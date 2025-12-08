import { ethers } from 'ethers';
import { config } from '../config';

// Chainlink Price Feed ABI (simplified)
const PRICE_FEED_ABI = [
  'function latestRoundData() external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)',
  'function decimals() external view returns (uint8)'
];

// Common Chainlink price feed addresses on Polygon
const PRICE_FEEDS = {
  'ETH/USD': '0xF9680D99D6C9589e2a93a78A04A279e509205945',
  'BTC/USD': '0xc907E116054Ad103354f2D350FD2514433D57F6f',
  'MATIC/USD': '0xAB594600376Ec9fD91F8e885dADF0CE036862dE0',
  'USDC/USD': '0xfE4A8cc5b5B2366C1B58Bea3858e81843581b2F7'
};

class ChainlinkService {
  private provider: ethers.JsonRpcProvider;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(config.blockchain.rpcUrl);
  }

  async getPrice(symbol: string) {
    try {
      const feedAddress = PRICE_FEEDS[symbol as keyof typeof PRICE_FEEDS];
      
      if (!feedAddress) {
        return {
          success: false,
          error: `Price feed not available for ${symbol}`
        };
      }

      const priceFeed = new ethers.Contract(feedAddress, PRICE_FEED_ABI, this.provider);
      
      const [roundId, answer, startedAt, updatedAt, answeredInRound] = await priceFeed.latestRoundData();
      const decimals = await priceFeed.decimals();
      
      const price = ethers.formatUnits(answer, decimals);
      
      return {
        success: true,
        data: {
          symbol,
          price,
          decimals: Number(decimals),
          roundId: roundId.toString(),
          updatedAt: new Date(Number(updatedAt) * 1000).toISOString(),
          feedAddress
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch price'
      };
    }
  }

  async getPriceAtTimestamp(symbol: string, timestamp: number) {
    try {
      // Get historical price data (requires additional Chainlink integration)
      // This is a placeholder for historical data fetching
      
      return {
        success: true,
        data: {
          symbol,
          price: '0.00',
          timestamp: new Date(timestamp * 1000).toISOString(),
          message: 'Historical price data integration pending'
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch historical price'
      };
    }
  }

  async validatePriceForMarket(marketId: string, expectedPrice: string, tolerance: number = 0.05) {
    try {
      // Validate price for market resolution
      // This would compare expected vs actual price within tolerance
      
      return {
        success: true,
        marketId,
        expectedPrice,
        actualPrice: '0.00',
        withinTolerance: true,
        tolerance,
        message: 'Price validation logic pending'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Price validation failed'
      };
    }
  }

  getAvailableFeeds() {
    return {
      success: true,
      feeds: Object.keys(PRICE_FEEDS).map(symbol => ({
        symbol,
        address: PRICE_FEEDS[symbol as keyof typeof PRICE_FEEDS],
        network: 'Polygon'
      }))
    };
  }
}

export default new ChainlinkService();
