import Fastify from 'fastify';
import escrowRoutes from '../../src/routes/escrow';
import { errorHandler } from '../../src/middleware/errorHandler';

// Mock the gnosis service
jest.mock('../../src/services/gnosis');
import gnosisService from '../../src/services/gnosis';

// Create type-safe mock
const mockGnosisService = gnosisService as jest.Mocked<typeof gnosisService>;

describe('Escrow Routes', () => {
  let fastify: any;

  beforeEach(async () => {
    fastify = Fastify();
    fastify.setErrorHandler(errorHandler);
    await fastify.register(escrowRoutes, { prefix: '/escrow' });
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await fastify.close();
  });

  describe('POST /escrow/create-safe', () => {
    it('should create Safe with default parameters', async () => {
      const mockResult = {
        safeAddress: '0xEBD3c785be50b5268251a421D940eadDee3e4Da3',
        owners: ['0x5D0F0f1bE93F562D5c4A37cF583CC14238514c84'],
        threshold: 1,
        platformSigner: '0xE202311D37084f485e3eD0f9B03a26E882De0411',
        isDeployed: false,
        message: 'Safe wallet created successfully using Safe SDK'
      };

      mockGnosisService.createMarketEscrowSafe.mockResolvedValue(mockResult);

      const response = await fastify.inject({
        method: 'POST',
        url: '/escrow/create-safe',
        payload: {}
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.status).toBe('SUCCESS');
      expect(body.data.safeAddress).toBe(mockResult.safeAddress);
    });

    it('should create Safe with custom owners and threshold', async () => {
      const customOwners = ['0x1234567890123456789012345678901234567890'];
      const customThreshold = 1;

      const mockResult = {
        safeAddress: '0xABCDEF1234567890ABCDEF1234567890ABCDEF12',
        owners: customOwners,
        threshold: customThreshold,
        platformSigner: '0xE202311D37084f485e3eD0f9B03a26E882De0411',
        isDeployed: false,
        message: 'Safe wallet created successfully using Safe SDK'
      };

      mockGnosisService.createMarketEscrowSafe.mockResolvedValue(mockResult);

      const response = await fastify.inject({
        method: 'POST',
        url: '/escrow/create-safe',
        payload: {
          owners: customOwners,
          threshold: customThreshold
        }
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.owners).toEqual(customOwners);
      expect(body.data.threshold).toBe(customThreshold);
    });
  });

  describe('POST /escrow/deploy', () => {
    it('should deploy Safe successfully', async () => {
      const mockResult = {
        safeAddress: '0xEBD3c785be50b5268251a421D940eadDee3e4Da3',
        message: 'Safe deployed successfully',
        transactionHash: '0xabcdef1234567890',
        blockNumber: 12345
      };

      mockGnosisService.deploySafe.mockResolvedValue(mockResult);

      const response = await fastify.inject({
        method: 'POST',
        url: '/escrow/deploy',
        payload: {
          safeAddress: '0xEBD3c785be50b5268251a421D940eadDee3e4Da3'
        }
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.transactionHash).toBe(mockResult.transactionHash);
    });
  });

  describe('GET /escrow/safe/:safeAddress', () => {
    it('should return Safe information', async () => {
      const mockResult = {
        address: '0xEBD3c785be50b5268251a421D940eadDee3e4Da3',
        owners: ['0x5D0F0f1bE93F562D5c4A37cF583CC14238514c84'],
        threshold: 1,
        nonce: 0,
        usdcBalance: '100.0',
        chainId: 137
      };

      mockGnosisService.getSafeInfo.mockResolvedValue(mockResult);

      const response = await fastify.inject({
        method: 'GET',
        url: '/escrow/safe/0xEBD3c785be50b5268251a421D940eadDee3e4Da3'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.address).toBe(mockResult.address);
      expect(body.data.usdcBalance).toBe(mockResult.usdcBalance);
    });
  });

  describe('POST /escrow/release', () => {
    it('should release escrow funds', async () => {
      const mockResult = {
        transactionHash: '0xabcdef1234567890',
        safeAddress: '0xEBD3c785be50b5268251a421D940eadDee3e4Da3',
        recipient: '0x1234567890123456789012345678901234567890',
        amount: '100.0',
        message: 'Escrow released successfully'
      };

      mockGnosisService.executeEscrowRelease.mockResolvedValue(mockResult);

      const response = await fastify.inject({
        method: 'POST',
        url: '/escrow/release',
        payload: {
          safeAddress: '0xEBD3c785be50b5268251a421D940eadDee3e4Da3',
          recipient: '0x1234567890123456789012345678901234567890',
          amount: '100.0'
        }
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.transactionHash).toBe(mockResult.transactionHash);
    });
  });

  describe('POST /escrow/propose', () => {
    it('should propose transaction to Safe', async () => {
      const mockResult = {
        transactionHash: '0xsafetxhash123',
        safeAddress: '0xEBD3c785be50b5268251a421D940eadDee3e4Da3',
        transaction: { to: '0x1234567890123456789012345678901234567890', value: '0', data: '0x' },
        message: 'Transaction proposed successfully',
        note: ''
      };

      mockGnosisService.proposeTransaction.mockResolvedValue(mockResult);

      const response = await fastify.inject({
        method: 'POST',
        url: '/escrow/propose',
        payload: {
          safeAddress: '0xEBD3c785be50b5268251a421D940eadDee3e4Da3',
          transaction: {
            to: '0x1234567890123456789012345678901234567890',
            value: '0',
            data: '0x'
          }
        }
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.transactionHash).toBe(mockResult.transactionHash);
    });
  });
});
