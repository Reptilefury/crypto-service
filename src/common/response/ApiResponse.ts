import { ResponseCode, ResponseCodeType, ResponseStatus } from './ResponseCode';

export interface ApiError {
    code: string;
    message: string;
    details?: any;
    traceId?: string;
}

export class ApiResponse<T> {
    status: ResponseStatus;
    data?: T;
    error?: ApiError;
    timestamp: string;

    constructor(status: ResponseStatus, data?: T, error?: ApiError) {
        this.status = status;
        this.data = data;
        this.error = error;
        this.timestamp = new Date().toISOString();
    }

    static success<T>(data: T, message?: string): ApiResponse<T> {
        return new ApiResponse(ResponseStatus.SUCCESS, data);
    }

    static created<T>(data: T): ApiResponse<T> {
        return new ApiResponse(ResponseStatus.SUCCESS, data);
    }

    static error(responseCode: ResponseCodeType, message?: string, details?: any): ApiResponse<null> {
        const error: ApiError = {
            code: responseCode.code,
            message: message || responseCode.message,
            details
        };
        return new ApiResponse(ResponseStatus.ERROR, undefined as any, error);
    }

    static validationError(details: any): ApiResponse<null> {
        return ApiResponse.error(ResponseCode.VALIDATION_ERROR, undefined, details);
    }
}
