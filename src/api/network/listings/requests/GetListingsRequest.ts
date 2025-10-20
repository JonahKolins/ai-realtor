import GetRequest from "../../../main/requests/GetRequest";
import JSONResponseHandler from "../../../main/handlers/JSONResponseHandler";

export enum ListingType {
    SALE = 'sale',
    RENT = 'rent',
}
export type ListingStatus = 'draft' | 'ready' | 'archived';

export interface IListingUserFields {
    city: string;
    district: string;
    street: string;
    floor: number;
    balcony: boolean;
    parking: boolean;
}

export interface IListing {
    id: string;
    type: ListingType;
    status: ListingStatus;
    title: string;
    price: number;
    userFields: IListingUserFields;
    createdAt: string;
    updatedAt: string;
}

export interface IListingsResponse {
    items: IListing[];
    page: number;
    limit: number;
    total: number;
}

export interface IListingsRequestParams {
    status?: ListingStatus;
    type?: ListingType;
    q?: string;
    page?: number;
    limit?: number;
    sort?: string;
}

const GET_LISTINGS_URL = '/listings';

export class GetListingsRequest extends GetRequest<IListingsResponse> {
    private params: IListingsRequestParams;

    constructor(params: IListingsRequestParams = {}) {
        super();
        this.params = {
            page: 1,
            limit: 20,
            sort: '-createdAt',
            ...params
        };
    }

    protected get url(): string {
        const queryParams = new URLSearchParams();
        
        Object.entries(this.params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                queryParams.append(key, value.toString());
            }
        });

        const queryString = queryParams.toString();
        return `${GET_LISTINGS_URL}${queryString ? `?${queryString}` : ''}`;
    }

    protected responseHandler = new JSONResponseHandler<IListingsResponse>();
}