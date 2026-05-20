'use client';

import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import { MessageCircle, Zap, Plus, Minus } from 'lucide-react';

// --- ICONS ---
const createCustomIcon = (color: string, iconChar: string, isHot: boolean, pulse: boolean) => {
  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center">
        ${pulse ? `<div class="absolute inset-0 rounded-full animate-ping scale-150" style="background-color: ${color}44"></div>` : ''}
        <svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.268 21.732 0 14 0z" fill="${color}" stroke="#0f172a" stroke-width="1.5"/>
          <circle cx="14" cy="13" r="6" fill="white" opacity="0.9"/>
          <text x="14" y="16" text-anchor="middle" font-size="10" font-weight="bold" fill="#0f172a">${iconChar}</text>
        </svg>
      </div>
    `,
    className: 'custom-lead-marker',
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -36]
  });
};

const icons = {
  inactive: createCustomIcon('#b45309', '★', false, false), // Laranja Escuro (Inativo/Base)
  aware: createCustomIcon('#ea580c', '●', false, false), // Laranja Médio (Abriu E-mail)
  interested: createCustomIcon('#f97316', '🔥', true, true), // Laranja Vivo (Clicou/Engajado)
  trial: createCustomIcon('#0ea5e9', '⚡', true, true), // Sky-500 (Teste 7 Dias)
  converted: createCustomIcon('#00FF00', '✓', false, false) // Verde Fluor (Assinante)
};

function ZoomControls() {
  const map = useMap();
  return (
    <div className="absolute top-0 right-0 z-[1000] flex flex-col">
      <button
        onClick={() => map.setZoom(map.getZoom() + 1)}
        className="w-12 h-12 bg-black/60 backdrop-blur-xl border-l border-b border-white/10 flex items-center justify-center text-white hover:bg-[#FF5500] transition-all">
        
        <Plus className="w-5 h-5" />
      </button>
      <button
        onClick={() => map.setZoom(map.getZoom() - 1)}
        className="w-12 h-12 bg-black/60 backdrop-blur-xl border-l border-b border-white/10 flex items-center justify-center text-white hover:bg-[#FF5500] transition-all">
        
        <Minus className="w-5 h-5" />
      </button>
    </div>);

}

function MapController({ center }: {center: [number, number] | null;}) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 13, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

interface Props {
  leads: any[];
  selectedLead: any;
  onSelectLead: (lead: any) => void;
}

export default function LeadMapInner({ leads, selectedLead, onSelectLead }: Props) {
  return (
    <>
      <MapContainer
        center={[-14.235, -51.9253]}
        zoom={5}
        className="h-full w-full"
        zoomControl={false}
        style={{ background: '#0a0e1a' }}>
        
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        
        <ZoomControls />
        <MapController center={selectedLead ? [selectedLead.latitude, selectedLead.longitude] : null} />
        
        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={40}
          showCoverageOnHover={false}>
          
          {useMemo(() => leads.filter((l) => l.latitude && l.longitude).map((lead) => {
            let icon = icons.inactive;
            if (lead.status === 'CONVERTED' || lead.funnelStage === 'CONVERTED') icon = icons.converted;else
            if (lead.status === 'TRIAL_STARTED' || lead.funnelStage === 'TRIAL') icon = icons.trial;else
            if (lead.status === 'QUALIFIED' || lead.funnelStage === 'INTERESTED' || lead.conversionScore >= 50) icon = icons.interested;else
            if (lead.funnelStage === 'AWARE' || lead.funnelStage === 'ENGAGED') icon = icons.aware;

            return (
              <Marker
                key={lead.id}
                position={[lead.latitude, lead.longitude]}
                icon={icon}
                eventHandlers={{
                  click: () => onSelectLead(lead)
                }}>
                
              <Popup className="zehla-custom-popup">
                <div className="p-3 min-w-[220px] bg-[#0d1117] text-white">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-xs font-bold leading-tight pr-4">{lead.name}</h4>
                    <div className="px-1.5 py-0.5 rounded-full bg-[#FF5500]/20 border border-[#FF5500]/30 text-[#FF5500] text-[8px] font-bold">
                      {lead.score}%
                    </div>
                  </div>
                  <p className="text-[9px] text-zinc-500 mb-2">{lead.city} / {lead.state}</p>
                  <a
                      href={`https://wa.me/${lead.whatsapp}`}
                      target="_blank"
                      className="w-full flex items-center justify-center gap-1.5 bg-[#25D366] py-1.5 rounded-lg text-[9px] font-bold uppercase">
                      
                    <MessageCircle className="w-3 h-3" />
                    WhatsApp
                  </a>
                </div>
              </Popup>
              </Marker>);

          }), [])}
        </MarkerClusterGroup>
      </MapContainer>

      <style jsx global>{`
        .zehla-custom-popup .leaflet-popup-content-wrapper {
          background: #0d1117 !important;
          color: white !important;
          border-radius: 12px !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          padding: 0 !important;
        }
        .zehla-custom-popup .leaflet-popup-content {
          margin: 0 !important;
        }
        .zehla-custom-popup .leaflet-popup-tip {
          background: #0d1117 !important;
        }
        .marker-cluster {
          background-clip: padding-box;
          border-radius: 20px;
        }
        .marker-cluster div {
          width: 30px;
          height: 30px;
          margin-left: 5px;
          margin-top: 5px;
          text-align: center;
          border-radius: 15px;
          font-size: 12px;
          background-color: rgba(255, 85, 0, 0.6);
          color: white;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </>);

}