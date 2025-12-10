import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ApiResponse } from '../common/response/ApiResponse';
import { AppException } from '../common/exception/AppException';
import { ResponseCode } from '../common/response/ResponseCode';
import { randomUUID } from 'crypto';

export const errorHandler = (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
    const traceId = randomUUID().substring(0, 8);
    request.log.error({ err: error, traceId }, 'Request failed');

    if (error instanceof AppException) {
        const response = ApiResponse.error(error.responseCode, error.message, error.details);
        if (response.error) {
            response.error.traceId = traceId;
        }
        return reply.status(error.responseCode.httpStatus).send(response);
    }

    // Handle Fastify validation errors
    if (error.validation) {
        const details = error.validation.map(v => ({
            field: v.instancePath,
            message: v.message
        }));
        const response = ApiResponse.validationError(details);
        if (response.error) {
            response.error.traceId = traceId;
        }
        return reply.status(ResponseCode.VALIDATION_ERROR.httpStatus).send(response);
    }

    // Handle unexpected errors
    const response = ApiResponse.error(ResponseCode.INTERNAL_SERVER_ERROR, 'An unexpected error occurred');
    if (response.error) {
        response.error.traceId = traceId;
        // In development, include stack trace
        if (process.env.NODE_ENV !== 'production') {
            response.error.details = error.stack;
        }
    }

    return reply.status(ResponseCode.INTERNAL_SERVER_ERROR.httpStatus).send(response);
};
