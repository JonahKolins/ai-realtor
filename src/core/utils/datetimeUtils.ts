import {RuntimeError} from "../errors";
import {stringUtils} from "./stringUtils";

export namespace datetimeUtils {
	export const timeH24 = 24 * 60 * 60 * 1000;
	export const timeW = timeH24 * 7;
	export const timeM1 = timeH24 * 30;
	export const timeM3 = timeH24 * 90;
	export const timeM6 = timeH24 * 180;
	export const timeY1 = timeH24 * 365;
	export const timeN15 = 15 * 60 * 1000;
	export const timeN60 = 60 * 60 * 1000;
	export const timeS60 = 60 * 1000;

	// месяцы
	export function getMonthName(month: number): string {
		const m = {
			Jan: 'Январь',
			Feb: 'Февраль',
			Mar: 'Март',
			Apr: 'Апрель',
			May: 'Май',
			Jun: 'Июнь',
			Jul: 'Июль',
			Aug: 'Август',
			Sep: 'Сентябрь',
			Oct: 'Октябрь',
			Nov: 'Ноябрь',
			Dec: 'Декабрь'
		};
		switch(month) {
			case 0: return m.Jan;
			case 1: return m.Feb;
			case 2: return m.Mar;
			case 3: return m.Apr;
			case 4: return m.May;
			case 5: return m.Jun;
			case 6: return m.Jul;
			case 7: return m.Aug;
			case 8: return m.Sep;
			case 9: return m.Oct;
			case 10: return m.Nov;
			case 11: return m.Dec;
			default:
				throw new RuntimeError('datetimeUtils.getMonthName: month argument should be between 0..11');
		}
	}


	// месяцы в сокращенной форме
	function getMonthNameShort(month: number): string {
		const m = {
			Jan: 'янв',
			Feb: 'фев',
			Mar: 'мар',
			Apr: 'апр',
			May: 'май',
			Jun: 'июн',
			Jul: 'июл',
			Aug: 'авг',
			Sep: 'сен',
			Oct: 'окт',
			Nov: 'ноя',
			Dec: 'дек'
		};
		switch(month) {
			case 0: return m.Jan;
			case 1: return m.Feb;
			case 2: return m.Mar;
			case 3: return m.Apr;
			case 4: return m.May;
			case 5: return m.Jun;
			case 6: return m.Jul;
			case 7: return m.Aug;
			case 8: return m.Sep;
			case 9: return m.Oct;
			case 10: return m.Nov;
			case 11: return m.Dec;
			default:
				throw new RuntimeError(`datetimeUtils.getMonthNameShort: month argument should be between 0..11, value=${month ?? '<null>'}`);
		}
	}

	// месяцы в родительном падаже
	function getMonthNameInGenitive(month: number): string {
		const m = {
			Jan: 'января',
			Feb: 'февраля',
			Mar: 'марта',
			Apr: 'апреля',
			May: 'мая',
			Jun: 'июня',
			Jul: 'июля',
			Aug: 'августа',
			Sep: 'сентября',
			Oct: 'октября',
			Nov: 'ноября',
			Dec: 'декабря'
		};
		switch(month) {
			case 0: return m.Jan;
			case 1: return m.Feb;
			case 2: return m.Mar;
			case 3: return m.Apr;
			case 4: return m.May;
			case 5: return m.Jun;
			case 6: return m.Jul;
			case 7: return m.Aug;
			case 8: return m.Sep;
			case 9: return m.Oct;
			case 10: return m.Nov;
			case 11: return m.Dec;
			default:
				throw new RuntimeError(`datetimeUtils.getMonthNameInGenitive: month argument should be between 0..11, value=${month ?? '<null>'}`);
		}
	}

	// дни недели
	export function getDayOfWeekName(dayOfWeek: number): string {
		const m = {
			"0": 'воскресенье',
			"1": 'понедельник',
			"2": 'вторник',
			"3": 'среда',
			"4": 'четверг',
			"5": 'пятница',
			"6": 'суббота'
		}
		switch(dayOfWeek) {
			case 0: return m["0"];
			case 1: return m["1"];
			case 2: return m["2"];
			case 3: return m["3"];
			case 4: return m["4"];
			case 5: return m["5"];
			case 6: return m["6"];
			default:
				throw new RuntimeError(`datetimeUtils.getDayOfWeekName: dayOfWeek argument should be between 0..6, value=${dayOfWeek ?? '<null>'}`);
		}
	}

	// Сокращение дней недели
	export function getShortDayOfWeekName(dayOfWeek: number): string {
		const weekLoc = {
			mo: 'Пн',
			tu: 'Вт',
			we: 'Ср',
			th: 'Чт',
			fr: 'Пт',
			sa: 'Сб',
			su: 'Вс'
		}
		switch(dayOfWeek) {
			case 0: return weekLoc.mo;
			case 1: return weekLoc.tu;
			case 2: return weekLoc.we;
			case 3: return weekLoc.th;
			case 4: return weekLoc.fr;
			case 5: return weekLoc.sa;
			case 6: return weekLoc.su;
			default:
				throw new RuntimeError(`datetimeUtils.getDayOfWeekName: dayOfWeek argument should be between 0..6, value=${dayOfWeek ?? '<null>'}`);
		}
	}

	// дописывает лидирующие нули слева к value, чтобы всего получилось count символов
	export function padLeft(value: number, count: number): string {
		if (value == null || isNaN(value) || !isFinite(value)) return null;
		//
		const valueStr = value.toString();
		if (valueStr.length >= count) return valueStr;
		//
		return (Array(count).join('0') + valueStr).slice(-count);
	}

	// все параметры для подстановки в buildDateStringByFormat
	// ПРИЧИНА: 'MMM' = ?, MMM = May, replace MMM -> 'May', replace M => 'Mayay'
	// для простоты написания кода нужно задавать значения параметров так, чтобы они не пересекались по символам с шаблонами, это важно!
	enum DateParams {
		year = '%01%',					// год, 4 цифры
		year2Digit = '%02%',			// год, 2 цифры
		//
		monthNameInGenitive = '%03%',	// название месяца в родительном падеже
		monthName = '%04%',				// название месяца
		month2Digit = '%05%',			// месяц, 2 цифры
		monthShortName = '%06%',		// месяц, 3 символа (сокращение)
		//
		dayOfWeek = '%07%',				// день недели
		//
		day2Digit = '%08%',				// день месяца, 2 цифры
		day = '%09%',					// день месяца (1 или 2 цифры)
		//
		hours2Digit = '%10%',			// часы, 2 цифры
		hours = '%11%',					// часы (1 или 2 цифры)
		//
		minutes2Digit = '%12%',			// минуты, 2 цифры
		minutes = '%13%',				// минуты (1 или 2 цифры)
		//
		seconds2Digit = '%14%',			// секунды, 2 цифры
		seconds = '%15%',				// секунды (1 или 2 цифры)
	}

	// сопоставление параметров шаблона с параметрами даты <template, dateParam>
	// порядок важен (от длинной строки к короткой)
	const MapOfDateFormats: Map<string, string> = new Map([
		// год
		['YYYY', DateParams.year], ['yyyy', DateParams.year],
		['YY', DateParams.year2Digit], ['yy', DateParams.year2Digit],
		// месяц
		['MMM', DateParams.monthNameInGenitive],
		['mmm', DateParams.monthName],
		['MM', DateParams.month2Digit],
		['M', DateParams.monthShortName],
		// день недели
		['WW', DateParams.dayOfWeek], ['ww', DateParams.dayOfWeek],
		// день месяца
		['DD', DateParams.day2Digit], ['dd', DateParams.day2Digit],
		['D', DateParams.day], ['d', DateParams.day],
		// часы
		['HH', DateParams.hours2Digit], ['hh', DateParams.hours2Digit],
		['H', DateParams.hours], ['h', DateParams.hours],
		// минуты
		['mm', DateParams.minutes2Digit],
		['m', DateParams.minutes],
		// секунды
		['SS', DateParams.seconds2Digit], ['ss', DateParams.seconds2Digit],
		['S', DateParams.seconds], ['s', DateParams.seconds],
	]);

	/** форматирует дату и время в заданном формате
	 * Допустимые макроподстановки
	 * DD - день два знака
	 * D - день без добивания до двух знаков
	 * MMM - месяц словом
	 * M - месяц коротким словом(3 символа)
	 * MM - месяц два знака
	 * YYYY - год 4 знака
	 * YY - год 2 знака
	 * hh - час 2 знака
	 * mm - минуты 2 знака
	 * ss - секунды 2 знака
	 * */
	export function formatTime(date: number | string, format: string): string {
		if (!date) return '';
		
		const d = new Date(date);

		return buildDateStringByFormat(format,
			d.getFullYear(),
			d.getMonth(),
			d.getDay(),
			d.getDate(),
			d.getHours(),
			d.getMinutes(),
			d.getSeconds()
		);
	}

	/** форматирует дату и время в заданном формате
	 * Допустимые макроподстановки
	 * DD - день два знака
	 * D - день без добивания до двух знаков
	 * MMM - месяц словом
	 * MM - месяц два знака
	 * M - месяц коротким словом(3 символа)
	 * YYYY - год 4 знака
	 * hh - час 2 знака
	 * mm - минуты 2 знака
	 * ss - секунды 2 знака
	 * */
	export function formatUTCTime(date: number, format: string): string {
		if (!date) return '';

		const d = new Date(date);

		return buildDateStringByFormat(format,
			d.getUTCFullYear(),
			d.getUTCMonth(),
			d.getUTCDay(),
			d.getUTCDate(),
			d.getUTCHours(),
			d.getUTCMinutes(),
			d.getUTCSeconds()
		);
	}

	// подставляет значения в формат даты
	function buildDateStringByFormat(format: string, year: number, month: number, dayOfWeek: number, day: number, hours: number, minutes: number, seconds: number): string {
		const replaceAll = stringUtils.replaceAll;
		let tmp = format;
		//
		{// замена шаблонных обозначений на уникальные параметры, названия которых совсем не пересекаются с шаблонами
			MapOfDateFormats.forEach((dateParam, template) => tmp = replaceAll(tmp, template, dateParam));
		}
		{// формируем строку, заполняя параметры
			const DP = DateParams;
			// год
			tmp = replaceAll(tmp, DP.year, year.toString());
			tmp = replaceAll(tmp, DP.year2Digit, year.toString().slice(-2).padStart(2, '0'));
			// месяц
			const month2Digit = padLeft(month + 1, 2);
			tmp = replaceAll(tmp, DP.monthNameInGenitive, getMonthNameInGenitive(month) || month2Digit);
			tmp = replaceAll(tmp, DP.monthName, getMonthName(month) || month2Digit);
			tmp = replaceAll(tmp, DP.month2Digit, month2Digit);
			tmp = replaceAll(tmp, DP.monthShortName, getMonthNameShort(month));
			// день недели
			tmp = replaceAll(tmp, DP.dayOfWeek, getDayOfWeekName(dayOfWeek));
			// день месяца
			tmp = replaceAll(tmp, DP.day2Digit, padLeft(day, 2));
			tmp = replaceAll(tmp, DP.day, day.toString());
			//
			// часы
			tmp = replaceAll(tmp, DP.hours2Digit, padLeft(hours, 2));
			tmp = replaceAll(tmp, DP.hours, hours.toString());
			// минуты
			tmp = replaceAll(tmp, DP.minutes2Digit, padLeft(minutes, 2));
			tmp = replaceAll(tmp, DP.minutes, minutes.toString());
			// секунды
			tmp = replaceAll(tmp, DP.seconds2Digit, padLeft(seconds, 2));
			tmp = replaceAll(tmp, DP.seconds, seconds.toString());
		}
		//
		return tmp;
	}

	// Форматирует игровое время, из числа секунд, например formatPlayTime(145) = '2:25';
	export function formatPlayTime(seconds: number): string {
		const _seconds = seconds % 60;
		const _minutes = (seconds - _seconds) / 60;
		return _minutes + ':' + padLeft(_seconds, 2);
	}

	// Возвращает лаконичную запись только времени в человеческом представлении.
	// Например "Сегодня", "Завтра, "12"
	export function toSmartTimeString(date: number): string {
		const dateTime = new Date(date);
		const hour = padLeft(dateTime.getHours(), 2);
		const minutes = padLeft(dateTime.getMinutes(), 2);
		return hour + ':' + minutes;
	}

	// Проверяется, принадлежат ли две даты к одному и тому-же дню
	export function isDateEquals(firstDateLikeNum: number | Date, secondDateLikeNum: number | Date) {
		const firstDate = new Date(firstDateLikeNum);
		const secondDate = new Date(secondDateLikeNum);

		firstDate.setHours(0, 0, 0, 0);
		secondDate.setHours(0, 0, 0, 0);

		return firstDate.getTime() === secondDate.getTime();
	}

	// Функция проверяющая, что две даты находятся в одной и той-же минуту
	export function isMinuteEquals(firstDateLikeNum: number, secondDateLikeNum: number) {
		const firstDate = new Date(firstDateLikeNum);
		const secondDate = new Date(secondDateLikeNum);

		firstDate.setSeconds(0, 0);
		secondDate.setSeconds(0, 0);

		return firstDate.getTime() === secondDate.getTime();
	}

	export function isDateInCurrentYear(datetime: number) {
		return (new Date()).getFullYear() === (new Date(datetime)).getFullYear();
	}

	/**
	 * Проверка, что дата отсутствует.
	 * null в Delphi (Sat Dec 30 1899) -2209161600000
	 * Со старого сайта
	 */
	export function isDateEmpty(date: number): boolean {
		const delphiNull = -2209161600000;
		return date == null || date == delphiNull;
	}
}
