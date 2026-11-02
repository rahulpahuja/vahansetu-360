/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * VahanSetu 360 — Driver Onboarding & Compliance Management Modal
 */

import React, { useState } from 'react';
import {
  UserCheck,
  X,
  CreditCard,
  Phone,
  Calendar,
  ShieldCheck,
  FileCheck,
  AlertTriangle,
  Upload,
  Check,
  Heart,
  Briefcase,
  Users,
} from 'lucide-react';
import { Driver, LicenseBadge } from '../types/logistics';

interface DriverOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDriver: (driver: Driver) => void;
}

export const DriverOnboardingModal: React.FC<DriverOnboardingModalProps> = ({
  isOpen,
  onClose,
  onAddDriver,
}) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [aadhaarRaw, setAadhaarRaw] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseExpiry, setLicenseExpiry] = useState('2032-12-31');
  const [licenseBadge, setLicenseBadge] = useState<LicenseBadge>('HMV_TRANSPORT');
  const [policeStatus, setPoliceStatus] = useState<'VERIFIED' | 'PENDING' | 'REJECTED'>('VERIFIED');
  const [bloodGroup, setBloodGroup] = useState<'O+' | 'O-' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-'>('O+');
  const [dob, setDob] = useState('1990-05-15');
  const [yearsExperience, setYearsExperience] = useState(10);
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('Brother (Sohan)');
  const [aadhaarUploaded, setAadhaarUploaded] = useState(true);
  const [dlUploaded, setDlUploaded] = useState(true);

  if (!isOpen) return null;

  // Format Aadhaar with 4-digit chunks: XXXX-XXXX-XXXX
  const handleAadhaarChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').substring(0, 12);
    const chunks = cleaned.match(/.{1,4}/g);
    setAadhaarRaw(chunks ? chunks.join('-') : cleaned);
  };

  // Calculate age from DOB
  const calculateAge = (birthDateStr: string) => {
    if (!birthDateStr) return 35;
    const bDate = new Date(birthDateStr);
    const diff = Date.now() - bDate.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !licenseNumber) return;

    const newDriver: Driver = {
      id: `driver-${Date.now()}`,
      tenantId: 'tenant-1',
      fullName,
      phone,
      aadhaarNumber: aadhaarRaw ? `XXXX-XXXX-${aadhaarRaw.slice(-4)}` : 'XXXX-XXXX-8921',
      aadhaarDocUrl: aadhaarUploaded ? 'mock://docs/aadhaar.pdf' : undefined,
      licenseNumber: licenseNumber.toUpperCase().replace(/\s+/g, ''),
      licenseExpiry,
      licenseDocUrl: dlUploaded ? 'mock://docs/dl.pdf' : undefined,
      licenseBadge,
      policeVerificationStatus: policeStatus,
      bloodGroup,
      dob,
      yearsExperience,
      emergencyContact: emergencyPhone || phone,
      emergencyContactRelation: emergencyRelation,
      status: 'AVAILABLE',
      totalTripsCompleted: 0,
    };

    onAddDriver(newDriver);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-display font-bold text-white tracking-tight">
                Driver Onboarding & Verification
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                SARATHI RTO License validation, Aadhaar KYC, Police check, and Emergency contacts.
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Section 1: Basic Profile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Full Name (as per Aadhaar / DL) *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ramesh Singh Rathore"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Primary Mobile Phone *
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98260 12345"
                  className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Identity & Documents */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-4">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
              Statutory Identity & RTO Credentials
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Aadhaar Card Number (12 Digits)
                </label>
                <input
                  type="text"
                  value={aadhaarRaw}
                  onChange={(e) => handleAadhaarChange(e.target.value)}
                  placeholder="XXXX-XXXX-XXXX"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                />
                <div className="flex items-center justify-between mt-1 text-[11px]">
                  <span className="text-slate-500">Document Upload:</span>
                  <button
                    type="button"
                    onClick={() => setAadhaarUploaded(!aadhaarUploaded)}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border ${
                      aadhaarUploaded
                        ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                        : 'text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    {aadhaarUploaded ? (
                      <>
                        <Check className="w-3 h-3" /> Aadhaar Attached (PDF)
                      </>
                    ) : (
                      <>
                        <Upload className="w-3 h-3" /> Attach Aadhaar Copy
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Driving License Number (SARATHI format) *
                </label>
                <input
                  type="text"
                  required
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  placeholder="e.g. MP09-2016-0091823"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono uppercase text-white focus:outline-none focus:border-emerald-500"
                />
                <div className="flex items-center justify-between mt-1 text-[11px]">
                  <span className="text-slate-500">DL Scan Copy:</span>
                  <button
                    type="button"
                    onClick={() => setDlUploaded(!dlUploaded)}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border ${
                      dlUploaded
                        ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                        : 'text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    {dlUploaded ? (
                      <>
                        <Check className="w-3 h-3" /> DL Attached (PDF)
                      </>
                    ) : (
                      <>
                        <Upload className="w-3 h-3" /> Attach DL Copy
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  License Expiry Date
                </label>
                <input
                  type="date"
                  value={licenseExpiry}
                  onChange={(e) => setLicenseExpiry(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  License Badge Category
                </label>
                <select
                  value={licenseBadge}
                  onChange={(e) => setLicenseBadge(e.target.value as LicenseBadge)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="HMV_TRANSPORT">HMV Heavy Goods Transport</option>
                  <option value="HAZARDOUS_GOODS">Hazardous Chemical Cargo</option>
                  <option value="HILL_TERRAIN">Hill Terrain Endorsement</option>
                  <option value="LMV_COMMERCIAL">LMV Commercial Goods</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Police Verification Status
                </label>
                <select
                  value={policeStatus}
                  onChange={(e) => setPoliceStatus(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="VERIFIED">Verified (Police NOC on file)</option>
                  <option value="PENDING">Under Verification</option>
                  <option value="REJECTED">Adverse Record / Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Health, Age & Experience */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Date of Birth (Age: {calculateAge(dob)} Yrs)
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Blood Group (Emergency)
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="O+">O Positive (O+)</option>
                <option value="B+">B Positive (B+)</option>
                <option value="A+">A Positive (A+)</option>
                <option value="AB+">AB Positive (AB+)</option>
                <option value="O-">O Negative (O-)</option>
                <option value="B-">B Negative (B-)</option>
                <option value="A-">A Negative (A-)</option>
                <option value="AB-">AB Negative (AB-)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Commercial Driving Experience
              </label>
              <input
                type="number"
                min="1"
                max="45"
                value={yearsExperience}
                onChange={(e) => setYearsExperience(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Section 4: Emergency Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Emergency Contact Number
              </label>
              <input
                type="text"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                placeholder="+91 98260 99882"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Relationship & Contact Name
              </label>
              <input
                type="text"
                value={emergencyRelation}
                onChange={(e) => setEmergencyRelation(e.target.value)}
                placeholder="e.g. Spouse (Sita Devi)"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors shadow-sm"
            >
              <UserCheck className="w-4 h-4" />
              Complete Driver Onboarding
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
