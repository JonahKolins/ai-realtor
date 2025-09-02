import {timerUtils} from "../../utils/timerUtils";
import {RuntimeError} from "../../errors";

export type ObserverHandler = (entry: ResizeObserverEntry | MutationRecord) => void;

export interface HandlerItem {
    func: ObserverHandler;
    mutation: {
        observer: MutationObserver;
        scrollHeight: number;
        scrollWidth: number;
    }
}

// Служит для навешивания обработчиков на resize для HTMLElement-ов.
export class ResizeObserveController {
    private _resizeObserver: ResizeObserver; // TODO отсутсвует в старых браузерах
    private _handlers: Map<Element | Node, HandlerItem>;

    constructor() {
        this._resizeObserver = new ResizeObserver(this.handleResize);
        this._handlers = new Map<Element, HandlerItem>();
    }

    private handleMutate = timerUtils.throttle((entries: MutationRecord[]) => {
        entries.forEach(entry => {
            const handler = this._handlers.get(entry.target);
            const target = entry.target as HTMLElement;
            if (!handler || (handler.mutation.scrollHeight == target.scrollHeight
                && handler.mutation.scrollWidth == target.scrollWidth)) return;
			handler.mutation.scrollHeight = target.scrollHeight;
            handler.mutation.scrollWidth = target.scrollWidth;
            handler.func?.(entry);
        });
    }, 100)

    private handleResize = timerUtils.throttleRAF((entries: ResizeObserverEntry[]) => {
        entries.forEach(entry => this._handlers.get(entry.target)?.func?.(entry));
    })

    public observe(target: Element, callback: ObserverHandler, useMutation?: boolean): void {
		if (!target) throw new RuntimeError('ResizeObserveController.observe: argument null exception');
		//
        const handler = this._handlers.get(target);
        this._handlers.set(target, {
            func: callback,
            mutation: {
                observer: (() => {
                    if (!useMutation || handler?.mutation?.observer) return handler?.mutation?.observer;
                    const result = new MutationObserver(this.handleMutate);
                    result.observe(target, {childList: true});
                    return result;
                })(),
                scrollHeight: useMutation ? (handler?.mutation?.scrollHeight || target.scrollHeight) : 0,
                scrollWidth: useMutation ? (handler?.mutation?.scrollWidth || target.scrollWidth) : 0
            }
        });
        this._resizeObserver.observe(target);
    }

    public unobserve(target: Element): void {
		if (!target) return;
        this._resizeObserver.unobserve(target);
        const handler = this._handlers.get(target);
        if (handler?.mutation?.observer) {
            handler.mutation.observer.disconnect();
            handler.mutation.observer = null;
            handler.mutation.scrollHeight = 0;
            handler.mutation.scrollWidth = 0;
        }
    }

    // аналог unobserve для всех ранее подписанных
    public disconnect(): void {
        this._resizeObserver.disconnect();
        this.handleResize.cancel();
        this._handlers = null;
    }
}
