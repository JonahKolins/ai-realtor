import GetRequest from "../../../main/requests/GetRequest";
import AuthAwareResponseHandler from "@/api/main/handlers/AuthAwareResponseHandler";

export interface IListingPhotoVariant {
    w1600?: string;      // S3 ключ для размера 1600px
    w1024?: string;      // S3 ключ для размера 1024px
    w512?: string;       // S3 ключ для размера 512px
}

export interface IListingPhoto {
    id: string;              // UUID фотографии
    status: "UPLOADING" | "PROCESSING" | "READY" | "FAILED";
    isCover: boolean;        // Является ли обложкой
    sortOrder: number;       // Порядок сортировки
    mime: string | null;     // MIME тип
    width: number | null;    // Ширина в пикселях
    height: number | null;   // Высота в пикселях
    variants: {              // Варианты изображения
        webp?: IListingPhotoVariant;
        avif?: IListingPhotoVariant;
    } | null;
    cdnBaseUrl: string;      // "https://media.casalabia.dev/"
    createdAt: string;       // ISO дата создания
    updatedAt: string;       // ISO дата обновления
}

export type IGetListingPhotosResponse = IListingPhoto[];

// класс запроса на получение списка фотографий объявления
export class GetListingPhotos extends GetRequest<IGetListingPhotosResponse> {

    constructor(private listingId: string) {
        super();
    }

    protected url = `/listings/${this.listingId}/photos`;

    protected responseHandler = new AuthAwareResponseHandler<IGetListingPhotosResponse>();
}
