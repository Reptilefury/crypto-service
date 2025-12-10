export enum ResponseStatus {
    SUCCESS = 'SUCCESS',
    ERROR = 'ERROR',
    WARNING = 'WARNING'
}

export interface IResponseCode {
    code: string;
    message: string;
    httpStatus: number;
}

export const ResponseCode = {
    // Success
    SUCCESS: { code: 'SUCCESS', message: 'Operation successful', httpStatus: 200 },
    CREATED: { code: 'CREATED', message: 'Resource created successfully', httpStatus: 201 },

    // Client Errors
    BAD_REQUEST: { code: 'BAD_REQUEST', message: 'Bad request', httpStatus: 400 },
    VALIDATION_ERROR: { code: 'VALIDATION_ERROR', message: 'Validation failed', httpStatus: 400 },
    UNAUTHORIZED: { code: 'UNAUTHORIZED', message: 'Unauthorized access', httpStatus: 401 },
    FORBIDDEN: { code: 'FORBIDDEN', message: 'Access forbidden', httpStatus: 403 },
    NOT_FOUND: { code: 'NOT_FOUND', message: 'Resource not found', httpStatus: 404 },
    METHOD_NOT_ALLOWED: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed', httpStatus: 405 },
    CONFLICT: { code: 'CONFLICT', message: 'Resource conflict', httpStatus: 409 },

    // Business Errors
    INVALID_CREDENTIALS: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials', httpStatus: 401 },
    DUPLICATE_USER: { code: 'DUPLICATE_USER', message: 'User already exists', httpStatus: 409 },
    INSUFFICIENT_FUNDS: { code: 'INSUFFICIENT_FUNDS', message: 'Insufficient funds', httpStatus: 400 },

    // Server Errors
    INTERNAL_SERVER_ERROR: { code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error', httpStatus: 500 },
    DATABASE_ERROR: { code: 'DATABASE_ERROR', message: 'Database error', httpStatus: 500 },
    EXTERNAL_SERVICE_ERROR: { code: 'EXTERNAL_SERVICE_ERROR', message: 'External service error', httpStatus: 502 },
    SERVICE_UNAVAILABLE: { code: 'SERVICE_UNAVAILABLE', message: 'Service unavailable', httpStatus: 503 },
} as const;

export type ResponseCodeType = typeof ResponseCode[keyof typeof ResponseCode];
