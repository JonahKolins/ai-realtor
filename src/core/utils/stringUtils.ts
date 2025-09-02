export namespace stringUtils {
	// Обычный пробел
	export const SPACE = ' ';
	// неразрывный пробел
	export const NBSP = '\u00A0';
	// узкий пробел
	export const NSPACE = '\u2009';
	// неразрывный дефис
	export const NBHyphen = '\u2011';
	// среднее тире
	export const NDASH = '\u2013';

	export function replaceAll(target: string, search: string, replacement: string): string {
		return target.split(search).join(replacement);
	}

	/**
	 * Возвращает существительное после числительного в правильной форме.
	 *
	 * count - число для которого необходимо выбрать правильный падеж существительного
	 *
	 * form1, form2, form5 - содержат формы существительного для значений 1,2 и 5
	 *
	 * чтобы легче было запомнить название функции включает в себя эти значения
	 *
	 * пример `stringMorph125(775, 'маркшейдер','маркшейдера', 'маркшейдеров')
	 *
	 * вернет 'маркшейдеров'
	 */
	export function morph125(count: number, form1: string, form2: string, form5: string): string {
		const n = count % 100;
		if (n >= 11 && n <= 19) {
			return form5;
		}

		const i = count % 10;
		switch (i) {
			case (1): return form1;
			case (2):
			case (3):
			case (4): return form2;
			default: return form5;
		}
	}

	// для обычной сортировки с проверкой на undefined
	export function localeCompareString(a: string, b: string): number {
		return (a || '').localeCompare(b);
	}

	// сравниватель для сортировки строковых идентификаторов, которые являются числами
	export function comparerStringAsIdentifierAsc(x: string, y: string): number {
		if (!x && !y) return 0;
		if (!x && y) return 1;
		if (x && !y) return -1;
		//
		if (x.length < y.length) return -1;
		if (x.length > y.length) return 1;
		//
		if (x < y) return -1;
		if (x > y) return 1;

		return 0;
	}

	/**
	 * Работа с битовыми строками:
	 *
	 * Возвращает значение бита в позиции index для значения str
	 * */
	export const getBit = (index: number, str: string): boolean => {
		const _str = str || '';
		return _str[index] == '+';
	};

	/**
	 * Работа с битовыми строками:
	 *
	 * Устанавливает бит в позиции index в значение flag для значения str
	 * Возвращает новое значение строки
	 * */
	export const setBit = (index: number, str: string, flag: boolean): string => {
		let _str = str || '';
		while (_str.length < index + 1) {
			_str = _str + '-';
		}
		const arr = _str.split('');
		arr[index] = flag ? '+' : '-';
		return arr.join('');
	};

	/**
	 * Делит исходную строку str на подстроки по разделителю separator
	 * Безразличен к регистру (case insensitive)
	 *
	 * @param str Входная строка
	 * @param separator Разделитель
	 */
	export const splitStringCI = (str: string, separator: string): string[] => {
		if (!str) return [];
		if (!separator) return [str];
		//
		const strLC = str.toLowerCase();
		const separatorLC = separator.toLowerCase();
		const retval: string[] = [];
		//
		let startSearchIndex = 0;
		while (startSearchIndex < strLC.length) {
			const indexOfSeparator = strLC.indexOf(separatorLC, startSearchIndex);
			if (indexOfSeparator != -1) {
				const before = str.substring(startSearchIndex, indexOfSeparator);
				retval.push(before);
				//
				const sep = str.substr(indexOfSeparator, separator.length);
				retval.push(sep);
				//
				startSearchIndex = indexOfSeparator + separator.length;
			} else {
				const after = str.substring(startSearchIndex);
				retval.push(after);
				break;
			}
		}
		//
		return retval;
	};

	export const formatPhoneNumber = (number: string): string => {
		const phone = number?.trim() || '';
		if (/^(\+7)|8\d{10}$/.test(phone)) {
			const k = phone[0] == '+' ? 1 : 0;
			return `+7 ${phone.substr(1 + k,3)} ${phone.substr(4 + k,3)}-${phone.substr(7 + k,2)}-${phone.substr(9 + k,2)}`;
		}
		return number;
	}


	/**
	 * Человекочитаемое название события
	 *
	 * Варианты:
	 * 1-я карта. Unicorns of Love — Sprout -> 1-я карта {eventName}. Unicorns of Love {team1} — Sprout {team2}
	 * тираж 128110 ТОП-3 -> тираж 128110 {eventName} ТОП-3 {team1|team2}
	 * Бразил-Арген. Фирмино Р забьет в первом тайме -> Бразил-Арген {eventName}. Фирмино Р {team1} забьет в первом тайме {team2}
	 *
	 * @param {string} eventName
	 * @param {string} team1
	 * @param {string} team2
	 * @param {boolean} notMatch. Не является настоящим событием
	 * @return boolean
	 */
	export const formatEventName = (eventName: string, team1: string, team2: string, notMatch: boolean): string => {
		const a: string[] = [];
		if (eventName) {
			a.push(eventName.replace(/\.$/, ''));
		}
		if (team1 && team2) {
			if (a.length) {
				if (!a[0].endsWith(':')) a.push('.');
				a.push(' ');
			}
			if (notMatch) {
				a.push(team1.slice(0, 1).toUpperCase(), team1.slice(1), ' ', team2);
				return a.join('');
			}
		} else {
			if (a.length && team1) {
				a.push(' ');
			}
		}
		if (team1) {
			a.push(team1);
			if (team2) {
				a.push(' — ');
				a.push(team2);
			}
		} else if (team2) {
			// случай неверный, для тестов
			a.push(team2);
		}
		//
		return a.join('');
	};


	/** Создает рандомную строку, подходящую для использования ка индицикатор */
	export const createRandomStr = () => (Math.random() + 1).toString(36);


	/** Преобразует строку в нижний регистр за исключением первого символа, который преобразуется вверхний регистр */
	export const capitalize = (word: string): string => {
		if (!word) return '';
		return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
	}

	// Делает заглавной первую букву, сохраняя регистр остальной части строковго выражения.
	export const capitalizeFirstLetter = (word: string) => {
		if (!word) return '';
		return word.charAt(0).toUpperCase() + word.slice(1);
	}

	// удаляет точку как последний символ строки
	export const removeLastPoint = (str: string): string => {
		if (str && str[str.length - 1] == '.') {
			return str.substring(0, Math.max(0, str.length - 1));
		}
		return str;
	}

	// урезает наименование заголовка до 1 или 2х букв
	export const getShort = (value: string): string => {
		if (!value?.length) return null;
		//
		const words = value.split(' ');
		if (words.length == 1) {
			const w = words[0].trim();	// слово первое
			return w[0];				// первая букву
		} else if (words.length > 1) {
			const w1 = words[0].trim();	// слово первое
			const w2 = words[1].trim();	// слово второе
			return `${w1[0]}${w2[0]}`;	// первые буквы
		}
		return null;
	}

	let _uniqueId: number = 0;
	// возвращает уникальный идентификатор, инкрементируя число
	export const getUniqueId = () => {
		_uniqueId++;
		return _uniqueId;
	};

	// возвращает общее начало у массива строк
	export const getCommonSubString = (strings: string[]): string => {
		let retVal = '';
		let haveSymbol = true;
		let i = 0;
		while (haveSymbol) {
			let symbol: string = null;
			strings.every(string => {
				// строка закончилась - заканчиваем находить общее
				if (string.length < i + 1) {
					haveSymbol = false;
					return false;
				}
				// задаем символ первой строки
				if (symbol == null) {
					symbol = string[i];
					return true;
				}
				// символы равны - идем дальше
				if (symbol == string[i]) {
					return true;
				} else {
					// символы не равны - заканчиваем находить общее
					symbol = null;
					haveSymbol = false;
					return false;
				}
			})
			// прошли по всем строкам и есть общий - записываем его в общую подстроку
			if (haveSymbol && symbol != null) {
				retVal += symbol;
			}
			i++;
		}
		return retVal;
	}

	// Разделяет строку по заданному сепаратору и изменяет первую выделенную часть
	export const splitAndLeftMap = (
		// Исходная строка
		target: string,
		// Разделитель
		sep: string,
		// Преобразователь левой части (первого выделенного элемента)
		mapper: (item: string) => string
	): string => {
		return target
			?.split(sep)
			.map((item, idx) => (idx === 0) ? mapper(item) : item)
			.join(sep) ?? null;
	}
}
