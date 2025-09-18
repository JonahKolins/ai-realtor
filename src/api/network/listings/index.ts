export { requestListings } from './methods/requestListings';
export { requestUpdateListing } from './methods/requestUpdateListing';
export { requestCreateListingDraft } from './methods/requestCreateListingDraft';
export { requestGenerateAIDescription } from './methods/requestGenerateAIDescription';
export type { 
    IListing, 
    IListingsResponse, 
    IListingsRequestParams,
    ListingType,
    ListingStatus 
} from './requests/GetListingsRequest';
export type {
    IUpdateListingRequest,
    IUpdateListingRequestBody
} from './requests/PatchUpdateListing';
export type {
    ICreateListingDraftRequest,
    ICreateListingDraftResponse
} from './requests/PostCreateListingDraft';
export type {
    IGenerateAIDescriptionRequest,
    IAIGenerationResponse,
    AILocale,
    AITone,
    AILength
} from './requests/PostGenerateAIDescription';
export { GetListingsRequest } from './requests/GetListingsRequest';
export { PatchUpdateListing } from './requests/PatchUpdateListing';
export { PostCreateListingDraft } from './requests/PostCreateListingDraft';
export { PostGenerateAIDescription } from './requests/PostGenerateAIDescription';
