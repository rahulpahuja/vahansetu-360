/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * VahanSetu 360 — Party Management Module (Non-Exclusive Multi-Role Entity Model)
 */

import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Building,
  CreditCard,
  ShieldCheck,
  Eye,
  Award,
  Calendar,
} from 'lucide-react';
import { Party, PartyRoleType } from '../types/logistics';
import { formatPaiseToINR, inrToPaise } from '../utils/accountingEngine';
import { calculatePartyVintage } from '../utils/vintageEngine';
import { evaluatePartyTrustScore } from '../utils/trustScoreEngine';
import { TrustScoreModal } from './TrustScoreModal';

interface PartyManagerProps {
  parties: Party[];
  onAddParty: (party: Party) => void;
  onSelectPartyForLedger: (partyId: string) => void;
}

export const PartyManager: React.FC<PartyManagerProps> = ({
  parties,
  onAddParty,
  onSelectPartyForLedger,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPartyForTrustScore, setSelectedPartyForTrustScore] = useState<Party | null>(null);

  // New Party Form
  const [legalName, setLegalName] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [pan, setPan] = useState('');
  const [gstin, setGstin] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<PartyRoleType[]>(['BROKER']);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [city, setCity] = useState('Indore');
  const [state, setState] = useState('Madhya Pradesh');
  const [stateCode, setStateCode] = useState('23');
  const [creditLimitRupees, setCreditLimitRupees] = useState(200000);
  const [tdsExemption, setTdsExemption] = useState(false);

  const ALL_ROLES: PartyRoleType[] = [
    'CONSIGNOR',
    'CONSIGNEE',
    'BROKER',
    'MOTOR_OWNER',
    'TRANSPORTER',
    'SUB_BROKER',
  ];

  const handleRoleToggle = (role: PartyRoleType) => {
    if (selectedRoles.includes(role)) {
      if (selectedRoles.length > 1) {
        setSelectedRoles(selectedRoles.filter((r) => r !== role));
      }
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const handleAddPartySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newParty: Party = {
      id: `party-${Date.now()}`,
      tenantId: 'tenant-1',
      legalName,
      tradeName: tradeName || legalName,
      pan: pan.toUpperCase(),
      gstin: gstin ? gstin.toUpperCase() : undefined,
      roles: selectedRoles,
      tdsExemptionDeclared: tdsExemption,
      creditLimitPaise: inrToPaise(creditLimitRupees),
      paymentTermsDays: 15,
      primaryContactName: contactName,
      primaryContactPhone: contactPhone,
      primaryContactEmail: `${contactName.toLowerCase().replace(/\s+/g, '')}@transact.in`,
      billingAddress: `${city} Transport Area`,
      city,
      state,
      stateCode,
      verificationStatus: 'VERIFIED',
      createdAt: new Date().toISOString().substring(0, 10),
    };

    onAddParty(newParty);
    setShowAddModal(false);
  };

  const filteredParties = parties.filter((p) => {
    if (roleFilter !== 'ALL' && !p.roles.includes(roleFilter as PartyRoleType)) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = p.legalName.toLowerCase().includes(q);
      const matchPan = p.pan.toLowerCase().includes(q);
      const matchCity = p.city.toLowerCase().includes(q);
      return matchName || matchPan || matchCity;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-display font-bold text-white tracking-tight">
            Party & Business Entity Management
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Non-exclusive multi-role entities (Brokers who own fleet, Shippers who broker, Motor Owners).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, PAN, city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-44 sm:w-56"
            />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            + Register Party
          </button>
        </div>
      </div>

      {/* Role Filter Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2 text-xs overflow-x-auto">
        <span className="text-slate-400 font-medium">Filter by Role:</span>
        {['ALL', ...ALL_ROLES].map((role) => (
          <button
            key={role}
            onClick={() => setRoleFilter(role)}
            className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
              roleFilter === role
                ? 'bg-slate-800 text-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {role.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Parties Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-mono uppercase text-[11px]">
              <tr>
                <th className="px-4 py-3">Legal & Trade Entity</th>
                <th className="px-4 py-3">Trust Score & Vintage</th>
                <th className="px-4 py-3">Assigned Business Roles</th>
                <th className="px-4 py-3">PAN & GSTIN</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Credit Limit</th>
                <th className="px-4 py-3 text-center">TDS 194C</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredParties.map((party) => {
                const vintage = calculatePartyVintage(party.establishmentDate);
                const trust = party.trustScore || evaluatePartyTrustScore(party);

                return (
                  <tr key={party.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-white text-xs">{party.legalName}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Contact: {party.primaryContactName} ({party.primaryContactPhone})
                      </div>
                      {/* Brokerage & Motor Malik specifics */}
                      {party.brokerageCommissionPct && (
                        <div className="text-[10px] font-mono text-amber-400 mt-0.5">
                          Broker Commission: {party.brokerageCommissionPct}% · License: {party.tradeLicenseNo || 'Active'}
                        </div>
                      )}
                      {party.roles.includes('MOTOR_OWNER') && (
                        <div className="text-[10px] font-mono text-emerald-400 mt-0.5">
                          Fleet: {party.ownedFleetCount || 4} Trucks · Beneficiary: {party.motorMalikBankBeneficiary || party.primaryContactName}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedPartyForTrustScore({ ...party, trustScore: trust })}
                        className={`px-2 py-1 rounded text-xs font-mono font-bold border flex items-center gap-1.5 transition-colors ${
                          trust.grade === 'AAA'
                            ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20'
                            : trust.grade === 'AA'
                            ? 'text-teal-400 bg-teal-500/10 border-teal-500/30 hover:bg-teal-500/20'
                            : trust.grade === 'A'
                            ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30 hover:bg-cyan-500/20'
                            : 'text-amber-400 bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20'
                        }`}
                        title="Click to inspect algorithmic Trust Score breakdown"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {trust.overallScore} · {trust.grade}
                      </button>
                      <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {vintage.formattedVintage}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {party.roles.map((r) => (
                          <span
                            key={r}
                            className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700"
                          >
                            {r.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap font-mono">
                      <div className="text-slate-200 font-bold">{party.pan}</div>
                      <div className="text-[11px] text-slate-400">
                        {party.gstin || 'Unregistered'}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="text-slate-200 font-medium">{party.city}</div>
                      <div className="text-[11px] text-slate-400">
                        {party.state} (Code: {party.stateCode})
                      </div>
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap font-mono tabular-nums">
                      <span className="text-white font-medium">
                        {formatPaiseToINR(party.creditLimitPaise)}
                      </span>
                      <div className="text-[10px] text-slate-400">
                        {party.paymentTermsDays} days credit
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      {party.tdsExemptionDeclared ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          194C Declared
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-mono">Standard TDS</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedPartyForTrustScore({ ...party, trustScore: trust })}
                          className="px-2 py-1 text-xs font-medium text-emerald-400 hover:text-emerald-300 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors inline-flex items-center gap-1"
                        >
                          <Award className="w-3 h-3" />
                          Trust Score
                        </button>
                        <button
                          onClick={() => onSelectPartyForLedger(party.id)}
                          className="px-2 py-1 text-xs font-medium text-amber-400 hover:text-amber-300 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          Ledger
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Register New Party with Multiple Roles */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-display font-bold text-white">
                Register New Business Party Entity
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded hover:bg-slate-800"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleAddPartySubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Legal Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Agarwal Road Transport"
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Trade Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Agarwal Freight"
                    value={tradeName}
                    onChange={(e) => setTradeName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Multi-Role Selector */}
              <div>
                <label className="block text-slate-400 mb-1.5 font-medium">
                  Operational Business Roles (Select Multiple as Applicable):
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {ALL_ROLES.map((r) => {
                    const isChecked = selectedRoles.includes(r);
                    return (
                      <button
                        type="button"
                        key={r}
                        onClick={() => handleRoleToggle(r)}
                        className={`p-2 rounded-lg border text-left text-xs transition-colors ${
                          isChecked
                            ? 'bg-emerald-950 border-emerald-800 text-emerald-300 font-semibold'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {isChecked ? '✓ ' : '+ '}
                        {r.replace('_', ' ')}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">PAN (10 Chars)</label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    placeholder="e.g. AABCI1234F"
                    value={pan}
                    onChange={(e) => setPan(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono uppercase focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">GSTIN (15 Chars)</label>
                  <input
                    type="text"
                    maxLength={15}
                    placeholder="e.g. 23AABCI1234F1ZK"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono uppercase focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">State</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">State Code</label>
                  <input
                    type="text"
                    required
                    maxLength={2}
                    value={stateCode}
                    onChange={(e) => setStateCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Primary Contact Person</label>
                  <input
                    type="text"
                    required
                    placeholder="Name"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Contact Phone</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98260 00000"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* TDS Exemption Checkbox */}
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="tdsExempt"
                  checked={tdsExemption}
                  onChange={(e) => setTdsExemption(e.target.checked)}
                  className="rounded accent-emerald-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="tdsExempt" className="cursor-pointer text-slate-300">
                  <span className="font-semibold text-white block">TDS Section 194C Exemption Declared</span>
                  <span className="text-[11px] text-slate-400">
                    Entity owns 10 or fewer commercial vehicles and submitted statutory declaration.
                  </span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
                >
                  Save Party Entity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Trust Score & Financial Reliability Modal */}
      <TrustScoreModal
        party={selectedPartyForTrustScore}
        onClose={() => setSelectedPartyForTrustScore(null)}
      />
    </div>
  );
};
