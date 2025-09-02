import {RuntimeError} from "../../errors/RuntimeError";

export namespace timerUtils {
    export function throttle<T extends (...args: unknown[]) => unknown>(func: T, timeout: number): T {
        let ready: boolean = true;
        const fn = (...args: unknown[]) => {
            if (!ready) return;
            ready = false;
            func(...args);
            setTimeout(() => {
                ready = true
            }, timeout);
        };

        return fn as T;
    }

    // Функция троттлинга работающая на requestAnimationFrame,
    // позволяет ограничить вызов функции частотой кадров браузера клиента
    //
    // Возвращаемая функция имеет дополнительный метод cancel, для отчистки запущенного цикла троттлинга
    // Оригинальная идея: https://github.com/alexreardon/raf-schd
    export function throttleRAF<T extends (...args: unknown[]) => unknown>(
        func: T
    ): T & { cancel: VoidFunction } {
        let lastArgs: null | unknown[] = null;
        let frameId: number | null = null;

        const wrapperFn = (...args: unknown[]) => {
            // Сохраняем последние аргументы вызова функции
            lastArgs = args;

            // Если мы уже запустили RAF завершаем выполнение функции
            if (frameId) return;

            // Запланируем новый фрейм
            frameId = requestAnimationFrame(() => {
                frameId = null;
                func(...lastArgs);
            });
        };

        wrapperFn.cancel = () => {
            if (!frameId) return;
            cancelAnimationFrame(frameId);
            frameId = null;
        }

        return wrapperFn as T & { cancel: VoidFunction };
    }

    export function debounce<T extends (...args: unknown[]) => unknown>(func: T, timeout: number): T {
        let timeoutId: number;
        const fn = (...args: unknown[]) => {
            clearTimeout(timeoutId);
            timeoutId = window.setTimeout(() => func(...args), timeout);
        };

        return fn as T;
    }

    // отладочный Promise реализующий задержку
    export function wait(milliseconds: number): Promise<void> {
        return new Promise<void>(resolve => setTimeout(() => resolve(), milliseconds));
    }

    // отложенное выполнение, не аналогичен по логике NodeJS.setImmediate, поскольку срабатывает чаще
    // сделано только потому, что штатный setImmediate не импортирон в проект из core-js, может и не нужно тащить лишнее
    export function setImmediate(method: (...args: any[]) => void) {
        window.setTimeout(method, 0);
    }

    type CallbackType = () => void;
    // единый таймер обновления для всех визуальных компонентов, чтобы экономить ресурсы
    // использовать при провероке размеров, при тикании часиков, любой интервальной проверки
    export class InvalidateTimer {
        private static MIN_CHECK_INTERVAL: number = 100;		// для всех проверок используется идиная задержка

        private static _timers: InvalidateTimer[] = [];				// все таймеры
        private static _handle: number =							// указатель на стандартный setInterval
            window.setInterval(InvalidateTimer.check, InvalidateTimer.MIN_CHECK_INTERVAL);
        //
        private readonly _callback: CallbackType;		// то, что нужно вызвать при проверке
        private readonly _timeout: number;				// количество миллисекунд между срабатываниями
        private _nexRunDate: number;					// время, когда следует вызвать колбэк

        private constructor(callback: CallbackType, timeout: number) {
            this._callback = callback;
            this._timeout = timeout;
            this.calcNextDate(new Date());
            //
            InvalidateTimer._timers.push(this);
        }

        // очистка ресурсов этого компонента
        public static dispose() {
            InvalidateTimer._timers.splice(0, InvalidateTimer._timers.length);
            clearInterval(InvalidateTimer._handle);
            InvalidateTimer._handle = null;
        }

        // вызов всех колбэков последовательно
        private static check() {
            const dt = new Date();
            InvalidateTimer._timers.forEach(x => x.processTimer(dt));
        }

        // добавить новую проверку (вызов callback раз в timeout)
        public static add(callback: CallbackType, timeout?: number): InvalidateTimer {
            if (InvalidateTimer._handle == null) throw new RuntimeError('timerUtils.InvalidateTimer.add: not supported usage');
            //
            const retval = new InvalidateTimer(callback, timeout != null ? timeout : InvalidateTimer.MIN_CHECK_INTERVAL);
            return retval;
        }

        // удалить эту проверку
        public remove(): boolean {
            if (InvalidateTimer._handle == null) throw new RuntimeError('timerUtils.InvalidateTimer.remove: not supported usage');
            //
            const index = InvalidateTimer._timers.indexOf(this);
            if (index == -1) return false;
            //
            InvalidateTimer._timers.splice(index, 1);
            return true;
        }

        // пора ли запускать колбэк
        private shouldRun(currentDate: Date): boolean {
            return currentDate.valueOf() >= this._nexRunDate;
        }

        // вычистеление следующей даты запуска колбэка
        private calcNextDate(currentDate: Date) {
            this._nexRunDate = currentDate.valueOf() + this._timeout;
        }

        // обработать таймер
        private processTimer(currentDate: Date) {
            if (!this.shouldRun(currentDate)) return;
            //
            this.calcNextDate(currentDate);
            try {
                this._callback();
            } catch (e) {
                console.log('timerUtils.InvalidateTimer.processTimer: unhandled error', e);
            }
        }
    }
}
