import Fastify from 'fastify';
import authRoutes from '../../src/routes/auth';
import { errorHandler } from '../../src/middleware/errorHandler';

describe('Auth Routes', () => {
  let fastify: any;

  beforeEach(async () => {
    fastify = Fastify();
    fastify.setErrorHandler(errorHandler);
    await fastify.register(authRoutes, { prefix: '/auth' });
  });

  afterEach(async () => {
    await fastify.close();
  });

  describe('POST /auth/validate', () => {
    it('should validate DID token successfully', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/auth/validate',
        payload: {
          didToken: 'valid_token'
        }
      });

      expect(response.statusCode).toBe(200);
      const result = JSON.parse(response.payload);
      expect(result.status).toBe('SUCCESS');
      expect(result.data.user).toBeDefined();
    });

    it('should return 400 for missing DID token', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/auth/validate',
        payload: {}
      });

      expect(response.statusCode).toBe(400);
      const result = JSON.parse(response.payload);
      expect(result.status).toBe('FAILED');
      expect(result.error).toBeDefined();
    });
  });

  describe('GET /auth/user/:userId', () => {
    it('should get user metadata', async () => {
      const response = await fastify.inject({
        method: 'GET',
        url: '/auth/user/did:ethr:0x123'
      });

      expect(response.statusCode).toBe(200);
    });
  });
});
