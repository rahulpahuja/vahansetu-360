/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * VahanSetu 360 — Party Trust & Financial Reliability Score Engine
 * Evaluates payment transparency, statutory compliance, and operational integrity (300 - 900 Scale)
 */

import { Party, TrustGrade, TrustScoreMetrics } from '../types/logistics';
import { calculatePartyVintage } from './vintageEngine';

export interface PartyOperationalData {
  totalTripsHandled?: number;
  invoicesSettledCount?: number;
  onTimePaymentCount?: number;
  avgPaymentLagDays?: number;
  ais140GpsTripsCount?: number;
  onTimePodUploadCount?: number;
  transitCargoDisputeCount?: number;
}

/**
 * Computes a standardized 300 to 900 Indian Logistics Trust Score
 */
export function evaluatePartyTrustScore(
  party: Partial<Party>,
  opsData: PartyOperationalData = {}
): TrustScoreMetrics {
  const {
    totalTripsHandled = 48,
    invoicesSettledCount = 45,
    onTimePaymentCount = 42,
    avgPaymentLagDays = 2.4,
    ais140GpsTripsCount = 46,
    onTimePodUploadCount = 44,
    transitCargoDisputeCount = 0,
  } = opsData;

  const riskFlags: string[] = [];

  // --- PILLAR 1: PAYMENT RELIABILITY & FINANCIAL DISCIPLINE (40% Weight) ---
  const onTimeRate =
    invoicesSettledCount > 0 ? (onTimePaymentCount / invoicesSettledCount) * 100 : 85;

  let paymentReliabilityScore = 80;
  if (onTimeRate >= 95) {
    paymentReliabilityScore = 95;
  } else if (onTimeRate >= 85) {
    paymentReliabilityScore = 85;
  } else if (onTimeRate >= 70) {
    paymentReliabilityScore = 70;
    riskFlags.push('Intermittent payment delays beyond agreed payment terms.');
  } else {
    paymentReliabilityScore = 45;
    riskFlags.push('High delinquency risk: < 70% invoices settled within terms.');
  }

  // Deduct for excess payment lag
  if (avgPaymentLagDays > 7) {
    paymentReliabilityScore = Math.max(30, paymentReliabilityScore - 15);
    riskFlags.push(`Average payment lag is ${avgPaymentLagDays.toFixed(1)} days overdue.`);
  }

  // --- PILLAR 2: STATUTORY & REGULATORY COMPLIANCE (30% Weight) ---
  let statutoryScore = 50;
  const hasGstin = Boolean(party.gstin && party.gstin.length === 15);
  const hasPan = Boolean(party.pan && party.pan.length === 10);
  const isMotorOwner = party.roles?.includes('MOTOR_OWNER');
  const hasSec194c = party.tdsExemptionDeclared || false;
  const hasBankDetails = Boolean(party.bankAccountNumber && party.bankIfsc);

  if (hasGstin) statutoryScore += 20;
  if (hasPan) statutoryScore += 15;
  if (hasBankDetails) statutoryScore += 10;
  if (isMotorOwner && hasSec194c) statutoryScore += 5;

  if (!hasGstin && !isMotorOwner) {
    riskFlags.push('Unregistered non-GST entity; freight billing restricted to RCM.');
  }
  if (!hasBankDetails) {
    riskFlags.push('Bank account & IFSC not verified for direct electronic payouts.');
  }

  // Vintage bonus
  const vintage = calculatePartyVintage(party.establishmentDate);
  if (vintage.entityTier === 'VETERAN') {
    statutoryScore = Math.min(100, statutoryScore + 8);
  } else if (vintage.entityTier === 'ESTABLISHED') {
    statutoryScore = Math.min(100, statutoryScore + 4);
  }

  // --- PILLAR 3: OPERATIONAL TRANSPARENCY & INTEGRITY (30% Weight) ---
  const ais140Rate =
    totalTripsHandled > 0 ? (ais140GpsTripsCount / totalTripsHandled) * 100 : 90;
  const podTurnaroundRate =
    totalTripsHandled > 0 ? (onTimePodUploadCount / totalTripsHandled) * 100 : 92;

  let operationalScore = 80;
  if (ais140Rate >= 90) operationalScore += 10;
  else if (ais140Rate < 50) {
    operationalScore -= 20;
    riskFlags.push('Low telematics adoption: < 50% transits tracked via AIS-140 GPS.');
  }

  if (podTurnaroundRate >= 90) operationalScore += 10;
  else if (podTurnaroundRate < 70) {
    operationalScore -= 15;
    riskFlags.push('Slow POD turnaround (> 48 hrs average physical document submission).');
  }

  if (transitCargoDisputeCount > 0) {
    operationalScore = Math.max(20, operationalScore - transitCargoDisputeCount * 12);
    riskFlags.push(`${transitCargoDisputeCount} active transit cargo dispute/shortage claims logged.`);
  }

  // --- COMPOSITE SCORING (300 to 900 SCALE) ---
  // Weighted percentage (0 to 100)
  const compositePct =
    paymentReliabilityScore * 0.4 +
    statutoryScore * 0.3 +
    operationalScore * 0.3;

  // Map to 300 - 900 index: 300 + (compositePct / 100) * 600
  const overallScore = Math.round(300 + (compositePct / 100) * 600);

  let grade: TrustGrade = 'BBB';
  let recommendedMaxCreditPaise = 20000000; // ₹2,00,000 default
  let recommendedMaxAdvancePct = 70;

  if (overallScore >= 820) {
    grade = 'AAA';
    recommendedMaxCreditPaise = 150000000; // ₹15,00,000
    recommendedMaxAdvancePct = 90;
  } else if (overallScore >= 740) {
    grade = 'AA';
    recommendedMaxCreditPaise = 80000000; // ₹8,00,000
    recommendedMaxAdvancePct = 80;
  } else if (overallScore >= 660) {
    grade = 'A';
    recommendedMaxCreditPaise = 40000000; // ₹4,00,000
    recommendedMaxAdvancePct = 70;
  } else if (overallScore >= 560) {
    grade = 'BBB';
    recommendedMaxCreditPaise = 15000000; // ₹1,50,000
    recommendedMaxAdvancePct = 50;
  } else {
    grade = 'HIGH_RISK';
    recommendedMaxCreditPaise = 0; // Strict cash on delivery
    recommendedMaxAdvancePct = 30;
  }

  return {
    overallScore,
    grade,
    paymentReliabilityScore: Math.round(paymentReliabilityScore),
    avgPaymentDelayDays: avgPaymentLagDays,
    onTimePaymentRatePct: Math.round(onTimeRate),
    statutoryComplianceScore: Math.round(statutoryScore),
    gstinVerified: hasGstin,
    panVerified: hasPan,
    sec194cDeclared: hasSec194c,
    operationalTransparencyScore: Math.round(operationalScore),
    ais140GpsAdoptionPct: Math.round(ais140Rate),
    onTimePodTurnaroundPct: Math.round(podTurnaroundRate),
    transitDisputeRatePct:
      totalTripsHandled > 0 ? (transitCargoDisputeCount / totalTripsHandled) * 100 : 0,
    recommendedMaxCreditPaise,
    recommendedMaxAdvancePct,
    riskFlags: riskFlags.length > 0 ? riskFlags : ['Zero high-risk compliance indicators found.'],
  };
}
