/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * VahanSetu 360 — AIS-140 Protocol Parser & Packet Decoder
 * Standard Indian automotive intelligence protocol specification.
 */

import { AIS140Packet } from '../types/logistics';

/**
 * Calculates XOR checksum for an AIS-140 / NMEA sentence
 * In AIS-140, characters between '$' and '*' are XORed together.
 */
export function calculateAis140Checksum(payload: string): string {
  // Strip leading '$' and trailing '*..' if present
  let clean = payload;
  if (clean.startsWith('$')) {
    clean = clean.substring(1);
  }
  const starIndex = clean.indexOf('*');
  if (starIndex !== -1) {
    clean = clean.substring(0, starIndex);
  }

  let checksum = 0;
  for (let i = 0; i < clean.length; i++) {
    checksum ^= clean.charCodeAt(i);
  }

  return checksum.toString(16).toUpperCase().padStart(2, '0');
}

/**
 * Parse a raw AIS-140 `$PVT` packet string
 * Example:
 * "$PVT,759709824950,1,20261102040500,22.7196,75.8577,54.2,185,1,1,4.1,0,A*4D"
 */
export function parseAis140Packet(rawString: string): AIS140Packet | null {
  try {
    const trimmed = rawString.trim();
    if (!trimmed.startsWith('$PVT')) {
      return null;
    }

    const starIndex = trimmed.lastIndexOf('*');
    let checksumValid = false;
    let expectedChecksum = '';

    if (starIndex !== -1 && starIndex < trimmed.length - 1) {
      expectedChecksum = trimmed.substring(starIndex + 1).trim();
      const payloadToCheck = trimmed.substring(1, starIndex);
      const calculated = calculateAis140Checksum(payloadToCheck);
      checksumValid = calculated.toUpperCase() === expectedChecksum.toUpperCase();
    }

    const payloadPart = starIndex !== -1 ? trimmed.substring(0, starIndex) : trimmed;
    const tokens = payloadPart.split(',');

    if (tokens.length < 11) {
      return null;
    }

    // tokens:
    // 0: Header ($PVT)
    // 1: IMEI (e.g. 759709824950)
    // 2: Packet Type (e.g. 1 = Live Periodic, 2 = History, 3 = Alert)
    // 3: Timestamp (YYYYMMDDHHMMSS)
    // 4: Latitude (e.g. 22.7196)
    // 5: Longitude (e.g. 75.8577)
    // 6: Speed in km/h (e.g. 54.2)
    // 7: Heading in degrees (e.g. 185)
    // 8: Ignition (1 = ON, 0 = OFF)
    // 9: GPS Fix (1 = Valid, 0 = Invalid)
    // 10: Battery Voltage (e.g. 4.1 or 24.2)
    // 11: Emergency/Panic alert (optional, 0 = Normal, 1 = Panic)

    const imei = tokens[1];
    const packetType = tokens[2];
    const timestamp = tokens[3];
    const latitude = parseFloat(tokens[4]);
    const longitude = parseFloat(tokens[5]);
    const speedKmh = parseFloat(tokens[6]) || 0;
    const headingDeg = parseFloat(tokens[7]) || 0;
    const ignitionOn = tokens[8] === '1';
    const gpsFix = tokens[9] === '1';
    const batteryVoltage = parseFloat(tokens[10]) || 0;
    const panicAlert = tokens[11] === '1';

    return {
      header: tokens[0],
      imei,
      packetType,
      timestamp,
      latitude,
      longitude,
      speedKmh,
      headingDeg,
      ignitionOn,
      gpsFix,
      batteryVoltage,
      panicAlert,
      checksumValid,
      rawString: trimmed,
    };
  } catch {
    return null;
  }
}

/**
 * Generate a valid AIS-140 string from parameters with correct XOR checksum
 */
export function generateAis140PacketString(params: {
  imei: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  speedKmh: number;
  headingDeg: number;
  ignitionOn: boolean;
  batteryVoltage?: number;
  panicAlert?: boolean;
}): string {
  const body = [
    'PVT',
    params.imei,
    '1',
    params.timestamp,
    params.latitude.toFixed(4),
    params.longitude.toFixed(4),
    params.speedKmh.toFixed(1),
    Math.round(params.headingDeg).toString(),
    params.ignitionOn ? '1' : '0',
    '1',
    (params.batteryVoltage || 12.6).toFixed(1),
    params.panicAlert ? '1' : '0',
  ].join(',');

  const checksum = calculateAis140Checksum(body);
  return `$${body}*${checksum}`;
}
