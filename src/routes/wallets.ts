import { FastifyPluginAsync } from 'fastify';
import biconomyService from '../services/biconomy';
import { ApiResponse } from '../common/response/ApiResponse';
import { ValidationException } from '../common/exception/AppException';

const walletRoutes: FastifyPluginAsync = async (fastify) => {

  // Create smart account for user
  fastify.post('/smart-account', async (request, reply) => {
    const { userAddress } = request.body as { userAddress: string };

    if (!userAddress) {
      throw new ValidationException({ userAddress: 'User address is required' });
    }

    // For creation, we need a signer, but here we just return the deterministic address
    // In a real app, this endpoint would likely receive a signed message or be authenticated
    const result = await biconomyService.getSmartAccountAddress(userAddress);

    return reply.send(ApiResponse.success(result));
  });

  // Get smart account address
  fastify.get('/smart-account/:userAddress', async (request, reply) => {
    const { userAddress } = request.params as { userAddress: string };

    const result = await biconomyService.getSmartAccountAddress(userAddress);

    return reply.send(ApiResponse.success(result));
  });

  // Execute gasless transaction
  fastify.post('/execute', async (request, reply) => {
    const { smartAccount, transaction } = request.body as {
      smartAccount: any;
      transaction: any;
    };

    if (!smartAccount || !transaction) {
      throw new ValidationException({ error: 'Smart account and transaction are required' });
    }

    const result = await biconomyService.executeTransaction(smartAccount, transaction);

    return reply.send(ApiResponse.success(result));
  });

};

export default walletRoutes;
