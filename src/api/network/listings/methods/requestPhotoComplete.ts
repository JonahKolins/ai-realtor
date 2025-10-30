import { ICompletePhotoUploadRequest, ICompletePhotoUploadResponse, PostPhotoComplete } from "../requests/PostPhotoComplete";

// запрос на подтверждение загрузки фотографии
export const requestPhotoComplete = async (listingId: string, params: ICompletePhotoUploadRequest): Promise<ICompletePhotoUploadResponse> => {
    const photoCompleteRequest = new PostPhotoComplete(listingId, params);

    const data: ICompletePhotoUploadResponse = await photoCompleteRequest.send();

    return data;
}
