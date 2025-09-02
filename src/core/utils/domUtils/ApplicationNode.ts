import {EventHandle} from "../../event/EventHandle";
import {EventEmitter} from "../../event/EventEmmiter";
import {ResizeObserveController} from "../browserApi/ResizeObserveController";
import {RuntimeError} from "../../errors/RuntimeError";
import {Instance} from "../../entity/Instance";
import {domUtils} from "./domUtils";


export type ApplicationResizeMessage = { width: number; height: number; };
export type ApplicationResizeHandle = EventHandle<ApplicationResizeMessage>;
export type ApplicationResizeEmitter = EventEmitter<ApplicationResizeMessage>;

const ROOT_CONTAINER_TAG_NAME: string = 'application';

// помогатор для тэга <application/>
// window.innerHeight нельзя использовать для изменения размеров, только от body или ниже по иерархии, ввиду специфики мобильных браузеров (адресная строка прячется / landscape)
// после срабатывания window.onResize в window.innerHeight не актуальные размеры в общем случае!
export class ApplicationNode {
    private readonly _element: HTMLElement;
    private _width: number;
    private _height: number;
    //
    private readonly _sizeChangedEvent: ApplicationResizeEmitter;
    private readonly _resizeObserveController: ResizeObserveController;

    constructor() {
        this._element = document.getElementsByTagName(ROOT_CONTAINER_TAG_NAME)[0] as HTMLElement;
        if (!this._element) throw new RuntimeError('ApplicationNode: the <application/> node was not found');
        //
        this._sizeChangedEvent = new EventEmitter<ApplicationResizeMessage>('application_resize');
        //
        this.resizeObserveController_onResize = this.resizeObserveController_onResize.bind(this);
        // так как нода вызывается раньше чем проверяется браузер, надо учесть, что браузер может не поддерживать
        this._resizeObserveController = !window.ResizeObserver ? null : new ResizeObserveController();
        this._resizeObserveController?.observe(this._element, this.resizeObserveController_onResize);
        //
        this.setSizeParameters();
    }

    // событие изменения размеров приложения
    public get onResize() { return this._sizeChangedEvent; }

    // корневой элемент
    public get element() { return this._element; }

    // актуальная ширина
    public get width() { return this._width; }

    // актуальная высота
    public get height() { return this._height; }

    // singleton
    public static get instance() { return Instance.getOrCreate<ApplicationNode>(ApplicationNode, 'ApplicationNode'); }

    // размер изменился
    private resizeObserveController_onResize(entry: ResizeObserverEntry) {
        this.setSizeParameters();
        this._sizeChangedEvent.emit({ width: this._width, height: this._height });
    }

    // установить актуальные параметры размеров
    private setSizeParameters() {
        const rect = this.element.getBoundingClientRect();
        this._width = rect.width;
        this._height = rect.height;
        //
        this.setCSSVars(rect);
    }

    // установить переменные css
    private setCSSVars(rect: DOMRect) {
        domUtils.setCSSVariable('appWidth', `${rect.width}px`);
        domUtils.setCSSVariable('appHeight', `${rect.height}px`);
    }
}
