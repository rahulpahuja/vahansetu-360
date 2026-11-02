/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * VahanSetu 360 — Triple Telematics Engine & AIS-140 Live Replay
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Radio,
  Play,
  Pause,
  RotateCcw,
  Navigation,
  Compass,
  Zap,
  Smartphone,
  Terminal,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Activity,
  Send,
  CloudOff,
  Cloud,
} from 'lucide-react';
import { TelematicsPoint, Vehicle } from '../types/logistics';
import { SEED_TELEMATICS_POINTS } from '../data/seedData';
import {
  generateAis140PacketString,
  parseAis140Packet,
} from '../utils/ais140Parser';
import { calculateFleetCapacityMetrics } from '../utils/capacityEngine';
import { OpenStreetMapPlayback } from './OpenStreetMapPlayback';

interface TelematicsSuiteProps {
  vehicles: Vehicle[];
}

export const TelematicsSuite: React.FC<TelematicsSuiteProps> = ({ vehicles }) => {
  const [activeEngineTab, setActiveEngineTab] = useState<'map' | 'ais140' | 'driver'>('map');
  const [mapSubMode, setMapSubMode] = useState<'osm' | 'schematic'>('osm');
  const capacity = calculateFleetCapacityMetrics(100000);

  // --- ENGINE 1: HISTORICAL REPLAY & LIVE MAP ---
  const [currentPointIndex, setCurrentPointIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const points = SEED_TELEMATICS_POINTS;
  const currentPoint = points[currentPointIndex] || points[0];

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentPointIndex((prev) => {
          if (prev >= points.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 2000 / playbackSpeed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, points.length]);

  // --- ENGINE 2: AIS-140 PACKET DECODER & HIGH-THROUGHPUT STREAM ---
  const [simulatedPackets, setSimulatedPackets] = useState<string[]>([]);
  const [customAisPacket, setCustomAisPacket] = useState(
    '$PVT,862045051234567,1,20261102114500,20.2589,74.2412,61.2,210,1,1,24.2,0*47'
  );
  const decodedResult = parseAis140Packet(customAisPacket);

  // Stream simulator interval
  useEffect(() => {
    const streamInterval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toISOString().replace(/[-:T]/g, '').substring(0, 14);
      const randomLat = 20.2589 + (Math.random() - 0.5) * 0.05;
      const randomLon = 74.2412 + (Math.random() - 0.5) * 0.05;
      const speed = Math.round(45 + Math.random() * 25);
      const packet = generateAis140PacketString({
        imei: '862045051234567',
        timestamp: timeStr,
        latitude: randomLat,
        longitude: randomLon,
        speedKmh: speed,
        headingDeg: 210,
        ignitionOn: true,
      });

      setSimulatedPackets((prev) => [packet, ...prev.slice(0, 14)]);
    }, 1500);

    return () => clearInterval(streamInterval);
  }, []);

  // --- ENGINE 3: DRIVER SMARTPHONE BEACON & OFFLINE QUEUE ---
  const [driverBeaconActive, setDriverBeaconActive] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);
  const [bufferedPointsCount, setBufferedPointsCount] = useState(0);

  useEffect(() => {
    let interval: any;
    if (driverBeaconActive) {
      interval = setInterval(() => {
        if (offlineMode) {
          setBufferedPointsCount((c) => c + 1);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [driverBeaconActive, offlineMode]);

  const handleSyncOfflineQueue = () => {
    setOfflineMode(false);
    setBufferedPointsCount(0);
  };

  // Convert GPS Coordinates (Lat/Lon) to SVG Canvas space (NH-52 corridor)
  // Latitude spans from Indore (~22.72) down to Nashik (~20.00)
  // Longitude spans from ~73.78 to ~75.86
  const getSvgCoordinates = (lat: number, lon: number) => {
    const minLat = 19.8;
    const maxLat = 22.9;
    const minLon = 73.6;
    const maxLon = 76.0;

    const x = ((lon - minLon) / (maxLon - minLon)) * 640 + 60;
    // Invert Y because Latitude increases going north
    const y = ((maxLat - lat) / (maxLat - minLat)) * 360 + 40;
    return { x, y };
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with 3 Telematics Modes */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-display font-bold text-white tracking-tight">
            High-Throughput Telematics & Live Fleet Replay
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Engineered for 100,000 daily transits, AIS-140 automotive protocol ingestion, and offline driver telemetry.
          </p>
        </div>

        {/* Engine Mode Tabs */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveEngineTab('map')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeEngineTab === 'map'
                ? 'bg-slate-800 text-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            Live Highway Map & Replay
          </button>
          <button
            onClick={() => setActiveEngineTab('ais140')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeEngineTab === 'ais140'
                ? 'bg-slate-800 text-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            AIS-140 Packet Ingestion
          </button>
          <button
            onClick={() => setActiveEngineTab('driver')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeEngineTab === 'driver'
                ? 'bg-slate-800 text-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Driver App Beacon & Sync
          </button>
        </div>
      </div>

      {/* MODE 1: LIVE MAP & REPLAY */}
      {activeEngineTab === 'map' && (
        <div className="space-y-4">
          {/* Sub-mode Toggle */}
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Map View Engine:</span>
              <div className="inline-flex rounded-lg p-0.5 bg-slate-900 border border-slate-800 text-xs">
                <button
                  onClick={() => setMapSubMode('osm')}
                  className={`px-3 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                    mapSubMode === 'osm'
                      ? 'bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Navigation className="w-3.5 h-3.5" />
                  OpenStreetMap (GIS & Harsh Braking Events)
                </button>
                <button
                  onClick={() => setMapSubMode('schematic')}
                  className={`px-3 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                    mapSubMode === 'schematic'
                      ? 'bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  Vector Schematic Corridor
                </button>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>NH-52 Transit: MP09SR4241</span>
            </div>
          </div>

          {mapSubMode === 'osm' ? (
            <OpenStreetMapPlayback vehicleReg="MP09SR4241" points={points} />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: Interactive Canvas Map (8 cols) */}
              <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
                {/* Map Canvas Header */}
                <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-semibold text-white">
                      Corridor: NH-52 (Agra–Mumbai National Highway)
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                      MP09SR4241 In Transit
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400">
                    Indore (MP) ➔ Dhule ➔ Malegaon ➔ Nashik (MH)
                  </div>
                </div>

              {/* Map SVG Projection */}
              <div className="relative bg-[#070b14] p-4 flex-1 min-h-[440px] flex items-center justify-center overflow-hidden">
                {/* SVG Route Line */}
                <svg
                  viewBox="0 0 760 440"
                  className="w-full h-full max-h-[440px]"
                  style={{ filter: 'drop-shadow(0px 0px 8px rgba(16, 185, 129, 0.15))' }}
                >
                  {/* Grid Lines */}
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />

                  {/* Route Polyline (Indore to Nashik) */}
                  <polyline
                    fill="none"
                    stroke="#334155"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={points
                      .map((p) => {
                        const { x, y } = getSvgCoordinates(p.latitude, p.longitude);
                        return `${x},${y}`;
                      })
                      .join(' ')}
                  />

                  {/* Traveled Green Trace */}
                  <polyline
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="4 2"
                    points={points
                      .slice(0, currentPointIndex + 1)
                      .map((p) => {
                        const { x, y } = getSvgCoordinates(p.latitude, p.longitude);
                        return `${x},${y}`;
                      })
                      .join(' ')}
                  />

                  {/* Highway Waypoints */}
                  {points.map((p, idx) => {
                    const { x, y } = getSvgCoordinates(p.latitude, p.longitude);
                    const isStop = p.stoppageMinutes && p.stoppageMinutes > 0;
                    const isCurrent = idx === currentPointIndex;

                    return (
                      <g key={p.id}>
                        <circle
                          cx={x}
                          cy={y}
                          r={isStop ? 6 : 4}
                          fill={isStop ? '#F59E0B' : '#64748B'}
                          stroke="#0B0F19"
                          strokeWidth="2"
                        />
                        <text
                          x={x + 10}
                          y={y + 4}
                          fill="#94A3B8"
                          fontSize="10"
                          fontFamily="DM Sans"
                          fontWeight="500"
                        >
                          {p.locationName.split('(')[0].trim()}
                        </text>
                      </g>
                    );
                  })}

                  {/* Current Moving Truck Icon Marker */}
                  {(() => {
                    const { x, y } = getSvgCoordinates(
                      currentPoint.latitude,
                      currentPoint.longitude
                    );
                    return (
                      <g transform={`translate(${x}, ${y})`}>
                        {/* Pulse Ring */}
                        <circle
                          r="18"
                          fill="none"
                          stroke="#10B981"
                          strokeWidth="1.5"
                          opacity="0.6"
                          className="animate-ping"
                        />
                        {/* Marker Badge */}
                        <circle r="11" fill="#10B981" stroke="#0B0F19" strokeWidth="2.5" />
                        <path
                          d="M -4 -4 L 4 0 L -4 4 Z"
                          fill="#022c22"
                          transform={`rotate(${currentPoint.headingDeg})`}
                        />
                      </g>
                    );
                  })()}
                </svg>

                {/* Live HUD Overlay */}
                <div className="absolute top-4 right-4 bg-slate-900/90 border border-slate-800 p-3 rounded-lg text-xs font-mono space-y-1 shadow-lg backdrop-blur-md">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-sans">
                    Live Telemetry HUD
                  </div>
                  <div className="text-white font-bold">
                    Vehicle: MP09SR4241
                  </div>
                  <div className="text-emerald-400">
                    Speed: {currentPoint.speedKmh} km/h
                  </div>
                  <div className="text-slate-300">
                    Ignition: {currentPoint.ignitionOn ? 'ON' : 'OFF'}
                  </div>
                  <div className="text-slate-400">
                    Heading: {currentPoint.headingDeg}°
                  </div>
                </div>
              </div>

              {/* Playback Scrubber & Speed Controls */}
              <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-2 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-semibold transition-colors"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => {
                      setIsPlaying(false);
                      setCurrentPointIndex(0);
                    }}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    title="Rewind to Start"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  {/* Speed Multipliers */}
                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
                    {[1, 2, 5].map((spd) => (
                      <button
                        key={spd}
                        onClick={() => setPlaybackSpeed(spd)}
                        className={`px-2 py-0.5 rounded font-mono font-bold transition-colors ${
                          playbackSpeed === spd
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Scrubber Range */}
                <div className="flex-1 max-w-md flex items-center gap-3 text-xs font-mono text-slate-400">
                  <span>Start</span>
                  <input
                    type="range"
                    min={0}
                    max={points.length - 1}
                    value={currentPointIndex}
                    onChange={(e) => setCurrentPointIndex(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <span>Stop {points.length}</span>
                </div>

                <div className="text-xs font-mono text-slate-300 whitespace-nowrap">
                  {currentPoint.recordedAt}
                </div>
              </div>
            </div>

            {/* Right: Point Details & Stoppage Analysis (4 cols) */}
            <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800">
                Transit Milestone & Stoppage Details
              </h2>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 text-xs font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Current Location</span>
                  <span className="font-bold text-white font-sans text-sm block mt-0.5">
                    {currentPoint.locationName}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                  <div>
                    <span className="text-slate-500 block text-[10px]">GPS Coordinates</span>
                    <span className="text-slate-300">
                      {currentPoint.latitude.toFixed(4)}, {currentPoint.longitude.toFixed(4)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Current Velocity</span>
                    <span className="text-emerald-400 font-bold">
                      {currentPoint.speedKmh} km/h
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-slate-500 block text-[10px]">Stoppage Status</span>
                  {currentPoint.stoppageMinutes ? (
                    <div className="flex items-center gap-2 mt-1 text-amber-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Halted for {currentPoint.stoppageMinutes} minutes (Unloading Consignments)</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-1 text-emerald-400">
                      <Zap className="w-3.5 h-3.5" />
                      <span>Cruising on National Highway</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Waypoints Sequence List */}
              <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1 text-xs">
                {points.map((pt, idx) => (
                  <div
                    key={pt.id}
                    onClick={() => setCurrentPointIndex(idx)}
                    className={`p-2.5 rounded-lg border cursor-pointer transition-colors ${
                      idx === currentPointIndex
                        ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                        : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white truncate max-w-[200px]">
                        {pt.locationName.split('(')[0]}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500">
                        {pt.recordedAt.split(' ')[1]} {pt.recordedAt.split(' ')[2]}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono mt-1 text-slate-400 flex justify-between">
                      <span>Speed: {pt.speedKmh} km/h</span>
                      {pt.stoppageMinutes && (
                        <span className="text-amber-400 font-bold">Stop: {pt.stoppageMinutes}m</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    )}

      {/* MODE 2: AIS-140 PROTOCOL PARSER & INGESTION SIMULATOR */}
      {activeEngineTab === 'ais140' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Interactive Packet Inspector (6 cols) */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="pb-3 border-b border-slate-800">
              <h2 className="text-base font-display font-bold text-white">
                AIS-140 Sentence Decoder & Checksum Verifier
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Inspect raw $PVT string according to Indian automotive standards. Validates 2-byte XOR parity.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-300">
                Raw AIS-140 Packet Sentence:
              </label>
              <textarea
                rows={3}
                value={customAisPacket}
                onChange={(e) => setCustomAisPacket(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Decoded Field Representation */}
            {decodedResult ? (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-400 font-sans">Checksum Verification:</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                      decodedResult.checksumValid
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}
                  >
                    {decodedResult.checksumValid ? '✓ Valid Checksum' : '✕ Checksum Mismatch'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Device IMEI:</span>
                    <span className="text-white font-bold">{decodedResult.imei}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">GPS Fix Status:</span>
                    <span className="text-emerald-400 font-bold">
                      {decodedResult.gpsFix ? '3D Fix Acquired' : 'No Fix'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Latitude / Longitude:</span>
                    <span className="text-slate-200">
                      {decodedResult.latitude}, {decodedResult.longitude}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Speed & Heading:</span>
                    <span className="text-emerald-400">
                      {decodedResult.speedKmh} km/h · {decodedResult.headingDeg}°
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Ignition Status:</span>
                    <span className="text-slate-200">
                      {decodedResult.ignitionOn ? 'ON (Engine Running)' : 'OFF'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Battery Voltage:</span>
                    <span className="text-slate-200">{decodedResult.batteryVoltage}V</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
                Invalid packet structure. Sentence must begin with $PVT and contain valid comma-separated tokens.
              </div>
            )}
          </div>

          {/* Right: Simulated High-Throughput Stream Terminal (6 cols) */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <h2 className="text-base font-display font-bold text-white">
                  Live Gateway Ingestion Stream
                </h2>
              </div>
              <span className="text-xs font-mono text-emerald-400">
                Peak: {capacity.peakGpsPingsPerSec.toLocaleString()} msg/sec
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Simulating TCP/UDP ingestion socket handling AIS-140 bursts from moving vehicles.
            </p>

            <div className="bg-black/90 p-4 rounded-xl border border-slate-800 h-[340px] overflow-y-auto font-mono text-[11px] space-y-1.5 text-slate-400">
              {simulatedPackets.map((pkt, i) => (
                <div key={i} className="hover:text-emerald-300 cursor-pointer transition-colors truncate">
                  <span className="text-slate-600 mr-2">[{new Date().toLocaleTimeString()}]</span>
                  <span className="text-emerald-400 font-semibold">{pkt.split('*')[0]}</span>
                  <span className="text-amber-400 font-bold">*{pkt.split('*')[1]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODE 3: DRIVER SMARTPHONE BEACON & OFFLINE QUEUE */}
      {activeEngineTab === 'driver' && (
        <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-950 flex items-center justify-center text-emerald-400 border border-emerald-800/60">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-display font-bold text-white">
                  Driver Smartphone Telemetry & Offline PWA
                </h2>
                <p className="text-xs text-slate-400">
                  Mohan Singh Yadav · Vehicle: MP09SR4241 · Trip: TRP-2026-00412
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                  offlineMode
                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                    : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                }`}
              >
                {offlineMode ? <CloudOff className="w-3.5 h-3.5" /> : <Cloud className="w-3.5 h-3.5" />}
                {offlineMode ? 'Highway Deadzone (Offline)' : 'Online (4G / 5G)'}
              </span>
            </div>
          </div>

          {/* Smartphone Simulator Card */}
          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Background GPS Beacon Broadcast:</span>
              <button
                onClick={() => setDriverBeaconActive(!driverBeaconActive)}
                className={`px-3 py-1 rounded-lg font-bold text-xs font-mono transition-colors ${
                  driverBeaconActive
                    ? 'bg-emerald-400 text-slate-950'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {driverBeaconActive ? 'BEACON ACTIVE' : 'PAUSED'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Current Road Speed</span>
                <span className="text-lg font-bold text-white block mt-0.5">58.4 km/h</span>
              </div>

              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">Trip Distance Covered</span>
                <span className="text-lg font-bold text-emerald-400 block mt-0.5">284.6 km</span>
              </div>
            </div>

            {/* Offline Simulation Control */}
            <div className="pt-2 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">
                  Simulate Ghat Section / Cellular Blackout:
                </span>
                <button
                  onClick={() => setOfflineMode(!offlineMode)}
                  className={`px-3 py-1 rounded text-xs font-semibold ${
                    offlineMode
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  {offlineMode ? 'End Deadzone' : 'Trigger Deadzone'}
                </button>
              </div>

              {bufferedPointsCount > 0 && (
                <div className="p-3 bg-amber-950/40 border border-amber-800 rounded-lg flex items-center justify-between text-xs">
                  <span className="text-amber-300 font-mono">
                    {bufferedPointsCount} GPS pings stored in browser IndexedDB
                  </span>
                  <button
                    onClick={handleSyncOfflineQueue}
                    className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded"
                  >
                    Sync Queue Now
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
