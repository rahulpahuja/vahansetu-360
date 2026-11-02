/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * VahanSetu 360 — Dispatch & Trip Management Module
 */

import React, { useState } from 'react';
import {
  MapPin,
  Plus,
  Truck,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  ArrowRight,
} from 'lucide-react';
import {
  Driver,
  LorryReceipt,
  Party,
  Trip,
  TripStatus,
  TripStop,
  Vehicle,
} from '../types/logistics';
import { formatPaiseToINR, inrToPaise } from '../utils/accountingEngine';

interface DispatchManagementProps {
  trips: Trip[];
  vehicles: Vehicle[];
  drivers: Driver[];
  parties: Party[];
  lorryReceipts: LorryReceipt[];
  onAddTrip: (newTrip: Trip) => void;
  onUpdateTripStopStatus: (
    tripId: string,
    stopId: string,
    status: 'PENDING' | 'REACHED' | 'COMPLETED'
  ) => void;
  onOpenTrackingModal: (token: string) => void;
  onNavigateToBilty: (tripId: string) => void;
}

export const DispatchManagement: React.FC<DispatchManagementProps> = ({
  trips,
  vehicles,
  drivers,
  parties,
  lorryReceipts,
  onAddTrip,
  onUpdateTripStopStatus,
  onOpenTrackingModal,
  onNavigateToBilty,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedTripId, setSelectedTripId] = useState<string>(trips[0]?.id || '');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  // New Trip Form State
  const [newOrigin, setNewOrigin] = useState('Indore (MP)');
  const [newDestination, setNewDestination] = useState('Mumbai (MH)');
  const [newVehicleId, setNewVehicleId] = useState(vehicles[0]?.id || '');
  const [newDriverId, setNewDriverId] = useState(drivers[0]?.id || '');
  const [newBrokerId, setNewBrokerId] = useState(
    parties.find((p) => p.roles.includes('BROKER'))?.id || ''
  );
  const [newOwnerId, setNewOwnerId] = useState(
    parties.find((p) => p.roles.includes('MOTOR_OWNER'))?.id || ''
  );
  const [newFreightRupees, setNewFreightRupees] = useState(48000);
  const [newAdvanceRupees, setNewAdvanceRupees] = useState(20000);
  const [newBrokerageRupees, setNewBrokerageRupees] = useState(1500);

  const selectedTrip = trips.find((t) => t.id === selectedTripId) || trips[0];
  const selectedVehicle = vehicles.find((v) => v.id === selectedTrip?.vehicleId);
  const selectedDriver = drivers.find((d) => d.id === selectedTrip?.driverId);
  const selectedBroker = parties.find((p) => p.id === selectedTrip?.primaryBrokerPartyId);
  const selectedOwner = parties.find((p) => p.id === selectedTrip?.vehicleOwnerPartyId);

  const filteredTrips = trips.filter((t) => {
    if (filterStatus === 'ALL') return true;
    return t.status === filterStatus;
  });

  const handleCreateTripSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const freightPaise = inrToPaise(newFreightRupees);
    const advancePaise = inrToPaise(newAdvanceRupees);
    const balancePaise = freightPaise - advancePaise;
    const brokeragePaise = inrToPaise(newBrokerageRupees);

    const tripNum = `TRP-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const token = `trk_${tripNum.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

    const newTrip: Trip = {
      id: `trip-${Date.now()}`,
      tenantId: 'tenant-1',
      branchId: 'branch-1',
      tripNumber: tripNum,
      vehicleId: newVehicleId,
      driverId: newDriverId,
      primaryBrokerPartyId: newBrokerId,
      vehicleOwnerPartyId: newOwnerId,
      originCity: newOrigin,
      destinationCity: newDestination,
      scheduledDeparture: new Date().toISOString().replace('T', ' ').substring(0, 16),
      totalAgreedFreightPaise: freightPaise,
      advancePayableToOwnerPaise: advancePaise,
      balancePayableToOwnerPaise: balancePaise,
      brokerCommissionPaise: brokeragePaise,
      status: 'PLANNED',
      fastagTollDeductionPaise: 0,
      dieselExpensePaise: 0,
      trackingToken: token,
      stops: [
        {
          id: `stop-${Date.now()}-1`,
          stopSequence: 1,
          stopName: `${newOrigin} Hub Loading`,
          locationName: `${newOrigin} Transport Depot`,
          city: newOrigin,
          stopType: 'LOADING',
          scheduledEta: 'Today 10:00 AM',
          status: 'PENDING',
          packagesCount: 450,
        },
        {
          id: `stop-${Date.now()}-2`,
          stopSequence: 2,
          stopName: `${newDestination} Unloading`,
          locationName: `${newDestination} Wholesale Terminal`,
          city: newDestination,
          stopType: 'UNLOADING',
          scheduledEta: 'Tomorrow 04:00 PM',
          status: 'PENDING',
          packagesCount: 450,
        },
      ],
      notes: `Arranged through ${parties.find((p) => p.id === newBrokerId)?.legalName}.`,
    };

    onAddTrip(newTrip);
    setSelectedTripId(newTrip.id);
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-display font-bold text-white tracking-tight">
            Trip Dispatch & Consignment Management
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Broker-centric trip lifecycle, multi-stop drop points, vehicle allocation, and freight agreements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
            {['ALL', 'IN_TRANSIT', 'PLANNED', 'COMPLETED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                  filterStatus === st
                    ? 'bg-slate-800 text-emerald-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            + New Trip
          </button>
        </div>
      </div>

      {/* Main Split View: Left List, Right Active Trip Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Trips List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium px-1">
            <span>Trips ({filteredTrips.length})</span>
            <span>Sorted by Latest</span>
          </div>

          <div className="space-y-2.5 max-h-[720px] overflow-y-auto pr-1">
            {filteredTrips.map((trip) => {
              const veh = vehicles.find((v) => v.id === trip.vehicleId);
              const isSelected = trip.id === selectedTrip?.id;

              return (
                <div
                  key={trip.id}
                  onClick={() => setSelectedTripId(trip.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-900 border-emerald-500/80 shadow-md ring-1 ring-emerald-500/20'
                      : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-bold text-white">
                      {trip.tripNumber}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        trip.status === 'IN_TRANSIT'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {trip.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-200">
                    <span>{trip.originCity}</span>
                    <ArrowRight className="w-3 h-3 text-slate-500" />
                    <span>{trip.destinationCity}</span>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-400">
                      {veh?.registrationNo || 'No Vehicle'}
                    </span>
                    <span className="font-mono font-bold text-emerald-400">
                      {formatPaiseToINR(trip.totalAgreedFreightPaise)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Trip Deep Inspector (8 cols) */}
        {selectedTrip && (
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm space-y-6 p-5">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-display font-bold text-white">
                    {selectedTrip.tripNumber}
                  </h2>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                    {selectedTrip.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Route: <strong className="text-slate-200">{selectedTrip.originCity} ➔ {selectedTrip.destinationCity}</strong> · Departure: {selectedTrip.scheduledDeparture}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenTrackingModal(selectedTrip.trackingToken)}
                  className="px-3 py-1.5 text-xs font-medium text-emerald-300 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                  Public Tracking URL
                </button>
                <button
                  onClick={() => onNavigateToBilty(selectedTrip.id)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  View Issued LRs
                </button>
              </div>
            </div>

            {/* Entity Roles Matrix for this Trip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400 block font-medium">Arranging Broker</span>
                <span className="font-semibold text-slate-200 block mt-0.5">
                  {selectedBroker?.legalName || 'Direct Booking'}
                </span>
                <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                  Commission: {formatPaiseToINR(selectedTrip.brokerCommissionPaise)}
                </span>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400 block font-medium">Vehicle Owner (Motor Owner)</span>
                <span className="font-semibold text-slate-200 block mt-0.5">
                  {selectedOwner?.legalName || 'Self-Owned'}
                </span>
                <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                  Agreed Hire: {formatPaiseToINR(selectedTrip.totalAgreedFreightPaise - 800000)}
                </span>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400 block font-medium">Assigned Vehicle & Driver</span>
                <span className="font-semibold text-emerald-400 font-mono block mt-0.5">
                  {selectedVehicle?.registrationNo} ({selectedVehicle?.capacityMt} MT)
                </span>
                <span className="text-[11px] text-slate-300 block mt-0.5">
                  Driver: {selectedDriver?.fullName}
                </span>
              </div>
            </div>

            {/* Multi-Stop Delivery Progression */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Intermediate Stops & Consignment Drop Points
                </h3>
                <span className="text-xs text-slate-400">
                  Click status button to update en-route milestones
                </span>
              </div>

              <div className="space-y-2.5">
                {selectedTrip.stops.map((stop, idx) => (
                  <div
                    key={stop.id}
                    className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[11px] font-mono font-bold text-slate-300 shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-white">
                            {stop.stopName}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {stop.stopType}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {stop.locationName} · {stop.city}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5 text-[11px] font-mono text-slate-400">
                          <span>Scheduled: {stop.scheduledEta}</span>
                          {stop.actualArrival && (
                            <span className="text-emerald-400">Arrival: {stop.actualArrival}</span>
                          )}
                          {stop.packagesCount && (
                            <span className="text-slate-300">{stop.packagesCount} Cartons</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Interactive Stop Status Toggles */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => onUpdateTripStopStatus(selectedTrip.id, stop.id, 'PENDING')}
                        className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
                          stop.status === 'PENDING'
                            ? 'bg-slate-800 text-slate-200 border border-slate-600'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        Pending
                      </button>
                      <button
                        onClick={() => onUpdateTripStopStatus(selectedTrip.id, stop.id, 'REACHED')}
                        className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
                          stop.status === 'REACHED'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'text-slate-500 hover:text-amber-400'
                        }`}
                      >
                        Reached
                      </button>
                      <button
                        onClick={() => onUpdateTripStopStatus(selectedTrip.id, stop.id, 'COMPLETED')}
                        className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors flex items-center gap-1 ${
                          stop.status === 'COMPLETED'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'text-slate-500 hover:text-emerald-400'
                        }`}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        Completed
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Ledger Balance for this Trip */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Financial Agreement & Double-Entry Settlement
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block">Total Agreed Freight</span>
                  <span className="text-sm font-mono font-bold text-white tabular-nums">
                    {formatPaiseToINR(selectedTrip.totalAgreedFreightPaise)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Advance to Truck Owner</span>
                  <span className="text-sm font-mono font-bold text-emerald-400 tabular-nums">
                    {formatPaiseToINR(selectedTrip.advancePayableToOwnerPaise)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Balance to Truck Owner</span>
                  <span className="text-sm font-mono font-bold text-amber-400 tabular-nums">
                    {formatPaiseToINR(selectedTrip.balancePayableToOwnerPaise)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Broker Commission</span>
                  <span className="text-sm font-mono font-bold text-slate-200 tabular-nums">
                    {formatPaiseToINR(selectedTrip.brokerCommissionPaise)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Create & Dispatch New Trip */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-display font-bold text-white">
                Dispatch New Road Freight Transit
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded hover:bg-slate-800"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleCreateTripSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Origin City</label>
                  <input
                    type="text"
                    required
                    value={newOrigin}
                    onChange={(e) => setNewOrigin(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Destination City</label>
                  <input
                    type="text"
                    required
                    value={newDestination}
                    onChange={(e) => setNewDestination(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Assigned Vehicle</label>
                  <select
                    value={newVehicleId}
                    onChange={(e) => setNewVehicleId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.registrationNo} ({v.capacityMt} MT · {v.category})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Assigned Driver</label>
                  <select
                    value={newDriverId}
                    onChange={(e) => setNewDriverId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.fullName} ({d.phone})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Arranging Broker</label>
                  <select
                    value={newBrokerId}
                    onChange={(e) => setNewBrokerId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    {parties.filter((p) => p.roles.includes('BROKER')).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.legalName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Vehicle Owner (Motor Owner)</label>
                  <select
                    value={newOwnerId}
                    onChange={(e) => setNewOwnerId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    {parties.filter((p) => p.roles.includes('MOTOR_OWNER')).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.legalName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Agreed Freight (₹)</label>
                  <input
                    type="number"
                    required
                    min={1000}
                    value={newFreightRupees}
                    onChange={(e) => setNewFreightRupees(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Owner Advance (₹)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newAdvanceRupees}
                    onChange={(e) => setNewAdvanceRupees(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Broker Commission (₹)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newBrokerageRupees}
                    onChange={(e) => setNewBrokerageRupees(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                  />
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
                  Confirm & Dispatch Trip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
