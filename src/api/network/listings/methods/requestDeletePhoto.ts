import { DeletePhoto, DeleteAllPhotos, IDeletePhotoResponse, IDeleteAllPhotosResponse } from "../requests/DeletePhoto";

// запрос на удаление одной фотографии
export const requestDeletePhoto = async (listingId: string, photoId: string): Promise<IDeletePhotoResponse> => {
    const deletePhotoRequest = new DeletePhoto(listingId, photoId);

    const data: IDeletePhotoResponse = await deletePhotoRequest.send();

    return data;
}

// запрос на удаление всех фотографий объявления
export const requestDeleteAllPhotos = async (listingId: string): Promise<IDeleteAllPhotosResponse> => {
    const deleteAllPhotosRequest = new DeleteAllPhotos(listingId);

    const data: IDeleteAllPhotosResponse = await deleteAllPhotosRequest.send();

    return data;
}
