import PostRequest from "../../../main/requests/PostRequest";
import AuthAwareResponseHandler from "@/api/main/handlers/AuthAwareResponseHandler";

export interface IRequestPhotoUploadsRequest {
    count: number;           // 1-10, количество слотов
    mimeTypes?: string[];    // ["image/jpeg", "image/png", "image/webp", "image/heic"]
}

export interface IPhotoUploadSlot {
    assetId: string;       // "photo-uuid-1"
    key: string;           // "uploads/users/{userId}/listings/{listingId}/{photoId}/orig.heic"
    uploadUrl: string;     // "https://s3.amazonaws.com/bucket/key?..."
}

export interface IRequestPhotoUploadsResponse {
    items: IPhotoUploadSlot[];
    expiresInSeconds: number; // 300
}

// класс запроса на получение слотов загрузки фотографий
export class PostPhotoUploads extends PostRequest<IRequestPhotoUploadsResponse> {

    constructor(private listingId: string, private params: IRequestPhotoUploadsRequest) {
        super();
    }

    protected url = `/listings/${this.listingId}/photos/uploads`;

    protected responseHandler = new AuthAwareResponseHandler<IRequestPhotoUploadsResponse>();

    protected body = {
        ...this.params
    }
}
