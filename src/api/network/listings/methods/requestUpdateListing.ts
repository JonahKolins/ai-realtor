import { IUpdateListingRequest, PatchUpdateListing } from "../requests/PatchUpdateListing";
import { IListing } from "../requests/GetListingsRequest";

// запрос на обновление объявления (включая черновик)
export const requestUpdateListing = async (params: IUpdateListingRequest): Promise<IListing> => {
    const updateListingRequest = new PatchUpdateListing(params);

    const data = await updateListingRequest.send();

    return data;
}