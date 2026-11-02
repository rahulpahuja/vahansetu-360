/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * VahanSetu 360 — Pure Double-Entry Accounting & Ledger Engine
 * Operates in integer paise to eliminate floating-point arithmetic errors.
 */

import {
  ChartOfAccount,
  JournalEntry,
  JournalLine,
  Party,
  Trip,
  LorryReceipt,
} from '../types/logistics';

export interface LedgerTransaction {
  date: string;
  entryNumber: string;
  referenceType: string;
  narration: string;
  debitPaise: number;
  creditPaise: number;
  runningBalancePaise: number;
  balanceType: 'DR' | 'CR';
}

export interface PartyLedgerStatement {
  partyId: string;
  partyName: string;
  partyPan: string;
  openingBalancePaise: number;
  totalDebitPaise: number;
  totalCreditPaise: number;
  closingBalancePaise: number;
  closingBalanceType: 'DR' | 'CR'; // DR = Receivable from party, CR = Payable to party
  transactions: LedgerTransaction[];
}

export interface TrialBalanceRow {
  accountId: string;
  accountCode: string;
  accountName: string;
  accountType: string;
  debitTotalPaise: number;
  creditTotalPaise: number;
}

export interface TrialBalanceResult {
  rows: TrialBalanceRow[];
  totalDebitPaise: number;
  totalCreditPaise: number;
  isBalanced: boolean;
}

export interface AgingBucket {
  partyId: string;
  partyName: string;
  role: string;
  days0To15Paise: number;
  days16To30Paise: number;
  days31To60Paise: number;
  daysOver60Paise: number;
  totalOutstandingPaise: number;
}

/**
 * Format integer paise into standard Indian Rupee string (e.g. ₹50,000.00)
 */
export function formatPaiseToINR(paise: number): string {
  const isNegative = paise < 0;
  const absPaise = Math.abs(Math.round(paise));
  const rupees = Math.floor(absPaise / 100);
  const remainderPaise = absPaise % 100;
  const paiseStr = remainderPaise.toString().padStart(2, '0');

  // Indian Number Format (lakhs and crores: 12,34,567.89)
  const rupeesStr = rupees.toString();
  let formattedRupees = '';
  if (rupeesStr.length <= 3) {
    formattedRupees = rupeesStr;
  } else {
    const lastThree = rupeesStr.substring(rupeesStr.length - 3);
    const otherNumbers = rupeesStr.substring(0, rupeesStr.length - 3);
    formattedRupees =
      otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
  }

  return `${isNegative ? '-' : ''}₹${formattedRupees}.${paiseStr}`;
}

/**
 * Convert INR numeric (e.g. 50000.50) to integer paise (5000050)
 */
export function inrToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

/**
 * Invariant Check: Every journal entry must have Sum(Debits) === Sum(Credits)
 */
export function validateJournalEntryBalance(lines: JournalLine[]): {
  isValid: boolean;
  totalDebitsPaise: number;
  totalCreditsPaise: number;
  discrepancyPaise: number;
  error?: string;
} {
  let totalDebits = 0;
  let totalCredits = 0;

  for (const line of lines) {
    if (line.debitPaise < 0 || line.creditPaise < 0) {
      return {
        isValid: false,
        totalDebitsPaise: 0,
        totalCreditsPaise: 0,
        discrepancyPaise: 0,
        error: 'Negative debit or credit amounts are strictly prohibited.',
      };
    }
    if (line.debitPaise > 0 && line.creditPaise > 0) {
      return {
        isValid: false,
        totalDebitsPaise: 0,
        totalCreditsPaise: 0,
        discrepancyPaise: 0,
        error: 'A single journal line cannot contain both debit and credit.',
      };
    }
    totalDebits += line.debitPaise;
    totalCredits += line.creditPaise;
  }

  const discrepancy = Math.abs(totalDebits - totalCredits);
  const isValid = discrepancy === 0;

  return {
    isValid,
    totalDebitsPaise: totalDebits,
    totalCreditsPaise: totalCredits,
    discrepancyPaise: discrepancy,
    error: isValid
      ? undefined
      : `Unbalanced entry: Total debits (${formatPaiseToINR(
          totalDebits
        )}) do not equal total credits (${formatPaiseToINR(totalCredits)}).`,
  };
}

/**
 * Compute party-specific sub-ledger statement
 */
export function calculatePartyLedger(
  party: Party,
  entries: JournalEntry[]
): PartyLedgerStatement {
  const transactions: LedgerTransaction[] = [];
  let runningBalance = 0;
  let totalDebits = 0;
  let totalCredits = 0;

  // Sort chronologically
  const sortedEntries = [...entries].sort((a, b) =>
    a.entryDate.localeCompare(b.entryDate)
  );

  for (const entry of sortedEntries) {
    const matchingLines = entry.lines.filter(
      (line) => line.partyId === party.id
    );
    for (const line of matchingLines) {
      totalDebits += line.debitPaise;
      totalCredits += line.creditPaise;

      // Positive balance represents a net Debit (Receivable from party)
      // Negative balance represents a net Credit (Payable to party)
      runningBalance += line.debitPaise - line.creditPaise;

      transactions.push({
        date: entry.entryDate,
        entryNumber: entry.entryNumber,
        referenceType: entry.referenceType,
        narration: line.description || entry.narration,
        debitPaise: line.debitPaise,
        creditPaise: line.creditPaise,
        runningBalancePaise: Math.abs(runningBalance),
        balanceType: runningBalance >= 0 ? 'DR' : 'CR',
      });
    }
  }

  return {
    partyId: party.id,
    partyName: party.legalName,
    partyPan: party.pan,
    openingBalancePaise: 0,
    totalDebitPaise: totalDebits,
    totalCreditPaise: totalCredits,
    closingBalancePaise: Math.abs(runningBalance),
    closingBalanceType: runningBalance >= 0 ? 'DR' : 'CR',
    transactions,
  };
}

/**
 * Compute comprehensive Trial Balance across all Chart of Accounts
 */
export function calculateTrialBalance(
  accounts: ChartOfAccount[],
  entries: JournalEntry[]
): TrialBalanceResult {
  const accountTotals = new Map<
    string,
    { debit: number; credit: number; code: string; name: string; type: string }
  >();

  for (const acc of accounts) {
    accountTotals.set(acc.id, {
      debit: 0,
      credit: 0,
      code: acc.code,
      name: acc.name,
      type: acc.accountType,
    });
  }

  for (const entry of entries) {
    if (!entry.isPosted) continue;
    for (const line of entry.lines) {
      const acc = accountTotals.get(line.accountId);
      if (acc) {
        acc.debit += line.debitPaise;
        acc.credit += line.creditPaise;
      }
    }
  }

  let totalDebits = 0;
  let totalCredits = 0;
  const rows: TrialBalanceRow[] = [];

  for (const [id, acc] of accountTotals.entries()) {
    if (acc.debit > 0 || acc.credit > 0) {
      rows.push({
        accountId: id,
        accountCode: acc.code,
        accountName: acc.name,
        accountType: acc.type,
        debitTotalPaise: acc.debit,
        creditTotalPaise: acc.credit,
      });
      totalDebits += acc.debit;
      totalCredits += acc.credit;
    }
  }

  rows.sort((a, b) => a.accountCode.localeCompare(b.accountCode));

  return {
    rows,
    totalDebitPaise: totalDebits,
    totalCreditPaise: totalCredits,
    isBalanced: totalDebits === totalCredits,
  };
}

/**
 * Compute Profit & Loss Statement (Operating Freight Income vs Direct & Overhead Expenses)
 */
export function calculateProfitAndLoss(
  accounts: ChartOfAccount[],
  entries: JournalEntry[]
): {
  incomeRows: { code: string; name: string; amountPaise: number }[];
  expenseRows: { code: string; name: string; amountPaise: number }[];
  totalIncomePaise: number;
  totalExpensePaise: number;
  netProfitPaise: number;
  marginPercent: number;
} {
  const trial = calculateTrialBalance(accounts, entries);
  const incomeRows: { code: string; name: string; amountPaise: number }[] = [];
  const expenseRows: { code: string; name: string; amountPaise: number }[] = [];
  let totalIncome = 0;
  let totalExpense = 0;

  for (const row of trial.rows) {
    if (row.accountType === 'INCOME') {
      const net = row.creditTotalPaise - row.debitTotalPaise;
      incomeRows.push({
        code: row.accountCode,
        name: row.accountName,
        amountPaise: net,
      });
      totalIncome += net;
    } else if (row.accountType === 'EXPENSE') {
      const net = row.debitTotalPaise - row.creditTotalPaise;
      expenseRows.push({
        code: row.accountCode,
        name: row.accountName,
        amountPaise: net,
      });
      totalExpense += net;
    }
  }

  const netProfit = totalIncome - totalExpense;
  const margin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

  return {
    incomeRows,
    expenseRows,
    totalIncomePaise: totalIncome,
    totalExpensePaise: totalExpense,
    netProfitPaise: netProfit,
    marginPercent: parseFloat(margin.toFixed(2)),
  };
}

export interface TripProfitabilityBreakdown {
  tripId: string;
  tripNumber: string;
  originCity: string;
  destinationCity: string;
  status: string;
  lrCount: number;
  totalFreightRevenuePaise: number;
  pureFreightPaise: number;
  totalHireExpensePaise: number;
  advancePayableToOwnerPaise: number;
  balancePayableToOwnerPaise: number;
  brokerCommissionPaise: number;
  grossProfitPaise: number;
  grossMarginPct: number;
  netOperatingProfitPaise: number;
  netMarginPct: number;
  advanceCashSpreadPaise: number;
  balanceSpreadPaise: number;
  marginStatus: 'EXCELLENT' | 'HEALTHY' | 'MODERATE' | 'DEFICIT';
}

export interface RealTimeProfitabilitySummary {
  totalFreightRevenuePaise: number;
  totalPureFreightPaise: number;
  totalHireExpensePaise: number;
  totalBrokerCommissionPaise: number;
  grossProfitPaise: number;
  grossMarginPct: number;
  netOperatingProfitPaise: number;
  netMarginPct: number;
  totalAdvanceReceivedPaise: number;
  totalAdvancePaidToOwnersPaise: number;
  advanceCashSpreadPaise: number;
  totalReceivablePaise: number;
  totalBalancePayableToOwnersPaise: number;
  balanceSpreadPaise: number;
  tripCount: number;
  lrCount: number;
  profitableTripsCount: number;
  deficitTripsCount: number;
  tripBreakdowns: TripProfitabilityBreakdown[];
}

/**
 * Real-time Profitability Engine
 * Calculates the exact difference between total freight revenue from Lorry Receipts
 * and total hire expenses from active/current trips with integer paise precision.
 */
export function calculateTripProfitabilityMetrics(
  trips: Trip[],
  lorryReceipts: LorryReceipt[]
): RealTimeProfitabilitySummary {
  // 1. Total Freight Revenue from Lorry Receipts (including handling charges)
  const totalFreightRevenuePaise = lorryReceipts.reduce(
    (sum, lr) => sum + (lr.totalLrAmountPaise || lr.freightPaise || 0),
    0
  );

  const totalPureFreightPaise = lorryReceipts.reduce(
    (sum, lr) => sum + (lr.freightPaise || 0),
    0
  );

  const totalAdvanceReceivedPaise = lorryReceipts.reduce(
    (sum, lr) => sum + (lr.advanceReceivedPaise || 0),
    0
  );

  const totalReceivablePaise = lorryReceipts.reduce(
    (sum, lr) => sum + (lr.balanceReceivablePaise || 0),
    0
  );

  // 2. Total Hire Expenses from Trips (payable to Motor Maliks / Truck Owners)
  let totalHireExpensePaise = 0;
  let totalBrokerCommissionPaise = 0;
  let totalAdvancePaidToOwnersPaise = 0;
  let totalBalancePayableToOwnersPaise = 0;

  const tripBreakdowns: TripProfitabilityBreakdown[] = trips.map((trip) => {
    const matchingLrs = lorryReceipts.filter((lr) => lr.tripId === trip.id);
    
    // Revenue for this trip from its Lorry Receipts
    const tripRevenuePaise = matchingLrs.length > 0
      ? matchingLrs.reduce((sum, lr) => sum + (lr.totalLrAmountPaise || lr.freightPaise || 0), 0)
      : (trip.totalAgreedFreightPaise || 0);

    const tripPureFreight = matchingLrs.length > 0
      ? matchingLrs.reduce((sum, lr) => sum + (lr.freightPaise || 0), 0)
      : (trip.totalAgreedFreightPaise || 0);

    const tripAdvanceRcvd = matchingLrs.reduce((sum, lr) => sum + (lr.advanceReceivedPaise || 0), 0);
    const tripBalanceRcv = matchingLrs.reduce((sum, lr) => sum + (lr.balanceReceivablePaise || 0), 0);

    // Hire expense for this trip payable to Truck Owner
    const hireExpense = (trip.advancePayableToOwnerPaise || 0) + (trip.balancePayableToOwnerPaise || 0);
    const brokerFee = trip.brokerCommissionPaise || 0;

    totalHireExpensePaise += hireExpense;
    totalBrokerCommissionPaise += brokerFee;
    totalAdvancePaidToOwnersPaise += (trip.advancePayableToOwnerPaise || 0);
    totalBalancePayableToOwnersPaise += (trip.balancePayableToOwnerPaise || 0);

    const grossProfit = tripRevenuePaise - hireExpense;
    const netProfit = grossProfit - brokerFee;

    const grossPct = tripRevenuePaise > 0
      ? parseFloat(((grossProfit / tripRevenuePaise) * 100).toFixed(2))
      : 0;

    const netPct = tripRevenuePaise > 0
      ? parseFloat(((netProfit / tripRevenuePaise) * 100).toFixed(2))
      : 0;

    let marginStatus: 'EXCELLENT' | 'HEALTHY' | 'MODERATE' | 'DEFICIT' = 'HEALTHY';
    if (grossProfit < 0) {
      marginStatus = 'DEFICIT';
    } else if (grossPct >= 18) {
      marginStatus = 'EXCELLENT';
    } else if (grossPct >= 10) {
      marginStatus = 'HEALTHY';
    } else {
      marginStatus = 'MODERATE';
    }

    return {
      tripId: trip.id,
      tripNumber: trip.tripNumber,
      originCity: trip.originCity,
      destinationCity: trip.destinationCity,
      status: trip.status,
      lrCount: matchingLrs.length,
      totalFreightRevenuePaise: tripRevenuePaise,
      pureFreightPaise: tripPureFreight,
      totalHireExpensePaise: hireExpense,
      advancePayableToOwnerPaise: trip.advancePayableToOwnerPaise || 0,
      balancePayableToOwnerPaise: trip.balancePayableToOwnerPaise || 0,
      brokerCommissionPaise: brokerFee,
      grossProfitPaise: grossProfit,
      grossMarginPct: grossPct,
      netOperatingProfitPaise: netProfit,
      netMarginPct: netPct,
      advanceCashSpreadPaise: tripAdvanceRcvd - (trip.advancePayableToOwnerPaise || 0),
      balanceSpreadPaise: tripBalanceRcv - (trip.balancePayableToOwnerPaise || 0),
      marginStatus,
    };
  });

  // Calculate global gross and net margins
  // If LRs exist, revenue is totalFreightRevenuePaise; if not, fallback to trip totals
  const effectiveRevenuePaise = totalFreightRevenuePaise > 0 
    ? totalFreightRevenuePaise 
    : trips.reduce((sum, t) => sum + (t.totalAgreedFreightPaise || 0), 0);

  const grossProfitPaise = effectiveRevenuePaise - totalHireExpensePaise;
  const netOperatingProfitPaise = grossProfitPaise - totalBrokerCommissionPaise;

  const grossMarginPct = effectiveRevenuePaise > 0
    ? parseFloat(((grossProfitPaise / effectiveRevenuePaise) * 100).toFixed(2))
    : 0;

  const netMarginPct = effectiveRevenuePaise > 0
    ? parseFloat(((netOperatingProfitPaise / effectiveRevenuePaise) * 100).toFixed(2))
    : 0;

  const advanceCashSpreadPaise = totalAdvanceReceivedPaise - totalAdvancePaidToOwnersPaise;
  const balanceSpreadPaise = totalReceivablePaise - totalBalancePayableToOwnersPaise;

  const profitableTripsCount = tripBreakdowns.filter((t) => t.grossProfitPaise > 0).length;
  const deficitTripsCount = tripBreakdowns.filter((t) => t.grossProfitPaise < 0).length;

  return {
    totalFreightRevenuePaise: effectiveRevenuePaise,
    totalPureFreightPaise,
    totalHireExpensePaise,
    totalBrokerCommissionPaise,
    grossProfitPaise,
    grossMarginPct,
    netOperatingProfitPaise,
    netMarginPct,
    totalAdvanceReceivedPaise,
    totalAdvancePaidToOwnersPaise,
    advanceCashSpreadPaise,
    totalReceivablePaise,
    totalBalancePayableToOwnersPaise,
    balanceSpreadPaise,
    tripCount: trips.length,
    lrCount: lorryReceipts.length,
    profitableTripsCount,
    deficitTripsCount,
    tripBreakdowns,
  };
}

export interface DailyRollingFinancialPoint {
  date: string; // "2026-10-27"
  dayLabel: string; // "27 Oct"
  dayName: string; // "Mon"
  revenuePaise: number; // Freight income booked
  expensePaise: number; // Operating hire & direct expenses
  grossMarginPaise: number; // revenue - expense
  marginPct: number; // ((revenue - expense) / revenue) * 100
  tripsCount: number;
}

export interface Rolling7DayFinancialTrend {
  dailyPoints: DailyRollingFinancialPoint[];
  total7DayRevenuePaise: number;
  total7DayExpensePaise: number;
  total7DayGrossMarginPaise: number;
  average7DayMarginPct: number;
  revenueMomentumPct: number;
  maxDailyValuePaise: number;
  peakRevenueDay: { date: string; dayLabel: string; amountPaise: number };
  peakProfitDay: { date: string; dayLabel: string; amountPaise: number };
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Calculates 7-day rolling performance of total freight revenue vs operating expenses.
 * Operates in integer paise to eliminate floating-point arithmetic errors.
 */
export function calculate7DayRollingFinancialTrend(
  journalEntries: JournalEntry[],
  trips: Trip[] = [],
  lorryReceipts: LorryReceipt[] = [],
  asOfDateStr: string = '2026-11-02'
): Rolling7DayFinancialTrend {
  // Parse asOfDate deterministically
  const parts = asOfDateStr.split('-').map(Number);
  const targetYear = parts[0] || 2026;
  const targetMonth = (parts[1] || 11) - 1;
  const targetDay = parts[2] || 2;

  const baseDate = new Date(Date.UTC(targetYear, targetMonth, targetDay, 12, 0, 0));

  const dailyPoints: DailyRollingFinancialPoint[] = [];

  for (let i = 6; i >= 0; i--) {
    const current = new Date(baseDate.getTime() - i * 24 * 60 * 60 * 1000);
    const y = current.getUTCFullYear();
    const m = (current.getUTCMonth() + 1).toString().padStart(2, '0');
    const d = current.getUTCDate().toString().padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;
    const dayLabel = `${current.getUTCDate()} ${MONTH_NAMES[current.getUTCMonth()]}`;
    const dayName = DAY_NAMES[current.getUTCDay()];

    // 1. Calculate from Journal Entries on this date
    let dayRevenuePaise = 0;
    let dayExpensePaise = 0;

    for (const entry of journalEntries) {
      if (entry.entryDate === dateStr) {
        for (const line of entry.lines) {
          // Freight / Handling income
          if (
            line.accountId === 'acc-freight-revenue' ||
            line.accountId === 'acc-loading-income' ||
            line.accountId === 'acc-rev'
          ) {
            dayRevenuePaise += (line.creditPaise - line.debitPaise);
          }
          // Direct hire / broker / toll expense
          if (
            line.accountId === 'acc-exp-hire' ||
            line.accountId === 'acc-exp-brokerage' ||
            line.accountId === 'acc-exp-toll' ||
            line.accountId === 'acc-exp'
          ) {
            dayExpensePaise += (line.debitPaise - line.creditPaise);
          }
        }
      }
    }

    // 2. Count trips and check fallback if date has trips/LRs but no journal entries
    const matchingTrips = trips.filter((t) => t.scheduledDeparture.startsWith(dateStr));
    const matchingLrs = lorryReceipts.filter((lr) => lr.lrDate === dateStr);

    if (dayRevenuePaise === 0 && matchingLrs.length > 0) {
      dayRevenuePaise = matchingLrs.reduce(
        (sum, lr) => sum + (lr.totalLrAmountPaise || lr.freightPaise || 0),
        0
      );
    }

    if (dayExpensePaise === 0 && matchingTrips.length > 0) {
      dayExpensePaise = matchingTrips.reduce(
        (sum, t) => sum + (t.advancePayableToOwnerPaise || 0) + (t.balancePayableToOwnerPaise || 0),
        0
      );
    }

    const grossMarginPaise = dayRevenuePaise - dayExpensePaise;
    const marginPct = dayRevenuePaise > 0
      ? parseFloat(((grossMarginPaise / dayRevenuePaise) * 100).toFixed(2))
      : 0;

    dailyPoints.push({
      date: dateStr,
      dayLabel,
      dayName,
      revenuePaise: dayRevenuePaise,
      expensePaise: dayExpensePaise,
      grossMarginPaise,
      marginPct,
      tripsCount: matchingTrips.length,
    });
  }

  const total7DayRevenuePaise = dailyPoints.reduce((sum, p) => sum + p.revenuePaise, 0);
  const total7DayExpensePaise = dailyPoints.reduce((sum, p) => sum + p.expensePaise, 0);
  const total7DayGrossMarginPaise = total7DayRevenuePaise - total7DayExpensePaise;

  const average7DayMarginPct = total7DayRevenuePaise > 0
    ? parseFloat(((total7DayGrossMarginPaise / total7DayRevenuePaise) * 100).toFixed(2))
    : 0;

  // Max daily value for SVG coordinate scaling (revenue or expense)
  let maxDaily = 1;
  let peakRev = { date: dailyPoints[0].date, dayLabel: dailyPoints[0].dayLabel, amountPaise: 0 };
  let peakProf = { date: dailyPoints[0].date, dayLabel: dailyPoints[0].dayLabel, amountPaise: -Infinity };

  dailyPoints.forEach((p) => {
    if (p.revenuePaise > maxDaily) maxDaily = p.revenuePaise;
    if (p.expensePaise > maxDaily) maxDaily = p.expensePaise;

    if (p.revenuePaise >= peakRev.amountPaise) {
      peakRev = { date: p.date, dayLabel: p.dayLabel, amountPaise: p.revenuePaise };
    }
    if (p.grossMarginPaise >= peakProf.amountPaise) {
      peakProf = { date: p.date, dayLabel: p.dayLabel, amountPaise: p.grossMarginPaise };
    }
  });

  // Calculate momentum: first 3 days vs last 3 days
  const first3DaysRev = dailyPoints.slice(0, 3).reduce((sum, p) => sum + p.revenuePaise, 0);
  const last3DaysRev = dailyPoints.slice(4, 7).reduce((sum, p) => sum + p.revenuePaise, 0);
  const revenueMomentumPct = first3DaysRev > 0
    ? parseFloat((((last3DaysRev - first3DaysRev) / first3DaysRev) * 100).toFixed(1))
    : 0;

  return {
    dailyPoints,
    total7DayRevenuePaise,
    total7DayExpensePaise,
    total7DayGrossMarginPaise,
    average7DayMarginPct,
    revenueMomentumPct,
    maxDailyValuePaise: maxDaily,
    peakRevenueDay: peakRev,
    peakProfitDay: peakProf,
  };
}
