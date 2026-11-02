/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * VahanSetu 360 — 360° Transport & Logistics SaaS Operating System
 */

import React, { useState } from 'react';
import { Header, ActiveTab } from './components/Header';
import { DashboardOverview } from './components/DashboardOverview';
import { DispatchManagement } from './components/DispatchManagement';
import { BiltyManager } from './components/BiltyManager';
import { DoubleEntryAccounting } from './components/DoubleEntryAccounting';
import { TelematicsSuite } from './components/TelematicsSuite';
import { PartyManager } from './components/PartyManager';
import { FleetManager } from './components/FleetManager';
import { VehicleMarketplace } from './components/VehicleMarketplace';
import { CustomerTrackingModal } from './components/CustomerTrackingModal';
import { TenantAdminModal } from './components/TenantAdminModal';
import { AuditLogViewer } from './components/AuditLogViewer';

import {
  AuditLogEntry,
  Branch,
  Driver,
  JournalEntry,
  LorryReceipt,
  MarketplaceListing,
  Party,
  Tenant,
  Trip,
  Vehicle,
} from './types/logistics';

import {
  INITIAL_ACCOUNTS,
  INITIAL_BRANCHES,
  INITIAL_DRIVERS,
  INITIAL_JOURNAL_ENTRIES,
  INITIAL_LORRY_RECEIPTS,
  INITIAL_PARTIES,
  INITIAL_TENANTS,
  INITIAL_TRIPS,
  INITIAL_VEHICLES,
} from './data/seedData';
import { generateInitialAuditLogs } from './data/seedAuditLogs';
import { createAuditLogEntry } from './utils/auditLogger';
import { inrToPaise } from './utils/accountingEngine';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [activeTenant, setActiveTenant] = useState<Tenant>(INITIAL_TENANTS[0]);
  const [branches, setBranches] = useState<Branch[]>(INITIAL_BRANCHES);
  const [activeBranchId, setActiveBranchId] = useState<string>(INITIAL_BRANCHES[0].id);

  // Core Data Stores
  const [parties, setParties] = useState<Party[]>(INITIAL_PARTIES);
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [drivers, setDrivers] = useState<Driver[]>(INITIAL_DRIVERS);
  const [trips, setTrips] = useState<Trip[]>(INITIAL_TRIPS);
  const [lorryReceipts, setLorryReceipts] = useState<LorryReceipt[]>(INITIAL_LORRY_RECEIPTS);
  const [accounts, setAccounts] = useState(INITIAL_ACCOUNTS);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(INITIAL_JOURNAL_ENTRIES);

  // Centralized Cryptographically Chained Audit Log Vault
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => generateInitialAuditLogs());

  // Modals & Navigation Deep Links
  const [activeTrackingToken, setActiveTrackingToken] = useState<string | null>(null);
  const [showTenantModal, setShowTenantModal] = useState<boolean>(false);
  const [selectedTripFilterForBilty, setSelectedTripFilterForBilty] = useState<string | undefined>(undefined);
  const [selectedPartyIdForLedger, setSelectedPartyIdForLedger] = useState<string | undefined>(undefined);

  // Centralized Audit Emitter linking chronologically into the tamper-evident hash chain
  const recordAudit = (params: {
    actorId?: string;
    actorName?: string;
    actorRole?: string;
    action: any;
    entityType: any;
    entityId: string;
    entityDisplay: string;
    description: string;
    previousState?: Record<string, any>;
    newState: Record<string, any>;
  }) => {
    setAuditLogs((prevLogs) => {
      const lastEntry = prevLogs[prevLogs.length - 1];
      const newEntry = createAuditLogEntry(
        {
          tenantId: activeTenant.id,
          actorId: params.actorId || 'usr-central-ops',
          actorName: params.actorName || 'Sunil Gupta (Indore Ops Manager)',
          actorRole: params.actorRole || 'TENANT_ADMIN',
          action: params.action,
          entityType: params.entityType,
          entityId: params.entityId,
          entityDisplay: params.entityDisplay,
          description: params.description,
          previousState: params.previousState,
          newState: params.newState,
        },
        lastEntry
      );
      return [...prevLogs, newEntry];
    });
  };

  // Handler: Add New Trip & automatically generate initial accounting vouchers + audit trail
  const handleAddTrip = (newTrip: Trip) => {
    setTrips([newTrip, ...trips]);

    // Book double-entry hire expense for vehicle owner
    const hireJe: JournalEntry = {
      id: `je-hire-${Date.now()}`,
      tenantId: activeTenant.id,
      entryNumber: `JE-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      entryDate: new Date().toISOString().substring(0, 10),
      referenceType: 'TRIP_FREIGHT',
      referenceId: newTrip.id,
      narration: `Direct truck hire booked for ${newTrip.tripNumber} (${newTrip.originCity} to ${newTrip.destinationCity})`,
      isPosted: true,
      lines: [
        {
          id: `l1-${Date.now()}`,
          accountId: 'acc-exp-hire',
          debitPaise: newTrip.totalAgreedFreightPaise - 800000,
          creditPaise: 0,
        },
        {
          id: `l2-${Date.now()}`,
          accountId: 'acc-ap-owners',
          partyId: newTrip.vehicleOwnerPartyId,
          debitPaise: 0,
          creditPaise: newTrip.totalAgreedFreightPaise - 800000,
        },
      ],
      createdAt: new Date().toISOString(),
    };

    setJournalEntries([hireJe, ...journalEntries]);

    // Emit Audit Trail Entries
    recordAudit({
      actorId: 'usr-disp-1',
      actorName: 'Rajesh Sharma (Dispatcher)',
      actorRole: 'DISPATCHER',
      action: 'TRIP_DISPATCHED',
      entityType: 'TRIP',
      entityId: newTrip.id,
      entityDisplay: `${newTrip.tripNumber} (${newTrip.originCity} ➔ ${newTrip.destinationCity})`,
      description: `New road freight transit dispatched with agreed freight ₹${(newTrip.totalAgreedFreightPaise / 100).toLocaleString()}`,
      newState: {
        tripNumber: newTrip.tripNumber,
        origin: newTrip.originCity,
        destination: newTrip.destinationCity,
        freightPaise: newTrip.totalAgreedFreightPaise,
        vehicleId: newTrip.vehicleId,
      },
    });

    recordAudit({
      actorId: 'usr-acc-1',
      actorName: 'Pradeep Joshi (Accountant)',
      actorRole: 'ACCOUNTANT',
      action: 'FINANCIAL_POSTING',
      entityType: 'JOURNAL_ENTRY',
      entityId: hireJe.id,
      entityDisplay: `${hireJe.entryNumber} (Truck Hire Booking)`,
      description: `Lorry hire cost ₹${((newTrip.totalAgreedFreightPaise - 800000) / 100).toLocaleString()} booked to Motor Owner ledger`,
      newState: {
        entryNumber: hireJe.entryNumber,
        debitPaise: newTrip.totalAgreedFreightPaise - 800000,
        creditPaise: newTrip.totalAgreedFreightPaise - 800000,
      },
    });
  };

  // Handler: Add New Lorry Receipt & automatically recognize revenue and receivables + audit
  const handleAddLorryReceipt = (newLr: LorryReceipt) => {
    setLorryReceipts([newLr, ...lorryReceipts]);

    // 1. Freight Revenue Invoiced: Debit Accounts Receivable, Credit Gross Freight Revenue
    const biltyJe: JournalEntry = {
      id: `je-lr-${Date.now()}`,
      tenantId: activeTenant.id,
      entryNumber: `JE-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      entryDate: newLr.lrDate,
      referenceType: 'BILTY_BILLING',
      referenceId: newLr.id,
      narration: `Freight billed for Bilty ${newLr.lrNumber} (${newLr.goodsDescription})`,
      isPosted: true,
      lines: [
        {
          id: `l-ar-${Date.now()}`,
          accountId: 'acc-ar',
          partyId: newLr.billingPartyId,
          debitPaise: newLr.totalLrAmountPaise,
          creditPaise: 0,
          description: `Receivable for ${newLr.packageCount} pkgs`,
        },
        {
          id: `l-rev-${Date.now()}`,
          accountId: 'acc-freight-revenue',
          debitPaise: 0,
          creditPaise: newLr.totalLrAmountPaise,
          description: 'Freight revenue earned',
        },
      ],
      createdAt: new Date().toISOString(),
    };

    const newEntries = [biltyJe];

    // 2. If advance was received at loading, record Bank Debit and AR Credit
    if (newLr.advanceReceivedPaise > 0) {
      const advJe: JournalEntry = {
        id: `je-adv-${Date.now()}`,
        tenantId: activeTenant.id,
        entryNumber: `JE-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        entryDate: newLr.lrDate,
        referenceType: 'ADVANCE_PAYMENT',
        referenceId: newLr.id,
        narration: `Advance received against LR ${newLr.lrNumber}`,
        isPosted: true,
        lines: [
          {
            id: `l-bnk-${Date.now()}`,
            accountId: 'acc-hdfc',
            debitPaise: newLr.advanceReceivedPaise,
            creditPaise: 0,
            description: 'Advance received via bank',
          },
          {
            id: `l-aroff-${Date.now()}`,
            accountId: 'acc-ar',
            partyId: newLr.billingPartyId,
            debitPaise: 0,
            creditPaise: newLr.advanceReceivedPaise,
            description: 'Advance credit offset',
          },
        ],
        createdAt: new Date().toISOString(),
      };
      newEntries.push(advJe);
    }

    setJournalEntries([...newEntries, ...journalEntries]);

    // Emit Audit Log
    recordAudit({
      actorId: 'usr-branch-mgr-1',
      actorName: 'Sunil Gupta (Branch Manager)',
      actorRole: 'TENANT_ADMIN',
      action: 'BILTY_ISSUED',
      entityType: 'LORRY_RECEIPT',
      entityId: newLr.id,
      entityDisplay: `${newLr.lrNumber} (${newLr.goodsDescription})`,
      description: `Lorry Receipt issued for ${newLr.packageCount} pkgs (${newLr.actualWeightKg} kg). Total freight: ₹${(newLr.totalLrAmountPaise / 100).toLocaleString()}`,
      newState: {
        lrNumber: newLr.lrNumber,
        weightKg: newLr.actualWeightKg,
        totalPaise: newLr.totalLrAmountPaise,
        advancePaise: newLr.advanceReceivedPaise,
      },
    });

    recordAudit({
      actorId: 'usr-acc-1',
      actorName: 'Pradeep Joshi (Accountant)',
      actorRole: 'ACCOUNTANT',
      action: 'FINANCIAL_POSTING',
      entityType: 'JOURNAL_ENTRY',
      entityId: biltyJe.id,
      entityDisplay: `${biltyJe.entryNumber} (LR Revenue Recognition)`,
      description: `Double-entry freight revenue recognized for Bilty ${newLr.lrNumber}`,
      newState: {
        entryNumber: biltyJe.entryNumber,
        debitPaise: newLr.totalLrAmountPaise,
        creditPaise: newLr.totalLrAmountPaise,
      },
    });
  };

  // Handler: Update Stop Status (Pending / Reached / Completed) + Audit Trail
  const handleUpdateTripStopStatus = (
    tripId: string,
    stopId: string,
    newStatus: 'PENDING' | 'REACHED' | 'COMPLETED'
  ) => {
    let targetedStopName = '';
    let prevStatus = 'PENDING';

    setTrips((prevTrips) =>
      prevTrips.map((t) => {
        if (t.id !== tripId) return t;
        const updatedStops = t.stops.map((s) => {
          if (s.id !== stopId) return s;
          targetedStopName = s.stopName;
          prevStatus = s.status;
          return {
            ...s,
            status: newStatus,
            actualArrival: newStatus !== 'PENDING' ? s.actualArrival || 'Just now' : undefined,
          };
        });

        const allCompleted = updatedStops.every((s) => s.status === 'COMPLETED');
        return {
          ...t,
          stops: updatedStops,
          status: allCompleted ? 'DELIVERED' : 'IN_TRANSIT',
        };
      })
    );

    recordAudit({
      actorId: 'usr-disp-1',
      actorName: 'Rajesh Sharma (Dispatcher)',
      actorRole: 'DISPATCHER',
      action: 'STOP_UPDATED',
      entityType: 'TRIP',
      entityId: tripId,
      entityDisplay: targetedStopName || `Stop ${stopId}`,
      description: `Transit stop status transitioned from ${prevStatus} to ${newStatus}`,
      previousState: { status: prevStatus },
      newState: { status: newStatus, timestamp: new Date().toISOString() },
    });
  };

  // Handler: Update Digital POD verification status + Audit Trail
  const handleUpdatePodStatus = (
    lrId: string,
    newStatus: 'PENDING' | 'UPLOADED' | 'VERIFIED'
  ) => {
    let lrNumber = '';
    let prevStatus = 'PENDING';

    setLorryReceipts((prev) =>
      prev.map((lr) => {
        if (lr.id !== lrId) return lr;
        lrNumber = lr.lrNumber;
        prevStatus = lr.podStatus;
        return {
          ...lr,
          podStatus: newStatus,
          podUploadedAt: newStatus !== 'PENDING' ? lr.podUploadedAt || 'Just now' : undefined,
        };
      })
    );

    recordAudit({
      actorId: 'usr-branch-mgr-1',
      actorName: 'Sunil Gupta (Branch Manager)',
      actorRole: 'TENANT_ADMIN',
      action: 'POD_VERIFIED',
      entityType: 'LORRY_RECEIPT',
      entityId: lrId,
      entityDisplay: `${lrNumber || lrId} (POD ${newStatus})`,
      description: `Delivery Proof document status updated from ${prevStatus} to ${newStatus}`,
      previousState: { podStatus: prevStatus },
      newState: { podStatus: newStatus },
    });
  };

  // Handler: Register New Party + Audit Trail
  const handleAddParty = (newParty: Party) => {
    setParties([newParty, ...parties]);

    recordAudit({
      actorId: 'usr-branch-mgr-1',
      actorName: 'Sunil Gupta (Branch Manager)',
      actorRole: 'TENANT_ADMIN',
      action: 'PARTY_REGISTERED',
      entityType: 'PARTY',
      entityId: newParty.id,
      entityDisplay: `${newParty.legalName} (${newParty.pan})`,
      description: `Business entity registered with roles [${newParty.roles.join(', ')}] and credit limit ₹${(newParty.creditLimitPaise / 100).toLocaleString()}`,
      newState: {
        legalName: newParty.legalName,
        pan: newParty.pan,
        gstin: newParty.gstin,
        roles: newParty.roles,
        creditLimitPaise: newParty.creditLimitPaise,
      },
    });
  };

  // Handler: Manual Journal Voucher + Audit Trail
  const handleAddJournalEntry = (newEntry: JournalEntry) => {
    setJournalEntries([newEntry, ...journalEntries]);

    const totalDebits = newEntry.lines.reduce((s, l) => s + l.debitPaise, 0);
    recordAudit({
      actorId: 'usr-acc-1',
      actorName: 'Pradeep Joshi (Lead Accountant)',
      actorRole: 'ACCOUNTANT',
      action: 'FINANCIAL_POSTING',
      entityType: 'JOURNAL_ENTRY',
      entityId: newEntry.id,
      entityDisplay: `${newEntry.entryNumber} (Manual Voucher)`,
      description: `Manual double-entry voucher committed: "${newEntry.narration}". Total amount ₹${(totalDebits / 100).toLocaleString()}`,
      newState: {
        entryNumber: newEntry.entryNumber,
        referenceType: newEntry.referenceType,
        totalPaise: totalDebits,
        linesCount: newEntry.lines.length,
      },
    });
  };

  // Handler: Book listing from marketplace
  const handleBookListing = (listing: MarketplaceListing, rateRupees: number) => {
    const freightPaise = inrToPaise(rateRupees);
    const advancePaise = inrToPaise(Math.round(rateRupees * 0.4));
    const tripNum = `TRP-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    const newTrip: Trip = {
      id: `trip-${Date.now()}`,
      tenantId: activeTenant.id,
      branchId: activeBranchId,
      tripNumber: tripNum,
      vehicleId: listing.vehicleId,
      driverId: drivers[0]?.id || 'driver-1',
      primaryBrokerPartyId: parties.find((p) => p.roles.includes('BROKER'))?.id,
      vehicleOwnerPartyId: listing.ownerPartyId,
      originCity: listing.currentCity,
      destinationCity: listing.preferredDestination.split('/')[0].trim(),
      scheduledDeparture: 'Tomorrow 09:00 AM',
      totalAgreedFreightPaise: freightPaise,
      advancePayableToOwnerPaise: advancePaise,
      balancePayableToOwnerPaise: freightPaise - advancePaise,
      brokerCommissionPaise: inrToPaise(1500),
      status: 'PLANNED',
      fastagTollDeductionPaise: 0,
      dieselExpensePaise: 0,
      trackingToken: `trk_${tripNum.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      stops: [
        {
          id: `stop-${Date.now()}-1`,
          stopSequence: 1,
          stopName: `${listing.currentCity} Depot Loading`,
          locationName: `${listing.currentCity} Transport Nagar`,
          city: listing.currentCity,
          stopType: 'LOADING',
          scheduledEta: 'Tomorrow 09:00 AM',
          status: 'PENDING',
        },
        {
          id: `stop-${Date.now()}-2`,
          stopSequence: 2,
          stopName: `${listing.preferredDestination.split('/')[0].trim()} Unloading`,
          locationName: `${listing.preferredDestination.split('/')[0].trim()} Logistics Park`,
          city: listing.preferredDestination.split('/')[0].trim(),
          stopType: 'UNLOADING',
          scheduledEta: 'Day After 04:00 PM',
          status: 'PENDING',
        },
      ],
      notes: `Arranged via Spot Marketplace for ${listing.vehicleReg}.`,
    };

    handleAddTrip(newTrip);
  };

  const trackingModalTrip = trips.find((t) => t.trackingToken === activeTrackingToken) || trips[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* 1. Header (Strict 3-Zone Contract) */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => {
          setSelectedTripFilterForBilty(undefined);
          setActiveTab(tab);
        }}
        activeTenant={activeTenant}
        branches={branches}
        activeBranchId={activeBranchId}
        onBranchChange={setActiveBranchId}
        onOpenNewTripModal={() => setActiveTab('dispatch')}
        onOpenTenantModal={() => setShowTenantModal(true)}
      />

      {/* 2. Main Content Canvas */}
      <main className="flex-1 max-w-[1520px] w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'overview' && (
          <DashboardOverview
            trips={trips}
            vehicles={vehicles}
            drivers={drivers}
            lorryReceipts={lorryReceipts}
            parties={parties}
            journalEntries={journalEntries}
            onNavigateTab={setActiveTab}
            onOpenTrackingModal={setActiveTrackingToken}
            onOpenTripDetails={() => setActiveTab('dispatch')}
            onCreateLR={() => setActiveTab('bilty')}
            onDispatchTrip={() => setActiveTab('dispatch')}
            onPostJournal={() => setActiveTab('accounting')}
          />
        )}

        {activeTab === 'dispatch' && (
          <DispatchManagement
            trips={trips}
            vehicles={vehicles}
            drivers={drivers}
            parties={parties}
            lorryReceipts={lorryReceipts}
            onAddTrip={handleAddTrip}
            onUpdateTripStopStatus={handleUpdateTripStopStatus}
            onOpenTrackingModal={setActiveTrackingToken}
            onNavigateToBilty={(tripId) => {
              setSelectedTripFilterForBilty(tripId);
              setActiveTab('bilty');
            }}
          />
        )}

        {activeTab === 'bilty' && (
          <BiltyManager
            lorryReceipts={lorryReceipts}
            parties={parties}
            trips={trips}
            vehicles={vehicles}
            onAddLorryReceipt={handleAddLorryReceipt}
            onUpdatePodStatus={handleUpdatePodStatus}
            selectedTripIdFilter={selectedTripFilterForBilty}
          />
        )}

        {activeTab === 'accounting' && (
          <DoubleEntryAccounting
            parties={parties}
            accounts={accounts}
            journalEntries={journalEntries}
            onAddJournalEntry={handleAddJournalEntry}
          />
        )}

        {activeTab === 'telematics' && (
          <TelematicsSuite vehicles={vehicles} />
        )}

        {activeTab === 'parties' && (
          <PartyManager
            parties={parties}
            onAddParty={handleAddParty}
            onSelectPartyForLedger={(partyId) => {
              setSelectedPartyIdForLedger(partyId);
              setActiveTab('accounting');
            }}
          />
        )}

        {activeTab === 'fleet' && (
          <FleetManager
            vehicles={vehicles}
            drivers={drivers}
            parties={parties}
            onAddVehicle={(v) => setVehicles([v, ...vehicles])}
            onAddDriver={(d) => setDrivers([d, ...drivers])}
          />
        )}

        {activeTab === 'marketplace' && (
          <VehicleMarketplace
            parties={parties}
            onBookListing={handleBookListing}
          />
        )}

        {activeTab === 'audit' && (
          <AuditLogViewer logs={auditLogs} />
        )}
      </main>

      {/* 3. Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-6 px-4 sm:px-6 text-xs">
        <div className="max-w-[1520px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-white">VahanSetu 360</span>
            <span>·</span>
            <span>Enterprise Multi-Tenant Indian Transport Operating System</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500 font-mono text-[11px]">
            <span>Target: 100,000 Transits/Day</span>
            <span>·</span>
            <span>PostGIS · AIS-140 · Immutable Audit Vault</span>
          </div>
        </div>
      </footer>

      {/* 4. Modals */}
      {activeTrackingToken && (
        <CustomerTrackingModal
          trip={trackingModalTrip}
          vehicle={vehicles.find((v) => v.id === trackingModalTrip.vehicleId)}
          lorryReceipts={lorryReceipts}
          parties={parties}
          onClose={() => setActiveTrackingToken(null)}
        />
      )}

      {showTenantModal && (
        <TenantAdminModal
          currentTenant={activeTenant}
          branches={branches}
          onSelectTenant={(t) => {
            setActiveTenant(t);
            setShowTenantModal(false);
          }}
          onAddBranch={(b) => setBranches([...branches, b])}
          onClose={() => setShowTenantModal(false)}
        />
      )}
    </div>
  );
}
