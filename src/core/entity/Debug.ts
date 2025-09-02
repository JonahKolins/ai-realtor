import {RuntimeError} from '../errors';
import {stringUtils} from "../utils";

const DebugClassName = 'Debug';
const DebugClassListName = 'Debug_list';
type DebugListType = Map<any, string>;	// по объекту получаем его наименование настройки

// универсальный механизм хранения флагов отладки любых объектов
export class Debug {
	// map всех зарегистрированных сущностей
	// через window для повторного переиспользования в других пакетах (если объект будет с другим именем)
	private static get _list() {
		// @ts-ignore
		let retval = window[DebugClassListName] as DebugListType;
		if (!retval) {
			retval = new Map();
			// @ts-ignore
			window[DebugClassListName] = retval;
		}
		return retval;
	}

	// предоставляет все зарегистрированные Debug
	public static get all() {
		const retval: any[] = [];
		Debug._list.forEach((v, k) => retval.push(v));
		return retval;
	}

	// возвращает экземпляр настроек по типу
	public static getSettings<T>(instanceType: any): T {
		const name = Debug._list.get(instanceType);
		if (!name) return null;
		if (!Debug.hasOwnProperty(name)) return null;
		// @ts-ignore
		return Debug[name] as T;
	}

	// сохранение ссылки экземпляра по типу
	public static register(instance: any, instanceName: string, debugSettingsOfInstance: any): void {
		if (!instanceName) throw new RuntimeError(`Debug.register: instanceName not set`);
		const registeredName = Debug._list.get(instance);
		if (registeredName) throw new RuntimeError(`Debug.register: instanceName '${registeredName}' already registered for this object`);
		//
		if (Debug.hasOwnProperty(instanceName)) {
			instanceName += stringUtils.getUniqueId();
			console.warn(`Debug.register: instanceName '${instanceName}' already registered. Salt was added.`);
		}
		Debug._list.set(instance, instanceName);
		//
		// @ts-ignore
		Debug[instanceName] = debugSettingsOfInstance;
	}

	// удаление ссылки экземпляра по типу
	public static unregister(instance: any): void {
		const name = Debug._list.get(instance);
		if (!name) throw new RuntimeError(`Debug.unregister: instance not registered`);
		//
		Debug._list.delete(instance);
		//
		// @ts-ignore
		Debug[name] = undefined;
	}
}

// @ts-ignore
window[DebugClassName] = Debug;
