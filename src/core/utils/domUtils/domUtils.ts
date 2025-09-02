import {ApplicationNode} from "./ApplicationNode";
import {ChildOrientation} from "../../ChildOrientation";

export namespace domUtils {
	// Вычисляет смещение element относительно parentElement
	export const parentOffset = (element: HTMLElement, parentElement: HTMLElement): { x: number; y: number } => {
		let x = 0;
		let y = 0;
		let e = element;
		while (e && e !== parentElement) {
			x = x + e.offsetLeft;
			y = y + e.offsetTop;
			e = e.offsetParent as HTMLElement;
		}
		e = element;
		// Добавляем поправку на скролируемые области
		while (e && e !== parentElement) {
			x = x - e.scrollLeft;
			y = y - e.scrollTop;
			e = e.parentElement;
		}
		//
		return {x: x, y: y};
	}

	// возвращает положение элемента относительно экрана
	export function documentOffset(element: HTMLElement) { // crossbrowser version
		const rect = element.getBoundingClientRect();
		//
		const scrollTop = window.pageYOffset || document.documentElement?.scrollTop || document.body?.scrollTop || 0;
		const scrollLeft = window.pageXOffset || document.documentElement?.scrollLeft || document.body?.scrollLeft || 0;
		const clientTop = document.documentElement?.clientTop || document.body?.clientTop || 0;
		const clientLeft = document.documentElement?.clientLeft || document.body?.clientLeft || 0;
		//
		return {
			x: rect.left + scrollLeft - clientLeft,
			y: rect.top + scrollTop - clientTop,
		};
	}

	// возвращает размера экрана
	export function windowSize(): { width: number; height: number } {
		let width = window.innerWidth;
		let height = window.innerHeight;

		if (!width) width = window.screen.availWidth || 0;
		if (!height) height = window.screen.availHeight || 0;

		return { width, height};
	}

	// возвращает размер текста
	export function measureText(str: string, className: string, size?: {width?: number, height?: number}): { width: number; height: number } {
		const span = document.createElement('span');
		span.className = className;					// шрифт, размер, жирность...
		span.style.visibility = 'hidden';			// только невидимый
		span.style.position = 'absolute';
		span.style.top= '100%'
		span.style.left= '100%';
		if (size?.width != null) span.style.width = `${size.width}px`;
		if (size?.height != null) span.style.height = `${size.height}px`;
		span.innerText = str;						// именно с тем же текстом
		//
		const root = ApplicationNode.instance.element;
		root.appendChild(span);						// в этом контейнере нет ограничения по размерам
		const r = span.getBoundingClientRect();		// более точные размеры (дробные)
		root.removeChild(span);						// IE problem with remove()
		//
		return {width: Math.max(r.width, span.clientWidth), height: Math.max(r.height, span.clientHeight)};
	}

	// возвращает размеры элемента
	// withMargin - включая внешние отступы
	export function getBounds(element: HTMLElement, withMargin: boolean = false): DOMRect {
		if (!element) return null;
		//
		const bounds = element.getBoundingClientRect();
		let x = bounds.x;
		let y = bounds.y;
		let w = bounds.width;
		let h = bounds.height;
		let l = bounds.left;
		let r = bounds.right;
		let t = bounds.top;
		let b = bounds.bottom;
		//
		if (withMargin) {
			const cs = window.getComputedStyle(element);
			const ml = (cs.marginLeft ? parseFloat(cs.marginLeft) : 0);
			const mr = (cs.marginRight ? parseFloat(cs.marginRight) : 0);
			const mt = (cs.marginTop ? parseFloat(cs.marginTop) : 0);
			const mb = (cs.marginBottom ? parseFloat(cs.marginBottom) : 0);
			if (isFinite(ml)) {
				x -= ml;
				w += ml;
				l -= ml;
			}
			if (isFinite(mr)) {
				w += mr;
				r -= mr;
			}
			if (isFinite(mt)) {
				y -= mt;
				h += mt;
				t -= mt;
			}
			if (isFinite(mb)) {
				h += mb;
				b -= mb;
			}
		}
		return { x: x, y: y, width: w, height: h, left: l, right: r, top: t, bottom: b } as DOMRect;
	}

	// Замена тегов в тексте
	export const tagsReplacer = (text: string, regExpMap: Map<string, string>): string => {
		let retval = text || '';
		//
		regExpMap.forEach((value, key) => {
			const reg = new RegExp(key, 'g');
			retval = retval.replace(reg, value);
		});
		//
		return retval;
	};

	// проверяет является ли значение названием CSS переменной
	const isCSSVariableName = (name: string): boolean => {
		if (name && name.length > 2 && name[0] == '-' && name[1] == '-') return true;
		return false;
	}
	// формирует название CSS переменной по имени переменной
	const getCSSVariableName = (name: string): string => {
		if (isCSSVariableName(name)) return name;
		return '--' + name;
	}
	// устанавливает новое значение css переменной
	export const setCSSVariable = (name: string, value: string): void => {
		const v = getCSSVariableName(name);
		document.documentElement.style.setProperty(v, value);
	}

	// удалить css переменную
	export const removeCSSVariable = (name: string): void => {
		const v = getCSSVariableName(name);
		document.documentElement.style.removeProperty(v);
	}

	// возвращает значение css переменной
	// OPTIMIZE_DANIIL если метод сделать асинхронным через использование setTimeout0
	// то можно гарантировать для ряда мест отсутствие рефлоу, которое может происходить если читать свойства DOM
	// до того как они применены (применяются на следующем цикле евент лупа после добавления их)
	export const getCSSVariable = (name: string): string => {
		const v = getCSSVariableName(name);
		const retval = getComputedStyle(document.documentElement).getPropertyValue(v);
		return retval;
	}
	// возвращает значение либо из переменной CSS, либо из аргумента
	export const getCSSVariableOrValue = (valueOrCssVariable: string): string => {
		return isCSSVariableName(valueOrCssVariable) ?
			getCSSVariable(valueOrCssVariable)
			: valueOrCssVariable;
	}


	// устанавливает заголовок документа
	export const setTitle = (caption: string): void => {
		document.title = caption || '';
	}

	// устанавливает мату описания
	export const setDescription = (description: string): void => {
		setMeta('description', description);
	};

	// устанавливает значение мета-тэгов
	export const setMeta = (name: string, content: string, removeWithoutContent: boolean = true) => {
		const metaList = document.querySelectorAll<HTMLMetaElement>(`meta[name="${name}"]`);
		const metaArray: HTMLMetaElement[] = [];
		metaList.forEach(meta => metaArray.push(meta));
		//
		if (!content && removeWithoutContent) {
			// удаление существующей
			metaArray.forEach(meta => meta.remove());
		} else {
			// создание / обновление
			if (metaArray.length == 0) {
				// вариации media-запросов
				const mediaVars: string[] = [];
				if (name == 'theme-color') {
					// особый случай
					mediaVars.push("(prefers-color-scheme: dark)");
					mediaVars.push("(prefers-color-scheme: light)");
				} else {
					// обычный случай, нужен хотя бы один элемент массива
					mediaVars.push(null);
				}
				// создание
				mediaVars.forEach(media => {
					const meta = document.createElement('meta');
					meta.name = name;
					if (media) meta.media = media;
					document.head?.appendChild(meta);	// дом не загружен
					metaArray.push(meta);
				});
			}
			// проверяем контент
			metaArray.forEach(meta => {
				if (meta.content != content) {
					meta.content = content;
				}
			});
		}
	}

	// удаляет мету
	export const removeMeta = (name: string) => {
		const meta = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
		if (meta) {
			// удаление существующей
			meta.remove();
		}
	}

	// есть ли горизонтальное переполнение
	export const hasOverflowX = (element: HTMLElement): boolean => {
		if (!element) return false;
		return element.offsetWidth < element.scrollWidth;
	}

	// есть ли вертикальное переполнение
	export const hasOverflowY = (element: HTMLElement): boolean => {
		if (!element) return false;
		return element.offsetHeight < element.scrollHeight;
	}

	// Функция подготавливающая контент к вставке через dangerouslySetInnerHTML
	// Путем очищения строки от все потенциальных вредных скриптов
	export const secureInsertedText = (text: string) => {
		return text
			.replace(/<script.*>.*<\/script>/, '')
			.replace(/on[A-Za-z]*=['|"].*['|"]/, '')
	}

	// возвращает элемент или себя, если он сам удовлетворяет условиям
	export const findElement = (element: HTMLElement, checkSelf: boolean, checker: (tmp: HTMLElement) => boolean): HTMLElement => {
		if (!element) return null;
		//
		let tmp = checkSelf ? element : element.parentElement;
		while (tmp) {
			if (checker(tmp)) return tmp;
			tmp = tmp.parentElement;
		}
		return null;
	}

	// возвращает родительский прокручиваемый контейнер или себя, если он сам является прокручиваемым
	export const getParentScrollableElementOrSelf = (childElement: HTMLElement, overflowX: boolean = true, overflowY: boolean = true): HTMLElement => {
		return findElement(
			childElement,
			true,
			tmp => overflowX && hasOverflowX(tmp) || overflowY && hasOverflowY(tmp)
		);
	}

	// возвращает родительский прокручиваемый контейнер
	export const getParentScrollableElement = (childElement: HTMLElement, overflowX: boolean = true, overflowY: boolean = true): HTMLElement => {
		return findElement(
			childElement,
			false,
			tmp => overflowX && hasOverflowX(tmp) || overflowY && hasOverflowY(tmp)
		);
	}

	// возвращает родителя или себя по наличию атрибута
	export const getParentWithAttributeOrSelf = (childElement: HTMLElement, attr: string): HTMLElement => {
		return findElement(
			childElement,
			true,
			tmp => tmp.hasAttribute(attr)
		);
	}

	// уникальное число, одназначно говорящее про изменение горизонтально прокрутки
	export const getAllHorizontalScrollsHash = (target: HTMLElement) => {
		let retval = 0;
		let level = 1;
		let scrollableElement = domUtils.getParentScrollableElementOrSelf(target, true, false);
		while (scrollableElement) {
			retval += (scrollableElement.scrollLeft * level);
			level++;
			//
			scrollableElement = domUtils.getParentScrollableElement(scrollableElement, true, false);
		}
		return retval;
	}

	// уникальное число, одназначно говорящее про изменение вертикальной прокрутки
	export const getAllVerticalScrollsHash = (target: HTMLElement) => {
		let retval = 0;
		let level = 1;
		let scrollableElement = domUtils.getParentScrollableElementOrSelf(target, false, true);
		while (scrollableElement) {
			retval += (scrollableElement.scrollTop * level);
			level++;
			//
			scrollableElement = domUtils.getParentScrollableElement(scrollableElement, false, true);
		}
		return retval;
	}

	// копироем значения прокрутки дерева один к одному
	export const copyScrollPosition = (from: Element, to: Element) => {
		if (!to || !from) return;
		//
		if (to.scrollLeft != from.scrollLeft) {
			to.scrollLeft = from.scrollLeft;
		}
		if (to.scrollTop != from.scrollTop) {
			to.scrollTop = from.scrollTop;
		}
		//
		if (from.children.length == to.children.length) {
			for (let i = 0; i < from.children.length; i++) {
				copyScrollPosition(from.children[i], to.children[i]);
			}
		}
	};

	// очистка идентификаторов
	export const clearIds = (target: Element) => {
		if (!target) return;
		//
		if (target.id) {
			target.removeAttribute('id');
		}
		//
		for (let i = 0; i < target.children.length; i++) {
			clearIds(target.children[i]);
		}
	};

	// копия DOM элемента без идентификаторов (после вставки требуется восстановление скрола)
	export const cloneNode = (element: Node) => {
		if (!element) return null;
		//
		const clonedNode = element.cloneNode(true);
		// из клона убираем лишнее
		if (clonedNode instanceof Element) {
			clearIds(clonedNode);
		}
		//
		return clonedNode;
	};

	// Возводим название правила в camelCase, то есть вместо margin-top должно быть marginTop
	export const stringToCamelCase = (input: string): string =>
	{
		return input.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
	};

	// Копирует переданный текст в буфер обмена.
	// Если в браузере есть поддержка API clipboard, то использует его
	// Иначе создает фейковый input, помещает в него текст. Выделяет. Затем копирует и удалет input
	export const copyTextToClipboard = (text: string): void => {
		const dummy = document.createElement('input');
		document.body.appendChild(dummy);
		dummy.setAttribute('value', text);
		// мобильный Safari вызывает клавиатуру для фейкового input, для предотвращения ставим readonly
		dummy.setAttribute('readonly', 'true');
		dummy.select();
		document.execCommand('copy');
		document.body.removeChild(dummy);
	};

	// Предзагрузка изображений
	// OPTIMIZE_DANIIL 1 прибраться
	// OPTIMIZE_DANIIL 2 возможно делать это в воркере круче
	// OPTIMIZE_DANIIL 3 проверить как это работает с неподдердиваемыми расширениями
	// OPTIMIZE_DANIIL 4 не факт что allSettled поддерживается и это правильно для нас
	// OPTIMIZE_DANIIL 5 then/catch мб какие то топорные, перепредумать
	export const preloadImages = (images: string | string[]) => {
		const checkImage = (path: string) => {
			return new Promise((resolve, reject) => {
				fetch(path, {mode: 'no-cors'})
					.then(() => {
						resolve(`ok-${path}`);
					})
					.catch(() => {
						reject(`fail-${path}`);
					});
			});
		};
		// Если передали одно изображение сразу отдаем результат метода проверки одного изображения
		if (typeof images == 'string') {
			return checkImage(images);
		}
		// Если не передали изображения, тут же отдаем реджект
		if (!images?.length) return Promise.reject('Has no images');
		// Формируем массив промисов на основе метода проверки изображения
		const imagePromises = images.map((img) => checkImage(img));

		const mappedImagePromises = imagePromises.map((p) => {
			return p
				.then((value) => ({ status: 'fulfilled', value }))
				.catch((reason) => ({ status: 'rejected', reason }));
		});

		return Promise.all(mappedImagePromises);
	}

	// рекурсивно проходит по коллекции и строит линейный список элементов c заданным tabIndex
	export function getTabIndexList(children: HTMLCollection, focusIndexedAttr?: string, childFocusIndex?: number, noParentDependenceAttr?: string, parentOrientation?: ChildOrientation, childOrientationAttr?: string): HTMLElement[] {
		const retval: HTMLElement[] = [];
		if (!children) return retval;
		//
		const walk = (items: HTMLCollection): void => {
			for (let i = 0; i < items.length; i++) {
				const tmp = items[i] as HTMLElement;
				if (!tmp) continue;
				/** Алгоритм фильтрации по артибуту **/
				// если ребенок имеет атрибут нужен особый алгоритм
				if (focusIndexedAttr && tmp.hasAttribute(focusIndexedAttr)) {
					// получаем фокусный список детей элемента
					const tmpChildTabIndexesElements = getTabIndexList(tmp.children, focusIndexedAttr);
					if (tmpChildTabIndexesElements.length) {
						const activeElement = document.activeElement as HTMLElement;
						// есть ли активый элемент среди детей
						const indexOfFocusedElement = tmpChildTabIndexesElements.indexOf(activeElement);
						// получим сохраненый индекс из атрибута
						let savedFocusIndex = tmp.getAttribute(focusIndexedAttr) ? +tmp.getAttribute(focusIndexedAttr) : null;
						// является ли зависимым от родительского навигатора
						const noParentDependence = tmp.hasAttribute(noParentDependenceAttr);
						// ориентация из атрибута
						const childOrientation = tmp.getAttribute(childOrientationAttr);
						// если зависим от родителя и ориентация не совпадает с родителем, а также у родителя сохранен индекс для детей
						// перепишем сохраненый индекс
						if (!noParentDependence && parentOrientation != +childOrientation && childFocusIndex != null) {
							savedFocusIndex = childFocusIndex;
						}
						// если сохраненый индекс выходит за массив, скорректируем
						if (savedFocusIndex >= tmpChildTabIndexesElements.length) {
							savedFocusIndex = tmpChildTabIndexesElements.length - 1;
						}
						// вычислим новый индекс реббенка для участия в родительском листе
						let childIndex = 0;
						if (indexOfFocusedElement != -1) {
							// если есть активный элемент, то берем его
							childIndex = indexOfFocusedElement;
						} else if (savedFocusIndex != null) {
							// иначе, если есть сохраненый, берем его
							childIndex = savedFocusIndex;
						}
						// добавляем ребенка в родительский лист
						const tmpChild = tmpChildTabIndexesElements[childIndex];
						if (!tmpChild) continue;
						retval.push(tmpChild);
					}
					continue;
				}
				if (tmp.hasAttribute('tabIndex')) {
					// элемент может быть в фокусе
					const tabIndex = tmp.getAttribute('tabIndex').valueOf();
					if (tabIndex != '-1') retval.push(tmp);
				}
				// вглубь то же самое
				walk(tmp.children);
			}
		};
		// обходим все дерево элементов
		walk(children);
		//
		return retval;
	}
}
