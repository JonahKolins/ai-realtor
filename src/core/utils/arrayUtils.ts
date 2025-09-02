export namespace arrayUtils {
	/**
	 * Создать объект с элементами входного массива хранящимися по ключу
	 * создаваемому функцией keySelector
	 * */
	export const createMapByKey = <T extends {}, TKey extends string | number>(
		arr: T[],
		keySelector: (item: T) => TKey
	): Record<TKey, T> => {
		const map: Record<string, T> = {};
		for (let i = 0; i < arr.length; i++) {
			const item = arr[i];
			const key = keySelector(item) as string;
			map[key] = item
		}
		return map as Record<TKey, T>;
	}

	/** Обернуть элемент в массив если он сам им не является */
	export const arrayify = <T>(item: T | T[]): T[] => {
		return Array.isArray(item) ? item : [item];
	}


	const defaultCompareFn = <T>(a: T, b: T) => {
		if (a < b) return -1;
		if (a > b) return 1;
		return 0
	}

	// Функция сортировки
	export type SortSelectorFn<T> = (value: T) => number | string | boolean;
	// Способ сортировки
	export type SortOrder = 'ASC' | 'DESC';

	/**
	 *  Сортирует массив по выбранному из элемента сортировки полю
	 */
	export function sortBy<T>(selector: SortSelectorFn<T>): (a: T, B: T) => number;
	export function sortBy<T>(order: SortOrder, selector: SortSelectorFn<T>): (a: T, B:T) => number;
	export function sortBy<T>(orderOrSelector: SortOrder | SortSelectorFn<T>, selector?: SortSelectorFn<T>) {
		const totalSelector = typeof orderOrSelector === 'function' ? orderOrSelector : selector;
		const totalOrder = typeof orderOrSelector !== 'function' ? orderOrSelector : 'ASC';

		const moreResultA = totalOrder === 'ASC' ? 1 : -1;
		const moreResultB = totalOrder === 'ASC' ? -1 : 1;

		return (a: T, b: T) => {
			const valA = totalSelector(a);
			const valB = totalSelector(b);

			if (valB === valA) return 0;
			return valA > valB ? moreResultA : moreResultB;
		}
	}

	/**
	 * Создать новый массив на основе отсортированного массива
	 * вставив туда новый элемент сохранив сортировку
	 * */
	export const insertBySort = <T>(
		arr: T[],
		value: T,
		compareFn: (a: T, b: T) => number = defaultCompareFn
	): T[] => {
		const index = arr.findIndex(item => compareFn(item, value) === 1);
		return [
			...arr.slice(0, index),
			value,
			...arr.slice(index)
		]
	}

	/**
	 * Разбивает массив на map-у массивов по ключу получаемому из селектора
	 * */
	export const separate = <T, TKey extends string>(
		arr: T[],
		selectKey: (value: T, index: number, array: T[]) => TKey
	): Partial<Record<TKey, T[]>> => {
		const map: Partial<Record<TKey, T[]>> = {};

		arr.forEach((item, i, innerArr) => {
			const key = selectKey(item, i, innerArr);
			const arr = map[key] ?? [];
			arr.push(item);
			// @ts-ignore
			map[key] = arr;
		})

		return map;
	}

	export const immutableUpdate = <T>(arr: T[], index: number, item: T): T[] => {
		const cloneArr = [...arr];
		cloneArr[index] = item;
		return cloneArr;
	}

	export const immutableDelete = <T>(arr: T[], index: number): T[] => {
		return [...arr.slice(0, index), ...arr.slice(index + 1)];
	}

	// возвращает первые count элементов массива
	export const take = <T>(arr: T[], count: number): T[] => {
		const retval: T[] = [];
		const len = Math.min(arr.length, count);
		for (let i = 0; i < len; i++) {
			retval.push(arr[i]);
		}
		return retval;
	};

	// формирует map групп с объектами по селектору
	export const groupBy = <TObject, TGroup>(arr: TObject[], groupKeySelector: (item: TObject) => TGroup): Map<TGroup, TObject[]> => {
		const retval = new Map<TGroup, TObject[]>();
		//
		arr.forEach(item => {
			const groupKey = groupKeySelector(item);	// ключ группы
			//
			let groupArray = retval.get(groupKey);		// массив группы
			if (!groupArray) {
				groupArray = [];
				retval.set(groupKey, groupArray);
			}
			groupArray.push(item);						// добавляем элемент в нужную группу
		});
		//
		return retval;
	};

	// являются ли массивы одинаковыми
	// можно указать кастомную функцию сравнения элементов
	export const equals = <T>(
		x: ReadonlyArray<T>,
		y: ReadonlyArray<T>,
		compareFunc: (a: T, b: T) => boolean = (a, b) => a === b
	): boolean => {
		if (!x && !y) return true;	// оба не заданы
		if (!x && y || x && !y) return false;	// задан только один
		if (x.length != y.length) return false;	// длины отличаются
		// сравнение по элементам
		for (let i = 0; i < x.length; i++) {
			if (compareFunc(x[i], y[i]) == false) return false;	// элемент отличается
		}
		//
		return true;	// все элементы совпали :)
	}

	/**
	 * Функция возвращающая новый массив обрезанный по индексу
	 * первого элемента подходящего по условию.
	 * В случае если не один из элементов не подходит под условие,
	 * возвращается изначальный массив
	 * */
	export const cutByCondition = <T>(
		arr: T[],
		conditional: (item: T) => boolean
	) => {
		const indexForCut = arr.findIndex(conditional);
		if (indexForCut === -1) return arr;
		if (indexForCut === 0) return [];
		return arr.slice(0, indexForCut);
	}

	export const excludeElements = <T>(array: T[], excludedElements: T[]) => {
		const excludedElementsSet = new Set(excludedElements ?? []);
		return array.filter(item => !excludedElementsSet.has(item));
	};

	// export const toggleElement = <T>(array: T[], element: T) => {
	// 	if (array.includes(element)) return excludeElements(array, [element]);
	// 	return [...array, element];
	// };

	// Функция, возвращающая новый массив,
	// в котором все элементы вложенных массивов были рекурсивно "подняты" на указанный уровень depth.
	export const flat = <T>(array: T[], depth: number = 1) => {
		if (!array) return [];
		//
		return depth ? (
			array.reduce((acc, cur) => {
				if (Array.isArray(cur)) acc.push(...flat(cur, depth - 1))
				else acc.push(cur);
				//
				return acc;
			}, [])
		) : [...array];
	};

	export const findLastIndex = <T> (arr: T[], predicate: (item: T, index?: number) => boolean) => {
		for (let i = arr.length - 1; i >= 0; i--) {
			let x = arr[i];

			if (predicate(x, i)) {
				return i;
			}
		}

		return -1;
	}
}
