import {Activator} from './Activator';
import {RuntimeError} from '../errors';
import {stringUtils} from "../utils";

type InstanceInfo = {
	instance: any,			// экземпляр сущности
	instanceName: string,	// наименование класса сущности
}

const InstanceClassName = 'Instance';
const InstanceClassListName = 'Instance_list';
type InstanceListType = Map<any, InstanceInfo>;		// по типу объекта его инстанс

// универсальный механизм создания singleton классов
// за счет использования window как места для хранилища сущностей - является всеобъемлящим классом приложения
export class Instance {
	// map всех зарегистрированных сущностей
	// через window для повторного переиспользования в других пакетах (если объект будет с другим именем)
	private static get _list() {
		// @ts-ignore
		let retval = window[InstanceClassListName] as InstanceListType;
		if (!retval) {
			retval = new Map();
			// @ts-ignore
			window[InstanceClassListName] = retval;
		}
		return retval;
	}

	// предоставляет все зарегистрированные instance
	public static get all() {
		const retval: any[] = [];
		Instance._list.forEach((v, k) => retval.push(v.instance));
		return retval;
	}

	// возвращает экземпляр сущности заданного типа
	public static getOrCreate<T>(instanceType: any, instanceName: string, ...args: any[]): T {
		if (!instanceType) throw new RuntimeError(`Instance.getOrCreate: instanceType not set`);
		if (!instanceName) throw new RuntimeError(`Instance.getOrCreate: instanceName not set`);
		//
		let instanceInfo = Instance._list.get(instanceType);
		if (!instanceInfo) {
			const instance = Activator.createInstance(instanceType, args);
			instanceInfo = Instance.register(instanceType, instanceName, instance);
		}
		return instanceInfo.instance;
	}

	// возвращает экземпляр по типу
	public static get<T>(instanceType: any): T {
		return Instance._list.get(instanceType)?.instance;
	}

	// сохранение ссылки экземпляра по типу
	public static register(instanceType: any, instanceName: string, instance: any) {
		if (Instance._list.has(instanceType)) throw new RuntimeError(`Instance.register: instance with instanceType '${Instance.getNameOfInstanceType(instanceType)}' already registered`);
		if (!instanceName) throw new RuntimeError(`Instance.register: instanceName not set`);
		//
		const retval: InstanceInfo = {
			instance: instance,
			instanceName: instanceName,
		};
		Instance._list.set(instanceType, retval);
		//
		if (window.hasOwnProperty(retval.instanceName)) {
			retval.instanceName += stringUtils.getUniqueId();
			console.warn(`Instance.register: instanceName '${instanceName}' already registered. Salt was added.`);
		}
		// @ts-ignore
		window[retval.instanceName] = instance;
		//
		return retval;
	}

	// удаление ссылки экземпляра по типу
	public static unregister(instanceType: any) {
		const instanceInfo = Instance._list.get(instanceType);
		if (!instanceInfo) throw new RuntimeError(`Instance.unregister: instance with instanceType '${Instance.getNameOfInstanceType(instanceType)}' not registered`);
		//
		Instance._list.delete(instanceType);
		//
		delete Object(window)[instanceInfo.instanceName];
	}

	// возвращает зарегистрированный класс по имени
	public static getInstanceByName<T>(instanceName: string): T {
		if (!instanceName) throw new RuntimeError(`Instance.getInstanceByName: instanceName not set`);
		//
		// @ts-ignore
		const retval = window[instanceName] as T;
		return retval;
	}

	// получает название класса из указателя на него
	private static getNameOfInstanceType(instanceType: any) {
		if (!instanceType) return '<null>';
		const code = instanceType.toString();
		const word = 'class';
		const indexOfWord = code.indexOf(word);
		if (indexOfWord != -1) {
			const startIndex = indexOfWord + word.length;
			const spaceIndex = code.indexOf(' ', startIndex + 1);
			const endIndex = spaceIndex != -1 ? spaceIndex : (startIndex + 30);
			const name = code.substring(startIndex + 1, endIndex);
			return name;
		}
		return '<unknown>';
	}
}

// // если переиспользуем класс в другом пакете возможна ситуация, что сущность станет иной
// // @ts-ignore
// const currentInstance = window[InstanceClassName];
// if (currentInstance) console.warn('Instance: class "Instance" already registered in "window". But it`s not a problem!', currentInstance.all);
// @ts-ignore
window[InstanceClassName] = Instance;
