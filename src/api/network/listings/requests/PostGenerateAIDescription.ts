import PostRequest from "@/api/main/requests/PostRequest";
import JSONResponseHandler from "@/api/main/handlers/JSONResponseHandler";

export type AILocale = 'it-IT' | 'ru-RU' | 'en-US';
export type AITone = 'professionale' | 'informale' | 'premium';
export type AILength = 'short' | 'medium' | 'long';

export interface IGenerateAIDescriptionRequest {
    listingId: string;
    locale: AILocale;
    tone: AITone;
    length: AILength;
}

export interface IAIGenerationResponse {
    title: string;
    summary: string;
    description: string;
    highlights: string[];
    disclaimer: string;
    seo: {
        keywords: string[];
        metaDescription: string;
    };
}

export interface IAIGenerationError {
    error: {
        code: string;
        message: string;
        details?: any[];
    };
}

const POST_GENERATE_AI_DESCRIPTION_URL = '/listings';

export class PostGenerateAIDescription extends PostRequest<IAIGenerationResponse> {
    // 5 minutes - max timeout for AI generation
    protected timeout = 60000 * 5;
    //
    protected url: string;
    protected body: {
        locale: AILocale;
        tone: AITone;
        length: AILength;
    };

    constructor(params: IGenerateAIDescriptionRequest) {
        super();
        const { listingId, ...bodyData } = params;
        this.url = `${POST_GENERATE_AI_DESCRIPTION_URL}/${listingId}/generate-draft`;
        this.body = bodyData;
    }

    protected responseHandler = new JSONResponseHandler<IAIGenerationResponse>();
}
