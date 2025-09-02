import IResponseHandler from './IResponseHandler';

export default class JSONResponseHandler<TData> implements IResponseHandler<TData> {
    async handleResponse(response: Response): Promise<TData> {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Response is not JSON');
        }

        try {
            const data = await response.json();
            return data as TData;
        } catch (error) {
            throw new Error(`Failed to parse JSON response: ${error}`);
        }
    }
}