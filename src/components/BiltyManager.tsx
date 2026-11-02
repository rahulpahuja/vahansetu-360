/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * VahanSetu 360 — Lorry Receipt (LR / Bilty) Module & Printable Viewer
 */

import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Eye,
  Download,
  QrCode,
  ArrowRight,
} from 'lucide-react';
import { LorryReceipt, Party, Trip, Vehicle } from '../types/logistics';
import { formatPaiseToINR, inrToPaise } from '../utils/accountingEngine';

interface BiltyManagerProps {
  lorryReceipts: LorryReceipt[];
  parties: Party[];
  trips: Trip[];
  vehicles: Vehicle[];
  onAddLorryReceipt: (lr: LorryReceipt) => void;
  onUpdatePodStatus: (lrId: string, status: 'PENDING' | 'UPLOADED' | 'VERIFIED') => void;
  selectedTripIdFilter?: string;
}

export const BiltyManager: React.FC<BiltyManagerProps> = ({
  lorryReceipts,
  parties,
  trips,
  vehicles,
  onAddLorryReceipt,
  onUpdatePodStatus,
  selectedTripIdFilter,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewingLr, setViewingLr] = useState<LorryReceipt | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Bilty Form State
  const [selectedTripId, setSelectedTripId] = useState(trips[0]?.id || '');
  const [consignorId, setConsignorId] = useState(
    parties.find((p) => p.roles.includes('CONSIGNOR'))?.id || ''
  );
  const [consigneeId, setConsigneeId] = useState(
    parties.find((p) => p.roles.includes('CONSIGNEE'))?.id || ''
  );
  const [goodsDescription, setGoodsDescription] = useState('Consumer Packaged Goods');
  const [packageCount, setPackageCount] = useState(180);
  const [actualWeightKg, setActualWeightKg] = useState(3600);
  const [freightRupees, setFreightRupees] = useState(16000);
  const [advanceRupees, setAdvanceRupees] = useState(12000);
  const [paymentTerms, setPaymentTerms] = useState<'PAID' | 'TO_PAY' | 'TO_BE_BILLED'>('TO_BE_BILLED');

  const filteredLrs = lorryReceipts.filter((lr) => {
    if (selectedTripIdFilter && lr.tripId !== selectedTripIdFilter) return false;
    if (statusFilter !== 'ALL' && lr.deliveryStatus !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchNum = lr.lrNumber.toLowerCase().includes(q);
      const matchGoods = lr.goodsDescription.toLowerCase().includes(q);
      return matchNum || matchGoods;
    }
    return true;
  });

  const handleCreateLrSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const freightPaise = inrToPaise(freightRupees);
    const advancePaise = inrToPaise(advanceRupees);
    const balancePaise = freightPaise - advancePaise;

    const newLr: LorryReceipt = {
      id: `lr-${Date.now()}`,
      tenantId: 'tenant-1',
      tripId: selectedTripId,
      lrNumber: `LR-IND-2026-${Math.floor(100 + Math.random() * 900)}`,
      lrDate: new Date().toISOString().substring(0, 10),
      consignorPartyId: consignorId,
      consigneePartyId: consigneeId,
      billingPartyId: consignorId,
      goodsDescription,
      packageCount,
      packageType: 'CARTONS',
      actualWeightKg,
      chargeableWeightKg: actualWeightKg,
      freightPaise,
      loadingChargesPaise: 30000,
      unloadingChargesPaise: 0,
      statisticalChargesPaise: 5000,
      totalLrAmountPaise: freightPaise + 35000,
      advanceReceivedPaise: advancePaise,
      balanceReceivablePaise: balancePaise + 35000,
      paymentTerms,
      podStatus: 'PENDING',
      deliveryStatus: 'IN_TRANSIT',
    };

    onAddLorryReceipt(newLr);
    setShowCreateModal(false);
    setViewingLr(newLr);
  };

  const getParty = (id?: string) => parties.find((p) => p.id === id);
  const getTrip = (id: string) => trips.find((t) => t.id === id);
  const getVehicle = (vehId?: string) => vehicles.find((v) => v.id === vehId);

  return (
    <div className="space-y-6">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-display font-bold text-white tracking-tight">
            LR / Bilty Document Management
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Statutory Indian consignment notes, package weights, consignor-consignee records, and digital PODs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search LR# or goods..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-44 sm:w-56"
            />
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            + Issue Bilty
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs">
        <span className="text-slate-400 font-medium">Status Filter:</span>
        {['ALL', 'IN_TRANSIT', 'DELIVERED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-2.5 py-1 rounded transition-colors ${
              statusFilter === st
                ? 'bg-slate-800 text-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {st.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Lorry Receipts Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-mono uppercase text-[11px]">
              <tr>
                <th className="px-4 py-3">LR Number & Date</th>
                <th className="px-4 py-3">Consignor (Sender)</th>
                <th className="px-4 py-3">Consignee (Receiver)</th>
                <th className="px-4 py-3">Goods / Weight</th>
                <th className="px-4 py-3 text-right">Freight Amount</th>
                <th className="px-4 py-3 text-right">Advance / Balance</th>
                <th className="px-4 py-3 text-center">POD Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredLrs.map((lr) => {
                const consignor = getParty(lr.consignorPartyId);
                const consignee = getParty(lr.consigneePartyId);

                return (
                  <tr key={lr.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="font-mono font-bold text-white text-xs">
                        {lr.lrNumber}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                        Date: {lr.lrDate}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-medium text-slate-200 truncate max-w-[180px]">
                        {consignor?.legalName}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {consignor?.city} ({consignor?.stateCode})
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-medium text-slate-200 truncate max-w-[180px]">
                        {consignee?.legalName}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {consignee?.city} ({consignee?.stateCode})
                      </div>
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="text-slate-300 font-medium truncate max-w-[150px]">
                        {lr.goodsDescription}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {lr.packageCount} {lr.packageType} · {lr.actualWeightKg} kg
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-right font-mono tabular-nums whitespace-nowrap">
                      <div className="font-bold text-white">
                        {formatPaiseToINR(lr.totalLrAmountPaise)}
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase">
                        {lr.paymentTerms.replace(/_/g, ' ')}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-right font-mono tabular-nums whitespace-nowrap">
                      <div className="text-emerald-400">
                        Adv: {formatPaiseToINR(lr.advanceReceivedPaise)}
                      </div>
                      <div className="text-amber-400">
                        Due: {formatPaiseToINR(lr.balanceReceivablePaise)}
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                          lr.podStatus === 'VERIFIED'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : lr.podStatus === 'UPLOADED'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {lr.podStatus === 'VERIFIED' && <CheckCircle2 className="w-3 h-3" />}
                        {lr.podStatus}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-1.5">
                      <button
                        onClick={() => setViewingLr(lr)}
                        className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5 text-emerald-400" />
                        Print Bilty
                      </button>

                      {lr.podStatus !== 'VERIFIED' && (
                        <button
                          onClick={() =>
                            onUpdatePodStatus(
                              lr.id,
                              lr.podStatus === 'PENDING' ? 'UPLOADED' : 'VERIFIED'
                            )
                          }
                          className="px-2 py-1 text-[11px] font-medium text-emerald-400 hover:bg-emerald-950/40 rounded border border-emerald-800/40 transition-colors"
                        >
                          {lr.podStatus === 'PENDING' ? 'Upload POD' : 'Verify POD'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Printable Legal Indian Bilty Document View */}
      {viewingLr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white text-slate-950 rounded-xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-300 my-8">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <span className="text-xs font-mono font-bold text-slate-600 uppercase">
                Consignment Note (Lorry Receipt / Bilty)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / Save PDF
                </button>
                <button
                  onClick={() => setViewingLr(null)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  ✕ Close
                </button>
              </div>
            </div>

            {/* Bilty Document Sheet */}
            <div className="border-2 border-slate-900 p-5 space-y-4 text-xs font-sans">
              {/* Header section with Transporter details */}
              <div className="text-center pb-3 border-b-2 border-slate-900">
                <h2 className="text-xl font-bold tracking-tight text-slate-900 font-display">
                  SHREE GANESH TRANSLINES PVT. LTD.
                </h2>
                <p className="text-[11px] text-slate-700 font-medium">
                  Leading Fleet Operators, Bulk Road Transporters & Commission Agents
                </p>
                <p className="text-[10px] text-slate-600 mt-0.5">
                  Regd. Office: Scheme 78, Transport Nagar, Indore (M.P.) · Phone: +91 731 4059881 · GSTIN: 23AABCS1234F1Z8
                </p>
              </div>

              {/* LR Metadata Grid */}
              <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-300">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-slate-800">LR NUMBER:</span>
                    <span className="font-mono font-bold text-base text-red-700">
                      {viewingLr.lrNumber}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    <strong>Date:</strong> {viewingLr.lrDate}
                  </div>
                  <div className="text-[11px] text-slate-600">
                    <strong>Trip Ref:</strong> {getTrip(viewingLr.tripId)?.tripNumber}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-slate-800">
                    Vehicle No: <span className="font-mono font-bold text-slate-900">{getVehicle(getTrip(viewingLr.tripId)?.vehicleId)?.registrationNo || 'MP09SR4241'}</span>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    <strong>Driver:</strong> Mohan Singh Yadav (+91 98260 99881)
                  </div>
                  <div className="text-[11px] text-slate-600">
                    <strong>Payment Terms:</strong> {viewingLr.paymentTerms.replace(/_/g, ' ')}
                  </div>
                </div>
              </div>

              {/* Consignor & Consignee Columns */}
              <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-300">
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Consignor (From)
                  </span>
                  <div className="font-bold text-slate-900 text-xs">
                    {getParty(viewingLr.consignorPartyId)?.legalName}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    {getParty(viewingLr.consignorPartyId)?.billingAddress}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1 font-mono">
                    <strong>GSTIN:</strong> {getParty(viewingLr.consignorPartyId)?.gstin} · <strong>PAN:</strong> {getParty(viewingLr.consignorPartyId)?.pan}
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Consignee (To)
                  </span>
                  <div className="font-bold text-slate-900 text-xs">
                    {getParty(viewingLr.consigneePartyId)?.legalName}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    {getParty(viewingLr.consigneePartyId)?.billingAddress}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1 font-mono">
                    <strong>GSTIN:</strong> {getParty(viewingLr.consigneePartyId)?.gstin} · <strong>PAN:</strong> {getParty(viewingLr.consigneePartyId)?.pan}
                  </div>
                </div>
              </div>

              {/* Package Details & Weights Table */}
              <table className="w-full text-left border border-slate-300">
                <thead className="bg-slate-100 font-bold text-[11px] border-b border-slate-300">
                  <tr>
                    <th className="p-2 border-r border-slate-300">Packages</th>
                    <th className="p-2 border-r border-slate-300">Description of Goods</th>
                    <th className="p-2 border-r border-slate-300 text-right">Actual Wt (kg)</th>
                    <th className="p-2 border-r border-slate-300 text-right">Chargeable Wt (kg)</th>
                    <th className="p-2 text-right">Freight (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="p-2 border-r border-slate-300 font-mono">
                      {viewingLr.packageCount} {viewingLr.packageType}
                    </td>
                    <td className="p-2 border-r border-slate-300 font-medium">
                      {viewingLr.goodsDescription}
                    </td>
                    <td className="p-2 border-r border-slate-300 text-right font-mono">
                      {viewingLr.actualWeightKg}
                    </td>
                    <td className="p-2 border-r border-slate-300 text-right font-mono">
                      {viewingLr.chargeableWeightKg}
                    </td>
                    <td className="p-2 text-right font-mono font-bold">
                      {formatPaiseToINR(viewingLr.freightPaise)}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Charges Summary & Statutory Declaration */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="text-[10px] text-slate-500 space-y-1">
                  <p><strong>Conditions of Carriage:</strong></p>
                  <p>1. The goods booked under this LR are carried strictly at OWNER&apos;S RISK unless insured.</p>
                  <p>2. Transporter is not responsible for leakage, breakage, or climatic pilferage en-route.</p>
                  <p>3. Subject to Indore Jurisdiction exclusively.</p>
                  <div className="pt-2 flex items-center gap-2">
                    <QrCode className="w-10 h-10 text-slate-800" />
                    <span className="font-mono text-[9px] text-slate-600">
                      Digital Verification Token: {getTrip(viewingLr.tripId)?.trackingToken}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded border border-slate-300 space-y-1 text-xs font-mono">
                  <div className="flex justify-between">
                    <span>Base Freight:</span>
                    <span>{formatPaiseToINR(viewingLr.freightPaise)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Loading / Hamali Charges:</span>
                    <span>{formatPaiseToINR(viewingLr.loadingChargesPaise)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Statistical Charges:</span>
                    <span>{formatPaiseToINR(viewingLr.statisticalChargesPaise)}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-slate-300 pt-1 text-slate-900">
                    <span>Total LR Freight:</span>
                    <span>{formatPaiseToINR(viewingLr.totalLrAmountPaise)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700">
                    <span>Advance Received:</span>
                    <span>- {formatPaiseToINR(viewingLr.advanceReceivedPaise)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-red-700 border-t border-slate-300 pt-1">
                    <span>Balance Outstanding:</span>
                    <span>{formatPaiseToINR(viewingLr.balanceReceivablePaise)}</span>
                  </div>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-3 gap-4 pt-6 text-center text-[10px] text-slate-600 border-t border-slate-300">
                <div>
                  <div className="h-8 border-b border-slate-400"></div>
                  <span className="mt-1 block">Consignor&apos;s Signature</span>
                </div>
                <div>
                  <div className="h-8 border-b border-slate-400"></div>
                  <span className="mt-1 block">Driver&apos;s Signature</span>
                </div>
                <div>
                  <div className="h-8 border-b border-slate-400"></div>
                  <span className="mt-1 block font-bold text-slate-900">
                    For Shree Ganesh Translines Pvt Ltd
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Issue New Lorry Receipt Form */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-display font-bold text-white">
                Issue New Lorry Receipt (LR / Bilty)
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded hover:bg-slate-800"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleCreateLrSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Associated Trip Transit</label>
                <select
                  value={selectedTripId}
                  onChange={(e) => setSelectedTripId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  {trips.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.tripNumber} ({t.originCity} ➔ {t.destinationCity})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Consignor (Sender)</label>
                  <select
                    value={consignorId}
                    onChange={(e) => setConsignorId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    {parties.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.legalName} ({p.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Consignee (Receiver)</label>
                  <select
                    value={consigneeId}
                    onChange={(e) => setConsigneeId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    {parties.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.legalName} ({p.city})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Description of Goods</label>
                <input
                  type="text"
                  required
                  value={goodsDescription}
                  onChange={(e) => setGoodsDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Number of Packages (Cartons)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={packageCount}
                    onChange={(e) => setPackageCount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Actual Weight (kg)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={actualWeightKg}
                    onChange={(e) => setActualWeightKg(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Freight Amount (₹)</label>
                  <input
                    type="number"
                    required
                    min={100}
                    value={freightRupees}
                    onChange={(e) => setFreightRupees(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Advance Paid (₹)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={advanceRupees}
                    onChange={(e) => setAdvanceRupees(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Payment Terms</label>
                  <select
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="TO_BE_BILLED">To Be Billed</option>
                    <option value="PAID">Paid</option>
                    <option value="TO_PAY">To Pay</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
                >
                  Generate Bilty Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
