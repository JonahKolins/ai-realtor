export namespace browserUtils {
	// мобильное ли режим браузера
	export function isMobileUserAgent(): boolean {
		const userAgent = (navigator.userAgent || '').toLowerCase();
		const retval = userAgent.match('iphone|ipad|ipod|android|mobile') != null
		return retval;
	}

	// является ли userAgent InternetExplorer
	export const isIE: boolean = (() => {
		const ua = window.navigator.userAgent || '';
		const msie = ua.indexOf('MSIE ');

		return msie > 0 || !!navigator.userAgent.match(/Trident.*rv:11\./);
	})();

	// является ли userAgent ios Safari
	export const isIosSafari: boolean = (() => {
		const ua = window.navigator.userAgent || '';
		const iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
		const webkit = !!ua.match(/WebKit/i);
		const isOtherBrowser = [/CriOS/, /FxiOS/, /OPiOS/, /mercury/, /YaBrowser/].some(el => el.test(ua));
		//
		return iOS && webkit && !isOtherBrowser;
	})();

	// является ли userAgent macOs Safari
	export const isMacOsSafari: boolean = (() => {
		const ua = window.navigator.userAgent || '';
		//
		return /^((?!chrome|android).)*safari/i.test(ua);
	})();

	// является ли userAgent Safari
	export const isSafari: boolean = (() => {
		return isIosSafari || isMacOsSafari;
	})();

	// Ищет в user agent указанные выражения
	const isUserAgentContains = (...search: RegExp[]): boolean => {
		const ua = window.navigator.userAgent || '';
		const isContains = (searchRegExp: RegExp): boolean => !!ua.match(searchRegExp);
		//
		return search.some(isContains);
	};

	// является ли кривым браузером Samsung
	export const isSamsungBrowser: boolean = (() => isUserAgentContains(/SamsungBrowser/i))();

	// является ли ОС IOS
	export const isIOS: boolean = (() => isUserAgentContains(/iPad/i, /iPhone/i))();

	// является ли ОС Android
	export const isAndroid: boolean = (() => isUserAgentContains(/android/i))();

	// является ли userAgent Chrome
	export const isChrome: boolean = (() => isUserAgentContains(/Chrome/i))();

	// является ли userAgent Edge
	export const isEdge: boolean = (() => isUserAgentContains(/Edg/i))();

	// является ли userAgent Firefox
	export const isFireFox: boolean = (() => isUserAgentContains(/Firefox/i))();

	// является ли userAgent Opera
	export const isOpera: boolean = (() => {
		return isUserAgentContains(/Opera/i) || isUserAgentContains(/OPR/i);
	})();

	// это тач устройство
	export const isTouchSupported = (() => {
		return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
	})();

	// нет сети по мнению браузера
	export const isOffline = () => {
		return window.navigator.onLine != true;
	};

	const SLOW_INTERNET_SPEED = 1.0;		// megabits/s
	// медленное соединение по мнению браузера (кроме, естественно Safari + Firefox)
	export const isSlowInternetConnection = () => {
		// @ts-ignore
		// megabits per second, rounded to the nearest multiple of 25 kilobits per seconds
		return window.navigator.connection?.['downlink'] < SLOW_INTERNET_SPEED;
	};
}
