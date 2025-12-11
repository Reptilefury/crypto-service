import Fastify from 'fastify';
import { errorHandler } from '../../src/middleware/errorHandler';
import { 
  BusinessException, 
  ExternalServiceException, 
  UnauthorizedException, 
  NotFoundException 
} from '../../src/common/exception/AppException';
import { ResponseCode } from '../../src/common/response/ResponseCode';

describe('Error Handler Middleware', () => {
  let fastify: any;

  beforeEach(async () => {
    fastify = Fastify({ logger: false });
    fastify.setErrorHandler(errorHandler);
    
    // Add test routes that throw different types of errors
    fastify.get('/business-error', async () => {
      throw new BusinessException(ResponseCode.INVALID_INPUT, 'Invalid input provided');
    });

    fastify.get('/external-error', async () => {
      throw new ExternalServiceException('External service unavailable');
    });

    fastify.get('/unauthorized-error', async () => {
      throw new UnauthorizedException('Access denied');
    });

    fastify.get('/not-found-error', async () => {
      throw new NotFoundException('Resource not found');
    });

    fastify.get('/generic-error', async () => {
      throw new Error('Generic error message');
    });
  });

  afterEach(async () => {
    await fastify.close();
  });

  describe('BusinessException handling', () => {
    it('should handle BusinessException correctly', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/business-error'
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.status).toBe('FAILED');
      expect(body.error.code).toBe(ResponseCode.INVALID_INPUT.code);
      expect(body.error.message).toBe('Invalid input provided');
    });
  });

  describe('ExternalServiceException handling', () => {
    it('should handle ExternalServiceException correctly', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/external-error'
      });

      expect(response.statusCode).toBe(502);
      const body = JSON.parse(response.body);
      expect(body.status).toBe('FAILED');
      expect(body.error.code).toBe(ResponseCode.EXTERNAL_SERVICE_ERROR.code);
      expect(body.error.message).toBe('External service unavailable');
    });
  });

  describe('UnauthorizedException handling', () => {
    it('should handle UnauthorizedException correctly', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/unauthorized-error'
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.body);
      expect(body.status).toBe('FAILED');
      expect(body.error.code).toBe(ResponseCode.UNAUTHORIZED.code);
      expect(body.error.message).toBe('Access denied');
    });
  });

  describe('NotFoundException handling', () => {
    it('should handle NotFoundException correctly', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/not-found-error'
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.body);
      expect(body.status).toBe('FAILED');
      expect(body.error.code).toBe(ResponseCode.NOT_FOUND.code);
      expect(body.error.message).toBe('Resource not found');
    });
  });

  describe('Generic Error handling', () => {
    it('should handle generic errors correctly', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/generic-error'
      });

      expect(response.statusCode).toBe(500);
      const body = JSON.parse(response.body);
      expect(body.status).toBe('ERROR');
      expect(body.error.code).toBe(ResponseCode.INTERNAL_SERVER_ERROR.code);
      expect(body.error.message).toBe('An unexpected error occurred');
    });
  });
});
