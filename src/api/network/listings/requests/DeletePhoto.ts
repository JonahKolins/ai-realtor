import DeleteRequest from "../../../main/requests/DeleteRequest";
import AuthAwareResponseHandler from "@/api/main/handlers/AuthAwareResponseHandler";

export interface IDeletePhotoResponse {
    deleted: boolean;        // true при успешном удалении
}

export interface IDeleteAllPhotosResponse {
    deleted: number;         // Количество удаленных фотографий
}

// класс запроса на удаление одной фотографии
export class DeletePhoto extends DeleteRequest<IDeletePhotoResponse> {

    constructor(private listingId: string, private photoId: string) {
        super();
    }

    protected url = `/listings/${this.listingId}/photos/${this.photoId}`;

    protected responseHandler = new AuthAwareResponseHandler<IDeletePhotoResponse>();
}

// класс запроса на удаление всех фотографий объявления
export class DeleteAllPhotos extends DeleteRequest<IDeleteAllPhotosResponse> {

    constructor(private listingId: string) {
        super();
    }

    protected url = `/listings/${this.listingId}/photos`;

    protected responseHandler = new AuthAwareResponseHandler<IDeleteAllPhotosResponse>();
}
