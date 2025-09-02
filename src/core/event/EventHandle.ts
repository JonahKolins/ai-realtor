import {EventEmitter} from "./EventEmmiter";
import {CallBack} from "../types/CallBack";

export class EventHandle<T = void> {
	private owner: EventEmitter<T>;
	private callback: CallBack<T>;

	constructor(callback: CallBack<T>, message: EventEmitter<T>) {
		this.owner = message;
		this.callback = callback;
		this.eventListener = this.eventListener.bind(this);
		document.addEventListener(this.owner.messageName, this.eventListener);
	}

	private eventListener(a:CustomEvent<T>): void {
		if (this.callback) {
			this.callback(a.detail);
		}
	}

	// unsubscribe from getting messages
	public dispose(): void {
		document.removeEventListener(this.owner.messageName, this.eventListener);
		this.owner = null;
		this.callback = null;
	}
}
