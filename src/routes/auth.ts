import { FastifyPluginAsync } from 'fastify';
import magicService from '../services/magic';

const authRoutes: FastifyPluginAsync = async (fastify) => {
  
  // Validate Magic DID token
  fastify.post('/validate', async (request, reply) => {
    const { didToken } = request.body as { didToken: string };
    
    if (!didToken) {
      return reply.code(400).send({ error: 'DID token is required' });
    }

    const result = await magicService.validateDIDToken(didToken);
    
    if (result.isValid) {
      return reply.send({
        success: true,
        user: {
          id: result.userId,
          email: result.email,
          walletAddress: result.walletAddress
        }
      });
    } else {
      return reply.code(401).send({
        success: false,
        error: result.error
      });
    }
  });

  // Get user metadata by Magic user ID
  fastify.get('/user/:userId', async (request, reply) => {
    const { userId } = request.params as { userId: string };
    
    const result = await magicService.getUserMetadata(userId);
    
    if (result.success) {
      return reply.send(result);
    } else {
      return reply.code(404).send(result);
    }
  });

};

export default authRoutes;
