/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * VahanSetu 360 — Vehicle RC, Insurance & Motor Malik Compliance Modal
 */

import React, { useState } from 'react';
import {
  FileText,
  X,
  Truck,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Calendar,
  Building,
  CreditCard,
  FileCheck,
  Check,
  Download,
} from 'lucide-react';
import { Party, Vehicle } from '../types/logistics';
import { calculateVehicleAge } from '../utils/vintageEngine';

interface VehicleDocumentModalProps {
  vehicle: Vehicle | null;
  ownerParty?: Party;
  onClose: () => void;
  onUpdateVehicle?: (updated: Vehicle) => void;
}

export const VehicleDocumentModal: React.FC<VehicleDocumentModalProps> = ({
  vehicle,
  ownerParty,
  onClose,
  onUpdateVehicle,
}) => {
  if (!vehicle) return null;

  const ageAnalysis = calculateVehicleAge(vehicle.manufactureYearMonth || '2021-03');

  const [rcUploaded, setRcUploaded] = useState(Boolean(vehicle.rcDocumentUrl));
  const [insuranceUploaded, setInsuranceUploaded] = useState(Boolean(vehicle.insuranceDocUrl));
  const [fitnessUploaded, setFitnessUploaded] = useState(Boolean(vehicle.fitnessDocUrl));
  const [pucUploaded, setPucUploaded] = useState(Boolean(vehicle.pucDocUrl));

  const handleToggleDoc = (docType: 'rc' | 'insurance' | 'fitness' | 'puc') => {
    let updated = { ...vehicle };
    if (docType === 'rc') {
      const next = !rcUploaded;
      setRcUploaded(next);
      updated.rcDocumentUrl = next ? `mock://rc/${vehicle.registrationNo.toLowerCase()}.pdf` : undefined;
    } else if (docType === 'insurance') {
      const next = !insuranceUploaded;
      setInsuranceUploaded(next);
      updated.insuranceDocUrl = next ? `mock://insurance/${vehicle.registrationNo.toLowerCase()}.pdf` : undefined;
    } else if (docType === 'fitness') {
      const next = !fitnessUploaded;
      setFitnessUploaded(next);
      updated.fitnessDocUrl = next ? `mock://fitness/${vehicle.registrationNo.toLowerCase()}.pdf` : undefined;
    } else if (docType === 'puc') {
      const next = !pucUploaded;
      setPucUploaded(next);
      updated.pucDocUrl = next ? `mock://puc/${vehicle.registrationNo.toLowerCase()}.pdf` : undefined;
    }
    if (onUpdateVehicle) onUpdateVehicle(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-display font-bold text-white tracking-tight font-mono">
                  {vehicle.registrationNo}
                </h2>
                <span className="px-2 py-0.5 text-xs font-mono font-semibold rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {vehicle.category} · {vehicle.capacityMt} MT
                </span>
                <span
                  className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded border ${
                    ageAnalysis.isOver15Years
                      ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                      : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                  }`}
                >
                  {ageAnalysis.complianceBadge}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Vehicle Age: <span className="font-semibold text-white">{ageAnalysis.formattedAge}</span> ·{' '}
                {ageAnalysis.regulatoryNotice}
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

        {/* Motor Malik (Vehicle Owner) Profile */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-emerald-400" />
              Motor Malik (Vehicle Owner) Identity & Bank Settlement
            </span>
            {ownerParty?.tdsExemptionDeclared && (
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Sec 194C(6) Declared (&lt;=10 Trucks)
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500">Legal Name:</span>{' '}
              <span className="font-semibold text-white">
                {ownerParty?.legalName || 'Ram Motor Transport & Fleet'}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Owner PAN:</span>{' '}
              <span className="font-mono text-white">{ownerParty?.pan || 'ADMPR4419K'}</span>
            </div>
            <div>
              <span className="text-slate-500">Bank Account:</span>{' '}
              <span className="font-mono text-white">
                {ownerParty?.bankAccountNumber || '918239019283'} ({ownerParty?.bankName || 'SBI Loha Mandi'})
              </span>
            </div>
            <div>
              <span className="text-slate-500">IFSC / Beneficiary:</span>{' '}
              <span className="font-mono text-white">
                {ownerParty?.bankIfsc || 'SBIN0003011'} · {ownerParty?.motorMalikBankBeneficiary || 'Ramchandra Patidar'}
              </span>
            </div>
          </div>
        </div>

        {/* Four Core Statutory Documents */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-emerald-400" />
            Statutory RTO Document Vault & Validity Checks
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 1. Registration Certificate (RC) */}
            <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  1. RC Book / Smart Card
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Exp: {vehicle.rcExpiryDate}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 space-y-0.5">
                <div>Chassis: <span className="font-mono text-slate-300">{vehicle.chassisNumber || 'MAT628491M8K10294'}</span></div>
                <div>Engine: <span className="font-mono text-slate-300">{vehicle.engineNumber || '4D34CR91823'}</span></div>
              </div>
              <div className="pt-1 flex items-center justify-between">
                <button
                  onClick={() => handleToggleDoc('rc')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                    rcUploaded
                      ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                      : 'text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  {rcUploaded ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> RC Attached (Verified)
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" /> Upload RC Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 2. Commercial Insurance Policy */}
            <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-teal-400" />
                  2. Commercial Insurance
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Exp: {vehicle.insuranceExpiryDate}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 space-y-0.5">
                <div>Insurer: <span className="text-slate-300">{vehicle.insuranceCompany || 'ICICI Lombard'}</span></div>
                <div>Policy: <span className="font-mono text-slate-300">{vehicle.insurancePolicyNo || '3001/2026/88192841'}</span></div>
              </div>
              <div className="pt-1 flex items-center justify-between">
                <button
                  onClick={() => handleToggleDoc('insurance')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                    insuranceUploaded
                      ? 'text-teal-400 border-teal-500/30 bg-teal-500/10'
                      : 'text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  {insuranceUploaded ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Policy Attached (PDF)
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" /> Upload Insurance
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 3. Fitness Certificate */}
            <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  3. Fitness Certificate
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Exp: {vehicle.fitnessExpiryDate}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 space-y-0.5">
                <div>Cycle: <span className="text-slate-300">{ageAnalysis.fitnessCycle}</span></div>
                <div>Status: <span className="text-emerald-400">RTO Automated Passed</span></div>
              </div>
              <div className="pt-1 flex items-center justify-between">
                <button
                  onClick={() => handleToggleDoc('fitness')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                    fitnessUploaded
                      ? 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10'
                      : 'text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  {fitnessUploaded ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Fitness Attached (PDF)
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" /> Upload Fitness
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 4. Pollution & National Permit */}
            <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                  4. Permit & FASTag
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Permit: {vehicle.nationalPermitExpiry}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 space-y-0.5">
                <div>PUC Expiry: <span className="font-mono text-slate-300">{vehicle.pucExpiryDate}</span></div>
                <div>FASTag: <span className="font-mono text-slate-300">{vehicle.fastagId || 'FASTAG-ACTIVE'}</span></div>
              </div>
              <div className="pt-1 flex items-center justify-between">
                <button
                  onClick={() => handleToggleDoc('puc')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                    pucUploaded
                      ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                      : 'text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  {pucUploaded ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> PUC Attached
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" /> Upload PUC
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Close Document Vault
          </button>
        </div>
      </div>
    </div>
  );
};
