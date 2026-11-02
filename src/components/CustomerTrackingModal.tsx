/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * VahanSetu 360 — Secure Public Customer Tracking Portal (No Account Required)
 */

import React from 'react';
import {
  MapPin,
  Clock,
  CheckCircle2,
  Truck,
  ShieldCheck,
  FileText,
  Navigation,
  ExternalLink,
  Copy,
} from 'lucide-react';
import { LorryReceipt, Party, Trip, Vehicle } from '../types/logistics';
import { SEED_TELEMATICS_POINTS } from '../data/seedData';

interface CustomerTrackingModalProps {
  trip: Trip;
  vehicle?: Vehicle;
  lorryReceipts: LorryReceipt[];
  parties: Party[];
  onClose: () => void;
}

export const CustomerTrackingModal: React.FC<CustomerTrackingModalProps> = ({
  trip,
  vehicle,
  lorryReceipts,
  parties,
  onClose,
}) => {
  const [copied, setCopied] = React.useState(false);
  const publicUrl = `https://ganesh.vahansetu.in/track/${trip.trackingToken}`;
  const latestPoint = SEED_TELEMATICS_POINTS[SEED_TELEMATICS_POINTS.length - 1];

  const handleCopy = () => {
    navigator.clipboard?.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const relatedLrs = lorryReceipts.filter((lr) => lr.tripId === trip.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 sm:p-7 space-y-6 shadow-2xl my-8">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 flex items-center justify-center text-emerald-400 border border-emerald-800/60">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-display font-bold text-white">
                Customer Consignment Tracking Portal
              </h2>
              <span className="text-xs text-slate-400">
                Tokenized live tracking for Shippers & Consignees (No Login Required)
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

        {/* Secure Link Bar */}
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-xs">
          <div className="truncate font-mono text-emerald-400 text-[11px]">
            {publicUrl}
          </div>
          <button
            onClick={handleCopy}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-medium transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>
        </div>

        {/* Live Transit Status Banner */}
        <div className="bg-gradient-to-r from-emerald-950/40 to-slate-950 p-4 rounded-xl border border-emerald-800/50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Active Transit in Progress
            </span>
            <span className="text-xs font-mono font-bold text-white px-2.5 py-0.5 rounded bg-emerald-900/60 border border-emerald-700">
              ETA: 02:00 PM Today
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div>
              <span className="text-slate-400 block text-[10px]">Current Location</span>
              <span className="text-white font-sans font-semibold block mt-0.5">
                {latestPoint?.locationName || 'Chandwad Ghat Section, NH-52'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Vehicle Registration</span>
              <span className="text-emerald-400 font-bold block mt-0.5">
                {vehicle?.registrationNo || 'MP09SR4241'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">GPS Speed</span>
              <span className="text-slate-200 font-bold block mt-0.5">
                {latestPoint?.speedKmh || 61.2} km/h
              </span>
            </div>
          </div>
        </div>

        {/* Multi-Stop Consignments & POD Progress */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Journey Stops & Proof of Delivery (POD)
          </h3>

          <div className="space-y-2.5">
            {trip.stops.map((stop, idx) => {
              const matchingLr = relatedLrs.find((lr) => lr.lrNumber === stop.lrNumbers?.[0]);

              return (
                <div
                  key={stop.id}
                  className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                        stop.status === 'COMPLETED'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <div>
                      <span className="font-semibold text-white block">
                        {stop.stopName}
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        {stop.locationName} · {stop.city}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        stop.status === 'COMPLETED'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {stop.status}
                    </span>
                    {matchingLr?.podStatus === 'VERIFIED' && (
                      <div className="text-[10px] text-emerald-400 flex items-center gap-1 justify-end mt-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>POD Verified</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Security & Privacy Notice */}
        <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>
            Protected endpoint: Internal freight financials, commercial broker margins, and private driver documents are strictly withheld from customer tracking links.
          </span>
        </div>
      </div>
    </div>
  );
};
