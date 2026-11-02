/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * VahanSetu 360 — Capacity Planning & Telematics High-Throughput Engine
 * Real-world mathematical modeling for 100,000 daily transits.
 */

import { CapacityMetrics } from '../types/logistics';

export function calculateFleetCapacityMetrics(dailyTransits: number = 100000): CapacityMetrics {
  // Assumptions grounded in Indian long-haul / regional road transport:
  // Average trip transit duration = 18 hours
  const avgTripHours = 18;
  const activeConcurrentVehicles = Math.round((dailyTransits * avgTripHours) / 24); // 75,000
  const movingRatio = 0.8; // 80% moving on highways, 20% stopped/loading
  const peakConcurrentMoving = Math.round(activeConcurrentVehicles * movingRatio); // 60,000
  const haltedVehicles = activeConcurrentVehicles - peakConcurrentMoving; // 15,000

  // AIS-140 ping intervals: 10s moving, 60s halted
  const movingPingsPerSec = peakConcurrentMoving / 10; // 6,000 pings/s
  const haltedPingsPerSec = haltedVehicles / 60; // 250 pings/s
  const peakGpsPingsPerSec = Math.round((movingPingsPerSec + haltedPingsPerSec) * 1.2); // 7,500 with burst margin

  // Daily total pings: (60,000 * 360 pings/hr * 18 hrs) + (15,000 * 60 pings/hr * 24 hrs)
  const dailyPingsTotal = Math.round(
    peakConcurrentMoving * 360 * avgTripHours + haltedVehicles * 60 * 24
  ); // ~410M - 540M pings

  // Storage: ~200 bytes per uncompressed JSON/binary ping
  // TimescaleDB / Parquet compression delivers ~92% ratio (delta-of-delta time + Gorillas/ZSTD float compression)
  const uncompressedGb = (dailyPingsTotal * 200) / (1024 * 1024 * 1024);
  const dailyStorageCompressedGb = parseFloat((uncompressedGb * 0.08).toFixed(2)); // ~8.6 GB/day

  // Kafka partitions: 32 partitions partitioned by vehicle_id ensures zero consumer contention
  const kafkaPartitionCount = 32;

  // Redis memory: 75,000 active vehicles * ~400 bytes per HSET = ~30MB live vehicle state cache + geospatial index
  const redisMemoryRequiredGb = 4; // Generous 4GB cluster footprint for live telemetry + geofence sets

  // Network bandwidth: 7,500 msg/s * 200 bytes = 1.5 MB/s = 12 Mbps sustained
  const ingestionBandwidthMbps = parseFloat(((peakGpsPingsPerSec * 200 * 8) / (1000 * 1000)).toFixed(1));

  return {
    dailyTransitsTarget: dailyTransits,
    peakConcurrentMovingVehicles: peakConcurrentMoving,
    peakGpsPingsPerSec,
    dailyGpsPingsTotal: dailyPingsTotal,
    dailyStorageCompressedGb,
    kafkaPartitionCount,
    redisMemoryRequiredGb,
    ingestionBandwidthMbps,
  };
}
