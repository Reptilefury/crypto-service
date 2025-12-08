import { FastifyPluginAsync } from 'fastify';
import chainlinkService from '../services/chainlink';
import umaService from '../services/uma';

const oracleRoutes: FastifyPluginAsync = async (fastify) => {

  // Chainlink Routes

  // Get price feed from Chainlink
  fastify.get('/chainlink/price/:symbol', async (request, reply) => {
    const { symbol } = request.params as { symbol: string };

    const result = await chainlinkService.getPrice(symbol.toUpperCase());

    if (result.success) {
      return reply.send(result);
    } else {
      return reply.code(404).send(result);
    }
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
      return reply.code(400).send({ error: 'Market ID, symbol, target price, and comparison type are required' });
    }

    const result = await chainlinkService.resolveMarket(marketId, symbol, targetPrice, comparisonType, resolutionTime);

    if (result.success) {
      return reply.send(result);
    } else {
      return reply.code(500).send(result);
    }
  });

  // Validate price for market
  fastify.post('/chainlink/validate', async (request, reply) => {
    const { symbol, targetPrice, comparisonType } = request.body as {
      symbol: string;
      targetPrice: string;
      comparisonType: 'above' | 'below';
    };

    if (!symbol || !targetPrice || !comparisonType) {
      return reply.code(400).send({ error: 'Symbol, target price, and comparison type are required' });
    }

    const result = await chainlinkService.validatePriceForMarket(symbol, targetPrice, comparisonType);

    if (result.success) {
      return reply.send(result);
    } else {
      return reply.code(500).send(result);
    }
  });

  // Get available price feeds
  fastify.get('/chainlink/feeds', async (request, reply) => {
    const result = chainlinkService.getAvailableFeeds();
    return reply.send(result);
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
      return reply.code(400).send({ error: 'Market ID, API endpoint, and source code are required' });
    }

    const result = await chainlinkService.requestFunctionsResolution(marketId, apiEndpoint, sourceCode);

    if (result.success) {
      return reply.send(result);
    } else {
      return reply.code(500).send(result);
    }
  });

  // Simulate Functions script
  fastify.post('/chainlink/functions/simulate', async (request, reply) => {
    const { sourceCode, args } = request.body as {
      sourceCode: string;
      args: string[];
    };

    if (!sourceCode) {
      return reply.code(400).send({ error: 'Source code is required' });
    }

    const result = await chainlinkService.simulateFunctionsScript(sourceCode, args || []);

    if (result.success) {
      return reply.send(result);
    } else {
      return reply.code(500).send(result);
    }
  });

  // Get Functions config
  fastify.get('/chainlink/functions/config', async (request, reply) => {
    const result = chainlinkService.getFunctionsConfig();
    return reply.send(result);
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
      return reply.code(400).send({ error: 'Market ID, question, and resolution time are required' });
    }

    const result = await umaService.requestMarketResolution(marketId, question, resolutionTime);

    if (result.success) {
      return reply.send(result);
    } else {
      return reply.code(500).send(result);
    }
  });

  // Propose market outcome
  fastify.post('/uma/propose', async (request, reply) => {
    const { marketId, outcome, evidence } = request.body as {
      marketId: string;
      outcome: string;
      evidence?: string;
    };

    if (!marketId || !outcome) {
      return reply.code(400).send({ error: 'Market ID and outcome are required' });
    }

    const result = await umaService.proposeMarketOutcome(marketId, outcome, evidence);

    if (result.success) {
      return reply.send(result);
    } else {
      return reply.code(500).send(result);
    }
  });

  // Dispute market outcome
  fastify.post('/uma/dispute', async (request, reply) => {
    const { marketId, reason } = request.body as {
      marketId: string;
      reason: string;
    };

    if (!marketId || !reason) {
      return reply.code(400).send({ error: 'Market ID and dispute reason are required' });
    }

    const result = await umaService.disputeMarketOutcome(marketId, reason);

    if (result.success) {
      return reply.send(result);
    } else {
      return reply.code(500).send(result);
    }
  });

  // Settle market
  fastify.post('/uma/settle', async (request, reply) => {
    const { marketId } = request.body as { marketId: string };

    if (!marketId) {
      return reply.code(400).send({ error: 'Market ID is required' });
    }

    const result = await umaService.settleMarket(marketId);

    if (result.success) {
      return reply.send(result);
    } else {
      return reply.code(500).send(result);
    }
  });

  // Get market request status
  fastify.get('/uma/request/:marketId/:identifier/:timestamp', async (request, reply) => {
    const { marketId, identifier, timestamp } = request.params as {
      marketId: string;
      identifier: string;
      timestamp: string;
    };

    const result = await umaService.getMarketRequest(marketId, identifier, parseInt(timestamp));

    if (result.success) {
      return reply.send(result);
    } else {
      return reply.code(500).send(result);
    }
  });

  // Get UMA oracle info
  fastify.get('/uma/info', async (request, reply) => {
    const result = await umaService.getOptimisticOracleInfo();
    return reply.send(result);
  });

  // General oracle resolution endpoint
  fastify.post('/resolve', async (request, reply) => {
    const { marketId, oracleType, params } = request.body as {
      marketId: string;
      oracleType: 'chainlink' | 'uma';
      params: any;
    };

    if (!marketId || !oracleType) {
      return reply.code(400).send({ error: 'Market ID and oracle type are required' });
    }

    if (oracleType === 'chainlink') {
      const result = await chainlinkService.validatePriceForMarket(marketId, params.expectedPrice, params.tolerance);
      return reply.send(result);
    } else if (oracleType === 'uma') {
      const result = await umaService.settleMarket(marketId);
      return reply.send(result);
    } else {
      return reply.code(400).send({ error: 'Invalid oracle type' });
    }
  });

};

export default oracleRoutes;
