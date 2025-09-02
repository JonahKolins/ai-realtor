// обертки браузерных api
export namespace browserApi {
	// вибрация
	export function vibrate(pattern: VibratePattern): boolean {
		try {
			return navigator.vibrate?.(pattern);
		}
		catch (e) {}
		return false;
	}
}

