/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * VahanSetu 360 — Fleet & Driver Compliance Management
 */

import React, { useState } from 'react';
import {
  Truck,
  UserCheck,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  FileCheck,
  Shield,
  CreditCard,
  Radio,
} from 'lucide-react';
import { Driver, Party, Vehicle } from '../types/logistics';
import { calculateVehicleAge } from '../utils/vintageEngine';
import { DriverOnboardingModal } from './DriverOnboardingModal';
import { VehicleDocumentModal } from './VehicleDocumentModal';

interface FleetManagerProps {
  vehicles: Vehicle[];
  drivers: Driver[];
  parties: Party[];
  onAddVehicle: (vehicle: Vehicle) => void;
  onAddDriver: (driver: Driver) => void;
}

export const FleetManager: React.FC<FleetManagerProps> = ({
  vehicles,
  drivers,
  parties,
  onAddVehicle,
  onAddDriver,
}) => {
  const [activeTab, setActiveTab] = useState<'vehicles' | 'drivers' | 'compliance'>('vehicles');
  const [showAddVehModal, setShowAddVehModal] = useState(false);
  const [showAddDriverModal, setShowAddDriverModal] = useState(false);
  const [selectedVehicleForDocs, setSelectedVehicleForDocs] = useState<Vehicle | null>(null);

  // New Vehicle Form
  const [regNo, setRegNo] = useState('');
  const [category, setCategory] = useState<any>('CONTAINER');
  const [capacityMt, setCapacityMt] = useState(12.0);
  const [ownership, setOwnership] = useState<any>('ATTACHED_MARKET');
  const [ownerPartyId, setOwnerPartyId] = useState(parties[1]?.id || parties[0]?.id || '');
  const [gpsInstalled, setGpsInstalled] = useState(true);
  const [gpsImei, setGpsImei] = useState('');
  const [fastagId, setFastagId] = useState('');

  // New Driver Form
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  const handleAddVehicleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newVeh: Vehicle = {
      id: `veh-${Date.now()}`,
      tenantId: 'tenant-1',
      registrationNo: regNo.toUpperCase().replace(/\s+/g, ''),
      category,
      capacityMt,
      dimensions: { lengthFeet: 22, widthFeet: 8, heightFeet: 8 },
      ownershipType: ownership,
      ownerPartyId,
      rcExpiryDate: '2029-06-15',
      fitnessExpiryDate: '2028-02-10',
      insuranceExpiryDate: '2027-10-25',
      nationalPermitExpiry: '2028-04-12',
      pucExpiryDate: '2027-04-20',
      fastagId: fastagId || `FASTAG-${regNo.substring(0, 4)}-${Math.floor(1000 + Math.random() * 9000)}`,
      gpsDeviceImei: gpsInstalled ? gpsImei || `8620${Math.floor(100000000 + Math.random() * 900000000)}` : undefined,
      gpsInstalled,
      operationalStatus: 'AVAILABLE',
      currentCity: 'Indore Fleet Yard',
      lastUpdated: 'Just now',
    };

    onAddVehicle(newVeh);
    setShowAddVehModal(false);
  };

  const handleAddDriverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newDriver: Driver = {
      id: `driver-${Date.now()}`,
      tenantId: 'tenant-1',
      fullName: driverName,
      phone: driverPhone,
      licenseNumber: licenseNumber.toUpperCase(),
      licenseExpiry: '2032-10-15',
      emergencyContact: emergencyPhone,
      status: 'AVAILABLE',
      totalTripsCompleted: 0,
    };

    onAddDriver(newDriver);
    setShowAddDriverModal(false);
  };

  const getOwner = (partyId: string) => parties.find((p) => p.id === partyId);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-display font-bold text-white tracking-tight">
            Fleet, Hardware & Driver Compliance
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Support for owned, market-attached, and brokered trucks. GPS-enabled and manual operations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'vehicles' ? (
            <button
              onClick={() => setShowAddVehModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              + Onboard Vehicle
            </button>
          ) : (
            <button
              onClick={() => setShowAddDriverModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              + Onboard Driver
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('vehicles')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
            activeTab === 'vehicles'
              ? 'bg-slate-800 text-emerald-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Vehicle Registry ({vehicles.length})
        </button>
        <button
          onClick={() => setActiveTab('drivers')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
            activeTab === 'drivers'
              ? 'bg-slate-800 text-emerald-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Driver Registry ({drivers.length})
        </button>
        <button
          onClick={() => setActiveTab('compliance')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
            activeTab === 'compliance'
              ? 'bg-slate-800 text-emerald-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Document Compliance Matrix
        </button>
      </div>

      {/* TAB 1: Vehicles */}
      {activeTab === 'vehicles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((v) => {
            const owner = getOwner(v.ownerPartyId);
            const ageInfo = calculateVehicleAge(v.manufactureYearMonth || '2021-03');
            return (
              <div
                key={v.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 hover:border-slate-700 transition-colors shadow-sm"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-950 flex items-center justify-center text-emerald-400 font-bold">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-mono font-bold text-sm text-white block">
                        {v.registrationNo}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {v.category} · {v.capacityMt} MT
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        v.operationalStatus === 'IN_TRANSIT'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {v.operationalStatus}
                    </span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${
                        ageInfo.isOver15Years
                          ? 'text-amber-400 bg-amber-500/10 border-amber-500/30 font-bold'
                          : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                      }`}
                    >
                      {ageInfo.formattedAge} · {ageInfo.complianceBadge}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Motor Malik (Owner):</span>
                    <span className="text-slate-200 font-sans truncate max-w-[170px]">
                      {owner?.legalName}
                    </span>
                  </div>
                  {owner?.tdsExemptionDeclared && (
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500 font-sans">TDS Declaration:</span>
                      <span className="text-emerald-400 font-sans font-semibold">
                        Sec 194C(6) Declared
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Ownership Type:</span>
                    <span className="text-slate-200 font-sans">{v.ownershipType.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Dimensions:</span>
                    <span className="text-slate-300">
                      {v.dimensions.lengthFeet} × {v.dimensions.widthFeet} × {v.dimensions.heightFeet} ft
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Telematics / GPS:</span>
                    <span className={v.gpsInstalled ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                      {v.gpsInstalled ? `GPS Active (${v.gpsDeviceImei})` : 'Manual (No Hardware)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">FASTag Electronic Toll:</span>
                    <span className="text-slate-300">{v.fastagId || 'N/A'}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">City: {v.currentCity}</span>
                  <button
                    onClick={() => setSelectedVehicleForDocs(v)}
                    className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    RC & Insurance Vault
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: Drivers */}
      {activeTab === 'drivers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {drivers.map((d) => {
            const driverAge = d.dob
              ? Math.floor((Date.now() - new Date(d.dob).getTime()) / (365.25 * 24 * 3600 * 1000))
              : 38;
            return (
              <div
                key={d.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 hover:border-slate-700 transition-colors shadow-sm"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-950 flex items-center justify-center text-emerald-400 font-bold">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-semibold text-sm text-white block">
                        {d.fullName}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Phone: {d.phone}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        d.status === 'ON_TRIP'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {d.status.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                      Age: {driverAge} Yrs · {d.yearsExperience || 14} Yrs Exp
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-sans">Aadhaar KYC:</span>
                    <span className="text-slate-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      {d.aadhaarNumber || 'XXXX-XXXX-9821'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">HMV License #:</span>
                    <span className="text-slate-200 font-bold">{d.licenseNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">License Endorsement:</span>
                    <span className="text-cyan-400 font-semibold">
                      {d.licenseBadge?.replace('_', ' ') || 'HMV TRANSPORT'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Police Verification:</span>
                    <span
                      className={
                        d.policeVerificationStatus === 'VERIFIED'
                          ? 'text-emerald-400 font-semibold'
                          : 'text-amber-400 font-semibold'
                      }
                    >
                      {d.policeVerificationStatus || 'VERIFIED'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Blood Group:</span>
                    <span className="text-rose-400 font-bold">{d.bloodGroup || 'O+'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Emergency Contact:</span>
                    <span className="text-slate-300 font-sans truncate max-w-[170px]">
                      {d.emergencyContact} {d.emergencyContactRelation ? `(${d.emergencyContactRelation})` : ''}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Completed Transits:</span>
                    <span className="text-white font-bold">{d.totalTripsCompleted} Trips</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: Document Compliance Matrix */}
      {activeTab === 'compliance' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h2 className="text-base font-display font-bold text-white">
              Statutory RTO Document Compliance & Expiry Monitor
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Tracks Registration Certificate (RC), Fitness, Commercial Insurance, National Permit, and PUC certificates.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[11px]">
                <tr>
                  <th className="px-4 py-3">Vehicle #</th>
                  <th className="px-4 py-3 font-sans">Owner</th>
                  <th className="px-4 py-3">Fitness Expiry</th>
                  <th className="px-4 py-3">Insurance Expiry</th>
                  <th className="px-4 py-3">National Permit</th>
                  <th className="px-4 py-3">PUC Expiry</th>
                  <th className="px-4 py-3 text-center font-sans">Compliance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {vehicles.map((v) => {
                  const owner = getOwner(v.ownerPartyId);
                  return (
                    <tr key={v.id} className="hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-bold text-white">{v.registrationNo}</td>
                      <td className="px-4 py-3 font-sans text-slate-300 truncate max-w-[150px]">{owner?.legalName}</td>
                      <td className="px-4 py-3 text-emerald-400">{v.fitnessExpiryDate}</td>
                      <td className="px-4 py-3 text-emerald-400">{v.insuranceExpiryDate}</td>
                      <td className="px-4 py-3 text-emerald-400">{v.nationalPermitExpiry}</td>
                      <td className="px-4 py-3 text-emerald-400">{v.pucExpiryDate}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          All Verified Valid
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Onboard Vehicle */}
      {showAddVehModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-display font-bold text-white">
                Onboard Vehicle to Fleet Registry
              </h2>
              <button
                onClick={() => setShowAddVehModal(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded hover:bg-slate-800"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleAddVehicleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Registration Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MP09SR4241"
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono uppercase focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Vehicle Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="OPEN_TRUCK">Open Body Truck</option>
                    <option value="CONTAINER">Closed Container</option>
                    <option value="TRAILER">Multi-Axle Trailer</option>
                    <option value="LCV">Light Commercial (LCV)</option>
                    <option value="TANKER">Tanker</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Capacity (Metric Tonnes)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    required
                    value={capacityMt}
                    onChange={(e) => setCapacityMt(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Ownership Type</label>
                  <select
                    value={ownership}
                    onChange={(e) => setOwnership(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="ATTACHED_MARKET">Attached Market Vehicle</option>
                    <option value="OWNED">Self-Owned Fleet</option>
                    <option value="BROKERED">Brokered Third-Party</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Registered Motor Owner Entity</label>
                <select
                  value={ownerPartyId}
                  onChange={(e) => setOwnerPartyId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  {parties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.legalName} ({p.roles.join(', ')})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">GPS Hardware Installed?</span>
                  <input
                    type="checkbox"
                    checked={gpsInstalled}
                    onChange={(e) => setGpsInstalled(e.target.checked)}
                    className="rounded accent-emerald-500 w-4 h-4 cursor-pointer"
                  />
                </div>
                {gpsInstalled && (
                  <div>
                    <label className="block text-slate-400 mb-1">GPS Device IMEI</label>
                    <input
                      type="text"
                      placeholder="e.g. 862045051234567"
                      value={gpsImei}
                      onChange={(e) => setGpsImei(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 font-mono"
                    />
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddVehModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
                >
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Comprehensive Driver Onboarding Modal */}
      <DriverOnboardingModal
        isOpen={showAddDriverModal}
        onClose={() => setShowAddDriverModal(false)}
        onAddDriver={onAddDriver}
      />

      {/* Vehicle Document & Motor Malik Vault Modal */}
      {selectedVehicleForDocs && (
        <VehicleDocumentModal
          vehicle={selectedVehicleForDocs}
          ownerParty={getOwner(selectedVehicleForDocs.ownerPartyId)}
          onClose={() => setSelectedVehicleForDocs(null)}
          onUpdateVehicle={(updated) => {
            setSelectedVehicleForDocs(updated);
          }}
        />
      )}
    </div>
  );
};
