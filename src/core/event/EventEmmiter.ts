import {EventHandle} from "./EventHandle";
import {CallBack} from "../types/CallBack";

/**
 *  It lets you send and get messages/events with type of parameters T
 */

export class EventEmitter<T = void> {
	public readonly messageName: string;

	constructor(messageName: string) {
		this.messageName = messageName;
	}

	// Send message to all subscribers
	public emit(message: T): void {
		// console.log(this.messageName);
		const event = new CustomEvent(this.messageName, {detail: message});
		document.dispatchEvent(event);
	}

	// subscribe to getting messages/events
	// return object, type Handle
	// for unsubscribe it`s necessary to call handle.dispose()
	public subscribe(callBack: CallBack<T>): EventHandle<T> {
		return new EventHandle(callBack, this);
	}
}
