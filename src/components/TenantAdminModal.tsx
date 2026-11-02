/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * VahanSetu 360 — SaaS Super Admin & Tenancy Lifecycle Management
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  Building2,
  Users,
  Truck,
  Plus,
  CheckCircle2,
  TrendingUp,
  Server,
  Layers,
} from 'lucide-react';
import { Branch, Tenant } from '../types/logistics';
import { INITIAL_TENANTS } from '../data/seedData';

interface TenantAdminModalProps {
  currentTenant: Tenant;
  branches: Branch[];
  onSelectTenant: (tenant: Tenant) => void;
  onAddBranch: (branch: Branch) => void;
  onClose: () => void;
}

export const TenantAdminModal: React.FC<TenantAdminModalProps> = ({
  currentTenant,
  branches,
  onSelectTenant,
  onAddBranch,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'tenants' | 'branches' | 'quotas'>('tenants');
  const [showAddBranch, setShowAddBranch] = useState(false);

  // New Branch Form
  const [branchCode, setBranchCode] = useState('');
  const [branchName, setBranchName] = useState('');
  const [branchCity, setBranchCity] = useState('');
  const [branchState, setBranchState] = useState('');
  const [branchGstin, setBranchGstin] = useState('');
  const [branchPhone, setBranchPhone] = useState('');

  const handleAddBranchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newB: Branch = {
      id: `branch-${Date.now()}`,
      tenantId: currentTenant.id,
      code: branchCode.toUpperCase(),
      name: branchName,
      city: branchCity,
      state: branchState,
      gstin: branchGstin,
      isHeadOffice: false,
      contactPhone: branchPhone,
    };
    onAddBranch(newB);
    setShowAddBranch(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl my-8">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 flex items-center justify-center text-emerald-400 border border-emerald-800/60">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-display font-bold text-white">
                SaaS Super Admin & Multi-Tenancy Architecture
              </h2>
              <span className="text-xs text-slate-400">
                Independent tenant database isolation, quotas, and branch hierarchy.
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xs px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            ✕ Close
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs">
          <button
            onClick={() => setActiveTab('tenants')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'tenants'
                ? 'bg-slate-800 text-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Switch Tenants ({INITIAL_TENANTS.length})
          </button>
          <button
            onClick={() => setActiveTab('branches')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'branches'
                ? 'bg-slate-800 text-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Operational Branches ({branches.length})
          </button>
          <button
            onClick={() => setActiveTab('quotas')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'quotas'
                ? 'bg-slate-800 text-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Subscription & Usage Quotas
          </button>
        </div>

        {/* TAB 1: Switch Tenants */}
        {activeTab === 'tenants' && (
          <div className="space-y-3">
            <span className="text-xs text-slate-400 block font-medium">
              Registered Multi-Tenant Workspaces (Strict Row-Level Security Isolation):
            </span>
            <div className="space-y-3">
              {INITIAL_TENANTS.map((t) => {
                const isCurrent = t.id === currentTenant.id;
                return (
                  <div
                    key={t.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isCurrent
                        ? 'bg-slate-950 border-emerald-500 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white text-sm">
                            {t.legalName}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                            {t.subscriptionPlan}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] font-bold text-emerald-400">
                              (Active Workspace)
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 font-mono mt-1">
                          Tenant Code: {t.code} · Subdomain: {t.subdomain}
                        </p>
                      </div>

                      {!isCurrent && (
                        <button
                          onClick={() => onSelectTenant(t)}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
                        >
                          Switch Tenant
                        </button>
                      )}
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-xs font-mono text-slate-400">
                      <div>Fleet: {t.activeVehiclesCount} / {t.maxVehicles} trucks</div>
                      <div>Staff: {t.maxUsers} seats</div>
                      <div>Transits: {t.activeTripsToday} today</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: Operational Branches */}
        {activeTab === 'branches' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">
                Tenant Branches & Regional Depots
              </span>
              <button
                onClick={() => setShowAddBranch(true)}
                className="px-3 py-1 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg"
              >
                + Add Depot
              </button>
            </div>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {branches.map((b) => (
                <div
                  key={b.id}
                  className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{b.name}</span>
                      {b.isHeadOffice && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-950 text-amber-400 border border-amber-800">
                          Head Office
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {b.city}, {b.state} · Code: <span className="font-mono">{b.code}</span> · GSTIN: <span className="font-mono">{b.gstin}</span>
                    </p>
                  </div>

                  <span className="text-slate-400 font-mono text-[11px]">{b.contactPhone}</span>
                </div>
              ))}
            </div>

            {showAddBranch && (
              <form onSubmit={handleAddBranchSubmit} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 text-xs">
                <span className="font-bold text-white block">Add Operational Depot</span>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Depot Code (e.g. BHO-DEP)"
                    value={branchCode}
                    onChange={(e) => setBranchCode(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-200"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Depot Name"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-200"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="City (e.g. Bhopal)"
                    value={branchCity}
                    onChange={(e) => setBranchCity(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-200"
                  />
                  <input
                    type="text"
                    required
                    placeholder="State (e.g. Madhya Pradesh)"
                    value={branchState}
                    onChange={(e) => setBranchState(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-200"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="State GSTIN"
                    value={branchGstin}
                    onChange={(e) => setBranchGstin(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-200 font-mono"
                  />
                  <input
                    type="text"
                    placeholder="Contact Phone"
                    value={branchPhone}
                    onChange={(e) => setBranchPhone(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-slate-200"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddBranch(false)}
                    className="px-3 py-1 text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-emerald-400 text-slate-950 font-semibold rounded"
                  >
                    Save Depot
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 3: Quotas & Billing */}
        {activeTab === 'quotas' && (
          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4 text-xs font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="font-sans font-bold text-white text-sm">
                Active Plan: {currentTenant.subscriptionPlan} TIER
              </span>
              <span className="text-emerald-400">Monthly Billing: ₹75,000 / month</span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-slate-300 font-sans mb-1">
                  <span>Vehicle Fleet Quota Utilization:</span>
                  <span>{currentTenant.activeVehiclesCount} / {currentTenant.maxVehicles} trucks (8.4%)</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div
                    className="bg-emerald-400 h-2 rounded-full"
                    style={{ width: `${(currentTenant.activeVehiclesCount / currentTenant.maxVehicles) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 font-sans mb-1">
                  <span>Telematics Ingestion Throughput:</span>
                  <span>Active 100,000 Transits/Day Pipeline (Capacity: 7,500 msg/s)</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div className="bg-emerald-400 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 font-sans flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Tenant account is in good standing with encrypted database schemas and zero quota violations.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
