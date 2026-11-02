/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * VahanSetu 360 — Header Navigation (Strict 3-Zone Contract)
 */

import React from 'react';
import {
  Truck,
  PlusCircle,
  Building2,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { Branch, Tenant } from '../types/logistics';

export type ActiveTab =
  | 'overview'
  | 'dispatch'
  | 'bilty'
  | 'accounting'
  | 'telematics'
  | 'parties'
  | 'fleet'
  | 'marketplace'
  | 'audit';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  activeTenant: Tenant;
  branches: Branch[];
  activeBranchId: string;
  onBranchChange: (branchId: string) => void;
  onOpenNewTripModal: () => void;
  onOpenTenantModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  activeTenant,
  branches,
  activeBranchId,
  onBranchChange,
  onOpenNewTripModal,
  onOpenTenantModal,
}) => {
  const currentBranch = branches.find((b) => b.id === activeBranchId) || branches[0];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-[1520px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Display Font, Zero-Pill) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onTabChange('overview')}
            className="flex items-center gap-2.5 text-left group focus-visible:outline-none"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-slate-950 font-bold shadow-sm group-hover:bg-emerald-500 transition-colors">
              <Truck className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <span className="font-display font-bold text-lg tracking-tight text-white flex items-center gap-1.5 whitespace-nowrap">
                VahanSetu <span className="text-emerald-400 font-extrabold">360</span>
              </span>
              <p className="text-[10px] text-slate-400 tracking-wider uppercase font-medium whitespace-nowrap">
                {activeTenant.legalName.length > 24
                  ? activeTenant.legalName.substring(0, 24) + '...'
                  : activeTenant.legalName}
              </p>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Views (Single-line, Whitespace-Nowrap) */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 text-xs xl:text-sm font-medium">
          <button
            onClick={() => onTabChange('overview')}
            className={`px-2.5 py-1.5 rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'overview'
                ? 'bg-slate-800 text-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onTabChange('dispatch')}
            className={`px-2.5 py-1.5 rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'dispatch'
                ? 'bg-slate-800 text-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Dispatch
          </button>
          <button
            onClick={() => onTabChange('bilty')}
            className={`px-2.5 py-1.5 rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'bilty'
                ? 'bg-slate-800 text-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Bilty / LR
          </button>
          <button
            onClick={() => onTabChange('accounting')}
            className={`px-2.5 py-1.5 rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'accounting'
                ? 'bg-slate-800 text-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Ledger
          </button>
          <button
            onClick={() => onTabChange('telematics')}
            className={`px-2.5 py-1.5 rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'telematics'
                ? 'bg-slate-800 text-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Telematics
          </button>
          <button
            onClick={() => onTabChange('parties')}
            className={`px-2.5 py-1.5 rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'parties'
                ? 'bg-slate-800 text-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Parties
          </button>
          <button
            onClick={() => onTabChange('fleet')}
            className={`px-2.5 py-1.5 rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'fleet'
                ? 'bg-slate-800 text-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Fleet
          </button>
          <button
            onClick={() => onTabChange('marketplace')}
            className={`px-2.5 py-1.5 rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'marketplace'
                ? 'bg-slate-800 text-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Marketplace
          </button>
          <button
            onClick={() => onTabChange('audit')}
            className={`px-2.5 py-1.5 rounded-md whitespace-nowrap transition-colors ${
              activeTab === 'audit'
                ? 'bg-slate-800 text-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Audit Vault
          </button>
        </nav>

        {/* Zone 3: Branch Selector, Actions & Tenant Info */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Branch Switcher */}
          <div className="relative hidden sm:block">
            <select
              value={activeBranchId}
              onChange={(e) => onBranchChange(e.target.value)}
              className="appearance-none bg-slate-800/90 hover:bg-slate-800 text-slate-200 text-xs font-medium pl-8 pr-8 py-2 rounded-lg border border-slate-700/80 focus:border-emerald-500 focus:outline-none transition-colors cursor-pointer"
            >
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id} className="bg-slate-900 text-slate-200">
                  {branch.name}
                </option>
              ))}
            </select>
            <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Super Admin / Tenant Config Trigger */}
          <button
            onClick={onOpenTenantModal}
            title="Tenant Lifecycle & Quota Manager"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700/80 rounded-lg border border-slate-700 transition-colors whitespace-nowrap"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Tenant: {activeTenant.code}</span>
          </button>

          {/* Primary Action Button: Dispatch New Trip */}
          <button
            onClick={onOpenNewTripModal}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0"
          >
            <PlusCircle className="w-4 h-4 text-slate-950" />
            <span>+ Dispatch Trip</span>
          </button>
        </div>
      </div>
    </header>
  );
};
