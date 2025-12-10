import { FastifyPluginAsync } from 'fastify';
import gnosisService from '../services/gnosis';
import { ApiResponse } from '../common/response/ApiResponse';
import { ValidationException } from '../common/exception/AppException';

const escrowRoutes: FastifyPluginAsync = async (fastify) => {

  // Create market escrow safe
  fastify.post('/create-safe', async (request, reply) => {
    const { owners, threshold } = request.body as {
      owners: string[];
      threshold?: number;
    };

    if (!owners || owners.length === 0) {
      throw new ValidationException({ owners: 'Owners array is required' });
    }

    const result = await gnosisService.createMarketEscrowSafe(owners, threshold);

    return reply.send(ApiResponse.success(result));
  });

  // Get safe information
  fastify.get('/safe/:safeAddress', async (request, reply) => {
    const { safeAddress } = request.params as { safeAddress: string };

    const result = await gnosisService.getSafeInfo(safeAddress);

    return reply.send(ApiResponse.success(result));
  });

  // Propose transaction to safe
  fastify.post('/propose', async (request, reply) => {
    const { safeAddress, transaction } = request.body as {
      safeAddress: string;
      transaction: any;
    };

    if (!safeAddress || !transaction) {
      throw new ValidationException({ error: 'Safe address and transaction are required' });
    }

    const result = await gnosisService.proposeTransaction(safeAddress, transaction);

    return reply.send(ApiResponse.success(result));
  });

  // Release escrow funds
  fastify.post('/release', async (request, reply) => {
    const { safeAddress, recipient, amount } = request.body as {
      safeAddress: string;
      recipient: string;
      amount: string;
    };

    if (!safeAddress || !recipient || !amount) {
      throw new ValidationException({ error: 'Safe address, recipient, and amount are required' });
    }

    const result = await gnosisService.executeEscrowRelease(safeAddress, recipient, amount);

    return reply.send(ApiResponse.success(result));
  });

};

export default escrowRoutes;
