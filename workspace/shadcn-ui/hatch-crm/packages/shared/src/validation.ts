import { z } from 'zod';

export const tenantIdSchema = z.string().min(1, 'tenantId required');
export const entityIdSchema = z.string().min(1, 'id required');

export const paginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20)
});
