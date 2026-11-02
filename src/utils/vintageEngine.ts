/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * VahanSetu 360 — Vehicle Age & Party Business Vintage Calculation Engine
 * Compliant with Indian Central Motor Vehicles Rules (CMVR) & Enterprise KYC
 */

export interface VehicleAgeAnalysis {
  years: number;
  months: number;
  totalMonths: number;
  formattedAge: string;
  emissionNorm: 'BS-VI' | 'BS-IV' | 'BS-III' | 'PRE-BS';
  fitnessCycle: 'ANNUAL' | 'BIENNIAL' | 'GREEN_TAX_RENEWAL';
  isOver15Years: boolean;
  complianceBadge: string;
  regulatoryNotice: string;
}

export interface PartyVintageAnalysis {
  yearsInBusiness: number;
  monthsInBusiness: number;
  formattedVintage: string;
  entityTier: 'VETERAN' | 'ESTABLISHED' | 'GROWTH' | 'EMERGING';
  tierLabel: string;
  creditRiskWeight: number; // 0.85 (veteran) to 1.30 (emerging risk)
}

/**
 * Calculates vehicle age based on manufacture year/month or registration date.
 * Under CMVR:
 * - Commercial transport vehicles up to 8 years have 2-year fitness certificates.
 * - After 8 years, annual fitness testing is mandatory.
 * - At 15 years, commercial vehicles face green tax, higher fitness scrutiny, or scrappage mandates in key states.
 */
export function calculateVehicleAge(
  dateStr: string,
  referenceDate = new Date('2026-11-02T12:00:00Z')
): VehicleAgeAnalysis {
  if (!dateStr) {
    return {
      years: 0,
      months: 0,
      totalMonths: 0,
      formattedAge: 'Unknown',
      emissionNorm: 'BS-VI',
      fitnessCycle: 'BIENNIAL',
      isOver15Years: false,
      complianceBadge: 'Standard Fleet',
      regulatoryNotice: 'Manufacture date not documented.',
    };
  }

  const parts = dateStr.split('-');
  const year = parseInt(parts[0], 10);
  const month = parts[1] ? parseInt(parts[1], 10) - 1 : 0;
  const mfgDate = new Date(year, month, 1);

  let totalMonths =
    (referenceDate.getFullYear() - mfgDate.getFullYear()) * 12 +
    (referenceDate.getMonth() - mfgDate.getMonth());

  if (totalMonths < 0) totalMonths = 0;

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const formattedAge = years > 0 ? `${years}.${Math.round((months / 12) * 10)} Years` : `${months} Months`;

  // Emission Norm deduction under Indian MoRTH timeline:
  // BS-VI: April 2020 onwards
  // BS-IV: April 2010 to March 2020
  // BS-III: April 2005 to March 2010
  let emissionNorm: 'BS-VI' | 'BS-IV' | 'BS-III' | 'PRE-BS' = 'BS-VI';
  if (year >= 2020 && (year > 2020 || month >= 3)) {
    emissionNorm = 'BS-VI';
  } else if (year >= 2010) {
    emissionNorm = 'BS-IV';
  } else if (year >= 2005) {
    emissionNorm = 'BS-III';
  } else {
    emissionNorm = 'PRE-BS';
  }

  const isOver15Years = years >= 15;
  let fitnessCycle: 'ANNUAL' | 'BIENNIAL' | 'GREEN_TAX_RENEWAL' = 'BIENNIAL';
  let complianceBadge = 'BS-VI Prime';
  let regulatoryNotice = 'Eligible for unrestricted All-India National Goods Permit.';

  if (isOver15Years) {
    fitnessCycle = 'GREEN_TAX_RENEWAL';
    complianceBadge = '15+ Yr Green Tax';
    regulatoryNotice =
      'CMVR Section 52 Scrutiny: Mandatory Green Tax levy and semi-annual fitness inspection required.';
  } else if (years >= 8) {
    fitnessCycle = 'ANNUAL';
    complianceBadge = `${emissionNorm} (Annual Fitness)`;
    regulatoryNotice = 'Annual automated fitness testing mandated at authorized RTO testing station.';
  } else {
    fitnessCycle = 'BIENNIAL';
    complianceBadge = `${emissionNorm} Modern`;
  }

  return {
    years,
    months,
    totalMonths,
    formattedAge,
    emissionNorm,
    fitnessCycle,
    isOver15Years,
    complianceBadge,
    regulatoryNotice,
  };
}

/**
 * Calculates business vintage for shippers, brokers, and motor maliks.
 */
export function calculatePartyVintage(
  establishmentDateStr?: string,
  referenceDate = new Date('2026-11-02T12:00:00Z')
): PartyVintageAnalysis {
  if (!establishmentDateStr) {
    return {
      yearsInBusiness: 3,
      monthsInBusiness: 0,
      formattedVintage: '3+ Years',
      entityTier: 'GROWTH',
      tierLabel: 'Established Entity',
      creditRiskWeight: 1.05,
    };
  }

  const est = new Date(establishmentDateStr);
  let totalMonths =
    (referenceDate.getFullYear() - est.getFullYear()) * 12 +
    (referenceDate.getMonth() - est.getMonth());
  if (totalMonths < 0) totalMonths = 0;

  const yearsInBusiness = Math.floor(totalMonths / 12);
  const monthsInBusiness = totalMonths % 12;

  let entityTier: 'VETERAN' | 'ESTABLISHED' | 'GROWTH' | 'EMERGING' = 'GROWTH';
  let tierLabel = 'Growth Transporter';
  let creditRiskWeight = 1.0;

  if (yearsInBusiness >= 10) {
    entityTier = 'VETERAN';
    tierLabel = 'Tier-1 Veteran (10+ Yrs)';
    creditRiskWeight = 0.85;
  } else if (yearsInBusiness >= 5) {
    entityTier = 'ESTABLISHED';
    tierLabel = 'Established Business (5-9 Yrs)';
    creditRiskWeight = 0.95;
  } else if (yearsInBusiness >= 2) {
    entityTier = 'GROWTH';
    tierLabel = 'Growth Enterprise (2-4 Yrs)';
    creditRiskWeight = 1.1;
  } else {
    entityTier = 'EMERGING';
    tierLabel = 'Emerging Party (< 2 Yrs)';
    creditRiskWeight = 1.3;
  }

  const formattedVintage =
    yearsInBusiness >= 1
      ? `${yearsInBusiness} ${yearsInBusiness === 1 ? 'Year' : 'Years'} in Business`
      : `${monthsInBusiness} Months in Business`;

  return {
    yearsInBusiness,
    monthsInBusiness,
    formattedVintage,
    entityTier,
    tierLabel,
    creditRiskWeight,
  };
}
