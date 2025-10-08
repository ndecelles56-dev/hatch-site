import { describe, expect, it } from 'vitest';

import { routeLead } from '../routing';

describe('routeLead', () => {
  it('chooses agent with higher score', () => {
    const result = routeLead({
      leadId: 'lead-1',
      tenantId: 'tenant-1',
      geographyImportance: 0.3,
      priceBandImportance: 0.2,
      agents: [
        {
          userId: 'agent-a',
          fullName: 'Agent A',
          capacityTarget: 8,
          activePipeline: 2,
          geographyFit: 0.9,
          priceBandFit: 0.8,
          keptApptRate: 0.7,
          consentReady: true,
          tenDlcReady: true
        },
        {
          userId: 'agent-b',
          fullName: 'Agent B',
          capacityTarget: 8,
          activePipeline: 7,
          geographyFit: 0.5,
          priceBandFit: 0.4,
          keptApptRate: 0.4,
          consentReady: true,
          tenDlcReady: true
        }
      ],
      fallbackTeamId: 'team-1',
      quietHours: false
    });

    expect(result.selectedAgents[0]?.userId).toBe('agent-a');
  });

  it('falls back to team when no agent meets threshold', () => {
    const result = routeLead({
      leadId: 'lead-2',
      tenantId: 'tenant-1',
      geographyImportance: 0.3,
      priceBandImportance: 0.2,
      agents: [
        {
          userId: 'agent-low',
          fullName: 'Agent Low',
          capacityTarget: 8,
          activePipeline: 10,
          geographyFit: 0.2,
          priceBandFit: 0.2,
          keptApptRate: 0.2,
          consentReady: true,
          tenDlcReady: true
        }
      ],
      fallbackTeamId: 'team-pond',
      quietHours: false,
      config: {
        minimumScore: 0.9,
        performanceWeight: 0.25,
        capacityWeight: 0.35,
        geographyWeight: 0.2,
        priceBandWeight: 0.2
      }
    });

    expect(result.usedFallback).toBe(true);
    expect(result.fallbackTeamId).toBe('team-pond');
  });
});
