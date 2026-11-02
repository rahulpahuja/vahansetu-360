/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * VahanSetu 360 — Vehicle Availability & Broker Load Marketplace
 */

import React, { useState } from 'react';
import {
  Search,
  Truck,
  Filter,
  CheckCircle2,
  Calendar,
  Phone,
  Send,
  Building2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { MarketplaceListing, Party } from '../types/logistics';
import { INITIAL_MARKETPLACE_LISTINGS } from '../data/seedData';
import { formatPaiseToINR } from '../utils/accountingEngine';

interface VehicleMarketplaceProps {
  parties: Party[];
  onBookListing: (listing: MarketplaceListing, rateRupees: number) => void;
}

export const VehicleMarketplace: React.FC<VehicleMarketplaceProps> = ({
  parties,
  onBookListing,
}) => {
  const [originSearch, setOriginSearch] = useState('');
  const [destSearch, setDestSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [listings, setListings] = useState<MarketplaceListing[]>(INITIAL_MARKETPLACE_LISTINGS);
  const [bookingListing, setBookingListing] = useState<MarketplaceListing | null>(null);
  const [offeredRate, setOfferedRate] = useState<number>(42000);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  const filteredListings = listings.filter((l) => {
    if (categoryFilter !== 'ALL' && l.vehicleType !== categoryFilter) return false;
    if (originSearch && !l.currentCity.toLowerCase().includes(originSearch.toLowerCase())) return false;
    if (destSearch && !l.preferredDestination.toLowerCase().includes(destSearch.toLowerCase())) return false;
    return true;
  });

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingListing) return;

    onBookListing(bookingListing, offeredRate);
    setBookingSuccess(`Booking confirmed for ${bookingListing.vehicleReg}! Awaiting dispatch contract.`);
    setBookingListing(null);
    setTimeout(() => setBookingSuccess(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-display font-bold text-white tracking-tight">
            Vehicle Availability & Spot Freight Marketplace
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Empowering freight brokers to source, negotiate, and arrange vehicles on-demand without capital fleet ownership.
          </p>
        </div>
      </div>

      {bookingSuccess && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-800 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{bookingSuccess}</span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Origin / Current City</label>
            <input
              type="text"
              placeholder="e.g. Indore, Bhiwandi, Nashik"
              value={originSearch}
              onChange={(e) => setOriginSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Preferred Destination</label>
            <input
              type="text"
              placeholder="e.g. Mumbai, Pune, Gujarat"
              value={destSearch}
              onChange={(e) => setDestSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Vehicle Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Categories</option>
              <option value="OPEN_TRUCK">Open Truck</option>
              <option value="CONTAINER">Closed Container</option>
              <option value="TRAILER">Trailer</option>
              <option value="LCV">Light Commercial (LCV)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Available Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredListings.map((item) => (
          <div
            key={item.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 hover:border-slate-700 transition-colors shadow-sm flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-emerald-950 flex items-center justify-center text-emerald-400 font-bold">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-mono font-bold text-sm text-white block">
                      {item.vehicleReg}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {item.vehicleType} · {item.capacityMt} MT
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  {item.availableFrom}
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Current City:</span>
                  <span className="text-slate-200 font-sans font-medium">{item.currentCity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Preferred Route:</span>
                  <span className="text-emerald-400 font-sans">{item.preferredDestination}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Motor Owner:</span>
                  <span className="text-slate-200 font-sans truncate max-w-[170px]">{item.ownerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Base Benchmark:</span>
                  <span className="text-slate-300">
                    {formatPaiseToINR(item.baseRatePerKmPaise)} / km
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
              <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>{item.ownerPhone}</span>
              </div>

              <button
                onClick={() => {
                  setBookingListing(item);
                  setOfferedRate(item.capacityMt > 20 ? 55000 : 42000);
                }}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap"
              >
                Book & Negotiate
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Book & Negotiate Freight */}
      {bookingListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-base font-display font-bold text-white">
                  Confirm Vehicle Booking & Freight Rate
                </h2>
                <p className="text-xs text-slate-400">
                  {bookingListing.vehicleReg} ({bookingListing.vehicleType} · {bookingListing.capacityMt} MT)
                </p>
              </div>
              <button
                onClick={() => setBookingListing(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded hover:bg-slate-800"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleConfirmBooking} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Motor Owner:</span>
                  <span className="font-semibold text-white">{bookingListing.ownerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Phone:</span>
                  <span className="font-mono text-slate-300">{bookingListing.ownerPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Route:</span>
                  <span className="text-emerald-400">{bookingListing.currentCity} ➔ {bookingListing.preferredDestination}</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Agreed Freight Offer (₹)</label>
                <input
                  type="number"
                  required
                  min={5000}
                  step={500}
                  value={offeredRate}
                  onChange={(e) => setOfferedRate(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono text-sm font-bold focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Agreed hire payable to motor owner after journey completion.
                </span>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBookingListing(null)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors"
                >
                  Lock Booking & Generate Contract
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
