// Прикладные методы для работы с Cookie
export namespace cookieUtils {
	const cookieDomain = (): string => {
		return document.domain.replace('www.', '');
	};

	// установка значения
	export const setCookie = (name: string, value: string, expirationDays?: number) => {
		let cookie = name + "=" + encodeURIComponent(value);

		if (expirationDays) {
			const date = new Date();
			date.setTime(date.getTime() + (expirationDays * 24 * 60 * 60 * 1000));
			cookie = cookie + '; expires=' + date.toUTCString();
		}

		cookie += "; path=/";
		const COOKIE_DOMAIN = cookieDomain();

		if (COOKIE_DOMAIN.length > 0) {
			cookie += '; domain=' + COOKIE_DOMAIN + '; ';
		}

		document.cookie = cookie;
	}

	// получение значения
	export const getCookie = (name: string) => {
		let cookieArr = document.cookie.split("; ");

		for (let i = 0; i < cookieArr.length; i++) {
			let [key, ...rest] = cookieArr[i].split("=");

			if (name == key.trim()) {
				return decodeURIComponent(rest.map(item => item.trim()).join("="));
			}
		}

		return undefined;
	}

	// удаление значения
	export const deleteCookie = (name: string) => {
		setCookie(name, '', -1);
	}
}
