import PostRequest from "../../../main/requests/PostRequest";
import JSONResponseHandler from "@/api/main/handlers/JSONResponseHandler";
import { IListingUserFields, ListingStatus, ListingType } from "./GetListingsRequest";
import { PropertyType } from "@/classes/listings/Listing.types";
import { IListingDraftData } from "@/classes/listings/ListingDraft";

export interface ICreateListingDraftRequest {
    type?: ListingType;
    propertyType?: PropertyType;
    title?: string;
    summary?: string;
    description?: string;
    highlights?: string[];
    keywords?: string[];
    metaDescription?: string;
    price?: number;
    userFields?: IListingUserFields;
}

export interface ICreateListingDraftResponse {
    id: string;
    status: ListingStatus;
    data: IListingDraftData;
    createdAt: string;
    updatedAt: string;
}

const POST_CREATE_LISTING_DRAFT_URL = '/listings';

// класс запроса на создание черновика объявления
export class PostCreateListingDraft extends PostRequest<ICreateListingDraftResponse> {

    constructor(private params: ICreateListingDraftRequest) {
        super();
    }

    protected url = POST_CREATE_LISTING_DRAFT_URL;

    protected responseHandler = new JSONResponseHandler<ICreateListingDraftResponse>();

    protected body = {
        ...this.params
    }
}