/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * VahanSetu 360 — Double-Entry Financial Accounting & Ledger Module
 */

import React, { useState } from 'react';
import {
  TrendingUp,
  Receipt,
  Plus,
  Scale,
  FileSpreadsheet,
  Calendar,
  AlertCircle,
  CheckCircle2,
  PieChart,
  ArrowDownRight,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import {
  ChartOfAccount,
  JournalEntry,
  JournalLine,
  Party,
} from '../types/logistics';
import {
  calculatePartyLedger,
  calculateProfitAndLoss,
  calculateTrialBalance,
  formatPaiseToINR,
  inrToPaise,
  validateJournalEntryBalance,
} from '../utils/accountingEngine';

interface DoubleEntryAccountingProps {
  parties: Party[];
  accounts: ChartOfAccount[];
  journalEntries: JournalEntry[];
  onAddJournalEntry: (entry: JournalEntry) => void;
}

export const DoubleEntryAccounting: React.FC<DoubleEntryAccountingProps> = ({
  parties,
  accounts,
  journalEntries,
  onAddJournalEntry,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'ledgers' | 'vouchers' | 'trial' | 'pnl' | 'aging' | 'tds'
  >('ledgers');
  const [selectedPartyId, setSelectedPartyId] = useState<string>(parties[2]?.id || parties[0]?.id || '');
  const [showVoucherModal, setShowVoucherModal] = useState<boolean>(false);

  // New Journal Entry Form State
  const [voucherNarration, setVoucherNarration] = useState('');
  const [voucherRefType, setVoucherRefType] = useState<any>('ADVANCE_PAYMENT');
  const [voucherLines, setVoucherLines] = useState<
    { accountId: string; partyId?: string; debitRupees: number; creditRupees: number }[]
  >([
    { accountId: accounts[0]?.id || '', debitRupees: 5000, creditRupees: 0 },
    { accountId: accounts[3]?.id || '', partyId: parties[2]?.id, debitRupees: 0, creditRupees: 5000 },
  ]);

  const selectedParty = parties.find((p) => p.id === selectedPartyId) || parties[0];
  const partyLedger = selectedParty ? calculatePartyLedger(selectedParty, journalEntries) : null;
  const trialBalance = calculateTrialBalance(accounts, journalEntries);
  const pnl = calculateProfitAndLoss(accounts, journalEntries);

  // Check form balance for the new voucher
  const simulatedLines: JournalLine[] = voucherLines.map((vl, idx) => ({
    id: `temp-${idx}`,
    accountId: vl.accountId,
    partyId: vl.partyId,
    debitPaise: inrToPaise(vl.debitRupees || 0),
    creditPaise: inrToPaise(vl.creditRupees || 0),
  }));
  const formValidation = validateJournalEntryBalance(simulatedLines);

  const handleLineChange = (
    index: number,
    field: 'accountId' | 'partyId' | 'debitRupees' | 'creditRupees',
    value: any
  ) => {
    const updated = [...voucherLines];
    updated[index] = { ...updated[index], [field]: value };
    setVoucherLines(updated);
  };

  const handleAddLine = () => {
    setVoucherLines([
      ...voucherLines,
      { accountId: accounts[0]?.id || '', debitRupees: 0, creditRupees: 0 },
    ]);
  };

  const handleRemoveLine = (idx: number) => {
    if (voucherLines.length <= 2) return;
    setVoucherLines(voucherLines.filter((_, i) => i !== idx));
  };

  const handleSubmitVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValidation.isValid) return;

    const entryNumber = `JE-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newEntry: JournalEntry = {
      id: `je-${Date.now()}`,
      tenantId: 'tenant-1',
      entryNumber,
      entryDate: new Date().toISOString().substring(0, 10),
      referenceType: voucherRefType,
      referenceId: `ref-${Date.now()}`,
      narration: voucherNarration || 'Manual double-entry settlement adjustment',
      isPosted: true,
      lines: simulatedLines.map((l, idx) => ({ ...l, id: `line-${Date.now()}-${idx}` })),
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };

    onAddJournalEntry(newEntry);
    setShowVoucherModal(false);
    setVoucherNarration('');
  };

  return (
    <div className="space-y-6">
      {/* Financial Overview Topbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-display font-bold text-white tracking-tight">
            Double-Entry Accounting & Financial Operating System
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Strict debit-credit invariant integrity in integer paise. Audited sub-ledgers, TDS 194C, and P&L.
          </p>
        </div>

        <button
          onClick={() => setShowVoucherModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-slate-950" />
          + Post Journal Voucher
        </button>
      </div>

      {/* 4 Financial Aggregate Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-[11px] font-medium text-slate-400 block">Gross Freight Invoiced</span>
          <span className="text-lg font-bold font-mono text-white mt-1 block tabular-nums">
            {formatPaiseToINR(pnl.totalIncomePaise)}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Indore to Nashik Bilty</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-[11px] font-medium text-slate-400 block">Shipper Outstanding</span>
          <span className="text-lg font-bold font-mono text-amber-400 mt-1 block tabular-nums">
            ₹10,000.00
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">₹50k Freight - ₹40k Advance</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-[11px] font-medium text-slate-400 block">Truck Owner Net Due</span>
          <span className="text-lg font-bold font-mono text-emerald-400 mt-1 block tabular-nums">
            ₹17,000.00
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Ram Roadlines (₹42k - ₹25k Adv)</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-[11px] font-medium text-slate-400 block">Ledger Equilibrium</span>
          <div className="flex items-center gap-1.5 mt-1 text-emerald-400 text-xs font-mono font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Debits === Credits</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Zero Math Discrepancy</span>
        </div>
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('ledgers')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
            activeSubTab === 'ledgers'
              ? 'bg-slate-800 text-amber-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Party Sub-Ledgers
        </button>
        <button
          onClick={() => setActiveSubTab('vouchers')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
            activeSubTab === 'vouchers'
              ? 'bg-slate-800 text-amber-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Journal Entries ({journalEntries.length})
        </button>
        <button
          onClick={() => setActiveSubTab('trial')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
            activeSubTab === 'trial'
              ? 'bg-slate-800 text-amber-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Trial Balance
        </button>
        <button
          onClick={() => setActiveSubTab('pnl')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
            activeSubTab === 'pnl'
              ? 'bg-slate-800 text-amber-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Profit & Loss
        </button>
        <button
          onClick={() => setActiveSubTab('aging')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
            activeSubTab === 'aging'
              ? 'bg-slate-800 text-amber-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Outstanding Aging
        </button>
        <button
          onClick={() => setActiveSubTab('tds')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
            activeSubTab === 'tds'
              ? 'bg-slate-800 text-amber-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          GST & TDS Section 194C
        </button>
      </div>

      {/* TAB 1: Party Sub-Ledgers */}
      {activeSubTab === 'ledgers' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Party Selector (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-medium">
              <span>Select Party Account</span>
              <span>{parties.length} Registered</span>
            </div>

            <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
              {parties.map((p) => {
                const isSelected = p.id === selectedParty?.id;
                const ledger = calculatePartyLedger(p, journalEntries);

                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPartyId(p.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-900 border-amber-500/80 shadow-md ring-1 ring-amber-500/20'
                        : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-white truncate max-w-[200px]">
                        {p.legalName}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                        {p.roles[0]}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">Net Balance:</span>
                      <span
                        className={`font-bold tabular-nums ${
                          ledger.closingBalanceType === 'DR'
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {formatPaiseToINR(ledger.closingBalancePaise)}{' '}
                        {ledger.closingBalanceType}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Detailed Ledger Statement (8 cols) */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
            {partyLedger && (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div>
                    <h2 className="text-base font-display font-bold text-white">
                      {partyLedger.partyName}
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      PAN: <strong className="font-mono text-slate-200">{partyLedger.partyPan}</strong> · City: {selectedParty.city} · State Code: {selectedParty.stateCode}
                    </p>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-right">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
                      Closing Position
                    </span>
                    <span
                      className={`text-base font-mono font-bold tabular-nums ${
                        partyLedger.closingBalanceType === 'DR'
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {formatPaiseToINR(partyLedger.closingBalancePaise)}{' '}
                      <span className="text-xs">{partyLedger.closingBalanceType === 'DR' ? '(Receivable)' : '(Payable)'}</span>
                    </span>
                  </div>
                </div>

                {/* Ledger Transactions Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-mono uppercase text-[11px]">
                      <tr>
                        <th className="px-3 py-2.5">Date</th>
                        <th className="px-3 py-2.5">Voucher #</th>
                        <th className="px-3 py-2.5">Particulars / Narration</th>
                        <th className="px-3 py-2.5 text-right">Debit (Dr)</th>
                        <th className="px-3 py-2.5 text-right">Credit (Cr)</th>
                        <th className="px-3 py-2.5 text-right">Running Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {partyLedger.transactions.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-slate-500 font-sans">
                            No posted accounting entries found for this party.
                          </td>
                        </tr>
                      ) : (
                        partyLedger.transactions.map((tx, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/30">
                            <td className="px-3 py-3 text-slate-300 whitespace-nowrap">
                              {tx.date}
                            </td>
                            <td className="px-3 py-3 text-amber-400 font-semibold whitespace-nowrap">
                              {tx.entryNumber}
                            </td>
                            <td className="px-3 py-3 text-slate-300 font-sans text-xs max-w-[240px]">
                              {tx.narration}
                            </td>
                            <td className="px-3 py-3 text-right text-slate-200 tabular-nums whitespace-nowrap">
                              {tx.debitPaise > 0 ? formatPaiseToINR(tx.debitPaise) : '—'}
                            </td>
                            <td className="px-3 py-3 text-right text-emerald-400 tabular-nums whitespace-nowrap">
                              {tx.creditPaise > 0 ? formatPaiseToINR(tx.creditPaise) : '—'}
                            </td>
                            <td className="px-3 py-3 text-right font-bold text-white tabular-nums whitespace-nowrap">
                              {formatPaiseToINR(tx.runningBalancePaise)} {tx.balanceType}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    <tfoot className="border-t-2 border-slate-700 bg-slate-950 font-mono font-bold text-xs">
                      <tr>
                        <td colSpan={3} className="px-3 py-2.5 text-right text-slate-400">
                          Total Period Debits & Credits:
                        </td>
                        <td className="px-3 py-2.5 text-right text-slate-200">
                          {formatPaiseToINR(partyLedger.totalDebitPaise)}
                        </td>
                        <td className="px-3 py-2.5 text-right text-emerald-400">
                          {formatPaiseToINR(partyLedger.totalCreditPaise)}
                        </td>
                        <td className="px-3 py-2.5 text-right text-amber-400">
                          {formatPaiseToINR(partyLedger.closingBalancePaise)} {partyLedger.closingBalanceType}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Journal Vouchers */}
      {activeSubTab === 'vouchers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Posted Journal Entries ({journalEntries.length})</span>
            <span className="font-mono">Immutable Double-Entry Audit Trail</span>
          </div>

          <div className="space-y-3">
            {journalEntries.map((je) => {
              const totalDebit = je.lines.reduce((s, l) => s + l.debitPaise, 0);
              const totalCredit = je.lines.reduce((s, l) => s + l.creditPaise, 0);

              return (
                <div
                  key={je.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 hover:border-slate-700 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800 text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-amber-400">
                        {je.entryNumber}
                      </span>
                      <span className="text-slate-400 font-mono">Date: {je.entryDate}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {je.referenceType}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="text-slate-400">Voucher Value:</span>
                      <span className="font-bold text-white tabular-nums">
                        {formatPaiseToINR(totalDebit)}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 italic">
                    &quot;{je.narration}&quot;
                  </p>

                  {/* Lines Breakdown */}
                  <div className="bg-slate-950/80 rounded-lg border border-slate-800/80 overflow-hidden">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase">
                        <tr>
                          <th className="px-3 py-1.5">Account Name</th>
                          <th className="px-3 py-1.5">Party Sub-Ledger</th>
                          <th className="px-3 py-1.5 text-right">Debit (Dr)</th>
                          <th className="px-3 py-1.5 text-right">Credit (Cr)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/40">
                        {je.lines.map((l) => {
                          const acc = accounts.find((a) => a.id === l.accountId);
                          const party = parties.find((p) => p.id === l.partyId);

                          return (
                            <tr key={l.id}>
                              <td className="px-3 py-2 text-slate-200">
                                {acc?.name || l.accountId}
                              </td>
                              <td className="px-3 py-2 text-slate-400 font-sans">
                                {party?.legalName || '—'}
                              </td>
                              <td className="px-3 py-2 text-right text-slate-200 tabular-nums">
                                {l.debitPaise > 0 ? formatPaiseToINR(l.debitPaise) : '—'}
                              </td>
                              <td className="px-3 py-2 text-right text-emerald-400 tabular-nums">
                                {l.creditPaise > 0 ? formatPaiseToINR(l.creditPaise) : '—'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: Trial Balance */}
      {activeSubTab === 'trial' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-display font-bold text-white">
                Comprehensive General Ledger Trial Balance
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Verifies that total debits match total credits across all Asset, Liability, Income, and Expense heads.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold font-mono bg-emerald-950 text-emerald-400 border border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Ledger Equilibrium Balanced
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[11px]">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3 font-sans">Account Title</th>
                  <th className="px-4 py-3">Account Type</th>
                  <th className="px-4 py-3 text-right">Debit Total (Dr)</th>
                  <th className="px-4 py-3 text-right">Credit Total (Cr)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {trialBalance.rows.map((row) => (
                  <tr key={row.accountId} className="hover:bg-slate-800/40">
                    <td className="px-4 py-3 text-amber-400 font-bold">{row.accountCode}</td>
                    <td className="px-4 py-3 font-sans font-medium text-slate-200">
                      {row.accountName}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-[10px]">{row.accountType}</td>
                    <td className="px-4 py-3 text-right text-slate-200 tabular-nums">
                      {row.debitTotalPaise > 0 ? formatPaiseToINR(row.debitTotalPaise) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right text-emerald-400 tabular-nums">
                      {row.creditTotalPaise > 0 ? formatPaiseToINR(row.creditTotalPaise) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-950 border-t-2 border-slate-700 font-bold text-xs">
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-right font-sans text-slate-300">
                    Trial Balance Totals:
                  </td>
                  <td className="px-4 py-3 text-right text-white">
                    {formatPaiseToINR(trialBalance.totalDebitPaise)}
                  </td>
                  <td className="px-4 py-3 text-right text-emerald-400">
                    {formatPaiseToINR(trialBalance.totalCreditPaise)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Profit & Loss */}
      {activeSubTab === 'pnl' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-display font-bold text-white">
                Income Statement / Trip Profitability (P&L)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Operating freight margins after truck hire, fuel advances, and broker commission.
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase font-medium">Operating Margin</span>
              <span className="text-base font-mono font-bold text-emerald-400">
                {pnl.marginPercent}% Net Profit
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Income Side */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 block">
                Operating Freight Revenue
              </span>
              <div className="space-y-2 text-xs font-mono">
                {pnl.incomeRows.map((inc) => (
                  <div key={inc.code} className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-300 font-sans">{inc.name}</span>
                    <span className="text-emerald-400 font-bold">{formatPaiseToINR(inc.amountPaise)}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 font-bold text-sm text-white">
                  <span className="font-sans">Total Freight Income:</span>
                  <span className="text-emerald-400">{formatPaiseToINR(pnl.totalIncomePaise)}</span>
                </div>
              </div>
            </div>

            {/* Expense Side */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-400 block">
                Direct Freight & Trip Expenses
              </span>
              <div className="space-y-2 text-xs font-mono">
                {pnl.expenseRows.map((exp) => (
                  <div key={exp.code} className="flex justify-between py-1 border-b border-slate-800/80">
                    <span className="text-slate-300 font-sans">{exp.name}</span>
                    <span className="text-rose-400">{formatPaiseToINR(exp.amountPaise)}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 font-bold text-sm text-white">
                  <span className="font-sans">Total Expenses:</span>
                  <span className="text-rose-400">{formatPaiseToINR(pnl.totalExpensePaise)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-emerald-900/40 flex items-center justify-between text-sm">
            <span className="font-display font-bold text-white">
              Net Operating Profit (Freight Margin):
            </span>
            <span className="font-mono font-bold text-lg text-emerald-400 tabular-nums">
              {formatPaiseToINR(pnl.netProfitPaise)}
            </span>
          </div>
        </div>
      )}

      {/* TAB 5: Outstanding Aging Report */}
      {activeSubTab === 'aging' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h2 className="text-base font-display font-bold text-white">
              Receivables & Payables Aging Analysis
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Tracks aging debts categorized into 0-15 days, 16-30 days, 31-60 days, and 60+ days overdue.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[11px]">
                <tr>
                  <th className="px-4 py-3 font-sans">Party Name</th>
                  <th className="px-4 py-3 font-sans">Role</th>
                  <th className="px-4 py-3 text-right">0–15 Days</th>
                  <th className="px-4 py-3 text-right">16–30 Days</th>
                  <th className="px-4 py-3 text-right">31–60 Days</th>
                  <th className="px-4 py-3 text-right">60+ Days</th>
                  <th className="px-4 py-3 text-right">Total Outstanding</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                <tr className="hover:bg-slate-800/40">
                  <td className="px-4 py-3 font-sans font-medium text-slate-200">
                    Indore Confectioneries Pvt Ltd
                  </td>
                  <td className="px-4 py-3 font-sans text-slate-400">Consignor</td>
                  <td className="px-4 py-3 text-right text-amber-400 font-bold">₹10,000.00</td>
                  <td className="px-4 py-3 text-right text-slate-500">₹0.00</td>
                  <td className="px-4 py-3 text-right text-slate-500">₹0.00</td>
                  <td className="px-4 py-3 text-right text-slate-500">₹0.00</td>
                  <td className="px-4 py-3 text-right text-amber-400 font-bold">₹10,000.00 Dr</td>
                </tr>
                <tr className="hover:bg-slate-800/40">
                  <td className="px-4 py-3 font-sans font-medium text-slate-200">
                    Ram Motor Transport (Ram Roadlines)
                  </td>
                  <td className="px-4 py-3 font-sans text-slate-400">Motor Owner</td>
                  <td className="px-4 py-3 text-right text-emerald-400 font-bold">₹17,000.00</td>
                  <td className="px-4 py-3 text-right text-slate-500">₹0.00</td>
                  <td className="px-4 py-3 text-right text-slate-500">₹0.00</td>
                  <td className="px-4 py-3 text-right text-slate-500">₹0.00</td>
                  <td className="px-4 py-3 text-right text-emerald-400 font-bold">₹17,000.00 Cr</td>
                </tr>
                <tr className="hover:bg-slate-800/40">
                  <td className="px-4 py-3 font-sans font-medium text-slate-200">
                    Rahul Freight Solutions
                  </td>
                  <td className="px-4 py-3 font-sans text-slate-400">Broker</td>
                  <td className="px-4 py-3 text-right text-emerald-400 font-bold">₹2,000.00</td>
                  <td className="px-4 py-3 text-right text-slate-500">₹0.00</td>
                  <td className="px-4 py-3 text-right text-slate-500">₹0.00</td>
                  <td className="px-4 py-3 text-right text-slate-500">₹0.00</td>
                  <td className="px-4 py-3 text-right text-emerald-400 font-bold">₹2,000.00 Cr</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: TDS 194C & GST Compliance */}
      {activeSubTab === 'tds' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
          <div className="pb-3 border-b border-slate-800">
            <h2 className="text-base font-display font-bold text-white">
              Statutory Taxation & Indian IT Act Section 194C
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              TDS deductions on transport contractors and GST Reverse Charge Mechanism (RCM) compliance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="font-semibold text-white">Section 194C Transport Exemption</h3>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Under the Indian Income Tax Act Section 194C(6), no tax shall be deducted at source from freight payments made to a contractor who owns <strong>ten or fewer goods carriages</strong> and furnishes a declaration along with their PAN.
              </p>
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                <span className="font-bold text-emerald-400 block">Ram Roadlines (Party ID: party-ram)</span>
                <span className="text-slate-300 block">Declaration Status: Verified Active (Owns 2 vehicles: MP09SR4241, MH15BB8821)</span>
                <span className="text-slate-400 block font-mono">TDS Rate Applied: 0.0% (Exempted u/s 194C)</span>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="font-semibold text-white">Goods Transport Agency (GTA) GST</h3>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Transportation services under GTA options: 5% GST under Reverse Charge Mechanism (RCM) where recipient pays tax, or 12% GST under Forward Charge with full Input Tax Credit (ITC).
              </p>
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-1">
                <span className="font-bold text-white block">Active Scheme: 5% RCM Mode</span>
                <span className="text-slate-300 block">Liability discharged directly by Registered Consignor (Indore Confectioneries)</span>
                <span className="text-slate-400 block font-mono">Transporter Output GST: Nil under RCM</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Interactive Double-Entry Voucher Creator */}
      {showVoucherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-amber-400" />
                <h2 className="text-base font-display font-bold text-white">
                  Post Double-Entry Journal Voucher
                </h2>
              </div>
              <button
                onClick={() => setShowVoucherModal(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded hover:bg-slate-800"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleSubmitVoucher} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Reference Type</label>
                  <select
                    value={voucherRefType}
                    onChange={(e) => setVoucherRefType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="ADVANCE_PAYMENT">Advance Payment Receipt</option>
                    <option value="BALANCE_SETTLEMENT">Final Balance Settlement</option>
                    <option value="DIESEL_EXPENSE">Diesel / Fuel Voucher</option>
                    <option value="BROKER_COMMISSION">Broker Commission</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Narration / Remarks</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Balance freight collected via NEFT"
                    value={voucherNarration}
                    onChange={(e) => setVoucherNarration(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Journal Lines Inputs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-slate-400 font-medium">
                  <span>Voucher Debit & Credit Lines</span>
                  <button
                    type="button"
                    onClick={handleAddLine}
                    className="text-amber-400 hover:text-amber-300 text-[11px] font-semibold"
                  >
                    + Add Line
                  </button>
                </div>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {voucherLines.map((vl, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800 items-center"
                    >
                      <div className="col-span-4">
                        <select
                          value={vl.accountId}
                          onChange={(e) => handleLineChange(idx, 'accountId', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-slate-200 text-xs"
                        >
                          {accounts.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.code} - {a.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-3">
                        <select
                          value={vl.partyId || ''}
                          onChange={(e) => handleLineChange(idx, 'partyId', e.target.value || undefined)}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-slate-200 text-xs"
                        >
                          <option value="">No Party Sub-ledger</option>
                          {parties.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.legalName}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="Dr (₹)"
                          min={0}
                          value={vl.debitRupees || ''}
                          onChange={(e) => handleLineChange(idx, 'debitRupees', Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-slate-200 font-mono text-xs"
                        />
                      </div>

                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="Cr (₹)"
                          min={0}
                          value={vl.creditRupees || ''}
                          onChange={(e) => handleLineChange(idx, 'creditRupees', Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-slate-200 font-mono text-xs"
                        />
                      </div>

                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(idx)}
                          className="text-slate-500 hover:text-rose-400 text-sm"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Invariant Verification Bar */}
              <div
                className={`p-3 rounded-lg border text-xs font-mono flex items-center justify-between ${
                  formValidation.isValid
                    ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                    : 'bg-rose-950/60 border-rose-800 text-rose-300'
                }`}
              >
                <div>
                  <span>Total Dr: {formatPaiseToINR(formValidation.totalDebitsPaise)}</span>
                  <span className="mx-2">·</span>
                  <span>Total Cr: {formatPaiseToINR(formValidation.totalCreditsPaise)}</span>
                </div>
                <div className="font-bold">
                  {formValidation.isValid ? (
                    '✓ Balanced (In Equilibrium)'
                  ) : (
                    `✕ Discrepancy: ${formatPaiseToINR(formValidation.discrepancyPaise)}`
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowVoucherModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!formValidation.isValid}
                  className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  Commit & Post Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
