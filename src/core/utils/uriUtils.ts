import {stringUtils} from "./stringUtils";

// методы для работы с uri
export namespace uriUtils {
	export const PATH_SEPARATOR: string = '/';
	export const PATH_PARAM_SEPARATOR_FIRST: string = '?';
	export const PATH_PARAM_SEPARATOR_OTHER: string = '&';
	export const PATH_PARAM_SET: string = '=';
	export const PATH_SEPARATOR_ARRAY: string[] = [PATH_SEPARATOR, PATH_PARAM_SEPARATOR_FIRST, PATH_PARAM_SEPARATOR_OTHER, PATH_PARAM_SET];

	// Получить значение из search-строки по ключу
	export function getQueryStringValue(key: string, search: string = window.location.search): string {
		const URISearchParamsObject = new URLSearchParams(search);
		return URISearchParamsObject.get(key);
	}

	// Получить значения hash'а
	export function getHashValue(hash: string): string {
		return hash?.replace(/\/?#!?\/?/, '')
			.replace(PATH_SEPARATOR, '');
	}

	// возвращает true, если он является допустимым подпутем
	function isRealSubPath(subPath: string): boolean {
		if (!subPath || subPath == '*') return false;
		return true;
	}

	// убирает из пути лишние разделители (в начале, в конце, в середине) и заменяет их на separator
	export function replaceSlashes(url: string, separator: string): string {
		// разделим на путь и параметры
		const path_params = url.split(PATH_PARAM_SEPARATOR_FIRST);
		let path = url;
		let params = '';
		if (path_params.length > 1) {
			path = path_params[0];		// без searchParams
			params = path_params[1];	// только searchParams
		}
		//
		// убираем лишние слешики
		path = path.split(PATH_SEPARATOR).filter(x => isRealSubPath(x)).join(separator);
		// допишем параметры, если есть
		const retval = params
			? (path + PATH_PARAM_SEPARATOR_FIRST + params)
			: path;
		return retval;
	}

	// убирает из пути лишние разделители (в начале, в конце, в середине)
	export function trimSlashes(url: string): string {
		return replaceSlashes(url, PATH_SEPARATOR);
	}

	// одинаковы ли два пути
	export function isUrlEquals(x: string, y: string): boolean {
		// регистр, лишние слэши
		const u1 = trimSlashes(x);
		const u2 = trimSlashes(y);
		return u1.toLowerCase() == u2.toLowerCase();
	}

	// Проверяет, является ли ссылка абсолютной
	export function isAbsoluteLink(url: string): boolean {
		if (!url) return false;
		//
		const absoluteRegExp = new RegExp('^(?:[a-z]+:)?//', 'i');
		return absoluteRegExp.test(url);
	}

	// проверяет вхождение одного пути в другой
	export function isSubPath(mainPath: string, subPath: string): boolean {
		if (mainPath === subPath) return true;
		// регистр, лишние слэши
		const mainPathWithoutParams = mainPath.toLowerCase().split(PATH_PARAM_SEPARATOR_FIRST)[0];
		const mainPaths = mainPathWithoutParams.split(PATH_SEPARATOR).filter(x => isRealSubPath(x));
		//
		const subPathWithoutParams = subPath.toLowerCase().split(PATH_PARAM_SEPARATOR_FIRST)[0];
		const subPaths = subPathWithoutParams.split(PATH_SEPARATOR).filter(x => isRealSubPath(x));
		//
		if (mainPaths.length == 0) return false;				// нечего проверять
		if (subPaths.length < mainPaths.length) return false;	// дочерний путь априори длиннее должен быть

		for (let i = 0; i < mainPaths.length; i++) {
			const p = mainPaths[i];
			const sP = subPaths[i];
			if (p != sP) return false;							// на этом уровне появилось различие
		}
		//
		return true;
	}

	// соединяет все пути через разделитель '/'
	export function combinePath(...path: string[]): string {
		const totalUrl = path.join(PATH_SEPARATOR);
		return trimSlashes(totalUrl);
	}

	// соединяет все пути` через разделитель '/' как абсолютный путь
	export function combineAbsolutePath(...path: string[]): string {
		return `/${combinePath(...path)}`;
	}


	export const isCurrentDomainUrl = (url: string) => {
		if (!isAbsoluteLink(url)) return true;
		return doesStartWithCurrentDomain(url);
	}

	export const doesStartWithCurrentDomain = (url: string) => {
		const isProtocolExist = url.includes('://');
		const currentPathBase = isProtocolExist ? `${location.protocol}//${location.host}` : location.host;

		return url.toLowerCase().startsWith(currentPathBase);
	}

	export const getUrlWithoutCurrentDomain = (url: string) => {
		if (!doesStartWithCurrentDomain(url)) return url;
		return url.slice(url.indexOf(location.host) + location.host.length);
	}

	// получение search-строки из произвольного URL (забирает всё после ?)
	export function getQueryStringFromUrl(url: string): string {
		return /^\?.+/.test(url) ? url : url?.match(/\/([?].+)/)?.[1] || '';
	}

	export const decodeURIComponentEx = (uriComponent: string): string => {
		return uriComponent ? decodeURIComponent(decodeURIComponent(uriComponent)) : '';
	};

	export const removeQueryParam = (queryParamKey: string, search: string): string => {
		try {
			const queryParamValue = decodeURIComponent(getQueryStringValue(queryParamKey));
			const queryParam = `${queryParamKey}=${queryParamValue}`;
			return decodeURI(search).replace(queryParam, '').replace(/[?]&/,'?');
		} catch (e) {
			console.warn(e);
			return '';
		}
	};

	// Проверяет, является ли ссылка телефоном
	export function isTelLink (url: string): boolean {
		return !!url?.startsWith('tel');
	}

	// Проверяет, является ли ссылка почтой
	export function isEmailLink (url: string): boolean {
		return !!url?.startsWith('mailto');
	}

	/**
	 * Проверяет, что урл является файлом (имеет расширение).
	 * /pages/promo -> false
	 * /pages/promo.jpeg -> true
	 * /pages/promo?promoId.2 -> false
	 *
	 * @param {string} url Строка с адресом.
	 * @returns boolean
	 */
	export function isUrlContainsExtension(url: string): boolean {
		if (!url) return false;
		//
		const a = document.createElement("a");
		//
		a.href = url;
		//
		if (!a.pathname) return false;
		//
		const regExp = /\/[a-z\d._-]+\.\d*[a-z]+\d*$/i;
		//
		return regExp.test(a.pathname);
	}

	// Унифицирует html-ссылки
	export const asHtmlLinkUrl = (path: string): string => {
		if (!path) return (path ?? '');
		//
		return (
			stringUtils.splitAndLeftMap(path, '#', item => (
				stringUtils.splitAndLeftMap(item, PATH_PARAM_SEPARATOR_FIRST, item => {
					const isSlashNotRequired = ([
						(item: string) => item.endsWith(PATH_SEPARATOR),
						isTelLink,
						isUrlContainsExtension,
						isEmailLink
					].some(test => test(item)));
					//
					return isSlashNotRequired ? item : item.concat(PATH_SEPARATOR);
				})
			))
		)
	};
}

// @ts-ignore
window['uriUtils'] = uriUtils;
