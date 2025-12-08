import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';

// Import route handlers
import authRoutes from './routes/auth';
import walletRoutes from './routes/wallets';
import escrowRoutes from './routes/escrow';
import oracleRoutes from './routes/oracles';

dotenv.config();

const fastify = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
  }
});

// Register CORS
fastify.register(cors, {
  origin: true,
  credentials: true
});

// Health check
fastify.get('/health', async () => {
  return { status: 'ok', service: 'crypto-service', timestamp: new Date().toISOString() };
});

// Register routes
fastify.register(authRoutes, { prefix: '/auth' });
fastify.register(walletRoutes, { prefix: '/wallets' });
fastify.register(escrowRoutes, { prefix: '/escrow' });
fastify.register(oracleRoutes, { prefix: '/oracles' });

const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3001');
    await fastify.listen({ port, host: '0.0.0.0' });
    fastify.log.info(`Crypto service running on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
