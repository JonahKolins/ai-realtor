import { GetListingRequest, IListing } from "../requests/GetListingRequest";

export const requestListing = async (listingId: string): Promise<IListing> => {
    const getListingRequest = new GetListingRequest(listingId);
    const data: IListing = await getListingRequest.send();
    return data;
};
