import { WebhookTriggerEvents } from '@prisma/client';
import { z } from 'zod';

import { isPrivateUrl } from '@documenso/lib/server-only/webhooks/is-private-url';

import type { TrpcRouteMeta } from '../trpc';

export const ZWebhookUrlSchema = z
  .string()
  .url()
  .refine((url) => !isPrivateUrl(url), {
    message: 'Webhook URL cannot point to a private or loopback address',
  });

// Exposed over the v2 OpenAPI layer so the Yrney platform can register a
// webhook on each brokerage team it provisions (webhooks are team-scoped;
// the team comes from the API token used for the call).
export const getTeamWebhooksMeta: TrpcRouteMeta = {
  openapi: {
    method: 'GET',
    path: '/webhook/get-many',
    summary: 'Get team webhooks',
    description: 'Get all webhooks for the team the API token is scoped to.',
    tags: ['Webhook'],
  },
};

export const createWebhookMeta: TrpcRouteMeta = {
  openapi: {
    method: 'POST',
    path: '/webhook/create',
    summary: 'Create webhook',
    description: 'Create a webhook on the team the API token is scoped to.',
    tags: ['Webhook'],
  },
};

// Response shape for the exposed webhook routes. Intentionally excludes
// `secret` so it never leaks back out through the API. tRPC strips fields
// not present here, so this must cover everything the web UI reads too
// (the settings table renders createdAt; edits go through getWebhookById,
// which is unchanged and still returns the full record).
export const ZWebhookResponseSchema = z.object({
  id: z.string(),
  webhookUrl: z.string(),
  eventTriggers: z.array(z.nativeEnum(WebhookTriggerEvents)),
  enabled: z.boolean(),
  teamId: z.number(),
  createdAt: z.date(),
});

export const ZGetTeamWebhooksResponseSchema = ZWebhookResponseSchema.array();

export type TWebhookResponse = z.infer<typeof ZWebhookResponseSchema>;

export const ZCreateWebhookRequestSchema = z.object({
  webhookUrl: ZWebhookUrlSchema,
  eventTriggers: z
    .array(z.nativeEnum(WebhookTriggerEvents))
    .min(1, { message: 'At least one event trigger is required' }),
  secret: z.string().nullable(),
  enabled: z.boolean(),
});

export type TCreateWebhookFormSchema = z.infer<typeof ZCreateWebhookRequestSchema>;

export const ZGetWebhookByIdRequestSchema = z.object({
  id: z.string(),
});

export type TGetWebhookByIdRequestSchema = z.infer<typeof ZGetWebhookByIdRequestSchema>;

export const ZEditWebhookRequestSchema = ZCreateWebhookRequestSchema.extend({
  id: z.string(),
});

export type TEditWebhookRequestSchema = z.infer<typeof ZEditWebhookRequestSchema>;

export const ZDeleteWebhookRequestSchema = z.object({
  id: z.string(),
});

export type TDeleteWebhookRequestSchema = z.infer<typeof ZDeleteWebhookRequestSchema>;

export const ZTriggerTestWebhookRequestSchema = z.object({
  id: z.string(),
  event: z.nativeEnum(WebhookTriggerEvents),
});

export type TTriggerTestWebhookRequestSchema = z.infer<typeof ZTriggerTestWebhookRequestSchema>;
