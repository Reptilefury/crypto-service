import { ResponseCode, ResponseCodeType } from '../response/ResponseCode';

export class AppException extends Error {
    public readonly responseCode: ResponseCodeType;
    public readonly details?: any;

    constructor(responseCode: ResponseCodeType, message?: string, details?: any) {
        super(message || responseCode.message);
        this.responseCode = responseCode;
        this.details = details;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class ValidationException extends AppException {
    constructor(details: any) {
        super(ResponseCode.VALIDATION_ERROR, undefined, details);
    }
}

export class UnauthorizedException extends AppException {
    constructor(message?: string) {
        super(ResponseCode.UNAUTHORIZED, message);
    }
}

export class ForbiddenException extends AppException {
    constructor(message?: string) {
        super(ResponseCode.FORBIDDEN, message);
    }
}

export class NotFoundException extends AppException {
    constructor(message?: string) {
        super(ResponseCode.NOT_FOUND, message);
    }
}

export class BusinessException extends AppException {
    constructor(responseCode: ResponseCodeType, message?: string, details?: any) {
        super(responseCode, message, details);
    }
}

export class ExternalServiceException extends AppException {
    constructor(message?: string, details?: any) {
        super(ResponseCode.EXTERNAL_SERVICE_ERROR, message, details);
    }
}
