export default class RequestNetworkProblemError extends Error {
    public readonly url: string;
    public readonly requestInit: RequestInit;
    public readonly originalError: unknown;

    constructor(url: string, requestInit: RequestInit, originalError: unknown) {
        super(`Network problem: ${url} - ${originalError}`);
        this.name = 'RequestNetworkProblemError';
        this.url = url;
        this.requestInit = requestInit;
        this.originalError = originalError;
    }
}