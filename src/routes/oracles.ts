import { FastifyPluginAsync } from 'fastify';
import chainlinkService from '../services/chainlink';
import umaService from '../services/uma';
import { ApiResponse } from '../common/response/ApiResponse';
import { ValidationException } from '../common/exception/AppException';

const oracleRoutes: FastifyPluginAsync = async (fastify) => {

  // Chainlink Routes

  // Get price feed from Chainlink
  fastify.get('/chainlink/price/:symbol', async (request, reply) => {
    const { symbol } = request.params as { symbol: string };

    const result = await chainlinkService.getPrice(symbol.toUpperCase());

    return reply.send(ApiResponse.success(result));
  });

  // Resolve market based on price
  fastify.post('/chainlink/resolve', async (request, reply) => {
    const { marketId, symbol, targetPrice, comparisonType, resolutionTime } = request.body as {
      marketId: string;
      symbol: string;
      targetPrice: string;
      comparisonType: 'above' | 'below';
      resolutionTime?: number;
    };

    if (!marketId || !symbol || !targetPrice || !comparisonType) {
      throw new ValidationException({ error: 'Market ID, symbol, target price, and comparison type are required' });
    }

    const result = await chainlinkService.resolveMarket(marketId, symbol, targetPrice, comparisonType, resolutionTime);

    return reply.send(ApiResponse.success(result));
  });

  // Validate price for market
  fastify.post('/chainlink/validate', async (request, reply) => {
    const { symbol, targetPrice, comparisonType } = request.body as {
      symbol: string;
      targetPrice: string;
      comparisonType: 'above' | 'below';
    };

    if (!symbol || !targetPrice || !comparisonType) {
      throw new ValidationException({ error: 'Symbol, target price, and comparison type are required' });
    }

    const result = await chainlinkService.validatePriceForMarket(symbol, targetPrice, comparisonType);

    return reply.send(ApiResponse.success(result));
  });

  // Get available price feeds
  fastify.get('/chainlink/feeds', async (request, reply) => {
    const result = chainlinkService.getAvailableFeeds();
    return reply.send(ApiResponse.success(result));
  });

  // Chainlink Functions Routes

  // Request Functions resolution (Simulated)
  fastify.post('/chainlink/functions/resolve', async (request, reply) => {
    const { marketId, apiEndpoint, sourceCode } = request.body as {
      marketId: string;
      apiEndpoint: string;
      sourceCode: string;
    };

    if (!marketId || !apiEndpoint || !sourceCode) {
      throw new ValidationException({ error: 'Market ID, API endpoint, and source code are required' });
    }

    const result = await chainlinkService.requestFunctionsResolution(marketId, apiEndpoint, sourceCode);

    return reply.send(ApiResponse.success(result));
  });

  // Simulate Functions script
  fastify.post('/chainlink/functions/simulate', async (request, reply) => {
    const { sourceCode, args } = request.body as {
      sourceCode: string;
      args: string[];
    };

    if (!sourceCode) {
      throw new ValidationException({ error: 'Source code is required' });
    }

    const result = await chainlinkService.simulateFunctionsScript(sourceCode, args || []);

    return reply.send(ApiResponse.success(result));
  });

  // Get Functions config
  fastify.get('/chainlink/functions/config', async (request, reply) => {
    const result = chainlinkService.getFunctionsConfig();
    return reply.send(ApiResponse.success(result));
  });

  // UMA Routes

  // Request market resolution via UMA
  fastify.post('/uma/request', async (request, reply) => {
    const { marketId, question, resolutionTime } = request.body as {
      marketId: string;
      question: string;
      resolutionTime: number;
    };

    if (!marketId || !question || !resolutionTime) {
      throw new ValidationException({ error: 'Market ID, question, and resolution time are required' });
    }

    const result = await umaService.requestMarketResolution(marketId, question, resolutionTime);

    return reply.send(ApiResponse.success(result));
  });

  // Propose market outcome
  fastify.post('/uma/propose', async (request, reply) => {
    const { marketId, outcome, evidence } = request.body as {
      marketId: string;
      outcome: string;
      evidence?: string;
    };

    if (!marketId || !outcome) {
      throw new ValidationException({ error: 'Market ID and outcome are required' });
    }

    const result = await umaService.proposeMarketOutcome(marketId, outcome, evidence);

    return reply.send(ApiResponse.success(result));
  });

  // Dispute market outcome
  fastify.post('/uma/dispute', async (request, reply) => {
    const { marketId, reason } = request.body as {
      marketId: string;
      reason: string;
    };

    if (!marketId || !reason) {
      throw new ValidationException({ error: 'Market ID and dispute reason are required' });
    }

    const result = await umaService.disputeMarketOutcome(marketId, reason);

    return reply.send(ApiResponse.success(result));
  });

  // Settle market
  fastify.post('/uma/settle', async (request, reply) => {
    const { marketId } = request.body as { marketId: string };

    if (!marketId) {
      throw new ValidationException({ error: 'Market ID is required' });
    }

    const result = await umaService.settleMarket(marketId);

    return reply.send(ApiResponse.success(result));
  });

  // Get market request status
  fastify.get('/uma/request/:marketId/:identifier/:timestamp', async (request, reply) => {
    const { marketId, identifier, timestamp } = request.params as {
      marketId: string;
      identifier: string;
      timestamp: string;
    };

    const result = await umaService.getMarketRequest(marketId, identifier, parseInt(timestamp));

    return reply.send(ApiResponse.success(result));
  });

  // Get UMA oracle info
  fastify.get('/uma/info', async (request, reply) => {
    const result = await umaService.getOptimisticOracleInfo();
    return reply.send(ApiResponse.success(result));
  });

  // General oracle resolution endpoint
  fastify.post('/resolve', async (request, reply) => {
    const { marketId, oracleType, params } = request.body as {
      marketId: string;
      oracleType: 'chainlink' | 'uma';
      params: any;
    };

    if (!marketId || !oracleType) {
      throw new ValidationException({ error: 'Market ID and oracle type are required' });
    }

    if (oracleType === 'chainlink') {
      const result = await chainlinkService.validatePriceForMarket(marketId, params.expectedPrice, params.tolerance);
      return reply.send(ApiResponse.success(result));
    } else if (oracleType === 'uma') {
      const result = await umaService.settleMarket(marketId);
      return reply.send(ApiResponse.success(result));
    } else {
      throw new ValidationException({ error: 'Invalid oracle type' });
    }
  });

};

export default oracleRoutes;
