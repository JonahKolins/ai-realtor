import { ICreateListingDraftRequest, ICreateListingDraftResponse, PostCreateListingDraft } from "../requests/PostCreateListingDraft";

// запрос на создание черновика объявления
export const requestCreateListingDraft = async (params: ICreateListingDraftRequest): Promise<ICreateListingDraftResponse> => {
    const createListingDraftRequest = new PostCreateListingDraft(params);

    const data: ICreateListingDraftResponse = await createListingDraftRequest.send();

    return data;
}