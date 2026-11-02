/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * VahanSetu 360 — Seed Audit Log Entries (Cryptographically Chained)
 */

import { AuditLogEntry } from '../types/logistics';
import { createAuditLogEntry } from '../utils/auditLogger';

export function generateInitialAuditLogs(): AuditLogEntry[] {
  const logs: AuditLogEntry[] = [];

  // Log 1: Tenant Provisioning
  const l1 = createAuditLogEntry({
    tenantId: 'tenant-1',
    actorId: 'usr-superadmin',
    actorName: 'SaaS Super Admin (System)',
    actorRole: 'SUPER_ADMIN',
    action: 'TENANT_MODIFIED',
    entityType: 'TENANT',
    entityId: 'tenant-1',
    entityDisplay: 'Shree Ganesh Translines (SGT-IND)',
    description: 'Tenant workspace provisioned under Enterprise Tier with 500 vehicle quota',
    newState: { code: 'SGT-IND', maxVehicles: 500, plan: 'ENTERPRISE', status: 'ACTIVE' },
    ipAddress: '14.139.240.10 (Cloud Run Gateway)',
  });
  logs.push(l1);

  // Log 2: Party Registered (Indore Confectioneries)
  const l2 = createAuditLogEntry(
    {
      tenantId: 'tenant-1',
      actorId: 'usr-branch-mgr-1',
      actorName: 'Sunil Gupta (Indore Branch Manager)',
      actorRole: 'TENANT_ADMIN',
      action: 'PARTY_REGISTERED',
      entityType: 'PARTY',
      entityId: 'party-consignor-indore',
      entityDisplay: 'Indore Confectioneries Pvt Ltd',
      description: 'New Shipper registered with GSTIN 23AABCI1234F1ZK and ₹5,00,000 credit limit',
      newState: { pan: 'AABCI1234F', roles: ['CONSIGNOR'], creditLimitPaise: 50000000 },
      ipAddress: '103.21.244.18 (Indore Hub)',
    },
    logs[logs.length - 1]
  );
  logs.push(l2);

  // Log 3: Party Registered (Ram Motor Transport)
  const l3 = createAuditLogEntry(
    {
      tenantId: 'tenant-1',
      actorId: 'usr-branch-mgr-1',
      actorName: 'Sunil Gupta (Indore Branch Manager)',
      actorRole: 'TENANT_ADMIN',
      action: 'PARTY_REGISTERED',
      entityType: 'PARTY',
      entityId: 'party-ram',
      entityDisplay: 'Ram Motor Transport (Ram Roadlines)',
      description: 'Motor Owner registered with Section 194C statutory tax declaration (< 10 vehicles)',
      newState: { pan: 'ADMPR4419K', roles: ['MOTOR_OWNER', 'BROKER'], tdsExempt: true },
      ipAddress: '103.21.244.18 (Indore Hub)',
    },
    logs[logs.length - 1]
  );
  logs.push(l3);

  // Log 4: Trip Dispatched
  const l4 = createAuditLogEntry(
    {
      tenantId: 'tenant-1',
      actorId: 'usr-disp-1',
      actorName: 'Rajesh Sharma (Senior Dispatcher)',
      actorRole: 'DISPATCHER',
      action: 'TRIP_DISPATCHED',
      entityType: 'TRIP',
      entityId: 'trip-ind-nsk-412',
      entityDisplay: 'TRP-2026-00412 (Indore ➔ Nashik)',
      description: 'Multi-stop transit dispatched with vehicle MP09SR4241 (Driver: Mohan Singh Yadav)',
      newState: {
        origin: 'Indore',
        destination: 'Nashik',
        vehicle: 'MP09SR4241',
        totalAgreedFreightPaise: 5000000,
        stopsCount: 4,
      },
      ipAddress: '103.21.244.18 (Indore Hub)',
    },
    logs[logs.length - 1]
  );
  logs.push(l4);

  // Log 5: Financial Posting - Freight Invoicing
  const l5 = createAuditLogEntry(
    {
      tenantId: 'tenant-1',
      actorId: 'usr-acc-1',
      actorName: 'Pradeep Joshi (Lead Accountant)',
      actorRole: 'ACCOUNTANT',
      action: 'FINANCIAL_POSTING',
      entityType: 'JOURNAL_ENTRY',
      entityId: 'je-trip-freight-001',
      entityDisplay: 'JE-2026-00412-1 (₹50,000.00)',
      description: 'Freight revenue recognized: Dr Accounts Receivable (Indore Confectioneries) ₹50,000, Cr Freight Revenue ₹50,000',
      newState: {
        entryNumber: 'JE-2026-00412-1',
        debitPaise: 5000000,
        creditPaise: 5000000,
        ref: 'TRP-2026-00412',
      },
      ipAddress: '103.21.244.18 (Indore Hub)',
    },
    logs[logs.length - 1]
  );
  logs.push(l5);

  // Log 6: Financial Posting - Advance Receipt
  const l6 = createAuditLogEntry(
    {
      tenantId: 'tenant-1',
      actorId: 'usr-acc-1',
      actorName: 'Pradeep Joshi (Lead Accountant)',
      actorRole: 'ACCOUNTANT',
      action: 'FINANCIAL_POSTING',
      entityType: 'JOURNAL_ENTRY',
      entityId: 'je-adv-rec-002',
      entityDisplay: 'JE-2026-00412-2 (₹40,000.00)',
      description: 'Advance freight receipt: Dr HDFC Bank ₹40,000, Cr Accounts Receivable ₹40,000 (UTR# HDFC8821948123)',
      newState: {
        entryNumber: 'JE-2026-00412-2',
        debitPaise: 4000000,
        creditPaise: 4000000,
      },
      ipAddress: '103.21.244.18 (Indore Hub)',
    },
    logs[logs.length - 1]
  );
  logs.push(l6);

  // Log 7: Stop Updated & Reached
  const l7 = createAuditLogEntry(
    {
      tenantId: 'tenant-1',
      actorId: 'usr-disp-1',
      actorName: 'Rajesh Sharma (Senior Dispatcher)',
      actorRole: 'DISPATCHER',
      action: 'STOP_UPDATED',
      entityType: 'TRIP',
      entityId: 'trip-ind-nsk-412',
      entityDisplay: 'Stop 2: Dhule Highway Hub',
      description: 'Vehicle reached Stop A (Dhule). Unloaded 150 cartons for Dhule Retail Traders',
      previousState: { stopStatus: 'PENDING' },
      newState: { stopStatus: 'COMPLETED', arrival: '2026-11-01 06:15 PM' },
      ipAddress: '103.21.244.18 (Indore Hub)',
    },
    logs[logs.length - 1]
  );
  logs.push(l7);

  // Log 8: POD Verified
  const l8 = createAuditLogEntry(
    {
      tenantId: 'tenant-1',
      actorId: 'usr-branch-mgr-1',
      actorName: 'Sunil Gupta (Indore Branch Manager)',
      actorRole: 'TENANT_ADMIN',
      action: 'POD_VERIFIED',
      entityType: 'LORRY_RECEIPT',
      entityId: 'lr-1',
      entityDisplay: 'LR-IND-2026-001 (POD Verified)',
      description: 'Digital delivery challan verified with consignee stamp for Dhule consignment',
      previousState: { podStatus: 'UPLOADED' },
      newState: { podStatus: 'VERIFIED', verifiedAt: '2026-11-01 07:30 PM' },
      ipAddress: '103.21.244.18 (Indore Hub)',
    },
    logs[logs.length - 1]
  );
  logs.push(l8);

  return logs;
}
