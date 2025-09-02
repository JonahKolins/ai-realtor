export class Debounce<T> {
    private readonly _method: (...args: unknown[]) => unknown;
    private _callArg: T;
    private _delay: number;
    private _timeout: number;

    constructor(method: (param: T) => unknown, delay = 200) {
        this._delay = delay;
        this._method = method;
    }

    public get hasDelayCall() {
        return !!this._timeout;
    }

    public call(arg: T, newDelay?: number) {
        this._callArg = arg;

        if (newDelay != null) this._delay = newDelay;

        this.resetTimeout();
    }

    public executeDelayCall = () => {
        if (!this._timeout) return;
        this.cancel();
        this.execute();
    }

    public resetTimeout = () => {
        this.cancel();
        this._timeout = window.setTimeout(this.execute, this._delay);
    };

    public cancel = () => {
        window.clearTimeout(this._timeout);
        this._timeout = null;
    }

    private execute = () => {
        this._timeout = null;
		this._method(this._callArg);
    };
}
