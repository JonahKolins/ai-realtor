import { IGenerateAIDescriptionRequest, PostGenerateAIDescription, IAIGenerationResponse } from "../requests/PostGenerateAIDescription";

// запрос на генерацию AI описания для листинга
export const requestGenerateAIDescription = async (params: IGenerateAIDescriptionRequest): Promise<IAIGenerationResponse> => {
    const generateAIDescriptionRequest = new PostGenerateAIDescription(params);

    const data = await generateAIDescriptionRequest.send();

    return data;
}
