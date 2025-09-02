export default class RequestTimeoutError extends Error {
    public readonly url: string;
    public readonly requestInit: RequestInit;
    public readonly timeout: number;

    constructor(url: string, requestInit: RequestInit, timeout: number) {
        super(`Request timeout: ${url} (${timeout}ms)`);
        this.name = 'RequestTimeoutError';
        this.url = url;
        this.requestInit = requestInit;
        this.timeout = timeout;
    }
}