import { createApiToken } from '@documenso/lib/server-only/public-api/create-api-token';

import { authenticatedProcedure } from '../trpc';
import {
  ZCreateApiTokenRequestSchema,
  ZCreateApiTokenResponseSchema,
  createApiTokenMeta,
} from './create-api-token.types';

export const createApiTokenRoute = authenticatedProcedure
  .meta(createApiTokenMeta)
  .input(ZCreateApiTokenRequestSchema)
  .output(ZCreateApiTokenResponseSchema)
  .mutation(async ({ input, ctx }) => {
    const { tokenName, teamId, expirationDate } = input;

    ctx.logger.info({
      input: {
        teamId,
      },
    });

    return await createApiToken({
      userId: ctx.user.id,
      teamId,
      tokenName,
      expiresIn: expirationDate,
    });
  });
