import {uriUtils} from "../../utils/uriUtils";

// один раз при подключении модуля читаем (для оптимизации)
const _isHeadless = navigator.userAgent.toLowerCase().includes('headlesschrome');
const _locationSearchHasRendertron = !!uriUtils.getQueryStringValue('rendertron');

/***
 * Возвращает *true*, если сайт рендерит rendertron.
 * @description можно указать search параметр __?rendertron=true__ для принудительного возврата true
 */
export function isRendertron(): boolean {
	return (
		_isHeadless ||
		_locationSearchHasRendertron
	);
}
