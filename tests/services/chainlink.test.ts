import chainlinkService from '../../src/services/chainlink';

// Mock ethers
jest.mock('ethers', () => ({
  JsonRpcProvider: jest.fn(),
  Contract: jest.fn(),
  formatUnits: jest.fn().mockReturnValue('2000.00'),
}));

describe('ChainlinkService', () => {
  describe('getPrice', () => {
    it('should get price for valid symbol', async () => {
      const result = await chainlinkService.getPrice('ETH/USD');

      expect(result.success).toBe(true);
      expect(result.data?.symbol).toBe('ETH/USD');
      expect(result.data?.price).toBeDefined();
    });

    it('should handle invalid symbol', async () => {
      const result = await chainlinkService.getPrice('INVALID/USD');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Price feed not available');
    });
  });

  describe('validatePriceForMarket', () => {
    it('should validate price within tolerance', async () => {
      const result = await chainlinkService.validatePriceForMarket('market123', '2000.00', 0.05);

      expect(result.success).toBe(true);
      expect(result.marketId).toBe('market123');
      expect(result.expectedPrice).toBe('2000.00');
    });
  });

  describe('getAvailableFeeds', () => {
    it('should return available price feeds', () => {
      const result = chainlinkService.getAvailableFeeds();

      expect(result.success).toBe(true);
      expect(result.feeds).toBeInstanceOf(Array);
      expect(result.feeds.length).toBeGreaterThan(0);
    });
  });
});
