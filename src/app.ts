import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';

// Import route handlers
import authRoutes from './routes/auth';
import walletRoutes from './routes/wallets';
import escrowRoutes from './routes/escrow';
import oracleRoutes from './routes/oracles';

dotenv.config();

import { errorHandler } from './middleware/errorHandler';

export async function app(fastify: FastifyInstance) {
  fastify.setErrorHandler(errorHandler);

  // Register CORS
  await fastify.register(cors, {
    origin: true,
    credentials: true
  });

  // Health check
  fastify.get('/health', async () => {
    return { status: 'ok', service: 'crypto-service', timestamp: new Date().toISOString() };
  });

  // Register routes
  await fastify.register(authRoutes, { prefix: '/auth' });
  await fastify.register(walletRoutes, { prefix: '/wallets' });
  await fastify.register(escrowRoutes, { prefix: '/escrow' });
  await fastify.register(oracleRoutes, { prefix: '/oracles' });
}

const start = async () => {
  try {
    const fastify = Fastify({
      logger: {
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
      }
    });

    await app(fastify);

    const port = parseInt(process.env.PORT || '3001');
    await fastify.listen({ port, host: '0.0.0.0' });
    fastify.log.info(`Crypto service running on port ${port}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

if (require.main === module) {
  start();
}
