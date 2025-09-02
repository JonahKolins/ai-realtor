import IResponseHandler from "./IResponseHandler";

export class BlobResponseHandler<TData> implements IResponseHandler<TData> {
    public async handleResponse(response: Response): Promise<TData> {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const contentType = response.headers.get('Content-Type');
        
        // если ответ в формате JSON, парсим его как обычно
        if (contentType && contentType.includes('application/json')) {
            return await response.json() as TData;
        }
        
        // для бинарных данных создаем специальный ответ
        const blob = await response.blob();
        const fileName = this.getFileNameFromHeaders(response.headers) || 'document';
        const fileType = contentType || blob.type;
        
        // Создаем объект URL для доступа к содержимому файла
        const contentUrl = URL.createObjectURL(blob);
        
        // Создаем объект, соответствующий ожидаемой структуре TData
        return {
            status: 'success',
            document: {
                id: this.extractFileIdFromUrl(response.url),
                name: fileName,
                type: fileType,
                size: blob.size,
                uploadDate: Date.now(),
                contentUrl: contentUrl
            }
        } as unknown as TData;
    }

    private getFileNameFromHeaders(headers: Headers): string | null {
        const contentDisposition = headers.get('Content-Disposition');
        if (!contentDisposition) return null;
        
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
        if (matches && matches[1]) {
            return matches[1].replace(/['"]/g, '');
        }
        return null;
    }
    
    private extractFileIdFromUrl(url: string): string {
        // Извлекаем fileId из URL вида /claim/files/{sessionId}/{claimId}/{fileId}
        const parts = url.split('/');
        if (parts.length > 0) {
            return parts[parts.length - 1];
        }
        return 'unknown';
    }
}