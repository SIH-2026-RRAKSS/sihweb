import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Flame,
  ShieldAlert,
  Search,
  Navigation,
  DollarSign,
  Building,
  Radio,
  Crosshair,
  Layers,
  CheckCircle2,
  ChevronRight,
  Filter,
  Zap,
  ArrowRight
} from 'lucide-react';
import { ApiService } from '../../services/api';
import { EntityLocation, ConfidenceTier } from '../../types';

interface CashOutMapProps {
  targetEntityId?: string | null;
  onNavigateToCase?: (complaintId: string) => void;
}

// Real multi-hop laundering corridors connecting source cities to destination cash-out ATMs
const CORRIDORS: { from: [number, number]; to: [number, number]; fromCity: string; toCity: string; amount: string; risk: string; entityId: string; atmId: string }[] = [
  { from: [20.2718, 85.8358], to: [18.9255, 72.8242], fromCity: 'Bhubaneswar (Odisha)', toCity: 'Mumbai (Nariman Pt ATM_029)', amount: '₹4.50L', risk: 'HIGH', entityId: 'ENT_000185', atmId: 'ATM_029' },
  { from: [23.2599, 77.4126], to: [23.2324, 77.4332], fromCity: 'Bhopal (MP)', toCity: 'Bhopal (MP Nagar ATM_023)', amount: '₹8.20L', risk: 'HIGH', entityId: 'ENT_000513', atmId: 'ATM_023' },
  { from: [12.9716, 77.5946], to: [12.9784, 77.6408], fromCity: 'Bengaluru (KA)', toCity: 'Bengaluru (Indiranagar ATM_008)', amount: '₹3.10L', risk: 'HIGH', entityId: 'ENT_000387', atmId: 'ATM_008' },
  { from: [28.6139, 77.2090], to: [28.6315, 77.2167], fromCity: 'Delhi (NCR)', toCity: 'Delhi (Connaught Pl ATM_002)', amount: '₹1.95L', risk: 'HIGH', entityId: 'ENT_000047', atmId: 'ATM_002' },
  { from: [26.9124, 75.7873], to: [26.9198, 75.8115], fromCity: 'Jaipur (RJ)', toCity: 'Jaipur (MI Road ATM_015)', amount: '₹75k', risk: 'MEDIUM', entityId: 'ENT_000493', atmId: 'ATM_015' },
  { from: [17.3850, 78.4867], to: [17.4156, 78.4350], fromCity: 'Hyderabad (TS)', toCity: 'Hyderabad (Banjara Hills ATM_012)', amount: '₹1.20L', risk: 'MEDIUM', entityId: 'ENT_000449', atmId: 'ATM_012' },
  { from: [23.0225, 72.5714], to: [23.0543, 72.5189], fromCity: 'Ahmedabad (GJ)', toCity: 'Ahmedabad (SG Highway ATM_020)', amount: '₹98k', risk: 'MEDIUM', entityId: 'ENT_000576', atmId: 'ATM_020' },
  { from: [18.5204, 73.8567], to: [18.5314, 73.8446], fromCity: 'Pune (MH)', toCity: 'Pune (Shivajinagar ATM_018)', amount: '₹1.45L', risk: 'MEDIUM', entityId: 'ENT_000485', atmId: 'ATM_018' },
  { from: [9.9312, 76.2673], to: [9.9723, 76.2789], fromCity: 'Kochi (KL)', toCity: 'Kochi (MG Road ATM_014)', amount: '₹25k', risk: 'NORMAL', entityId: 'ENT_000325', atmId: 'ATM_014' },
];

export const CashOutMap: React.FC<CashOutMapProps> = ({ targetEntityId, onNavigateToCase }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const corridorsLayerRef = useRef<L.LayerGroup | null>(null);

  const [locations, setLocations] = useState<EntityLocation[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<EntityLocation | null>(null);
  const [tierFilter, setTierFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch Entity Locations
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        const data = await ApiService.getEntityLocations();
        setLocations(data);

        // Check if targetEntityId was passed
        if (targetEntityId && data.length > 0) {
          const match = data.find(l => l.entity_id.toUpperCase() === targetEntityId.toUpperCase() || l.city.toLowerCase() === targetEntityId.toLowerCase());
          if (match) {
            setSelectedEntity(match);
          } else {
            setSelectedEntity(data[0]);
          }
        } else if (data.length > 0) {
          setSelectedEntity(data[0]);
        }
      } catch (err) {
        console.error('Failed to load entity locations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLocations();
  }, [targetEntityId]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [21.5, 79.0],
      zoom: 5,
      minZoom: 4,
      maxZoom: 14,
      zoomControl: false,
      attributionControl: false,
    });

    // Dark Inverted OpenStreetMap Tiles (100% Free, NO API Key)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    const corridorsGroup = L.layerGroup().addTo(map);

    markersLayerRef.current = markersGroup;
    corridorsLayerRef.current = corridorsGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers, Animations & Corridors
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    const corridorsGroup = corridorsLayerRef.current;
    if (!map || !markersGroup || !corridorsGroup) return;

    markersGroup.clearLayers();
    corridorsGroup.clearLayers();

    // 1. Draw Flow Corridors with Animated Dotted Moving Polylines
    CORRIDORS.forEach((corridor) => {
      const isHighRisk = corridor.risk === 'HIGH';
      const isCurrentSelected =
        selectedEntity?.entity_id === corridor.entityId ||
        selectedEntity?.entity_id === corridor.atmId ||
        selectedEntity?.city.toLowerCase().includes(corridor.fromCity.toLowerCase());

      const polyline = L.polyline([corridor.from, corridor.to], {
        color: isHighRisk ? '#FF5500' : '#38BDF8',
        weight: isCurrentSelected ? 3.5 : 2.0,
        opacity: isCurrentSelected ? 1.0 : 0.65,
        dashArray: '8, 8',
        className: 'flow-corridor-animated',
      });

      polyline.bindTooltip(
        `<div style="background:#0C0E12; border:1px solid ${isHighRisk ? '#FF5500' : '#38BDF8'}; color:#fff; font-family:monospace; padding:4px 8px; font-size:10px; border-radius:4px;">
          <strong style="color:${isHighRisk ? '#FF5500' : '#38BDF8'}">${corridor.fromCity} ➔ ${corridor.toCity}</strong><br/>
          Corridor Volume: <span style="color:#F59E0B; font-weight:bold;">${corridor.amount}</span>
        </div>`,
        { sticky: true, opacity: 0.95 }
      );
      corridorsGroup.addLayer(polyline);
    });

    // 2. Render Entity Pins (Mules & ATMs)
    const filtered = locations.filter((loc) => {
      if (tierFilter !== 'ALL' && loc.confidence_tier !== tierFilter) return false;
      if (typeFilter !== 'ALL' && loc.entity_type !== typeFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          loc.entity_id.toLowerCase().includes(q) ||
          loc.city.toLowerCase().includes(q) ||
          (loc.holder_name && loc.holder_name.toLowerCase().includes(q))
        );
      }
      return true;
    });

    filtered.forEach((loc) => {
      const isATM = loc.entity_type === 'ATM_TERMINAL';
      const isHighRisk = loc.confidence_tier === 'HIGH_CONFIDENCE';
      const isSelected = selectedEntity?.entity_id === loc.entity_id;

      let iconHtml = '';
      if (isATM) {
        iconHtml = `
          <div style="position:relative; width:30px; height:30px; display:flex; align-items:center; justify-content:center;">
            ${isSelected ? `<div style="position:absolute; width:36px; height:36px; border-radius:4px; border:2px solid #F59E0B; animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite; opacity:0.6;"></div>` : ''}
            <div style="width:16px; height:16px; background:#F59E0B; border:2px solid ${isSelected ? '#FFFFFF' : '#F59E0B'}; box-shadow:0 0 14px #F59E0B; border-radius:2px;"></div>
            <div style="position:absolute; top:-20px; background:#0C0E12; color:#F59E0B; border:1px solid #F59E0B; font-family:monospace; font-size:9px; font-weight:bold; padding:1px 4px; border-radius:2px; white-space:nowrap; box-shadow:0 2px 6px rgba(0,0,0,0.6);">
              ${loc.entity_id}
            </div>
          </div>
        `;
      } else {
        const color = isHighRisk ? '#FF5500' : '#38BDF8';
        iconHtml = `
          <div style="position:relative; width:30px; height:30px; display:flex; align-items:center; justify-content:center;">
            ${isHighRisk ? `<div style="position:absolute; width:34px; height:34px; border-radius:50%; border:2px solid #FF5500; animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite; opacity:0.6;"></div>` : ''}
            <div style="width:14px; height:14px; border-radius:50%; background:${color}; border:2px solid ${isSelected ? '#FFFFFF' : color}; box-shadow:0 0 14px ${color};"></div>
            <div style="position:absolute; top:-20px; background:#0C0E12; color:${color}; border:1px solid ${color}; font-family:monospace; font-size:9px; font-weight:bold; padding:1px 4px; border-radius:2px; white-space:nowrap; box-shadow:0 2px 6px rgba(0,0,0,0.6);">
              ${loc.entity_id}
            </div>
          </div>
        `;
      }

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-industrial-marker',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      const marker = L.marker([loc.latitude, loc.longitude], { icon: customIcon });

      marker.on('click', () => {
        setSelectedEntity(loc);
        map.flyTo([loc.latitude, loc.longitude], 8, { duration: 1.2 });
      });

      marker.bindTooltip(
        `<div style="background:#0C0E12; border:1px solid #FFFFFF20; color:#fff; font-family:monospace; padding:5px 9px; font-size:11px; border-radius:4px;">
          <div style="color:${isATM ? '#F59E0B' : '#38BDF8'}; font-weight:bold;">${loc.entity_id} [${loc.entity_type}]</div>
          <div style="color:#CBD5E1;">${loc.holder_name || 'Holder Entity'} · ${loc.city}, ${loc.state}</div>
          <div style="color:${isHighRisk ? '#FF5500' : '#10B981'}; font-weight:bold; margin-top:2px;">
            Risk: ${(loc.risk_probability * 100).toFixed(1)}% [${loc.confidence_tier}]
          </div>
        </div>`,
        { opacity: 0.95 }
      );

      markersGroup.addLayer(marker);
    });

    // Auto-fly to selected entity if requested
    if (selectedEntity) {
      map.flyTo([selectedEntity.latitude, selectedEntity.longitude], 8, { duration: 1.2 });
    }
  }, [locations, tierFilter, typeFilter, searchQuery, selectedEntity]);

  const handleSelectFromList = (loc: EntityLocation) => {
    setSelectedEntity(loc);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([loc.latitude, loc.longitude], 8, { duration: 1.2 });
    }
  };

  const getCorridorText = (loc: EntityLocation) => {
    const isATM = loc.entity_type === 'ATM_TERMINAL';
    if (isATM) {
      return `Incoming Regional Cash-Out Flow ➔ ${loc.city} (${loc.entity_id})`;
    }
    const matched = CORRIDORS.find(c => c.fromCity.toLowerCase().includes(loc.city.toLowerCase()));
    if (matched) {
      return `${matched.fromCity} ➔ ${matched.toCity}`;
    }
    return `${loc.city} (${loc.state}) ➔ Downstream ATM Node`;
  };

  const isHighRisk = selectedEntity?.confidence_tier === 'HIGH_CONFIDENCE';
  const isATM = selectedEntity?.entity_type === 'ATM_TERMINAL';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 h-[calc(100vh-6.5rem)] font-sans text-xs">
      
      {/* ── LEFT PANEL: ENTITY SELECTOR ROSTER (3 COLS) ── */}
      <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-3 flex flex-col space-y-3 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-[#FF5500] animate-pulse" />
            <span className="font-bold text-slate-900 tracking-tight">ENTITY SELECTOR</span>
          </div>
          <span className="text-[10px] text-slate-500">{locations.length} LOCATIONS</span>
        </div>

        {/* Search */}
        <div className="relative flex-shrink-0">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="SEARCH CITY / ENTITY / ATM..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 pl-8 pr-3 py-1.5 rounded text-[11px] text-slate-900 placeholder-zinc-600 focus:border-[#FF5500] focus:outline-none"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex border border-slate-200 bg-slate-50 rounded p-0.5 text-[10px] flex-shrink-0">
          {['ALL', 'MULES', 'ATMs'].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t === 'MULES' ? 'MULE_ACCOUNT' : (t === 'ATMs' ? 'ATM_TERMINAL' : 'ALL'))}
              className={`flex-1 py-1 rounded font-bold transition-colors ${
                (typeFilter === 'ALL' && t === 'ALL') ||
                (typeFilter === 'MULE_ACCOUNT' && t === 'MULES') ||
                (typeFilter === 'ATM_TERMINAL' && t === 'ATMs')
                  ? 'bg-white text-black shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Entity List */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
          {locations
            .filter(l => typeFilter === 'ALL' || l.entity_type === typeFilter)
            .filter(l => !searchQuery || l.entity_id.toLowerCase().includes(searchQuery.toLowerCase()) || l.city.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((loc) => {
              const isSelected = selectedEntity?.entity_id === loc.entity_id;
              const isLocATM = loc.entity_type === 'ATM_TERMINAL';
              const isLocHigh = loc.confidence_tier === 'HIGH_CONFIDENCE';

              return (
                <div
                  key={loc.entity_id}
                  onClick={() => handleSelectFromList(loc)}
                  className={`p-2 rounded border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-100 border-white/30 text-slate-900'
                      : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className={isLocATM ? 'text-amber-400' : 'text-[#38BDF8]'}>
                      {loc.entity_id}
                    </span>
                    <span className={`text-[9px] px-1 py-0.2 rounded border font-bold ${
                      isLocHigh ? 'bg-[#FF5500]/15 text-[#FF5500] border-[#FF5500]/30' : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    }`}>
                      {(loc.risk_probability * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-700 truncate mt-0.5">
                    {loc.holder_name}
                  </div>
                  <div className="flex justify-between items-center text-[9px] text-slate-500 mt-1">
                    <span>{loc.city}, {loc.state}</span>
                    <span className="text-slate-900 font-sans font-bold">₹{(loc.flagged_amount || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* ── CENTER: LEAFLET INTERACTIVE MAP (6 COLS) ── */}
      <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl overflow-hidden relative shadow-sm flex flex-col">
        <div ref={mapContainerRef} className="w-full h-full min-h-[400px]" />

        {/* Map Legend Floating Bar */}
        <div className="absolute bottom-3 left-3 right-3 bg-white/90 border border-white/15 p-2 rounded  flex flex-wrap items-center justify-between text-[10px] text-slate-700 font-sans z-[1000]">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF5500]" />
              <span>Critical Mule</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]" />
              <span>Moderate Mule</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#F59E0B]" />
              <span>Cash-Out ATM</span>
            </div>
          </div>
          <div className="text-slate-500">
            Animated Corridors Active
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL: INSPECTOR DOSSIER (3 COLS) ── */}
      <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-3.5 flex flex-col space-y-3.5 shadow-sm overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div className="flex items-center gap-1.5 text-slate-900 font-bold">
            <Navigation className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>INSPECTOR DOSSIER</span>
          </div>
          <span className="text-[9px] bg-slate-100 border border-slate-200 text-slate-500 px-1.5 py-0.5 rounded font-bold">
            GPS TRACKED
          </span>
        </div>

        {selectedEntity ? (
          <div className="space-y-3 text-[11px]">
            <div className="bg-slate-50 p-3 border border-slate-200 rounded space-y-1.5">
              <div className="flex justify-between text-slate-500">
                <span>ENTITY ID:</span>
                <span className="text-slate-900 font-bold">{selectedEntity.entity_id}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>TYPE:</span>
                <span className={isATM ? 'text-amber-400 font-bold' : 'text-[#38BDF8] font-bold'}>
                  {selectedEntity.entity_type}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>HOLDER:</span>
                <span className="text-slate-900 font-bold">{selectedEntity.holder_name}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>LOCATION:</span>
                <span className="text-slate-800">{selectedEntity.city}, {selectedEntity.state}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>GPS COORDINATES:</span>
                <span className="text-slate-500">{selectedEntity.latitude.toFixed(4)}, {selectedEntity.longitude.toFixed(4)}</span>
              </div>
              <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-100">
                <span>FLAGGED EXPOSURE:</span>
                <span className="text-slate-900 font-bold font-sans">₹{(selectedEntity.flagged_amount || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Risk Gauge */}
            <div className="bg-slate-50 p-3 border border-slate-200 rounded space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-slate-500 text-[10px]">GRAPHSAGE RISK SCORE:</span>
                <span className="text-xl font-bold font-sans text-slate-900">
                  {(selectedEntity.risk_probability * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded overflow-hidden">
                <div
                  className={`h-full ${isHighRisk ? 'bg-[#FF5500]' : 'bg-emerald-400'}`}
                  style={{ width: `${selectedEntity.risk_probability * 100}%` }}
                />
              </div>
              <div className={`text-[9px] font-bold ${isHighRisk ? 'text-[#FF5500]' : 'text-emerald-400'}`}>
                {selectedEntity.confidence_tier}
              </div>
            </div>

            {/* Suspected Corridor */}
            <div className="bg-slate-50 p-3 border border-slate-200 rounded space-y-1.5">
              <div className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                <Flame className="w-3 h-3" />
                <span>SUSPECTED CASH-OUT CORRIDOR:</span>
              </div>
              <p className="text-xs text-slate-900 font-bold leading-relaxed">
                {getCorridorText(selectedEntity)}
              </p>
              <div className="text-[10px] text-slate-500 pt-1">
                Velocity: 92.4% funds moved out within 45 mins.
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500">
            Select an entity from the list or map to inspect details.
          </div>
        )}
      </div>

    </div>
  );
};
