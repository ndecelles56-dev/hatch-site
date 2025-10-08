import type { FastifyRequest } from 'fastify';

import { UserRole } from '@hatch/db';

export interface RequestContext {
  userId: string;
  tenantId?: string;
  role: UserRole;
  teamIds: string[];
  allowTeamContactActions: boolean;
}

const DEFAULT_USER_ID = 'user-agent';
const DEFAULT_ROLE = UserRole.AGENT;

const toTeamIds = (value?: string | string[]): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.flatMap((entry) => entry.split(',')).map((id) => id.trim()).filter(Boolean);
  }
  return value
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
};

export function resolveRequestContext(req: FastifyRequest): RequestContext {
  const headers = req.headers;
  const userId = (headers['x-user-id'] as string | undefined)?.trim() || DEFAULT_USER_ID;
  const tenantId = (headers['x-tenant-id'] as string | undefined)?.trim();
  const roleHeader = (headers['x-user-role'] as string | undefined)?.trim().toUpperCase();
  const role = ((roleHeader && (UserRole as Record<string, UserRole>)[roleHeader]) ?? DEFAULT_ROLE) as UserRole;
  const teamIds = toTeamIds(headers['x-user-team-ids'] as string | string[] | undefined);
  const allowTeamHeader = (headers['x-allow-team-contact-actions'] as string | undefined)?.trim().toLowerCase();
  const allowTeamContactActions =
    allowTeamHeader === undefined || allowTeamHeader === '' ? true : allowTeamHeader === 'true';

  return {
    userId,
    tenantId,
    role,
    teamIds,
    allowTeamContactActions
  };
}
