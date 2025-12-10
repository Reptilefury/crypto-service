import chainlinkService from '../../src/services/chainlink';
import { ExternalServiceException, BusinessException } from '../../src/common/exception/AppException';

describe('ChainlinkService', () => {
  describe('getPrice', () => {
    it('should get price for valid symbol', async () => {
      const result = await chainlinkService.getPrice('ETH/USD');

      expect(result.symbol).toBe('ETH/USD');
      expect(result.price).toBeDefined();
    });

    it('should handle invalid symbol', async () => {
      await expect(chainlinkService.getPrice('INVALID/USD'))
        .rejects
        .toThrow(BusinessException);
    });
  });

  describe('getAvailableFeeds', () => {
    it('should return available price feeds', () => {
      const result = chainlinkService.getAvailableFeeds();

      expect(result.feeds).toBeInstanceOf(Array);
      expect(result.feeds.length).toBeGreaterThan(0);
    });
  });
});
