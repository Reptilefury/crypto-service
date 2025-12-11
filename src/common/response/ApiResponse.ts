import { ResponseCode, ResponseCodeType, ResponseStatus } from './ResponseCode';

export interface ApiError {
    code: number;
    message: string;
    details?: any;
    traceId?: string;
}

export class ApiResponse<T> {
    status: ResponseStatus;
    code: number;
    message?: string;
    data?: T;
    error?: ApiError;
    timestamp: string;

    constructor(status: ResponseStatus, code: number, data?: T, error?: ApiError, message?: string) {
        this.status = status;
        this.code = code;
        this.message = message;
        this.data = data;
        this.error = error;
        this.timestamp = new Date().toISOString();
    }

    static success<T>(data: T, message?: string): ApiResponse<T> {
        return new ApiResponse(ResponseStatus.SUCCESS, ResponseCode.SUCCESS.code, data, undefined, message || ResponseCode.SUCCESS.message);
    }

    static created<T>(data: T, message?: string): ApiResponse<T> {
        return new ApiResponse(ResponseStatus.SUCCESS, ResponseCode.CREATED.code, data, undefined, message || ResponseCode.CREATED.message);
    }

    static failed(responseCode: ResponseCodeType, message?: string, details?: any): ApiResponse<null> {
        const friendlyMessage = message || responseCode.message;
        const error: ApiError = {
            code: responseCode.code,
            message: friendlyMessage,
            details
        };
        return new ApiResponse(ResponseStatus.FAILED, responseCode.code, undefined as any, error, friendlyMessage);
    }

    static error(responseCode: ResponseCodeType, message?: string, details?: any): ApiResponse<null> {
        const msg = message || responseCode.message;
        const error: ApiError = {
            code: responseCode.code,
            message: msg,
            details
        };
        return new ApiResponse(ResponseStatus.ERROR, responseCode.code, undefined as any, error, msg);
    }

    static validationError(details: any): ApiResponse<null> {
        return ApiResponse.failed(ResponseCode.VALIDATION_ERROR, undefined, details);
    }
}
