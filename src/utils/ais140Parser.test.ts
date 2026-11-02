/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Unit tests for AIS-140 Protocol Parser & Checksum Generator
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateAis140Checksum,
  generateAis140PacketString,
  parseAis140Packet,
} from './ais140Parser';

test('calculateAis140Checksum generates valid XOR 2-char hex', () => {
  const sentence = 'PVT,759709824950,1,20261102040500,22.7196,75.8577,54.2,185,1,1,12.6,0';
  const checksum = calculateAis140Checksum(sentence);
  assert.equal(typeof checksum, 'string');
  assert.equal(checksum.length, 2);
});

test('generateAis140PacketString and parseAis140Packet round-trip accurately', () => {
  const rawPacket = generateAis140PacketString({
    imei: '862045051234567',
    timestamp: '20261102083000',
    latitude: 22.7196,
    longitude: 75.8577,
    speedKmh: 58.5,
    headingDeg: 190,
    ignitionOn: true,
    batteryVoltage: 24.1,
    panicAlert: false,
  });

  assert.ok(rawPacket.startsWith('$PVT'));
  assert.ok(rawPacket.includes('*'));

  const parsed = parseAis140Packet(rawPacket);
  assert.ok(parsed !== null);
  assert.equal(parsed?.imei, '862045051234567');
  assert.equal(parsed?.latitude, 22.7196);
  assert.equal(parsed?.longitude, 75.8577);
  assert.equal(parsed?.speedKmh, 58.5);
  assert.equal(parsed?.ignitionOn, true);
  assert.equal(parsed?.checksumValid, true);
});

test('parseAis140Packet detects corrupted checksum', () => {
  const corruptedPacket = '$PVT,862045051234567,1,20261102083000,22.7196,75.8577,58.5,190,1,1,24.1,0*FF';
  const parsed = parseAis140Packet(corruptedPacket);
  assert.ok(parsed !== null);
  assert.equal(parsed?.checksumValid, false);
});
