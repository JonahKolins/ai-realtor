import { IGetListingPhotosResponse, GetListingPhotos } from "../requests/GetListingPhotos";

// запрос на получение списка фотографий объявления
export const requestListingPhotos = async (listingId: string): Promise<IGetListingPhotosResponse> => {
    const listingPhotosRequest = new GetListingPhotos(listingId);

    const data: IGetListingPhotosResponse = await listingPhotosRequest.send();

    return data;
}
