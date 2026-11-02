/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Unit tests for vintageEngine and trustScoreEngine
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateVehicleAge, calculatePartyVintage } from './vintageEngine';
import { evaluatePartyTrustScore } from './trustScoreEngine';

test('calculateVehicleAge computes exact vehicle age and BS-VI norm', () => {
  const refDate = new Date('2026-11-02T12:00:00Z');
  const res = calculateVehicleAge('2021-03', refDate);
  assert.equal(res.years, 5);
  assert.equal(res.emissionNorm, 'BS-VI');
  assert.equal(res.isOver15Years, false);
});

test('calculateVehicleAge flags 15+ year vehicle for green tax and scrappage scrutiny', () => {
  const refDate = new Date('2026-11-02T12:00:00Z');
  const res = calculateVehicleAge('2010-04', refDate);
  assert.ok(res.years >= 16);
  assert.equal(res.isOver15Years, true);
  assert.equal(res.fitnessCycle, 'GREEN_TAX_RENEWAL');
  assert.equal(res.emissionNorm, 'BS-IV');
});

test('calculatePartyVintage accurately determines veteran business tier', () => {
  const refDate = new Date('2026-11-02T12:00:00Z');
  const res = calculatePartyVintage('2012-05-10', refDate);
  assert.equal(res.yearsInBusiness, 14);
  assert.equal(res.entityTier, 'VETERAN');
  assert.equal(res.creditRiskWeight, 0.85);
});

test('evaluatePartyTrustScore awards Grade AAA to compliant entity with zero delays', () => {
  const party = {
    legalName: 'Indore Confectioneries Pvt Ltd',
    pan: 'AABCI1234F',
    gstin: '23AABCI1234F1ZK',
    bankAccountNumber: '98127391283',
    bankIfsc: 'HDFC0001234',
    establishmentDate: '2010-01-01',
    roles: ['CONSIGNOR' as const],
  };

  const score = evaluatePartyTrustScore(party, {
    totalTripsHandled: 100,
    invoicesSettledCount: 100,
    onTimePaymentCount: 99,
    avgPaymentLagDays: 1.0,
    ais140GpsTripsCount: 98,
    onTimePodUploadCount: 98,
    transitCargoDisputeCount: 0,
  });

  assert.ok(score.overallScore >= 820);
  assert.equal(score.grade, 'AAA');
  assert.ok(score.recommendedMaxCreditPaise >= 100000000);
});

test('evaluatePartyTrustScore flags high risk for missing GSTIN and high payment delays', () => {
  const party = {
    legalName: 'Fly By Night Transport',
    pan: 'DEFGH9999K',
    // Missing GSTIN and bank details
    roles: ['TRANSPORTER' as const],
  };

  const score = evaluatePartyTrustScore(party, {
    totalTripsHandled: 20,
    invoicesSettledCount: 20,
    onTimePaymentCount: 8, // 40% on time
    avgPaymentLagDays: 18.5,
    ais140GpsTripsCount: 5,
    onTimePodUploadCount: 8,
    transitCargoDisputeCount: 3,
  });

  assert.ok(score.overallScore < 600);
  assert.ok(score.riskFlags.length >= 2);
});
