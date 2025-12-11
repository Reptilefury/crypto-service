import { FastifyPluginAsync } from 'fastify';
import magicService from '../services/magic';
import { ApiResponse } from '../common/response/ApiResponse';
import { ResponseCode } from '../common/response/ResponseCode';
import { ValidationException } from '../common/exception/AppException';

const authRoutes: FastifyPluginAsync = async (fastify) => {

  // Validate Magic DID token
  fastify.post('/validate', async (request, reply) => {
    const { didToken } = request.body as { didToken: string };

    if (!didToken) {
      throw new ValidationException({ didToken: 'DID token is required' });
    }

    const result = await magicService.validateDIDToken(didToken);

    return reply.send(ApiResponse.success({
      user: {
        id: result.userId,
        email: result.email,
        walletAddress: result.walletAddress,
        subject: result.subject,
        audience: result.audience,
        issuedAt: result.issuedAt,
        expiresAt: result.expiresAt,
        notBefore: result.notBefore,
        tokenId: result.tokenId,
        additionalData: result.additionalData
      }
    }, ResponseCode.USER_AUTHENTICATED.message));
  });

  // Get user metadata by Magic user ID
  fastify.get('/user/:userId', async (request, reply) => {
    const { userId } = request.params as { userId: string };

    const result = await magicService.getUserMetadata(userId);

    return reply.send(ApiResponse.success(result));
  });

};

export default authRoutes;
