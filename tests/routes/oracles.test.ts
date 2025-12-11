import Fastify from 'fastify';
import oracleRoutes from '../../src/routes/oracles';
import { errorHandler } from '../../src/middleware/errorHandler';

// Mock services
jest.mock('../../src/services/chainlink');
jest.mock('../../src/services/uma');

import chainlinkService from '../../src/services/chainlink';
import umaService from '../../src/services/uma';

const mockChainlinkService = chainlinkService as jest.Mocked<typeof chainlinkService>;
const mockUmaService = umaService as jest.Mocked<typeof umaService>;

describe('Oracle Routes', () => {
  let fastify: any;

  beforeEach(async () => {
    fastify = Fastify();
    fastify.setErrorHandler(errorHandler);
    await fastify.register(oracleRoutes, { prefix: '/oracles' });
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await fastify.close();
  });

  describe('GET /oracles/chainlink/price/:symbol', () => {
    it('should get latest price from Chainlink', async () => {
      const mockResult = {
        symbol: 'ETH/USD',
        price: '2000.00',
        decimals: 8,
        roundId: '12345',
        updatedAt: new Date().toISOString(),
        feedAddress: '0xF9680D99D6C9589e2a93a78A04A279e509205945',
        isStale: false,
        staleness: 100,
        heartbeat: 3600
      };

      mockChainlinkService.getPrice.mockResolvedValue(mockResult);

      const response = await fastify.inject({
        method: 'GET',
        url: '/oracles/chainlink/price/ETH%2FUSD'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.status).toBe('SUCCESS');
      expect(body.data.symbol).toBe('ETH/USD');
    });
  });

  describe('POST /oracles/chainlink/resolve', () => {
    it('should resolve market based on price', async () => {
      const mockResult = {
        marketId: 'market-1',
        resolved: true,
        outcome: 'YES',
        symbol: 'ETH/USD',
        finalPrice: '2000.00',
        targetPrice: '2000',
        comparisonType: 'above' as 'above' | 'below',
        resolvedAt: new Date().toISOString(),
        message: 'Market resolved successfully'
      };

      mockChainlinkService.resolveMarket.mockResolvedValue(mockResult);

      const response = await fastify.inject({
        method: 'POST',
        url: '/oracles/chainlink/resolve',
        payload: {
          marketId: 'market-1',
          symbol: 'ETH/USD',
          targetPrice: '2000',
          comparisonType: 'above'
        }
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.resolved).toBe(true);
    });
  });

  describe('GET /oracles/chainlink/feeds', () => {
    it('should return available price feeds', async () => {
      const mockFeeds = {
        feeds: [
          {
            symbol: 'ETH/USD',
            address: '0xF9680D99D6C9589e2a93a78A04A279e509205945',
            network: 'Polygon',
            heartbeat: 3600
          },
          {
            symbol: 'BTC/USD',
            address: '0xc907E116054Ad103354f2D350FD2514433D57F6f',
            network: 'Polygon',
            heartbeat: 3600
          }
        ]
      };

      mockChainlinkService.getAvailableFeeds.mockReturnValue(mockFeeds);

      const response = await fastify.inject({
        method: 'GET',
        url: '/oracles/chainlink/feeds'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data).toBeDefined();
    });
  });

  describe('POST /oracles/uma/request', () => {
    it('should request UMA oracle resolution', async () => {
      const mockResult = {
        marketId: 'market-1',
        identifier: '0xidentifier',
        resolutionTime: Math.floor(Date.now() / 1000) + 86400,
        reward: '10.0',
        currency: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
        message: 'Resolution requested'
      };

      mockUmaService.requestMarketResolution.mockResolvedValue(mockResult);

      const response = await fastify.inject({
        method: 'POST',
        url: '/oracles/uma/request',
        payload: {
          marketId: 'market-1',
          question: 'Will ETH reach $5000?',
          resolutionTime: Math.floor(Date.now() / 1000) + 86400
        }
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.marketId).toBe('market-1');
    });
  });

  describe('POST /oracles/uma/propose', () => {
    it('should propose outcome to UMA', async () => {
      const mockResult = {
        marketId: 'market-1',
        outcome: 'YES',
        proposedPrice: '1.0',
        evidence: 'Price data shows...',
        message: 'Outcome proposal would be submitted to UMA Oracle'
      };

      mockUmaService.proposeMarketOutcome.mockResolvedValue(mockResult);

      const response = await fastify.inject({
        method: 'POST',
        url: '/oracles/uma/propose',
        payload: {
          marketId: 'market-1',
          outcome: 'YES',
          evidence: 'Price data shows...'
        }
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.outcome).toBe('YES');
    });
  });

  describe('GET /oracles/uma/info', () => {
    it('should return UMA oracle information', async () => {
      const mockInfo = {
        oracleAddress: '0x5953f2538F613E05bAED8A5AeFa8e6622467AD3D',
        network: 'Polygon',
        version: 'OptimisticOracle V3',
        features: []
      };

      mockUmaService.getOptimisticOracleInfo.mockResolvedValue(mockInfo);

      const response = await fastify.inject({
        method: 'GET',
        url: '/oracles/uma/info'
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.network).toBe('Polygon');
    });
  });
});
