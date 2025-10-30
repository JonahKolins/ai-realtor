import GetRequest from "../../../main/requests/GetRequest";
import AuthAwareResponseHandler from "../../../main/handlers/AuthAwareResponseHandler";
import { IListing as IListingBase, ListingType, ListingStatus } from './GetListingsRequest';

// Расширенный интерфейс для детального просмотра объявления
export interface IListing extends IListingBase {
    description?: string;
    summary?: string;
    highlights?: string[];
    keywords?: string[];
    metaDescription?: string;
    propertyType?: string;
}

export type { ListingType, ListingStatus } from './GetListingsRequest';

export class GetListingRequest extends GetRequest<IListing> {
    private listingId: string;

    constructor(listingId: string) {
        super();
        this.listingId = listingId;
    }

    protected get url(): string {
        return `/listings/${this.listingId}`;
    }

    protected responseHandler = new AuthAwareResponseHandler<IListing>();
}
