export default interface IResponseHandler<TData> {
    handleResponse(response: Response): Promise<TData>;
}