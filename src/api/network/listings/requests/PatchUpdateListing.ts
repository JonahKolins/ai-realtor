import PatchRequest from "../../../main/requests/PatchRequest";
import JSONResponseHandler from "../../../main/handlers/JSONResponseHandler";
import { IListing, ListingType, ListingStatus } from "./GetListingsRequest";
import { PropertyType } from "@/classes/listings/Listing.types";

// Интерфейс для частичного обновления объявления
export interface IUpdateListingRequest {
    id: string; // ID объявления для обновления
    title?: string;
    price?: number;
    status?: ListingStatus;
    type?: ListingType;
    propertyType?: PropertyType;
    userFields?: Record<string, any>; // Мёрджим поверх существующих
}

// Интерфейс тела запроса (без ID, так как он в URL)
export interface IUpdateListingRequestBody {
    title?: string;
    price?: number;
    status?: ListingStatus;
    type?: ListingType;
    userFields?: Record<string, any>;
}

export class PatchUpdateListing extends PatchRequest<IListing> {
    protected url: string;
    protected body: IUpdateListingRequestBody;
    
    constructor(params: IUpdateListingRequest) {
        super();
        
        const { id, ...bodyData } = params;
        this.url = `/listings/${id}`;
        this.body = bodyData;
    }

    protected responseHandler = new JSONResponseHandler<IListing>();
}
