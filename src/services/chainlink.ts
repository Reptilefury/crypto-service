import { ethers } from 'ethers';
import { config } from '../config';
import { simulateScript, decodeResult } from '@chainlink/functions-toolkit';
import { ReturnType } from '@chainlink/functions-toolkit/dist/types';

// Chainlink Price Feed ABI (simplified)
const PRICE_FEED_ABI = [
  'function latestRoundData() external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)',
  'function decimals() external view returns (uint8)',
  'function description() external view returns (string)'
];

// Common Chainlink price feed addresses on Polygon
const PRICE_FEEDS = {
  'ETH/USD': '0xF9680D99D6C9589e2a93a78A04A279e509205945',
  'BTC/USD': '0xc907E116054Ad103354f2D350FD2514433D57F6f',
  'MATIC/USD': '0xAB594600376Ec9fD91F8e885dADF0CE036862dE0',
  'USDC/USD': '0xfE4A8cc5b5B2366C1B58Bea3858e81843581b2F7'
};

// Heartbeat thresholds (in seconds) - how often feeds should update
const HEARTBEAT_THRESHOLDS = {
  'ETH/USD': 3600,    // 1 hour
  'BTC/USD': 3600,    // 1 hour
  'MATIC/USD': 120,   // 2 minutes
  'USDC/USD': 86400   // 24 hours (stablecoin)
};

class ChainlinkService {
  private provider: ethers.JsonRpcProvider;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(config.blockchain.rpcUrl);
  }

  /**
   * Get latest price from Chainlink oracle with staleness check
   * @param symbol - Price feed symbol (e.g., 'ETH/USD')
   * @returns Price data with validation
   */
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

      // Check for stale data
      const currentTime = Math.floor(Date.now() / 1000);
      const heartbeat = HEARTBEAT_THRESHOLDS[symbol as keyof typeof HEARTBEAT_THRESHOLDS] || 3600;
      const isStale = (currentTime - Number(updatedAt)) > heartbeat;

      const price = ethers.formatUnits(answer, decimals);

      return {
        success: true,
        data: {
          symbol,
          price,
          decimals: Number(decimals),
          roundId: roundId.toString(),
          updatedAt: new Date(Number(updatedAt) * 1000).toISOString(),
          feedAddress,
          isStale,
          staleness: currentTime - Number(updatedAt),
          heartbeat
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch price'
      };
    }
  }

  /**
   * Validate price for prediction market resolution
   * @param symbol - Price feed symbol
   * @param targetPrice - Target price to check against
   * @param comparisonType - 'above' or 'below'
   * @returns Validation result for market resolution
   */
  async validatePriceForMarket(
    symbol: string,
    targetPrice: string,
    comparisonType: 'above' | 'below' = 'above'
  ) {
    try {
      const priceResult = await this.getPrice(symbol);

      if (!priceResult.success || !priceResult.data) {
        return {
          success: false,
          error: 'Failed to fetch price for validation'
        };
      }

      const { price, isStale, updatedAt } = priceResult.data;

      // Don't allow stale data for market resolution
      if (isStale) {
        return {
          success: false,
          error: 'Price data is stale - cannot resolve market',
          staleness: priceResult.data.staleness
        };
      }

      const currentPrice = parseFloat(price);
      const target = parseFloat(targetPrice);

      const conditionMet = comparisonType === 'above'
        ? currentPrice > target
        : currentPrice < target;

      return {
        success: true,
        symbol,
        currentPrice: price,
        targetPrice,
        comparisonType,
        conditionMet,
        updatedAt,
        message: `Price ${conditionMet ? 'meets' : 'does not meet'} condition: ${symbol} ${comparisonType} ${targetPrice}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Price validation failed'
      };
    }
  }

  /**
   * Resolve a prediction market based on Chainlink price feed
   * @param marketId - Market identifier
   * @param symbol - Price feed symbol
   * @param targetPrice - Target price for resolution
   * @param comparisonType - 'above' or 'below'
   * @param resolutionTime - Optional specific time for resolution
   * @returns Market resolution result
   */
  async resolveMarket(
    marketId: string,
    symbol: string,
    targetPrice: string,
    comparisonType: 'above' | 'below',
    resolutionTime?: number
  ) {
    try {
      // If resolution time is specified, check if it's reached
      if (resolutionTime) {
        const currentTime = Math.floor(Date.now() / 1000);
        if (currentTime < resolutionTime) {
          return {
            success: false,
            error: 'Resolution time has not been reached yet',
            resolutionTime: new Date(resolutionTime * 1000).toISOString()
          };
        }
      }

      const validation = await this.validatePriceForMarket(symbol, targetPrice, comparisonType);

      if (!validation.success) {
        return {
          success: false,
          marketId,
          error: validation.error
        };
      }

      return {
        success: true,
        marketId,
        resolved: true,
        outcome: validation.conditionMet ? 'YES' : 'NO',
        symbol,
        finalPrice: validation.currentPrice,
        targetPrice,
        comparisonType,
        resolvedAt: validation.updatedAt,
        message: `Market resolved: ${validation.message}`
      };
    } catch (error) {
      return {
        success: false,
        marketId,
        error: error instanceof Error ? error.message : 'Market resolution failed'
      };
    }
  }

  /**
   * Check if price is within reasonable bounds
   * @param symbol - Price feed symbol
   * @param minPrice - Minimum acceptable price
   * @param maxPrice - Maximum acceptable price
   * @returns Validation result
   */
  async checkPriceBounds(symbol: string, minPrice: string, maxPrice: string) {
    try {
      const priceResult = await this.getPrice(symbol);

      if (!priceResult.success || !priceResult.data) {
        return {
          success: false,
          error: 'Failed to fetch price'
        };
      }

      const currentPrice = parseFloat(priceResult.data.price);
      const min = parseFloat(minPrice);
      const max = parseFloat(maxPrice);

      const withinBounds = currentPrice >= min && currentPrice <= max;

      return {
        success: true,
        symbol,
        currentPrice: priceResult.data.price,
        minPrice,
        maxPrice,
        withinBounds,
        message: withinBounds
          ? 'Price is within acceptable bounds'
          : `Price ${currentPrice} is outside bounds [${min}, ${max}]`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Bounds check failed'
      };
    }
  }

  /**
   * Get all available price feeds
   */
  getAvailableFeeds() {
    return {
      success: true,
      feeds: Object.keys(PRICE_FEEDS).map(symbol => ({
        symbol,
        address: PRICE_FEEDS[symbol as keyof typeof PRICE_FEEDS],
        network: 'Polygon',
        heartbeat: HEARTBEAT_THRESHOLDS[symbol as keyof typeof HEARTBEAT_THRESHOLDS] || 3600
      }))
    };
  }

  /**
   * Request resolution via Chainlink Functions (Simulated for backend)
   * @param marketId - Market ID
   * @param apiEndpoint - API endpoint to fetch data from
   * @param sourceCode - JavaScript source code to run in oracle
   * @returns Request status and simulated result
   */
  async requestFunctionsResolution(
    marketId: string,
    apiEndpoint: string,
    sourceCode: string
  ) {
    try {
      // In a real production environment with smart contracts, this would:
      // 1. Send a transaction to the Functions Router
      // 2. Wait for fulfillment via event listener

      // For this backend implementation, we will SIMULATE the execution
      // This allows testing the oracle logic without gas costs or waiting

      const args = [apiEndpoint];

      const simulationResult = await simulateScript({
        source: sourceCode,
        args: args,
        bytesArgs: [], // No bytes args for now
        secrets: {} // No secrets for public APIs
      });

      if (simulationResult.errorString) {
        return {
          success: false,
          marketId,
          error: simulationResult.errorString,
          logs: simulationResult.capturedTerminalOutput
        };
      }

      // Decode result (assuming string response for now)
      // In production, you'd handle different return types
      const resultString = simulationResult.responseBytesHexstring;

      return {
        success: true,
        marketId,
        status: 'simulated_success',
        result: resultString,
        decodedResult: simulationResult.responseBytesHexstring, // Raw hex for now
        logs: simulationResult.capturedTerminalOutput,
        message: 'Chainlink Functions simulation successful'
      };
    } catch (error) {
      return {
        success: false,
        marketId,
        error: error instanceof Error ? error.message : 'Functions request failed'
      };
    }
  }

  /**
   * Simulate a Chainlink Functions script
   * @param sourceCode - JavaScript source code
   * @param args - Arguments for the script
   * @returns Simulation result
   */
  async simulateFunctionsScript(sourceCode: string, args: string[]) {
    try {
      const result = await simulateScript({
        source: sourceCode,
        args: args,
        bytesArgs: [],
        secrets: {}
      });

      return {
        success: !result.errorString,
        result: result.responseBytesHexstring,
        error: result.errorString,
        logs: result.capturedTerminalOutput
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Simulation failed'
      };
    }
  }

  /**
   * Get Chainlink Functions configuration
   */
  getFunctionsConfig() {
    return {
      success: true,
      config: config.chainlink.functions
    };
  }
}

export default new ChainlinkService();
