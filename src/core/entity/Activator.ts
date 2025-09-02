// описание типа с public конструктором
export interface CtorType<T> {
	new(...args: any[]): T;
}

export class Activator {
	// создание сущности по наименованию типа
	public static createInstance<T>(type: any, args: any[]):T {
		const ctor = type.bind(null, ...args);
		return new ctor();
	}
}
