import { GetListingsRequest, IListingsResponse, IListingsRequestParams } from "../requests/GetListingsRequest";

export const requestListings = async (params?: IListingsRequestParams): Promise<IListingsResponse> => {
    const getListingsRequest = new GetListingsRequest(params);

    const data: IListingsResponse = await getListingsRequest.send();

    return data;
}