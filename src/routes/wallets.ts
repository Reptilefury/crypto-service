import { FastifyPluginAsync } from 'fastify';
import biconomyService from '../services/biconomy';
import magicService from '../services/magic';
import { ApiResponse } from '../common/response/ApiResponse';
import { ResponseCode } from '../common/response/ResponseCode';
import { ValidationException } from '../common/exception/AppException';

const walletRoutes: FastifyPluginAsync = async (fastify) => {

  // Create smart account wallet for authenticated user
  fastify.post('/create', async (request, reply) => {
    const authHeader = request.headers.authorization;
    const { walletAddress } = request.body as { walletAddress: string };
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ValidationException({ authorization: 'Bearer token is required' });
    }

    if (!walletAddress) {
      throw new ValidationException({ walletAddress: 'Wallet address is required' });
    }

    const didToken = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Validate user via DID token
    const user = await magicService.validateDIDToken(didToken);

    // Create smart account using provided wallet address
    const result = await biconomyService.createUserWalletFromAddress(walletAddress);

    return reply.send(ApiResponse.success({
      user: {
        id: user.userId,
        walletAddress: user.walletAddress
      },
      smartAccount: result
    }, ResponseCode.CREATED.message));
  });

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
