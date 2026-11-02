/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Unit tests for VahanSetu 360 Double-Entry Accounting Engine
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatPaiseToINR,
  validateJournalEntryBalance,
  calculatePartyLedger,
  calculateTrialBalance,
  calculateTripProfitabilityMetrics,
  calculate7DayRollingFinancialTrend,
} from './accountingEngine';
import { ChartOfAccount, JournalEntry, Party, Trip, LorryReceipt } from '../types/logistics';

test('formatPaiseToINR formats standard Indian currency with commas', () => {
  assert.equal(formatPaiseToINR(5000000), '₹50,000.00'); // ₹50,000 agreed freight
  assert.equal(formatPaiseToINR(4000000), '₹40,000.00'); // ₹40,000 advance
  assert.equal(formatPaiseToINR(1000000), '₹10,000.00'); // ₹10,000 outstanding
  assert.equal(formatPaiseToINR(12345678), '₹1,23,456.78'); // Lakhs format
});

test('validateJournalEntryBalance enforces strict sum(debit) === sum(credit)', () => {
  // Balanced entry (Indore-Nashik freight ₹50,000)
  const balancedLines = [
    { id: '1', accountId: 'acc-ar', debitPaise: 5000000, creditPaise: 0 },
    { id: '2', accountId: 'acc-rev', debitPaise: 0, creditPaise: 5000000 },
  ];
  const balancedResult = validateJournalEntryBalance(balancedLines);
  assert.equal(balancedResult.isValid, true);
  assert.equal(balancedResult.discrepancyPaise, 0);

  // Unbalanced entry (attempting ₹50,000 debit with only ₹40,000 credit)
  const unbalancedLines = [
    { id: '1', accountId: 'acc-ar', debitPaise: 5000000, creditPaise: 0 },
    { id: '2', accountId: 'acc-rev', debitPaise: 0, creditPaise: 4000000 },
  ];
  const unbalancedResult = validateJournalEntryBalance(unbalancedLines);
  assert.equal(unbalancedResult.isValid, false);
  assert.equal(unbalancedResult.discrepancyPaise, 1000000);
});

test('calculatePartyLedger accurately computes ₹10,000 outstanding after advance', () => {
  const consignorParty: Party = {
    id: 'party-consignor-1',
    tenantId: 'tenant-1',
    legalName: 'Indore Confectioneries Pvt Ltd',
    tradeName: 'Indore Sweets',
    pan: 'AABCI1234F',
    roles: ['CONSIGNOR'],
    tdsExemptionDeclared: false,
    creditLimitPaise: 10000000,
    paymentTermsDays: 15,
    primaryContactName: 'Rajesh Sharma',
    primaryContactPhone: '9826011223',
    primaryContactEmail: 'rajesh@indoresweets.in',
    billingAddress: 'Sanwer Road Industrial Area, Indore',
    city: 'Indore',
    state: 'Madhya Pradesh',
    stateCode: '23',
    verificationStatus: 'VERIFIED',
    createdAt: '2026-01-01',
  };

  const sampleEntries: JournalEntry[] = [
    // 1. Initial Bilty Freight billed: ₹50,000 (Debit)
    {
      id: 'je-1',
      tenantId: 'tenant-1',
      entryNumber: 'JE-2026-001',
      entryDate: '2026-11-01',
      referenceType: 'BILTY_BILLING',
      referenceId: 'lr-1',
      narration: 'Freight billed for Indore to Nashik transit (MP09SR4241)',
      isPosted: true,
      lines: [
        {
          id: 'l1',
          accountId: 'acc-ar',
          partyId: 'party-consignor-1',
          debitPaise: 5000000,
          creditPaise: 0,
        },
        { id: 'l2', accountId: 'acc-freight-rev', debitPaise: 0, creditPaise: 5000000 },
      ],
      createdAt: '2026-11-01',
    },
    // 2. Advance received: ₹40,000 (Credit)
    {
      id: 'je-2',
      tenantId: 'tenant-1',
      entryNumber: 'JE-2026-002',
      entryDate: '2026-11-02',
      referenceType: 'ADVANCE_PAYMENT',
      referenceId: 'lr-1',
      narration: 'Advance received via RTGS against Indore to Nashik transit',
      isPosted: true,
      lines: [
        { id: 'l3', accountId: 'acc-bank', debitPaise: 4000000, creditPaise: 0 },
        {
          id: 'l4',
          accountId: 'acc-ar',
          partyId: 'party-consignor-1',
          debitPaise: 0,
          creditPaise: 4000000,
        },
      ],
      createdAt: '2026-11-02',
    },
  ];

  const ledger = calculatePartyLedger(consignorParty, sampleEntries);
  assert.equal(ledger.totalDebitPaise, 5000000);
  assert.equal(ledger.totalCreditPaise, 4000000);
  assert.equal(ledger.closingBalancePaise, 1000000); // Exactly ₹10,000 outstanding!
  assert.equal(ledger.closingBalanceType, 'DR'); // Debit = Receivable
});

test('calculateTrialBalance verifies entire ledger equilibrium', () => {
  const accounts: ChartOfAccount[] = [
    { id: 'acc-bank', tenantId: 't1', code: '1010', name: 'HDFC Bank', accountType: 'ASSET' },
    { id: 'acc-ar', tenantId: 't1', code: '1020', name: 'Accounts Receivable', accountType: 'ASSET' },
    { id: 'acc-rev', tenantId: 't1', code: '4010', name: 'Freight Income', accountType: 'INCOME' },
  ];

  const entries: JournalEntry[] = [
    {
      id: 'je-1',
      tenantId: 't1',
      entryNumber: 'JE-001',
      entryDate: '2026-11-01',
      referenceType: 'BILTY_BILLING',
      referenceId: 'ref-1',
      narration: 'Bilty billing',
      isPosted: true,
      lines: [
        { id: 'l1', accountId: 'acc-ar', debitPaise: 5000000, creditPaise: 0 },
        { id: 'l2', accountId: 'acc-rev', debitPaise: 0, creditPaise: 5000000 },
      ],
      createdAt: '2026-11-01',
    },
  ];

  const tb = calculateTrialBalance(accounts, entries);
  assert.equal(tb.isBalanced, true);
  assert.equal(tb.totalDebitPaise, 5000000);
  assert.equal(tb.totalCreditPaise, 5000000);
});

test('calculateTripProfitabilityMetrics computes exact difference between LR revenue and trip hire expenses', () => {
  const mockTrips: Trip[] = [
    {
      id: 'trp-1',
      tenantId: 'tenant-1',
      branchId: 'branch-1',
      tripNumber: 'TRP-2026-00412',
      vehicleId: 'veh-1',
      driverId: 'drv-1',
      vehicleOwnerPartyId: 'owner-1',
      originCity: 'Indore',
      destinationCity: 'Nashik',
      stops: [],
      scheduledDeparture: '2026-11-01',
      totalAgreedFreightPaise: 5000000,
      advancePayableToOwnerPaise: 2500000, // ₹25,000 paid to truck owner
      balancePayableToOwnerPaise: 1700000, // ₹17,000 balance to truck owner (Total Hire = ₹42,000)
      brokerCommissionPaise: 200000, // ₹2,000 broker fee
      status: 'IN_TRANSIT',
      fastagTollDeductionPaise: 185000,
      dieselExpensePaise: 1800000,
      trackingToken: 'token-1',
    },
  ];

  const mockLRs: LorryReceipt[] = [
    {
      id: 'lr-1',
      tenantId: 'tenant-1',
      tripId: 'trp-1',
      lrNumber: 'LR-001',
      lrDate: '2026-11-01',
      consignorPartyId: 'p-1',
      consigneePartyId: 'p-2',
      billingPartyId: 'p-1',
      goodsDescription: 'Candies',
      packageCount: 150,
      packageType: 'CARTONS',
      actualWeightKg: 3000,
      chargeableWeightKg: 3000,
      freightPaise: 1250000,
      loadingChargesPaise: 30000,
      unloadingChargesPaise: 0,
      statisticalChargesPaise: 5000,
      totalLrAmountPaise: 1285000, // ₹12,850
      advanceReceivedPaise: 1000000, // ₹10,000
      balanceReceivablePaise: 285000, // ₹2,850
      paymentTerms: 'TO_BE_BILLED',
      podStatus: 'VERIFIED',
      deliveryStatus: 'DELIVERED',
    },
    {
      id: 'lr-2',
      tenantId: 'tenant-1',
      tripId: 'trp-1',
      lrNumber: 'LR-002',
      lrDate: '2026-11-01',
      consignorPartyId: 'p-1',
      consigneePartyId: 'p-3',
      billingPartyId: 'p-1',
      goodsDescription: 'Wafers',
      packageCount: 200,
      packageType: 'CARTONS',
      actualWeightKg: 4000,
      chargeableWeightKg: 4000,
      freightPaise: 1750000,
      loadingChargesPaise: 40000,
      unloadingChargesPaise: 0,
      statisticalChargesPaise: 5000,
      totalLrAmountPaise: 1795000, // ₹17,950
      advanceReceivedPaise: 1500000, // ₹15,000
      balanceReceivablePaise: 295000, // ₹2,950
      paymentTerms: 'TO_BE_BILLED',
      podStatus: 'UPLOADED',
      deliveryStatus: 'DELIVERED',
    },
    {
      id: 'lr-3',
      tenantId: 'tenant-1',
      tripId: 'trp-1',
      lrNumber: 'LR-003',
      lrDate: '2026-11-01',
      consignorPartyId: 'p-1',
      consigneePartyId: 'p-4',
      billingPartyId: 'p-1',
      goodsDescription: 'Chocolate',
      packageCount: 250,
      packageType: 'CARTONS',
      actualWeightKg: 5000,
      chargeableWeightKg: 5000,
      freightPaise: 2000000,
      loadingChargesPaise: 50000,
      unloadingChargesPaise: 0,
      statisticalChargesPaise: 5000,
      totalLrAmountPaise: 2055000, // ₹20,550
      advanceReceivedPaise: 1500000, // ₹15,000
      balanceReceivablePaise: 555000, // ₹5,550
      paymentTerms: 'TO_BE_BILLED',
      podStatus: 'PENDING',
      deliveryStatus: 'IN_TRANSIT',
    },
  ];

  const result = calculateTripProfitabilityMetrics(mockTrips, mockLRs);

  // Total Freight Revenue = 12,850 + 17,950 + 20,550 = ₹51,350 = 5,135,000 paise
  assert.equal(result.totalFreightRevenuePaise, 5135000);
  assert.equal(result.totalPureFreightPaise, 5000000);

  // Total Hire Expense = 25,000 + 17,000 = ₹42,000 = 4,200,000 paise
  assert.equal(result.totalHireExpensePaise, 4200000);

  // Gross Profit = 5,135,000 - 4,200,000 = 935,000 paise (₹9,350.00)
  assert.equal(result.grossProfitPaise, 935000);

  // Gross Profit Margin % = (935000 / 5135000) * 100 = 18.21%
  assert.equal(result.grossMarginPct, 18.21);

  // Brokerage deduction: ₹2,000 -> Net Operating Profit = ₹7,350
  assert.equal(result.totalBrokerCommissionPaise, 200000);
  assert.equal(result.netOperatingProfitPaise, 735000);
  assert.equal(result.netMarginPct, 14.31);

  // Cash Advance spread: Received ₹40,000 - Disbursed ₹25,000 = +₹15,000
  assert.equal(result.totalAdvanceReceivedPaise, 4000000);
  assert.equal(result.totalAdvancePaidToOwnersPaise, 2500000);
  assert.equal(result.advanceCashSpreadPaise, 1500000);

  // Trip breakdown
  assert.equal(result.tripBreakdowns.length, 1);
  assert.equal(result.tripBreakdowns[0].marginStatus, 'EXCELLENT');
  assert.equal(result.profitableTripsCount, 1);
  assert.equal(result.deficitTripsCount, 0);
});

test('calculateTripProfitabilityMetrics handles deficit / loss-making trips accurately', () => {
  const deficitTrip: Trip = {
    id: 'trp-deficit',
    tenantId: 'tenant-1',
    branchId: 'branch-1',
    tripNumber: 'TRP-LOSS-001',
    vehicleId: 'veh-2',
    driverId: 'drv-2',
    vehicleOwnerPartyId: 'owner-2',
    originCity: 'Delhi',
    destinationCity: 'Kanpur',
    stops: [],
    scheduledDeparture: '2026-11-01',
    totalAgreedFreightPaise: 3000000, // ₹30,000
    advancePayableToOwnerPaise: 2000000,
    balancePayableToOwnerPaise: 1500000, // Total Hire = ₹35,000 (Exceeds ₹30,000 freight!)
    brokerCommissionPaise: 100000,
    status: 'IN_TRANSIT',
    fastagTollDeductionPaise: 100000,
    dieselExpensePaise: 1200000,
    trackingToken: 'token-2',
  };

  const deficitLR: LorryReceipt = {
    id: 'lr-deficit',
    tenantId: 'tenant-1',
    tripId: 'trp-deficit',
    lrNumber: 'LR-DEF-001',
    lrDate: '2026-11-01',
    consignorPartyId: 'p-1',
    consigneePartyId: 'p-2',
    billingPartyId: 'p-1',
    goodsDescription: 'Heavy Iron Bars',
    packageCount: 100,
    packageType: 'CRATES',
    actualWeightKg: 10000,
    chargeableWeightKg: 10000,
    freightPaise: 3000000,
    loadingChargesPaise: 0,
    unloadingChargesPaise: 0,
    statisticalChargesPaise: 0,
    totalLrAmountPaise: 3000000, // ₹30,000
    advanceReceivedPaise: 1500000,
    balanceReceivablePaise: 1500000,
    paymentTerms: 'TO_BE_BILLED',
    podStatus: 'PENDING',
    deliveryStatus: 'IN_TRANSIT',
  };

  const result = calculateTripProfitabilityMetrics([deficitTrip], [deficitLR]);

  // Revenue = ₹30,000 (3,000,000 paise), Hire = ₹35,000 (3,500,000 paise)
  assert.equal(result.totalFreightRevenuePaise, 3000000);
  assert.equal(result.totalHireExpensePaise, 3500000);
  assert.equal(result.grossProfitPaise, -500000); // -₹5,000 deficit!
  assert.equal(result.grossMarginPct, -16.67);
  assert.equal(result.deficitTripsCount, 1);
  assert.equal(result.tripBreakdowns[0].marginStatus, 'DEFICIT');
});

test('calculate7DayRollingFinancialTrend accurately generates 7 chronological daily points and metrics', () => {
  const mockEntries: JournalEntry[] = [
    // 2026-10-31: Revenue ₹40,000, Hire ₹30,000
    {
      id: 'je-oct-31',
      tenantId: 'tenant-1',
      entryNumber: 'JE-OCT-31',
      entryDate: '2026-10-31',
      referenceType: 'BILTY_BILLING',
      referenceId: 'trp-mock-31',
      narration: 'Oct 31 transit',
      isPosted: true,
      lines: [
        { id: 'l1', accountId: 'acc-ar', debitPaise: 4000000, creditPaise: 0 },
        { id: 'l2', accountId: 'acc-freight-revenue', debitPaise: 0, creditPaise: 4000000 },
        { id: 'l3', accountId: 'acc-exp-hire', debitPaise: 3000000, creditPaise: 0 },
        { id: 'l4', accountId: 'acc-ap-owners', debitPaise: 0, creditPaise: 3000000 },
      ],
      createdAt: '2026-10-31',
    },
    // 2026-11-01: Revenue ₹50,000, Hire ₹42,000
    {
      id: 'je-nov-01',
      tenantId: 'tenant-1',
      entryNumber: 'JE-NOV-01',
      entryDate: '2026-11-01',
      referenceType: 'BILTY_BILLING',
      referenceId: 'trp-mock-01',
      narration: 'Nov 01 transit',
      isPosted: true,
      lines: [
        { id: 'l5', accountId: 'acc-ar', debitPaise: 5000000, creditPaise: 0 },
        { id: 'l6', accountId: 'acc-freight-revenue', debitPaise: 0, creditPaise: 5000000 },
        { id: 'l7', accountId: 'acc-exp-hire', debitPaise: 4200000, creditPaise: 0 },
        { id: 'l8', accountId: 'acc-ap-owners', debitPaise: 0, creditPaise: 4200000 },
      ],
      createdAt: '2026-11-01',
    },
    // 2026-11-02: Revenue ₹60,000, Hire ₹48,000
    {
      id: 'je-nov-02',
      tenantId: 'tenant-1',
      entryNumber: 'JE-NOV-02',
      entryDate: '2026-11-02',
      referenceType: 'BILTY_BILLING',
      referenceId: 'trp-mock-02',
      narration: 'Nov 02 transit',
      isPosted: true,
      lines: [
        { id: 'l9', accountId: 'acc-ar', debitPaise: 6000000, creditPaise: 0 },
        { id: 'l10', accountId: 'acc-freight-revenue', debitPaise: 0, creditPaise: 6000000 },
        { id: 'l11', accountId: 'acc-exp-hire', debitPaise: 4800000, creditPaise: 0 },
        { id: 'l12', accountId: 'acc-ap-owners', debitPaise: 0, creditPaise: 4800000 },
      ],
      createdAt: '2026-11-02',
    },
  ];

  const trend = calculate7DayRollingFinancialTrend(mockEntries, [], [], '2026-11-02');

  // Must have exactly 7 daily points ending on 2026-11-02
  assert.equal(trend.dailyPoints.length, 7);
  assert.equal(trend.dailyPoints[0].date, '2026-10-27');
  assert.equal(trend.dailyPoints[6].date, '2026-11-02');

  // Verify daily totals for 2026-10-31 (index 4)
  const oct31 = trend.dailyPoints[4];
  assert.equal(oct31.revenuePaise, 4000000);
  assert.equal(oct31.expensePaise, 3000000);
  assert.equal(oct31.grossMarginPaise, 1000000);
  assert.equal(oct31.marginPct, 25.0);

  // Verify daily totals for 2026-11-01 (index 5)
  const nov01 = trend.dailyPoints[5];
  assert.equal(nov01.revenuePaise, 5000000);
  assert.equal(nov01.expensePaise, 4200000);
  assert.equal(nov01.grossMarginPaise, 800000);
  assert.equal(nov01.marginPct, 16.0);

  // Verify daily totals for 2026-11-02 (index 6)
  const nov02 = trend.dailyPoints[6];
  assert.equal(nov02.revenuePaise, 6000000);
  assert.equal(nov02.expensePaise, 4800000);
  assert.equal(nov02.grossMarginPaise, 1200000);
  assert.equal(nov02.marginPct, 20.0);

  // 7-day cumulative totals: 40k + 50k + 60k = 150k revenue, 30k + 42k + 48k = 120k expense
  assert.equal(trend.total7DayRevenuePaise, 15000000);
  assert.equal(trend.total7DayExpensePaise, 12000000);
  assert.equal(trend.total7DayGrossMarginPaise, 3000000); // ₹30,000 profit
  assert.equal(trend.average7DayMarginPct, 20.0);

  // Peak revenue day is Nov 02 (₹60,000 = 6,000,000 paise)
  assert.equal(trend.peakRevenueDay.date, '2026-11-02');
  assert.equal(trend.peakRevenueDay.amountPaise, 6000000);
});
