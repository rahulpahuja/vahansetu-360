/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Unit tests for VahanSetu 360 Centralized Audit Logging Engine
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createAuditLogEntry,
  verifyAuditChain,
  GENESIS_HASH,
} from './auditLogger';
import { AuditLogEntry } from '../types/logistics';

test('createAuditLogEntry links to GENESIS_HASH on initial log', () => {
  const log1 = createAuditLogEntry({
    tenantId: 'tenant-1',
    actorId: 'usr-acc-1',
    actorName: 'Rajesh Sharma (Accountant)',
    actorRole: 'ACCOUNTANT',
    action: 'FINANCIAL_POSTING',
    entityType: 'JOURNAL_ENTRY',
    entityId: 'je-1',
    entityDisplay: 'JE-2026-00412-1',
    description: 'Gross freight billing ₹50,000 recognized',
    newState: { amountPaise: 5000000, reference: 'TRP-2026-00412' },
  });

  assert.equal(log1.previousHash, GENESIS_HASH);
  assert.equal(typeof log1.currentHash, 'string');
  assert.equal(log1.currentHash.length, 64);
});

test('createAuditLogEntry chains successive entries cryptographically', () => {
  const log1 = createAuditLogEntry({
    tenantId: 'tenant-1',
    actorId: 'usr-acc-1',
    actorName: 'Rajesh Sharma',
    actorRole: 'ACCOUNTANT',
    action: 'FINANCIAL_POSTING',
    entityType: 'JOURNAL_ENTRY',
    entityId: 'je-1',
    entityDisplay: 'JE-001',
    description: 'Bilty billing ₹50,000',
    newState: { amountPaise: 5000000 },
  });

  const log2 = createAuditLogEntry(
    {
      tenantId: 'tenant-1',
      actorId: 'usr-disp-1',
      actorName: 'Sunil Gupta (Dispatcher)',
      actorRole: 'DISPATCHER',
      action: 'TRIP_STATUS_CHANGED',
      entityType: 'TRIP',
      entityId: 'trip-1',
      entityDisplay: 'TRP-2026-00412',
      description: 'Trip status updated to IN_TRANSIT',
      previousState: { status: 'PLANNED' },
      newState: { status: 'IN_TRANSIT' },
    },
    log1
  );

  assert.equal(log2.previousHash, log1.currentHash);

  const verification = verifyAuditChain([log1, log2]);
  assert.equal(verification.isValid, true);
  assert.equal(verification.verifiedCount, 2);
});

test('verifyAuditChain immediately detects tampered payload in log history', () => {
  const log1 = createAuditLogEntry({
    tenantId: 'tenant-1',
    actorId: 'usr-acc-1',
    actorName: 'Rajesh Sharma',
    actorRole: 'ACCOUNTANT',
    action: 'FINANCIAL_POSTING',
    entityType: 'JOURNAL_ENTRY',
    entityId: 'je-1',
    entityDisplay: 'JE-001',
    description: 'Bilty billing ₹50,000',
    newState: { amountPaise: 5000000 },
  });

  const log2 = createAuditLogEntry(
    {
      tenantId: 'tenant-1',
      actorId: 'usr-disp-1',
      actorName: 'Sunil Gupta',
      actorRole: 'DISPATCHER',
      action: 'TRIP_STATUS_CHANGED',
      entityType: 'TRIP',
      entityId: 'trip-1',
      entityDisplay: 'TRP-2026-00412',
      description: 'Trip status updated to IN_TRANSIT',
      newState: { status: 'IN_TRANSIT' },
    },
    log1
  );

  // Malicious tampering: someone tries to alter the amount in log1 without re-computing the hash
  const tamperedLog1: AuditLogEntry = {
    ...log1,
    newState: { amountPaise: 4000000 }, // Maliciously changed ₹50k to ₹40k
  };

  const verification = verifyAuditChain([tamperedLog1, log2]);
  assert.equal(verification.isValid, false);
  assert.equal(verification.verifiedCount, 0);
  assert.ok(verification.error?.includes('Cryptographic tamper alert'));
});
