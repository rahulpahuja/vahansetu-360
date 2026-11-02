/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * VahanSetu 360 — Party Trust & Financial Reliability Scorecard Modal
 */

import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  X,
  CreditCard,
  Building,
  CheckCircle2,
  Clock,
  Radio,
  FileCheck,
  Award,
  TrendingUp,
} from 'lucide-react';
import { Party } from '../types/logistics';
import { formatPaiseToINR } from '../utils/accountingEngine';
import { calculatePartyVintage } from '../utils/vintageEngine';

interface TrustScoreModalProps {
  party: Party | null;
  onClose: () => void;
}

export const TrustScoreModal: React.FC<TrustScoreModalProps> = ({ party, onClose }) => {
  if (!party || !party.trustScore) return null;

  const score = party.trustScore;
  const vintage = calculatePartyVintage(party.establishmentDate);

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'AAA':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'AA':
        return 'text-teal-400 bg-teal-500/10 border-teal-500/30';
      case 'A':
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
      case 'BBB':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      default:
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-display font-bold text-white tracking-tight">
                  {party.legalName}
                </h2>
                <span
                  className={`px-2 py-0.5 text-xs font-mono font-bold rounded border ${getGradeColor(
                    score.grade
                  )}`}
                >
                  Grade {score.grade}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                PAN: <span className="font-mono text-slate-300">{party.pan}</span> ·{' '}
                {vintage.formattedVintage} ({vintage.tierLabel})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Score Hero Meter */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <div className="flex flex-col items-center justify-center p-3 text-center border-b sm:border-b-0 sm:border-r border-slate-800">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
              CIBIL-Scale Trust Index
            </span>
            <div className="text-4xl font-display font-extrabold text-white mt-1">
              {score.overallScore}
              <span className="text-sm font-normal text-slate-500"> / 900</span>
            </div>
            <span className="text-xs text-emerald-400 font-medium mt-1 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> High Confidence Tier
            </span>
          </div>

          <div className="flex flex-col justify-center p-3 border-b sm:border-b-0 sm:border-r border-slate-800">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
              Credit Limit Sanction
            </span>
            <div className="text-lg font-bold font-mono text-emerald-400 mt-1">
              {formatPaiseToINR(score.recommendedMaxCreditPaise)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Pre-approved credit terms of {party.paymentTermsDays || 15} days.
            </p>
          </div>

          <div className="flex flex-col justify-center p-3">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
              Advance Freight Limit
            </span>
            <div className="text-lg font-bold font-mono text-amber-400 mt-1">
              Up to {score.recommendedMaxAdvancePct}%
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Balance payable post digital POD verification.
            </p>
          </div>
        </div>

        {/* Three Pillar Breakdown */}
        <div className="space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Algorithmic Multi-Factor Evaluation
          </h3>

          {/* Pillar 1 */}
          <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                1. Payment Reliability & Financial Discipline (40% Weight)
              </span>
              <span className="font-mono font-bold text-emerald-400">
                {score.paymentReliabilityScore}/100
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all"
                style={{ width: `${score.paymentReliabilityScore}%` }}
              />
            </div>
            <div className="grid grid-cols-2 text-[11px] text-slate-400 pt-1">
              <div>
                On-Time Freight Settlement:{' '}
                <span className="text-white font-mono">{score.onTimePaymentRatePct}%</span>
              </div>
              <div>
                Avg Payment Lag:{' '}
                <span className="text-white font-mono">{score.avgPaymentDelayDays} days</span>
              </div>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Building className="w-4 h-4 text-teal-400" />
                2. Statutory & Regulatory Compliance (30% Weight)
              </span>
              <span className="font-mono font-bold text-teal-400">
                {score.statutoryComplianceScore}/100
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-teal-400 h-full rounded-full transition-all"
                style={{ width: `${score.statutoryComplianceScore}%` }}
              />
            </div>
            <div className="grid grid-cols-3 text-[11px] text-slate-400 pt-1">
              <div className="flex items-center gap-1">
                {score.gstinVerified ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>GSTIN Active</span>
              </div>
              <div className="flex items-center gap-1">
                {score.panVerified ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                )}
                <span>PAN Verified</span>
              </div>
              <div className="flex items-center gap-1">
                {score.sec194cDeclared ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <span className="text-slate-500 font-mono text-[10px]">194C Standard</span>
                )}
                <span>Sec 194C(6)</span>
              </div>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-cyan-400" />
                3. Operational Transparency & Telematics (30% Weight)
              </span>
              <span className="font-mono font-bold text-cyan-400">
                {score.operationalTransparencyScore}/100
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-cyan-400 h-full rounded-full transition-all"
                style={{ width: `${score.operationalTransparencyScore}%` }}
              />
            </div>
            <div className="grid grid-cols-3 text-[11px] text-slate-400 pt-1">
              <div>
                AIS-140 GPS:{' '}
                <span className="text-white font-mono">{score.ais140GpsAdoptionPct}%</span>
              </div>
              <div>
                Digital PODs:{' '}
                <span className="text-white font-mono">{score.onTimePodTurnaroundPct}%</span>
              </div>
              <div>
                Dispute Claims:{' '}
                <span className="text-emerald-400 font-mono">
                  {score.transitDisputeRatePct.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Assessment & Highlights */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
            Audit Notes & Integrity Check
          </span>
          <div className="space-y-1">
            {score.riskFlags.map((flag, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                <span className="text-emerald-400 font-bold mt-0.5">•</span>
                <span>{flag}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Close Scorecard
          </button>
        </div>
      </div>
    </div>
  );
};
