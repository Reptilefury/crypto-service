export enum ResponseStatus {
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED',
    ERROR = 'ERROR',
    WARNING = 'WARNING'
}

export interface IResponseCode {
    code: number;
    message: string;
    httpStatus: number;
}

export const ResponseCode = {
    // Success (2000-2999)
    SUCCESS: { code: 2000, message: 'Operation completed successfully', httpStatus: 200 },
    CREATED: { code: 2001, message: 'Resource created successfully', httpStatus: 201 },
    UPDATED: { code: 2002, message: 'Resource updated successfully', httpStatus: 200 },
    DELETED: { code: 2003, message: 'Resource deleted successfully', httpStatus: 200 },

    // Authentication/User Operations (2400-2499)
    USER_REGISTERED: { code: 2400, message: 'User registered successfully', httpStatus: 201 },
    USER_AUTHENTICATED: { code: 2401, message: 'User authenticated successfully', httpStatus: 200 },
    USER_PROFILE_UPDATED: { code: 2402, message: 'User profile updated successfully', httpStatus: 200 },
    TOKEN_REFRESHED: { code: 2403, message: 'Authentication token refreshed', httpStatus: 200 },

    // Client Errors (3000-3999)
    VALIDATION_ERROR: { code: 3000, message: 'Validation failed', httpStatus: 400 },
    INVALID_INPUT: { code: 3001, message: 'Invalid input provided', httpStatus: 400 },
    MISSING_REQUIRED_FIELD: { code: 3002, message: 'Required field is missing', httpStatus: 400 },
    INVALID_FORMAT: { code: 3003, message: 'Invalid format', httpStatus: 400 },
    INVALID_AMOUNT: { code: 3004, message: 'Invalid amount specified', httpStatus: 400 },

    // Authentication/Authorization Errors (3100-3199)
    UNAUTHORIZED: { code: 3100, message: 'Authentication required', httpStatus: 401 },
    INVALID_CREDENTIALS: { code: 3101, message: 'Invalid credentials provided', httpStatus: 401 },
    TOKEN_EXPIRED: { code: 3102, message: 'Authentication token has expired', httpStatus: 401 },
    TOKEN_INVALID: { code: 3103, message: 'Invalid authentication token', httpStatus: 401 },
    FORBIDDEN: { code: 3104, message: 'Access forbidden', httpStatus: 403 },
    INSUFFICIENT_PERMISSIONS: { code: 3105, message: 'Insufficient permissions for this operation', httpStatus: 403 },
    SESSION_EXPIRED: { code: 3106, message: 'Session has expired', httpStatus: 401 },
    ACCOUNT_LOCKED: { code: 3107, message: 'Account is locked', httpStatus: 403 },

    // Resource Not Found (3200-3299)
    NOT_FOUND: { code: 3200, message: 'Resource not found', httpStatus: 404 },
    USER_NOT_FOUND: { code: 3201, message: 'User not found', httpStatus: 404 },
    WALLET_NOT_FOUND: { code: 3205, message: 'Wallet not found', httpStatus: 404 },

    // Business Logic Errors (3300-3399)
    INSUFFICIENT_BALANCE: { code: 3300, message: 'Insufficient balance', httpStatus: 400 },
    DUPLICATE_USER: { code: 3320, message: 'User already exists', httpStatus: 409 },

    // Rate Limiting (3400-3499)
    RATE_LIMIT_EXCEEDED: { code: 3400, message: 'Rate limit exceeded', httpStatus: 429 },
    TOO_MANY_REQUESTS: { code: 3401, message: 'Too many requests', httpStatus: 429 },

    // Server Errors (4000-4999)
    INTERNAL_SERVER_ERROR: { code: 4000, message: 'Internal server error', httpStatus: 500 },
    SERVICE_UNAVAILABLE: { code: 4001, message: 'Service temporarily unavailable', httpStatus: 503 },
    TIMEOUT_ERROR: { code: 4002, message: 'Request timeout', httpStatus: 504 },
    PROCESSING_ERROR: { code: 4003, message: 'Error processing request', httpStatus: 500 },

    // Database Errors (4100-4199)
    DATABASE_ERROR: { code: 4100, message: 'Database error', httpStatus: 500 },
    DATABASE_CONNECTION_FAILED: { code: 4101, message: 'Database connection failed', httpStatus: 503 },
    DATABASE_TIMEOUT: { code: 4102, message: 'Database operation timeout', httpStatus: 504 },

    // External Service Errors (4200-4299)
    EXTERNAL_SERVICE_ERROR: { code: 4200, message: 'External service error', httpStatus: 502 },
    BLOCKCHAIN_ERROR: { code: 4201, message: 'Blockchain service error', httpStatus: 502 },
    PAYMENT_PROVIDER_ERROR: { code: 4204, message: 'Payment provider error', httpStatus: 502 },
    WALLET_SERVICE_ERROR: { code: 4206, message: 'Wallet service error', httpStatus: 502 },
    ORACLE_SERVICE_ERROR: { code: 4207, message: 'Oracle service error', httpStatus: 502 },
    MAGIC_AUTH_FAILED: { code: 4210, message: 'Magic authentication failed', httpStatus: 401 },
    ENCLAVE_API_ERROR: { code: 4211, message: 'Enclave API error', httpStatus: 502 },
    WEB3_AUTH_FAILED: { code: 4213, message: 'Web3 authentication failed', httpStatus: 401 },

} as const;

export type ResponseCodeType = typeof ResponseCode[keyof typeof ResponseCode];
