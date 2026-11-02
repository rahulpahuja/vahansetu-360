/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * VahanSetu 360 — Domain Types & Data Models
 */

export type SubscriptionPlan = 'STARTER' | 'GROWTH' | 'ENTERPRISE' | 'UNLIMITED';

export interface Tenant {
  id: string;
  code: string;
  legalName: string;
  tradeName: string;
  subdomain: string;
  subscriptionPlan: SubscriptionPlan;
  status: 'ACTIVE' | 'SUSPENDED' | 'TRIAL';
  maxVehicles: number;
  maxUsers: number;
  activeVehiclesCount: number;
  activeTripsToday: number;
  monthlyBiltyCount: number;
  createdAt: string;
}

export interface Branch {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  city: string;
  state: string;
  gstin: string;
  isHeadOffice: boolean;
  contactPhone: string;
}

export type UserRole =
  | 'SUPER_ADMIN'
  | 'TENANT_ADMIN'
  | 'DISPATCHER'
  | 'ACCOUNTANT'
  | 'BROKER_AGENT'
  | 'DRIVER';

export interface User {
  id: string;
  tenantId: string;
  branchId?: string;
  email: string;
  phone: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
}

export type PartyRoleType =
  | 'CONSIGNOR'
  | 'CONSIGNEE'
  | 'BROKER'
  | 'MOTOR_OWNER'
  | 'TRANSPORTER'
  | 'SUB_BROKER';

export type TrustGrade = 'AAA' | 'AA' | 'A' | 'BBB' | 'HIGH_RISK';

export interface TrustScoreMetrics {
  overallScore: number; // 300 - 900 scale (or 0 - 100 percentage)
  grade: TrustGrade;
  paymentReliabilityScore: number; // 0 - 100
  avgPaymentDelayDays: number;
  onTimePaymentRatePct: number;
  statutoryComplianceScore: number; // 0 - 100
  gstinVerified: boolean;
  panVerified: boolean;
  sec194cDeclared: boolean;
  operationalTransparencyScore: number; // 0 - 100
  ais140GpsAdoptionPct: number;
  onTimePodTurnaroundPct: number;
  transitDisputeRatePct: number;
  recommendedMaxCreditPaise: number;
  recommendedMaxAdvancePct: number;
  riskFlags: string[];
}

export interface Party {
  id: string;
  tenantId: string;
  legalName: string;
  tradeName: string;
  pan: string;
  gstin?: string;
  roles: PartyRoleType[]; // Non-exclusive multi-role support
  tdsExemptionDeclared: boolean; // Section 194C (< 10 vehicles)
  creditLimitPaise: number; // Stored in paise (1 INR = 100 paise)
  paymentTermsDays: number;
  primaryContactName: string;
  primaryContactPhone: string;
  primaryContactEmail: string;
  billingAddress: string;
  city: string;
  state: string;
  stateCode: string; // 23 for MP, 27 for MH, etc.
  bankAccountNumber?: string;
  bankIfsc?: string;
  bankName?: string;
  motorMalikBankBeneficiary?: string; // Motor Malik payout beneficiary name
  verificationStatus: 'VERIFIED' | 'PENDING' | 'DOCS_EXPIRED';
  createdAt: string;
  establishmentDate?: string; // e.g. "2014-06-15" for Party Business Vintage
  tradeLicenseNo?: string;
  brokerageCommissionPct?: number; // e.g. 2.5% for Broker
  securityDepositPaise?: number;
  ownedFleetCount?: number; // for Motor Malik
  sec194cDeclarationDocUrl?: string; // Uploaded Section 194C(6) declaration copy
  trustScore?: TrustScoreMetrics;
}

export type VehicleCategory =
  | 'OPEN_TRUCK'
  | 'CONTAINER'
  | 'TRAILER'
  | 'TANKER'
  | 'LCV'
  | 'TIPPER';

export type VehicleOwnership = 'OWNED' | 'ATTACHED_MARKET' | 'BROKERED';

export type OperationalStatus =
  | 'AVAILABLE'
  | 'LOADING'
  | 'IN_TRANSIT'
  | 'UNLOADING'
  | 'MAINTENANCE'
  | 'HALTED';

export interface Vehicle {
  id: string;
  tenantId: string;
  registrationNo: string; // e.g. MP09SR4241
  category: VehicleCategory;
  capacityMt: number; // e.g. 12.0
  dimensions: {
    lengthFeet: number;
    widthFeet: number;
    heightFeet: number;
  };
  ownershipType: VehicleOwnership;
  ownerPartyId: string; // Motor owner entity (Motor Malik)
  currentDriverId?: string;
  manufactureYearMonth?: string; // e.g. "2021-03" for Vehicle Age
  chassisNumber?: string;
  engineNumber?: string;
  rcDocumentUrl?: string;
  rcExpiryDate: string;
  insurancePolicyNo?: string;
  insuranceCompany?: string;
  insuranceExpiryDate: string;
  insuranceDocUrl?: string;
  fitnessExpiryDate: string;
  fitnessDocUrl?: string;
  nationalPermitExpiry: string;
  pucExpiryDate: string;
  pucDocUrl?: string;
  fastagId?: string;
  gpsDeviceImei?: string;
  gpsInstalled: boolean;
  operationalStatus: OperationalStatus;
  currentCity: string;
  lastUpdated: string;
}

export type LicenseBadge =
  | 'HMV_TRANSPORT'
  | 'HAZARDOUS_GOODS'
  | 'HILL_TERRAIN'
  | 'LMV_COMMERCIAL';

export interface Driver {
  id: string;
  tenantId: string;
  fullName: string;
  phone: string;
  aadhaarNumber?: string; // e.g. "XXXX-XXXX-9821" or 12-digit
  aadhaarDocUrl?: string;
  licenseNumber: string;
  licenseExpiry: string;
  licenseDocUrl?: string;
  licenseBadge?: LicenseBadge;
  policeVerificationStatus?: 'VERIFIED' | 'PENDING' | 'REJECTED';
  bloodGroup?: 'O+' | 'O-' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-';
  dob?: string; // For age calculation
  yearsExperience?: number;
  currentVehicleId?: string;
  currentTripId?: string;
  emergencyContact: string;
  emergencyContactRelation?: string;
  photoUrl?: string;
  status: 'AVAILABLE' | 'ON_TRIP' | 'OFF_DUTY';
  totalTripsCompleted: number;
}

export type TripStatus =
  | 'PLANNED'
  | 'LOADING'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'SETTLED'
  | 'CANCELLED';

export interface TripStop {
  id: string;
  stopSequence: number;
  stopName: string;
  locationName: string;
  city: string;
  stopType: 'LOADING' | 'UNLOADING' | 'WAYPOINT';
  scheduledEta: string;
  actualArrival?: string;
  actualDeparture?: string;
  status: 'PENDING' | 'REACHED' | 'COMPLETED';
  packagesCount?: number;
  lrNumbers?: string[];
}

export interface Trip {
  id: string;
  tenantId: string;
  branchId: string;
  tripNumber: string; // e.g. TRP-2026-00412
  vehicleId: string;
  driverId: string;
  primaryBrokerPartyId?: string; // Broker who arranged load
  vehicleOwnerPartyId: string; // Motor owner (e.g. Ram)
  originCity: string;
  destinationCity: string;
  stops: TripStop[];
  scheduledDeparture: string;
  actualDeparture?: string;
  actualCompletion?: string;
  totalAgreedFreightPaise: number; // ₹50,000.00 = 5000000 paise
  advancePayableToOwnerPaise: number;
  balancePayableToOwnerPaise: number;
  brokerCommissionPaise: number;
  status: TripStatus;
  fastagTollDeductionPaise: number;
  dieselExpensePaise: number;
  trackingToken: string;
  notes?: string;
}

export type PaymentTerms = 'PAID' | 'TO_PAY' | 'TO_BE_BILLED';
export type PodStatus = 'PENDING' | 'UPLOADED' | 'VERIFIED' | 'REJECTED';

export interface LorryReceipt {
  id: string;
  tenantId: string;
  tripId: string;
  lrNumber: string; // e.g. LR-IND-2026-0981
  lrDate: string;
  consignorPartyId: string; // Sender
  consigneePartyId: string; // Receiver
  billingPartyId: string; // Party charged for freight
  handlingBrokerPartyId?: string;
  deliveryStopId?: string;
  goodsDescription: string;
  packageCount: number;
  packageType: 'CARTONS' | 'BAGS' | 'DRUMS' | 'PALLETS' | 'CRATES' | 'ROLLS';
  actualWeightKg: number;
  chargeableWeightKg: number;
  freightPaise: number;
  loadingChargesPaise: number;
  unloadingChargesPaise: number;
  statisticalChargesPaise: number;
  totalLrAmountPaise: number;
  advanceReceivedPaise: number;
  balanceReceivablePaise: number;
  paymentTerms: PaymentTerms;
  podStatus: PodStatus;
  podDocumentUrl?: string;
  podUploadedAt?: string;
  deliveryStatus: 'AT_ORIGIN' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
}

export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE';

export interface ChartOfAccount {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  accountType: AccountType;
  partyId?: string; // Sub-ledger link
}

export interface JournalLine {
  id: string;
  accountId: string;
  partyId?: string;
  debitPaise: number;
  creditPaise: number;
  description?: string;
}

export interface JournalEntry {
  id: string;
  tenantId: string;
  entryNumber: string; // e.g. JE-2026-00104
  entryDate: string;
  referenceType:
    | 'TRIP_FREIGHT'
    | 'BILTY_BILLING'
    | 'ADVANCE_PAYMENT'
    | 'DIESEL_EXPENSE'
    | 'BROKER_COMMISSION'
    | 'BALANCE_SETTLEMENT'
    | 'TDS_ENTRY';
  referenceId: string;
  narration: string;
  isPosted: boolean;
  lines: JournalLine[];
  createdAt: string;
}

export interface AIS140Packet {
  header: string; // $PVT
  imei: string;
  packetType: string;
  timestamp: string; // YYYYMMDDHHMMSS
  latitude: number;
  longitude: number;
  speedKmh: number;
  headingDeg: number;
  ignitionOn: boolean;
  gpsFix: boolean;
  batteryVoltage: number;
  panicAlert: boolean;
  checksumValid: boolean;
  rawString: string;
}

export type TelematicsEventType =
  | 'NORMAL'
  | 'HARSH_BRAKING'
  | 'OVERSPEEDING'
  | 'IDLE_HALT'
  | 'TOLL_PLAZA'
  | 'STOP_DELIVERY';

export interface TelematicsPoint {
  id: string;
  vehicleId: string;
  recordedAt: string;
  latitude: number;
  longitude: number;
  speedKmh: number;
  headingDeg: number;
  ignitionOn: boolean;
  locationName: string;
  stoppageMinutes?: number;
  eventType?: TelematicsEventType;
  eventDescription?: string;
  brakePressurePsi?: number;
  accelerationG?: number;
  rpm?: number;
  fuelLevelPct?: number;
  elevationM?: number;
}

export interface TrackingSession {
  id: string;
  tripId: string;
  token: string;
  expiresAt: string;
  isRevoked: boolean;
  viewCount: number;
}

export interface MarketplaceListing {
  id: string;
  vehicleId: string;
  vehicleReg: string;
  vehicleType: VehicleCategory;
  capacityMt: number;
  currentCity: string;
  preferredDestination: string;
  availableFrom: string;
  ownerPartyId: string;
  ownerName: string;
  ownerPhone: string;
  baseRatePerKmPaise: number;
  verificationBadge: boolean;
}

export interface CapacityMetrics {
  dailyTransitsTarget: number;
  peakConcurrentMovingVehicles: number;
  peakGpsPingsPerSec: number;
  dailyGpsPingsTotal: number;
  dailyStorageCompressedGb: number;
  kafkaPartitionCount: number;
  redisMemoryRequiredGb: number;
  ingestionBandwidthMbps: number;
}

export type AuditActionType =
  | 'FINANCIAL_POSTING'
  | 'PARTY_REGISTERED'
  | 'PARTY_UPDATED'
  | 'TRIP_DISPATCHED'
  | 'TRIP_STATUS_CHANGED'
  | 'STOP_UPDATED'
  | 'BILTY_ISSUED'
  | 'POD_VERIFIED'
  | 'TENANT_MODIFIED';

export type AuditEntityType =
  | 'JOURNAL_ENTRY'
  | 'PARTY'
  | 'TRIP'
  | 'LORRY_RECEIPT'
  | 'TENANT'
  | 'VEHICLE';

export interface AuditLogEntry {
  id: string;
  tenantId: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: AuditActionType;
  entityType: AuditEntityType;
  entityId: string;
  entityDisplay: string;
  description: string;
  previousState?: Record<string, any>;
  newState: Record<string, any>;
  ipAddress: string;
  previousHash: string;
  currentHash: string;
}

