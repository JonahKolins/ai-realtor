import { IRequestPhotoUploadsRequest, IRequestPhotoUploadsResponse, PostPhotoUploads } from "../requests/PostPhotoUploads";

// запрос на получение слотов загрузки фотографий
export const requestPhotoUploads = async (listingId: string, params: IRequestPhotoUploadsRequest): Promise<IRequestPhotoUploadsResponse> => {
    const photoUploadsRequest = new PostPhotoUploads(listingId, params);

    const data: IRequestPhotoUploadsResponse = await photoUploadsRequest.send();

    return data;
}
