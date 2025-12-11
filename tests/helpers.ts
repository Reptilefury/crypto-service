import Fastify, { FastifyInstance, FastifyServerOptions } from 'fastify';
import { app } from '../src/app';

export async function build(opts?: FastifyServerOptions): Promise<FastifyInstance> {
  const fastify = Fastify({
    logger: false,
    ...opts
  });

  await fastify.register(app);
  return fastify;
}
