export type SyntheticEventEmitterHandler<T extends unknown[]> = (...args: T) => void;

export class SyntheticEventEmitter<T extends unknown[] = [void]> {
	private _handlerList: SyntheticEventEmitterHandler<T>[] = [];

	public emit(...value: T) {
		try {
			this._handlerList.forEach(handler => handler(...value));
		} catch (err) {
			console.error(err)
		}
	}

	public subscribe(handler: SyntheticEventEmitterHandler<T>): VoidFunction {
		this._handlerList.push(handler);
		return () => this.dispose(handler);
	}

	public get subscribersCount() { return this._handlerList.length }

	private dispose(handler: SyntheticEventEmitterHandler<T>) {
		this._handlerList = this._handlerList.filter(item => item !== handler);
	}
}
