// Mock Magic SDK before importing
jest.mock('@magic-sdk/admin', () => ({
  Magic: jest.fn().mockImplementation(() => ({
    token: {
      validate: jest.fn().mockResolvedValue(true),
    },
    users: {
      getMetadataByToken: jest.fn().mockResolvedValue({
        issuer: 'did:ethr:0x123',
        email: 'test@example.com',
        publicAddress: '0x123456789',
      }),
      getMetadataByIssuer: jest.fn().mockResolvedValue({
        issuer: 'did:ethr:0x123',
        email: 'test@example.com',
        publicAddress: '0x123456789',
      }),
    },
  })),
}));

import Fastify from 'fastify';
import authRoutes from '../../src/routes/auth';

describe('Auth Routes', () => {
  let fastify: any;

  beforeEach(async () => {
    fastify = Fastify();
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
      expect(result.success).toBe(true);
    });

    it('should return 400 for missing DID token', async () => {
      const response = await fastify.inject({
        method: 'POST',
        url: '/auth/validate',
        payload: {}
      });

      expect(response.statusCode).toBe(400);
      const result = JSON.parse(response.payload);
      expect(result.error).toBe('DID token is required');
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
