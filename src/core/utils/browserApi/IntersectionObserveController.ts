import {RuntimeError} from "../../errors";

export type IntersectionHandler = (entry: IntersectionObserverEntry) => void;

// Служит для навешивания обработчиков на resize для HTMLElement-ов.
export class IntersectionObserveController {
    private _observer: IntersectionObserver;
    private _handlers: Map<Element, IntersectionHandler>;

    constructor(threshold: number) {
        this.handleIntersection = this.handleIntersection.bind(this);

        this._observer = new IntersectionObserver(this.handleIntersection, { threshold });
        this._handlers = new Map();
    }

    private handleIntersection(entries: IntersectionObserverEntry[]): void {
        entries.forEach(entry => {
            this._handlers.get(entry.target)?.(entry)
        })
    }

    public observe(target: Element, callback: IntersectionHandler): void {
    	if (!target) throw new RuntimeError('IntersectionObserveController.onserve: argument null exception');
    	//
        this._handlers.set(target, callback);
        this._observer.observe(target);
    }

    public unobserve(target: Element): void {
    	if (!target) return;
        this._observer.unobserve(target);
    }

    public disconnect(): void {
        this._observer.disconnect();
        this._handlers = null;
    }
}
