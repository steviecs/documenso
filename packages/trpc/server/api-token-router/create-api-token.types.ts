import { z } from 'zod';

import type { TrpcRouteMeta } from '../trpc';

export const createApiTokenMeta: TrpcRouteMeta = {
  openapi: {
    method: 'POST',
    path: '/api-token/create',
    summary: 'Create API token',
    description: 'Create a new API token scoped to a team.',
    tags: ['API Token'],
  },
};

export const ZCreateApiTokenRequestSchema = z.object({
  teamId: z.number(),
  tokenName: z.string().min(3, { message: 'The token name should be 3 characters or longer' }),
  expirationDate: z.string().nullable(),
});

export const ZCreateApiTokenResponseSchema = z.object({
  id: z.number(),
  token: z.string(),
});
