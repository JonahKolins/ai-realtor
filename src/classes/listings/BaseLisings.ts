import { Instance } from "../../core/entity";
import { IListing, requestListings, IListingsRequestParams } from "../../api/network/listings";
import { EventEmitter } from "../../core/event/EventEmmiter";

export class BaseListings {
    private _listings: IListing[];
    private _page: number;
    private _limit: number;
    private _total: number;
    private _loading: boolean;
    private _error: string | null;
    private _currentParams: IListingsRequestParams;

    public readonly listingsChanged: EventEmitter<void>;
    
    constructor() {
        this._listings = [];
        this._page = 1;
        this._limit = 20;
        this._total = 0;
        this._loading = false;
        this._error = null;
        this._currentParams = {};

        this.listingsChanged = new EventEmitter('listingsChanged');
    }

    // синглтон
    public static get instance() {
        return Instance.getOrCreate<BaseListings>(BaseListings, 'BaseListings');
    }

    public get listings(): IListing[] {
        return this._listings;
    }

    public get page(): number {
        return this._page;
    }

    public get limit(): number {
        return this._limit;
    }

    public get total(): number {
        return this._total;
    }

    public get loading(): boolean {
        return this._loading;
    }
    
    public get error(): string | null {
        return this._error;
    }

    public get currentParams(): IListingsRequestParams {
        return this._currentParams;
    }

    // читаем листинги
    public readListings(params?: IListingsRequestParams): Promise<void> {
        return new Promise((resolve, reject) => {
            this._loading = true;
            this._error = null;
            
            const requestParams = {
                ...this._currentParams,
                ...params,
                page: params?.page || this._page,
                limit: params?.limit || this._limit,
            };

            this._currentParams = requestParams;

            requestListings(requestParams)
                .then((listings) => {
                    this._listings = listings.items;
                    this._page = listings.page;
                    this._limit = listings.limit;
                    this._total = listings.total;
                    resolve();
                })
                .catch((error) => {
                    this._error = error.message;
                    reject();
                })
                .finally(() => {
                    this._loading = false;
                    this.listingsChanged.emit();
                });
        });
    }

    // изменить страницу
    public changePage(page: number): Promise<void> {
        return this.readListings({ ...this._currentParams, page });
    }

    // применить фильтры
    public applyFilters(params: IListingsRequestParams): Promise<void> {
        return this.readListings({ ...params, page: 1 });
    }

    // сбросить фильтры
    public resetFilters(): Promise<void> {
        this._currentParams = {};
        return this.readListings({ page: 1 });
    }
}