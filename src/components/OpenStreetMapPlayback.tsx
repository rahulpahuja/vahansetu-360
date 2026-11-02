/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * VahanSetu 360 — OpenStreetMap Interactive Vehicle Journey Playback & Telemetry
 * Integrated with Leaflet, OpenStreetMap tiles, and harsh braking event markers
 */

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Play,
  Pause,
  RotateCcw,
  AlertTriangle,
  Zap,
  Gauge,
  Activity,
  Compass,
  Navigation,
  Coffee,
  CheckCircle2,
  Package,
  Layers,
  MapPin,
} from 'lucide-react';
import { TelematicsPoint } from '../types/logistics';
import { SEED_TELEMATICS_POINTS } from '../data/seedData';

interface OpenStreetMapPlaybackProps {
  vehicleReg?: string;
  points?: TelematicsPoint[];
}

export const OpenStreetMapPlayback: React.FC<OpenStreetMapPlaybackProps> = ({
  vehicleReg = 'MP09SR4241',
  points = SEED_TELEMATICS_POINTS,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const vehicleMarkerRef = useRef<L.Marker | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const completedPolylineRef = useRef<L.Polyline | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [activeEventFilter, setActiveEventFilter] = useState<'ALL' | 'BRAKING' | 'SPEED' | 'STOPS'>('ALL');

  const currentPt = points[currentIndex] || points[0];

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // already initialized

    // Center on NH-52 corridor (between Indore and Nashik)
    const initialMap = L.map(mapContainerRef.current, {
      center: [21.35, 74.88], // Midpoint around Shirpur/Sendhwa
      zoom: 7,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    // Dark-themed / Clean OpenStreetMap tiles
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors · VahanSetu AIS-140',
    }).addTo(initialMap);

    // Full Route LatLng array
    const latLngs: [number, number][] = points.map((p) => [p.latitude, p.longitude]);

    // Planned corridor Polyline (subtle emerald/slate)
    polylineRef.current = L.polyline(latLngs, {
      color: '#334155',
      weight: 4,
      opacity: 0.7,
      dashArray: '6, 8',
    }).addTo(initialMap);

    // Completed Route Polyline (high-contrast vibrant emerald)
    completedPolylineRef.current = L.polyline([latLngs[0]], {
      color: '#10b981',
      weight: 5,
      opacity: 0.95,
    }).addTo(initialMap);

    // Add Waypoint & Event Markers
    points.forEach((pt, idx) => {
      let iconHtml = '';
      let popupContent = '';

      if (pt.eventType === 'HARSH_BRAKING') {
        iconHtml = `
          <div class="relative flex items-center justify-center">
            <span class="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-rose-500 opacity-75"></span>
            <div class="w-8 h-8 rounded-full bg-rose-600 border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold font-mono">
              🛑
            </div>
          </div>
        `;
        popupContent = `
          <div style="font-family: inherit; font-size: 12px; min-width: 200px;">
            <div style="font-weight: 700; color: #f43f5e; margin-bottom: 4px;">HARSH BRAKING DETECTED</div>
            <div style="color: #334155; margin-bottom: 4px;">${pt.locationName}</div>
            <div style="background: #f1f5f9; padding: 6px; border-radius: 6px; font-size: 11px;">
              <div>• Deceleration: <b>${pt.accelerationG} G</b> (-14.8 m/s²)</div>
              <div>• Air-Brake Pressure: <b>${pt.brakePressurePsi} PSI</b></div>
              <div>• Speed Drop: <b>68 → 18 km/h</b></div>
            </div>
          </div>
        `;
      } else if (pt.eventType === 'OVERSPEEDING') {
        iconHtml = `
          <div class="w-7 h-7 rounded-full bg-amber-500 border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold font-mono">
            ⚡
          </div>
        `;
        popupContent = `
          <div style="font-family: inherit; font-size: 12px; min-width: 180px;">
            <div style="font-weight: 700; color: #d97706; margin-bottom: 4px;">SPEEDING ALERT</div>
            <div style="color: #334155;">Speed: <b>${pt.speedKmh} km/h</b> (Limit: 60 km/h)</div>
            <div style="color: #64748b; font-size: 11px;">${pt.locationName}</div>
          </div>
        `;
      } else if (pt.eventType === 'IDLE_HALT') {
        iconHtml = `
          <div class="w-7 h-7 rounded-full bg-blue-500 border-2 border-white shadow-lg flex items-center justify-center text-white text-xs">
            ☕
          </div>
        `;
        popupContent = `
          <div style="font-family: inherit; font-size: 12px; min-width: 180px;">
            <div style="font-weight: 700; color: #2563eb; margin-bottom: 4px;">DRIVER REST HALT</div>
            <div style="color: #334155;">Duration: <b>${pt.stoppageMinutes} mins</b></div>
            <div style="color: #64748b; font-size: 11px;">${pt.locationName}</div>
          </div>
        `;
      } else if (pt.eventType === 'STOP_DELIVERY') {
        iconHtml = `
          <div class="w-7 h-7 rounded-full bg-emerald-600 border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold">
            📦
          </div>
        `;
        popupContent = `
          <div style="font-family: inherit; font-size: 12px; min-width: 180px;">
            <div style="font-weight: 700; color: #059669; margin-bottom: 4px;">CONSIGNMENT DELIVERY STOP</div>
            <div style="color: #334155;">${pt.locationName}</div>
            <div style="color: #64748b; font-size: 11px;">${pt.eventDescription}</div>
          </div>
        `;
      } else {
        // Standard corridor waypoint
        iconHtml = `
          <div class="w-3.5 h-3.5 rounded-full bg-slate-600 border-2 border-slate-900 shadow"></div>
        `;
        popupContent = `
          <div style="font-family: inherit; font-size: 11px;">
            <b>${pt.locationName}</b><br/>Speed: ${pt.speedKmh} km/h
          </div>
        `;
      }

      const customIcon = L.divIcon({
        className: 'custom-osm-marker',
        html: iconHtml,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([pt.latitude, pt.longitude], { icon: customIcon }).addTo(initialMap);
      if (popupContent) {
        marker.bindPopup(popupContent);
      }
    });

    // Custom Live Vehicle Marker (Truck Beacon)
    const vehicleIcon = L.divIcon({
      className: 'vehicle-osm-marker',
      html: `
        <div class="relative flex items-center justify-center">
          <span class="animate-ping absolute inline-flex h-9 w-9 rounded-full bg-emerald-400 opacity-60"></span>
          <div class="w-9 h-9 rounded-full bg-slate-950 border-2 border-emerald-400 shadow-xl flex items-center justify-center text-emerald-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>
            </svg>
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    vehicleMarkerRef.current = L.marker([latLngs[0][0], latLngs[0][1]], {
      icon: vehicleIcon,
      zIndexOffset: 1000,
    }).addTo(initialMap);

    initialMap.fitBounds(polylineRef.current.getBounds(), { padding: [40, 40] });
    mapInstanceRef.current = initialMap;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [points]);

  // Handle Playback Loop
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= points.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 2400 / playbackSpeed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, points.length]);

  // Update Marker & Completed Trail when currentIndex changes
  useEffect(() => {
    if (!mapInstanceRef.current || !vehicleMarkerRef.current) return;
    const pt = points[currentIndex];
    if (!pt) return;

    vehicleMarkerRef.current.setLatLng([pt.latitude, pt.longitude]);

    // Update completed path
    const completedCoords: [number, number][] = points
      .slice(0, currentIndex + 1)
      .map((p) => [p.latitude, p.longitude]);

    if (completedPolylineRef.current) {
      completedPolylineRef.current.setLatLngs(completedCoords);
    }

    // Smoothly pan map to follow truck if playing
    if (isPlaying) {
      mapInstanceRef.current.panTo([pt.latitude, pt.longitude], { animate: true, duration: 0.8 });
    }
  }, [currentIndex, isPlaying, points]);

  // Jump to Harsh Braking Event
  const handleJumpToBraking = () => {
    const brakingIdx = points.findIndex((p) => p.eventType === 'HARSH_BRAKING');
    if (brakingIdx !== -1) {
      setCurrentIndex(brakingIdx);
      setIsPlaying(false);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView(
          [points[brakingIdx].latitude, points[brakingIdx].longitude],
          12,
          { animate: true }
        );
      }
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsPlaying(false);
    if (mapInstanceRef.current && polylineRef.current) {
      mapInstanceRef.current.fitBounds(polylineRef.current.getBounds(), { padding: [40, 40] });
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Playback Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-colors ${
              isPlaying
                ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                : 'bg-emerald-400 hover:bg-emerald-300 text-slate-950'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" /> Pause Journey
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" /> Play NH-52 Journey
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            title="Rewind to Indore Origin"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Speed Selectors */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            {[1, 2, 5, 10].map((spd) => (
              <button
                key={spd}
                onClick={() => setPlaybackSpeed(spd)}
                className={`px-2 py-0.5 rounded transition-colors ${
                  playbackSpeed === spd
                    ? 'bg-emerald-500/20 text-emerald-400 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* Jump-to Event Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleJumpToBraking}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Jump to Harsh Braking (Sendhwa Ghat)
          </button>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 h-[480px] shadow-2xl">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Real-time Telemetry HUD Card (Bottom Left) */}
        <div className="absolute bottom-4 left-4 z-10 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-3.5 shadow-2xl text-xs space-y-2.5 max-w-sm w-full">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono font-bold text-white">{vehicleReg}</span>
              <span className="text-slate-400 font-mono text-[11px]">• Mohan Singh (Driver)</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">{currentPt.recordedAt}</span>
          </div>

          {/* Location Description */}
          <div className="text-slate-300 font-medium text-[11px] line-clamp-1">
            📍 {currentPt.locationName}
          </div>

          {/* Event Callout if present */}
          {currentPt.eventType && currentPt.eventType !== 'NORMAL' && (
            <div
              className={`p-2 rounded-lg text-[11px] font-medium border ${
                currentPt.eventType === 'HARSH_BRAKING'
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  : currentPt.eventType === 'OVERSPEEDING'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
              }`}
            >
              {currentPt.eventDescription}
            </div>
          )}

          {/* Telemetry Gauge Grid */}
          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/80 text-[11px]">
            <div>
              <span className="text-slate-500 block text-[10px]">Speed:</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">
                {currentPt.speedKmh} <span className="text-[10px] font-normal text-slate-400">km/h</span>
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Brake Pressure:</span>
              <span
                className={`font-mono font-bold text-sm ${
                  (currentPt.brakePressurePsi || 0) > 80 ? 'text-rose-400' : 'text-slate-200'
                }`}
              >
                {currentPt.brakePressurePsi || 15} <span className="text-[10px] font-normal text-slate-400">PSI</span>
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Acceleration:</span>
              <span
                className={`font-mono font-bold text-sm ${
                  (currentPt.accelerationG || 0) < -0.5 ? 'text-rose-400' : 'text-slate-200'
                }`}
              >
                {currentPt.accelerationG !== undefined ? `${currentPt.accelerationG} G` : '0.0 G'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Engine RPM:</span>
              <span className="font-mono text-slate-300 font-semibold">
                {currentPt.rpm || 1500}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Fuel Tank:</span>
              <span className="font-mono text-amber-400 font-semibold">
                {currentPt.fuelLevelPct || 85}%
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Elevation:</span>
              <span className="font-mono text-cyan-400 font-semibold">
                {currentPt.elevationM || 450} m
              </span>
            </div>
          </div>
        </div>

        {/* Scrubber at Bottom Center */}
        <div className="absolute bottom-4 right-4 z-10 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 shadow-2xl flex items-center gap-3">
          <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">
            Point {currentIndex + 1} / {points.length}
          </span>
          <input
            type="range"
            min="0"
            max={points.length - 1}
            value={currentIndex}
            onChange={(e) => {
              setCurrentIndex(parseInt(e.target.value, 10));
              setIsPlaying(false);
            }}
            className="w-36 sm:w-52 accent-emerald-400 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
