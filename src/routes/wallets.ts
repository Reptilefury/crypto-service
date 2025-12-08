import { FastifyPluginAsync } from 'fastify';
import biconomyService from '../services/biconomy';

const walletRoutes: FastifyPluginAsync = async (fastify) => {
  
  // Create smart account for user
  fastify.post('/smart-account', async (request, reply) => {
    const { userAddress } = request.body as { userAddress: string };
    
    if (!userAddress) {
      return reply.code(400).send({ error: 'User address is required' });
    }

    const result = await biconomyService.createSmartAccount(userAddress);
    
    if (result.success) {
      return reply.send(result);
    } else {
      return reply.code(500).send(result);
    }
  });

  // Get smart account address
  fastify.get('/smart-account/:userAddress', async (request, reply) => {
    const { userAddress } = request.params as { userAddress: string };
    
    const result = await biconomyService.getSmartAccountAddress(userAddress);
    
    if (result.success) {
      return reply.send(result);
    } else {
      return reply.code(500).send(result);
    }
  });

  // Execute gasless transaction
  fastify.post('/execute', async (request, reply) => {
    const { smartAccountAddress, transaction } = request.body as { 
      smartAccountAddress: string; 
      transaction: any; 
    };
    
    if (!smartAccountAddress || !transaction) {
      return reply.code(400).send({ error: 'Smart account address and transaction are required' });
    }

    const result = await biconomyService.executeTransaction(smartAccountAddress, transaction);
    
    if (result.success) {
      return reply.send(result);
    } else {
      return reply.code(500).send(result);
    }
  });

};

export default walletRoutes;
