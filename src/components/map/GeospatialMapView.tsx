import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Building,
  Navigation,
  ShieldAlert,
  Layers,
  Filter,
  DollarSign,
  AlertTriangle,
  Compass
} from 'lucide-react';
import { EntityLocation } from '../../types';
import { ApiService } from '../../services/api';

interface GeospatialMapProps {
  onSelectEntity?: (id: string) => void;
}

export const GeospatialMapView: React.FC<GeospatialMapProps> = () => {
  const [locations, setLocations] = useState<EntityLocation[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('ALL');
  const [selectedEntity, setSelectedEntity] = useState<EntityLocation | null>(null);

  useEffect(() => {
    ApiService.getEntityLocations().then(setLocations);
  }, []);

  const cities = Array.from(new Set(locations.map(l => l.city)));

  const filteredLocations = locations.filter(l => {
    if (selectedCity !== 'ALL' && l.city !== selectedCity) return false;
    return true;
  });

  // Calculate bounding box / canvas projection for India coordinates
  // Lat: 8.0 to 32.0, Lon: 68.0 to 90.0
  const minLat = 8.0;
  const maxLat = 32.0;
  const minLon = 68.0;
  const maxLon = 90.0;

  const projectToCanvas = (lat: number, lon: number, width: number, height: number) => {
    const x = ((lon - minLon) / (maxLon - minLon)) * (width - 80) + 40;
    const y = height - (((lat - minLat) / (maxLat - minLat)) * (height - 80) + 40);
    return { x, y };
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-base font-bold font-sans text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <MapPin className="w-5 h-5 text-amber-400" />
            Geospatial ATM Terminal & Cash-Out Heatmap
          </h2>
          <p className="text-xs text-slate-500">
            Physical cash withdrawal terminal clusters and monitored entity coordinates across 15 Indian metropolitan corridors.
          </p>
        </div>

        {/* City Filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-sans text-slate-500">Filter City:</label>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="px-3 py-1.5 text-xs font-sans bg-white border border-slate-200 rounded-2xl text-cyber-cyan focus:border-cyber-cyan focus:outline-none"
          >
            <option value="ALL">ALL 15 CITIES ({locations.length} Points)</option>
            {cities.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Tactical Vector Map */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm p-4 relative flex flex-col items-center justify-center min-h-[520px] bg-white overflow-hidden">
          {/* Background Grid & Radar Sweep */}
          <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none"></div>

          {/* Compass Rose */}
          <div className="absolute top-4 right-4 text-cyber-cyan/40 flex items-center gap-1 text-[10px] font-sans">
            <Compass className="w-4 h-4 text-cyber-cyan" />
            <span>NORTH • INDIA GRID</span>
          </div>

          {/* Map Canvas / SVG */}
          <svg className="w-full h-[480px] max-w-[700px]" viewBox="0 0 700 480">
            {/* Outline Reference Contours */}
            <circle cx="350" cy="240" r="210" fill="none" stroke="rgba(0, 240, 255, 0.05)" strokeDasharray="4 4" />
            <circle cx="350" cy="240" r="140" fill="none" stroke="rgba(0, 240, 255, 0.08)" strokeDasharray="2 2" />

            {/* Trajectory lines from origins to cash-out terminals */}
            {filteredLocations.filter(l => l.entity_type === 'MULE_ACCOUNT').map((mule) => {
              const nearestAtm = filteredLocations.find(l => l.entity_type === 'ATM_TERMINAL' && l.city === mule.city) || filteredLocations.find(l => l.entity_type === 'ATM_TERMINAL');
              if (!nearestAtm) return null;
              const p1 = projectToCanvas(mule.latitude, mule.longitude, 700, 480);
              const p2 = projectToCanvas(nearestAtm.latitude, nearestAtm.longitude, 700, 480);

              return (
                <g key={`traj-${mule.entity_id}`}>
                  <line
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke="rgba(245, 158, 11, 0.35)"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                </g>
              );
            })}

            {/* Plotted Entity Pins */}
            {filteredLocations.map((loc) => {
              const { x, y } = projectToCanvas(loc.latitude, loc.longitude, 700, 480);
              const isSelected = selectedEntity?.entity_id === loc.entity_id;
              const isAtm = loc.entity_type === 'ATM_TERMINAL';

              return (
                <g
                  key={loc.entity_id}
                  className="cursor-pointer transition-transform hover:scale-125"
                  onClick={() => setSelectedEntity(loc)}
                >
                  {/* Outer pulse */}
                  {isAtm && (
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected ? 18 : 12}
                      fill="rgba(245, 158, 11, 0.2)"
                      className="animate-ping origin-center"
                    />
                  )}

                  {/* Marker Body */}
                  {isAtm ? (
                    <rect
                      x={x - (isSelected ? 9 : 7)}
                      y={y - (isSelected ? 9 : 7)}
                      width={isSelected ? 18 : 14}
                      height={isSelected ? 18 : 14}
                      fill="#F59E0B"
                      stroke={isSelected ? '#FFFFFF' : '#0B0F17'}
                      strokeWidth="2"
                      rx="2"
                    />
                  ) : (
                    <circle
                      cx={x}
                      cy={y}
                      r={isSelected ? 9 : 6}
                      fill={loc.risk_probability > 0.8 ? '#EF4444' : '#38BDF8'}
                      stroke={isSelected ? '#FFFFFF' : '#0B0F17'}
                      strokeWidth="2"
                    />
                  )}

                  {/* Text Label */}
                  <text
                    x={x}
                    y={y - 12}
                    fill={isSelected ? '#00F0FF' : '#94A3B8'}
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {loc.city} ({loc.entity_id})
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Map Legend Footer */}
          <div className="absolute bottom-3 left-3 flex items-center gap-4 bg-white border border-slate-200 px-3 py-2 rounded-2xl text-[10px] font-sans">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-amber-500 rounded-sm"></span>
              <span className="text-amber-400 font-bold">ATM Cash-Out Exit</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyber-red"></span>
              <span className="text-slate-700">High-Risk Mule Entity</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              <span className="text-slate-700">Monitored Account</span>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Location Inspector & Regional Corridors */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-xs font-bold font-sans text-slate-800 uppercase flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-amber-400" />
                Geospatial Pin Intelligence
              </h3>
              <span className="text-[10px] font-sans text-slate-500">{filteredLocations.length} Plotted</span>
            </div>

            {selectedEntity ? (
              <div className="space-y-3 mt-3 text-xs font-sans">
                <div className="p-3 bg-white rounded-2xl border border-slate-200 space-y-1.5">
                  <div className="text-[10px] text-slate-500 uppercase">Selected Entity ID</div>
                  <div className="text-sm font-bold text-cyber-cyan">{selectedEntity.entity_id}</div>
                  <div className="text-[11px] text-slate-700 font-sans">{selectedEntity.holder_name}</div>
                </div>

                <div className="p-3 bg-white rounded-2xl border border-slate-200 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Jurisdiction:</span>
                    <span className="text-slate-800 font-bold">{selectedEntity.city}, {selectedEntity.state}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Coordinates:</span>
                    <span className="text-slate-500">{selectedEntity.latitude.toFixed(4)}, {selectedEntity.longitude.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Entity Type:</span>
                    <span className={`font-bold ${selectedEntity.entity_type === 'ATM_TERMINAL' ? 'text-amber-400' : 'text-cyber-cyan'}`}>
                      {selectedEntity.entity_type}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Disputed/Flagged Amount:</span>
                    <span className="text-amber-400 font-bold">₹{(selectedEntity.flagged_amount || 0).toLocaleString()}</span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-2xl border border-slate-200 space-y-1">
                  <div className="text-[10px] text-slate-500 uppercase">GNN Risk Assessment</div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-800">Probability:</span>
                    <span className="text-cyber-red font-bold">{(selectedEntity.risk_probability * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500 font-sans text-xs">
                Click any ATM terminal or entity node on the map to inspect location telemetry and cash withdrawal metrics.
              </div>
            )}

            {/* Monitored Corridor List */}
            <div className="mt-4 pt-3 border-t border-slate-200 space-y-2">
              <div className="text-[10px] font-sans text-slate-500 uppercase tracking-wider">
                Top Monitored Urban Hubs
              </div>
              <div className="space-y-1 text-xs font-sans">
                <div className="flex justify-between p-1.5 bg-white rounded">
                  <span className="text-slate-700">1. Mumbai (West)</span>
                  <span className="text-cyber-red font-bold">ATM_029 • Nariman Pt</span>
                </div>
                <div className="flex justify-between p-1.5 bg-white rounded">
                  <span className="text-slate-700">2. Bhopal (Central)</span>
                  <span className="text-cyber-red font-bold">ATM_023 • MP Nagar</span>
                </div>
                <div className="flex justify-between p-1.5 bg-white rounded">
                  <span className="text-slate-700">3. Bengaluru (South)</span>
                  <span className="text-amber-400 font-bold">ATM_008 • Indiranagar</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 font-sans text-center pt-2">
            Synthetic Dataset A • 15 Indian Municipalities Ground Truth
          </div>
        </div>
      </div>
    </div>
  );
};
