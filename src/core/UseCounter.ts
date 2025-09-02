import { RuntimeError } from './errors/RuntimeError';

type MethodType = () => void;
type HashType = any;

interface ICounterObject {
	count: number;				// количество использований
	doIfNoUsing?: MethodType;	// нужно вызвать при unload
	dateToUnUse?: number;		// момент времени, когда уже пора вызывать для unload метод doIfNoUsing
}

const WATCH_DOG_INTERVAL: number = 100;	// как часто проверять таймеры

// Занимается подсчетом использований
export class UseCounter {
	private static _counter: Map<HashType, ICounterObject> = new Map();
	private static _watchDogIntervalHandle: number = window.setInterval(UseCounter.checkCountersToUnUse, WATCH_DOG_INTERVAL);

	// Имя класса для отладки и вывода сообщений об ошибках
	private static get logName(): string {return 'UseCounter'}

	// проверяем все таймеры на предмет ожидания выгрузки
	private static checkCountersToUnUse() {
		const now = Date.now();
		const toUnload: HashType[] = [];
		UseCounter._counter.forEach((co, type) => {
			if (UseCounter.isWaitingToUnUse(co) && co.dateToUnUse <= now) {	// ожидает выгрузки и уже время настало
				toUnload.push(type);	// в той же итерации не нужно менять коллекцию
				//
				try {
					co.doIfNoUsing && co.doIfNoUsing();
				} catch (e) {
					const logName = `${UseCounter.logName}.checkCountersToUnUse:`
					console.error(`${logName} error was occurred in doIfNoUsing, planned by unUseTimeout`, e);
				}
			}
		});
		toUnload.forEach((type) => {
			UseCounter._counter.delete(type);
		});
	}

	// запланирован на уничтожение по таймеру, поскольку более не используется
	private static isWaitingToUnUse(co: ICounterObject) {
		return co ? co.count == 0 : false;
	}

	// используется ли
	public static inUse(type: HashType) {
		const co = UseCounter._counter.get(type);
		//
		if (!co) return false;	// нет информации о счетчике
		if (UseCounter.isWaitingToUnUse(co)) return false;	// ожидает выгрузки, фактически не используется
		return true;	// счетчик используется
	}

	// количество использований (только для отладки)
	public static getUseCount(type: HashType) {
		const co = UseCounter._counter.get(type);
		//
		if (!co) return null;	// нет информации о счетчике
		if (UseCounter.isWaitingToUnUse(co)) return 0;	// ожидает выгрузки, фактически не используется
		return co.count;	// счетчик используется
	}

	// пометить как используемый
	// если счетчик был выгружен через unUseTimeout(), но timeout не истек, то метод doIfNoUsing не будет вызван
	public static use(type: HashType, doIfNoUsing?: MethodType) {
		let co = UseCounter._counter.get(type);
		//
		if (!co) {	// не было счетчика, формируем новый
			co = {
				count: 1,
				doIfNoUsing: null,
				dateToUnUse: null,
			};
			UseCounter._counter.set(type, co);
			doIfNoUsing && doIfNoUsing();
		} else {	// был ранее или ожидал выгрузки, увеличиваем число использований
			if (UseCounter.isWaitingToUnUse(co)) {	// ожидает выгрузки, фактически не используется
				// отменяем уничтожение, поскольку будем повторно использовать + не нужно вызывать co.doIfNoUsing + не нужно вызывать doIfNoUsing
				co.doIfNoUsing = null;
				co.dateToUnUse = null;
			}
			co.count = co.count + 1;
		}
	}

	// пометить как не используемый
	// если счетчик был уже выгружен через unUseTimeout(), но timeout не истек, то этот метод не отменит действие doIfNoUsing
	public static unUse(type: HashType, doIfNoUsing?: MethodType) {
		const co = UseCounter._counter.get(type);
		if (!co) {
			const logName = `${UseCounter.logName}.unUse:`
			throw new RuntimeError(`${logName} class not using!`);
		}
		if (UseCounter.isWaitingToUnUse(co)) return;	// ожидаем выгрузки и не мешаем, ругаться не будем, хотя следовало бы
		//
		if (co.count > 1) {	// испольуется, уменьшаем счетчик
			co.count = co.count - 1;
		} else {	// не используется, уничтожаем
			UseCounter._counter.delete(type);
			doIfNoUsing && doIfNoUsing();
		}
	}

	// пометить как не используемый, через timeout вызвать doIfNoUsing
	// если в течение timeout будет совершен вызов use(), то doIfNoUsing не будет вызван
	public static unUseTimeout(type: HashType, timeout: number, doIfNoUsing: MethodType) {
		const logName = `${UseCounter.logName}.unUseTimeout:`
		if (!doIfNoUsing) throw new RuntimeError(`${logName} argument null exception`);
		if (timeout <= 0) throw new RuntimeError(`${logName} timeout must have positive value`);
		//
		const co = UseCounter._counter.get(type);
		if (!co) throw new RuntimeError(`${logName} class not using!`)
		if (UseCounter.isWaitingToUnUse(co)) return;	// уже ожидаем выгрузки и не мешаем, ругаться не будем, хотя следовало бы
		//
		if (co.count > 1) {	// используется, уменьшаем счетчик
			co.count = co.count - 1;
		} else {	// не используется, планируем вызов doIfNoUsing через timeout
			co.count = 0;	// теперь isWaitingToUnUse будет возвращать true
			co.doIfNoUsing = doIfNoUsing;
			co.dateToUnUse = Date.now() + timeout;
		}
	}
}

// @ts-ignore
window['UseCounter'] = UseCounter;
