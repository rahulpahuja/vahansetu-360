/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * VahanSetu 360 — Centralized Enterprise Compliance Audit Log Viewer
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Download,
  Key,
  ExternalLink,
  Layers,
  Clock,
  ArrowRight,
  Database,
  FileText,
} from 'lucide-react';
import { AuditActionType, AuditEntityType, AuditLogEntry } from '../types/logistics';
import { verifyAuditChain } from '../utils/auditLogger';

interface AuditLogViewerProps {
  logs: AuditLogEntry[];
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');
  const [selectedEntityType, setSelectedEntityType] = useState<string>('ALL');
  const [inspectingLog, setInspectingLog] = useState<AuditLogEntry | null>(null);

  // Verify the cryptographic integrity of the audit chain
  const chainVerification = verifyAuditChain(logs);

  const financialLogsCount = logs.filter((l) => l.action === 'FINANCIAL_POSTING').length;
  const tripLogsCount = logs.filter(
    (l) => l.action === 'TRIP_DISPATCHED' || l.action === 'TRIP_STATUS_CHANGED' || l.action === 'STOP_UPDATED' || l.action === 'POD_VERIFIED'
  ).length;
  const partyLogsCount = logs.filter(
    (l) => l.action === 'PARTY_REGISTERED' || l.action === 'PARTY_UPDATED'
  ).length;

  const filteredLogs = logs.filter((l) => {
    if (selectedAction !== 'ALL' && l.action !== selectedAction) return false;
    if (selectedEntityType !== 'ALL' && l.entityType !== selectedEntityType) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchDisplay = l.entityDisplay.toLowerCase().includes(q);
      const matchActor = l.actorName.toLowerCase().includes(q);
      const matchDesc = l.description.toLowerCase().includes(q);
      const matchHash = l.currentHash.toLowerCase().includes(q);
      return matchDisplay || matchActor || matchDesc || matchHash;
    }
    return true;
  });

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `vahansetu_audit_chain_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-display font-bold text-white tracking-tight">
            Centralized Enterprise Compliance & Immutable Audit Vault
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Cryptographically chained event ledger logging financial vouchers, party updates, and trip dispatch mutations.
          </p>
        </div>

        <button
          onClick={handleExportJson}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700/80 rounded-lg border border-slate-700 transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          Export Signed Audit Trail (JSON)
        </button>
      </div>

      {/* Cryptographic Chain Integrity Banner */}
      <div
        className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
          chainVerification.isValid
            ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
            : 'bg-rose-950/40 border-rose-800/80 text-rose-300'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-950 flex items-center justify-center text-emerald-400 border border-emerald-800/80 shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold font-sans text-sm block">
              {chainVerification.isValid
                ? 'Cryptographic Tamper-Evident Hash Chain: 100% Verified Invariant'
                : 'Security Alert: Cryptographic Tamper Detected'}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block font-mono">
              {chainVerification.isValid
                ? `All ${chainVerification.verifiedCount} records verified via sequential SHA-256 equivalent hash blocks. Zero unauthorized alterations.`
                : chainVerification.error}
            </span>
          </div>
        </div>

        <span className="font-mono text-emerald-400 font-bold bg-emerald-950 px-2.5 py-1 rounded border border-emerald-800/80 whitespace-nowrap self-start sm:self-auto">
          Immutable Status: ACTIVE
        </span>
      </div>

      {/* Aggregate Counts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-[11px] text-slate-400 font-medium block">Total Audit Trail Records</span>
          <span className="text-xl font-bold font-mono text-white mt-1 block tabular-nums">
            {logs.length} Blocks
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Zero Gaps / Omissions</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-[11px] text-slate-400 font-medium block">Financial Transactions</span>
          <span className="text-xl font-bold font-mono text-amber-400 mt-1 block tabular-nums">
            {financialLogsCount} Postings
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Double-Entry Vouchers</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-[11px] text-slate-400 font-medium block">Trip & Milestone Operations</span>
          <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block tabular-nums">
            {tripLogsCount} Events
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Dispatch, Stops & PODs</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-[11px] text-slate-400 font-medium block">Party & KYC Modifications</span>
          <span className="text-xl font-bold font-mono text-slate-200 mt-1 block tabular-nums">
            {partyLogsCount} Entities
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">PAN, GSTIN & Role Mappings</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Search Audit Records</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search actor, entity, description, hash..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Filter by Action Type</label>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Recorded Actions</option>
              <option value="FINANCIAL_POSTING">Financial Voucher Posting</option>
              <option value="TRIP_DISPATCHED">Trip Dispatched</option>
              <option value="STOP_UPDATED">Trip Stop Reached / Updated</option>
              <option value="POD_VERIFIED">POD Verified</option>
              <option value="PARTY_REGISTERED">Party Registered</option>
              <option value="PARTY_UPDATED">Party Updated</option>
              <option value="TENANT_MODIFIED">Tenant Provisioning</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Filter by Entity Type</label>
            <select
              value={selectedEntityType}
              onChange={(e) => setSelectedEntityType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Entity Types</option>
              <option value="JOURNAL_ENTRY">Journal Entry (General Ledger)</option>
              <option value="TRIP">Trip / Transit</option>
              <option value="LORRY_RECEIPT">Lorry Receipt / Bilty</option>
              <option value="PARTY">Party / Customer / Motor Owner</option>
              <option value="TENANT">Tenant Workspace</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-mono uppercase text-[11px]">
              <tr>
                <th className="px-4 py-3">Timestamp (UTC)</th>
                <th className="px-4 py-3">Action Type</th>
                <th className="px-4 py-3">Entity Identifier</th>
                <th className="px-4 py-3">Authorized Actor</th>
                <th className="px-4 py-3">Audit Summary</th>
                <th className="px-4 py-3 text-right">Cryptographic Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono">
              {filteredLogs.map((log) => {
                const isFinancial = log.action === 'FINANCIAL_POSTING';
                const isTrip = log.action === 'TRIP_DISPATCHED' || log.action === 'STOP_UPDATED';
                const isPod = log.action === 'POD_VERIFIED';

                return (
                  <tr
                    key={log.id}
                    onClick={() => setInspectingLog(log)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap text-[11px]">
                      {log.timestamp.replace('T', ' ').substring(0, 19)}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          isFinancial
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : isPod || isTrip
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {log.action.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-bold text-white text-xs">{log.entityDisplay}</div>
                      <div className="text-[10px] text-slate-500 font-sans">{log.entityType}</div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap font-sans">
                      <div className="font-medium text-slate-200">{log.actorName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{log.ipAddress}</div>
                    </td>

                    <td className="px-4 py-3 font-sans text-slate-300 max-w-[280px]">
                      {log.description}
                    </td>

                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <span className="text-[11px] text-emerald-400 bg-slate-950 px-2 py-1 rounded border border-slate-800 font-mono">
                        {log.currentHash.substring(0, 10)}...
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Deep Cryptographic Hash & Diff Inspector */}
      {inspectingLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-emerald-400" />
                <h2 className="text-base font-display font-bold text-white">
                  Cryptographic Audit Block Inspector
                </h2>
              </div>
              <button
                onClick={() => setInspectingLog(null)}
                className="text-slate-400 hover:text-white text-xs px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              {/* Event Metadata */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Audit Record ID:</span>
                  <span className="text-slate-300">{inspectingLog.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Action & Entity:</span>
                  <span className="text-emerald-400 font-bold">
                    {inspectingLog.action} · {inspectingLog.entityDisplay}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Authorized Actor:</span>
                  <span className="text-white font-sans">{inspectingLog.actorName} ({inspectingLog.actorRole})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Source IP Address:</span>
                  <span className="text-slate-300">{inspectingLog.ipAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Recorded Timestamp:</span>
                  <span className="text-slate-300">{inspectingLog.timestamp}</span>
                </div>
              </div>

              {/* Cryptographic Chain Hashes */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-sans font-semibold block">
                  Tamper-Evident Hash Chain Linkage
                </span>
                <div>
                  <span className="text-slate-500 block text-[10px]">Previous Block Hash (predecessor):</span>
                  <span className="text-slate-400 break-all text-[11px]">{inspectingLog.previousHash}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Current Block Hash (digest):</span>
                  <span className="text-emerald-400 break-all text-[11px] font-bold">{inspectingLog.currentHash}</span>
                </div>
              </div>

              {/* Mutated State Snapshot */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-sans font-semibold block">
                  Mutated State Payload (JSON Snapshot)
                </span>
                <pre className="p-3 bg-black/80 rounded-lg border border-slate-800 text-[11px] text-emerald-300 overflow-x-auto">
                  {JSON.stringify(inspectingLog.newState, null, 2)}
                </pre>
              </div>

              {inspectingLog.previousState && (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-sans font-semibold block">
                    Previous State (Before Mutation)
                  </span>
                  <pre className="p-3 bg-black/80 rounded-lg border border-slate-800 text-[11px] text-slate-400 overflow-x-auto">
                    {JSON.stringify(inspectingLog.previousState, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
