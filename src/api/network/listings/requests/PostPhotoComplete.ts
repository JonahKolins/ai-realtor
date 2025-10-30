import PostRequest from "../../../main/requests/PostRequest";
import AuthAwareResponseHandler from "@/api/main/handlers/AuthAwareResponseHandler";

export interface ICompletePhotoUploadRequest {
    assetId: string;         // UUID из слота загрузки
    key: string;             // S3 ключ загруженного файла
    size: number;            // Размер файла в байтах (1 - 20MB)
    width: number;           // Ширина изображения (1-10000)
    height: number;          // Высота изображения (1-10000)
    originalName?: string;   // Оригинальное имя файла
    mime: string;            // MIME тип из разрешенных
}

export interface ICompletePhotoUploadResponse {
    status: "QUEUED" | "PROCESSING";
    photoId: string;         // UUID созданной записи фотографии
}

// класс запроса на подтверждение загрузки фотографии
export class PostPhotoComplete extends PostRequest<ICompletePhotoUploadResponse> {

    constructor(private listingId: string, private params: ICompletePhotoUploadRequest) {
        super();
    }

    protected url = `/listings/${this.listingId}/photos/complete`;

    protected responseHandler = new AuthAwareResponseHandler<ICompletePhotoUploadResponse>();

    protected body = {
        ...this.params
    }
}
