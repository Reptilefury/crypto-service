import { FastifyPluginAsync } from 'fastify';
import gnosisService from '../services/gnosis';

const escrowRoutes: FastifyPluginAsync = async (fastify) => {
  
  // Create market escrow safe
  fastify.post('/create-safe', async (request, reply) => {
    const { owners, threshold } = request.body as { 
      owners: string[]; 
      threshold?: number; 
    };
    
    if (!owners || owners.length === 0) {
      return reply.code(400).send({ error: 'Owners array is required' });
    }

    const result = await gnosisService.createMarketEscrowSafe(owners, threshold);
    
    if (result.success) {
      return reply.send(result);
    } else {
      return reply.code(500).send(result);
    }
  });

  // Get safe information
  fastify.get('/safe/:safeAddress', async (request, reply) => {
    const { safeAddress } = request.params as { safeAddress: string };
    
    const result = await gnosisService.getSafeInfo(safeAddress);
    
    if (result.success) {
      return reply.send(result);
    } else {
      return reply.code(404).send(result);
    }
  });

  // Propose transaction to safe
  fastify.post('/propose', async (request, reply) => {
    const { safeAddress, transaction } = request.body as { 
      safeAddress: string; 
      transaction: any; 
    };
    
    if (!safeAddress || !transaction) {
      return reply.code(400).send({ error: 'Safe address and transaction are required' });
    }

    const result = await gnosisService.proposeTransaction(safeAddress, transaction);
    
    if (result.success) {
      return reply.send(result);
    } else {
      return reply.code(500).send(result);
    }
  });

  // Release escrow funds
  fastify.post('/release', async (request, reply) => {
    const { safeAddress, recipient, amount } = request.body as { 
      safeAddress: string; 
      recipient: string; 
      amount: string; 
    };
    
    if (!safeAddress || !recipient || !amount) {
      return reply.code(400).send({ error: 'Safe address, recipient, and amount are required' });
    }

    const result = await gnosisService.executeEscrowRelease(safeAddress, recipient, amount);
    
    if (result.success) {
      return reply.send(result);
    } else {
      return reply.code(500).send(result);
    }
  });

};

export default escrowRoutes;
