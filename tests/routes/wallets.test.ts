import Fastify from 'fastify';
import walletRoutes from '../../src/routes/wallets';
import { errorHandler } from '../../src/middleware/errorHandler';

// Mock services
jest.mock('../../src/services/magic');
jest.mock('../../src/services/biconomy');

import magicService from '../../src/services/magic';
import biconomyService from '../../src/services/biconomy';

const mockMagicService = magicService as jest.Mocked<typeof magicService>;
const mockBiconomyService = biconomyService as jest.Mocked<typeof biconomyService>;

describe('Wallet Routes', () => {
  let fastify: any;

  beforeEach(async () => {
    fastify = Fastify();
    fastify.setErrorHandler(errorHandler);
    await fastify.register(walletRoutes, { prefix: '/wallets' });
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await fastify.close();
  });

  describe('POST /wallets/create', () => {
    it('should create a smart wallet', async () => {
      const mockUser = {
        userId: 'user123',
        email: 'test@example.com',
        walletAddress: '0x123456789abcdef',
        subject: null,
        audience: null,
        issuedAt: Date.now(),
        expiresAt: Date.now() + 3600000,
        notBefore: null,
        tokenId: null,
        additionalData: null
      };

      const mockResult = {
        smartAccountAddress: '0xSmartAccountAddress' as `0x${string}`,
        userAddress: '0x123456789abcdef',
        deployed: false,
        message: 'Smart account created',
        apiKey: 'test-api-key',
        projectId: 'test-project',
        bundlerUrl: 'https://bundler.biconomy.io',
        paymasterUrl: 'https://paymaster.biconomy.io',
        chainId: 137,
        usdcContract: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'
      };

      mockMagicService.validateDIDToken.mockResolvedValue(mockUser);
      mockBiconomyService.createUserWalletFromAddress.mockResolvedValue(mockResult);

      const response = await fastify.inject({
        method: 'POST',
        url: '/wallets/create',
        headers: {
          authorization: 'Bearer test-did-token'
        },
        payload: {
          walletAddress: '0x123456789abcdef'
        }
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.status).toBe('SUCCESS');
      expect(body.data.user.id).toBe(mockUser.userId);
      expect(body.data.smartAccount.smartAccountAddress).toBe(mockResult.smartAccountAddress);
    });
  });

  describe('GET /wallets/smart-account/:userAddress', () => {
    it('should get smart account address', async () => {
      const mockResult = {
        smartAccountAddress: '0xSmartAccountAddress',
        bundlerUrl: 'https://bundler.biconomy.io',
        note: 'Use createUserWallet() with actual signer for full Smart Account'
      };

      mockBiconomyService.getSmartAccountAddress.mockResolvedValue(mockResult);

      const response = await fastify.inject({
        method: 'GET',
        url: '/wallets/smart-account/0x123456789abcdef'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.status).toBe('SUCCESS');
      expect(body.data.smartAccountAddress).toBe(mockResult.smartAccountAddress);
    });
  });

  describe('POST /wallets/smart-account', () => {
    it('should create smart account for user', async () => {
      const mockResult = {
        smartAccountAddress: '0xSmartAccountAddress',
        bundlerUrl: 'https://bundler.biconomy.io',
        note: 'Use createUserWallet() with actual signer for full Smart Account'
      };

      mockBiconomyService.getSmartAccountAddress.mockResolvedValue(mockResult);

      const response = await fastify.inject({
        method: 'POST',
        url: '/wallets/smart-account',
        payload: {
          userAddress: '0x123456789abcdef'
        }
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.status).toBe('SUCCESS');
      expect(body.data.smartAccountAddress).toBe(mockResult.smartAccountAddress);
    });
  });

  describe('POST /wallets/execute', () => {
    it('should execute transaction', async () => {
      const mockResult = {
        userOpHash: '0x123abc',
        transaction: { to: '0xRecipient', value: 0, data: '0x' },
        message: 'Transaction executed successfully via Biconomy bundler'
      };

      mockBiconomyService.executeTransaction.mockResolvedValue(mockResult);

      const response = await fastify.inject({
        method: 'POST',
        url: '/wallets/execute',
        payload: {
          smartAccount: { address: '0xSmartAccountAddress' },
          transaction: { to: '0xRecipient', value: 0, data: '0x' }
        }
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.status).toBe('SUCCESS');
      expect(body.data.userOpHash).toBe(mockResult.userOpHash);
    });
  });
});
