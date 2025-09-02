import {IDisposable} from "../types/IDisposable";
import {UseCounter} from "../UseCounter";
import {Instance} from "./Instance";
import {RuntimeError} from "../errors";

type InstanceRegistration = {
	instanceType: any;		// тип сущности
	instanceName: string;	// наименование класса (от минизизатора)
	instance: any,			// экземпляр сущности
	unloadTimeout: number;	// интервал времени, через которое следует выгрузить сущность при её неиспользовании
}

// настройки создания контекста
interface InstanceContextSetup<T> {
	instanceType: any;			// целевой класс
	instanceName: string;		// наименование класса (от минизизатора)
	unloadTimeout?: number;		// вызов dispose можно отложить на unloadTimeout
	instanceCreator: () => T;	// механизм создания целевого класса
}

// может сложиться ситация, когда мы вызвали get при render для ReactComponent или просто в FC, а реакт не монтировал сущность
export const USE_INSTANCE_TIMEOUT = 5_000;		// если монтирование не произойдет - сущность уничтожается

// сущность, подверженная использованию
// обертка для одновременного использования Instance и UseCounter
export class UseInstanceContext<T extends IDisposable> implements IDisposable {
	private static _instances: Map<any, UseInstanceContext<IDisposable>> = new Map();	// by instanceType

	private constructor(private _registration: InstanceRegistration) {
		this.disposeIfNotUse = this.disposeIfNotUse.bind(this);
	}

	// уничтожение использования
	public dispose() {
		if (this._registration.unloadTimeout > 0) {
			UseCounter.unUseTimeout(this._registration.instance, this._registration.unloadTimeout, this.disposeIfNotUse);
		} else {
			UseCounter.unUse(this._registration.instance, this.disposeIfNotUse);
		}
	}

	// сущности не существует, пользоваться нельзя
	public get isDisposed() { return this._registration == null; }

	// экземпляр сущности
	public get instance(): T { return this._registration.instance; }

	// текущее количество использований (только для отладки)
	public get debug_useCount() { return UseCounter.getUseCount(this._registration.instance); }

	// создание или получение использования
	public static get<T extends IDisposable>(setup: InstanceContextSetup<T>): UseInstanceContext<T> {
		if (!setup) throw new RuntimeError('UseInstanceContext.get: argument null exception');
		//
		let retval = UseInstanceContext._instances.get(setup.instanceType) as UseInstanceContext<T>;
		if (!retval) {
			// контекст не найден - проверим существование объекта
			let instance = Instance.get<T>(setup.instanceType);
			// если сущность есть, это ошибка написания кода, нельзя одновременно и Instance и UseInstanceContext
			if (instance) throw new RuntimeError(`UsedInstance.get: instance already registered, name: '${setup.instanceName}'`);
			//
			// создание экземпляра объекта
			instance = setup.instanceCreator();
			// регистрация как единого экземпляра объекта
			Instance.register(setup.instanceType, setup.instanceName, instance);
			// создание единого контекста использования экземпляра объекта
			retval = new UseInstanceContext({ instanceType: setup.instanceType, instance: instance, instanceName: setup.instanceName, unloadTimeout: setup.unloadTimeout });
			//
			UseInstanceContext._instances.set(setup.instanceType, retval);
			// console.info(`UseInstanceContext.get: create entity '${setup.instanceName}'`);
		} else {
			// контекст есть, сверим настройки
			if (
				retval._registration.unloadTimeout != null && setup.unloadTimeout != null && retval._registration.unloadTimeout < setup.unloadTimeout ||
				retval._registration.unloadTimeout == null && setup.unloadTimeout != null
			) {
				// изменим настройки
				retval._registration.unloadTimeout = setup.unloadTimeout;
			}
		}
		// посчитаем использование объекта
		UseCounter.use(retval._registration.instance);
		//
		return retval;
	}

	// если контекст был последним использованием - уничтожение сущности
	private disposeIfNotUse() {
		// console.info(`UseInstanceContext.disposeIfNotUse: dispose entity '${this._registration.instanceName}'`);
		// забываем об контексте использвования
		UseInstanceContext._instances.delete(this._registration.instanceType);
		// убираем факт регистрации объекта
		Instance.unregister(this._registration.instanceType);
		// освобождаем все ресурсы по объекту
		this._registration.instance.dispose();
		// утрачиваем все ссылки
		this._registration = null;
	}
}
