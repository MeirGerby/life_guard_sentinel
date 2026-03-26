import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl:       require('leaflet/dist/images/marker-icon.png'),
  shadowUrl:     require('leaflet/dist/images/marker-shadow.png'),
});

const riskColors = { critical: '#ef4444', warning: '#f59e0b', ok: '#22c55e' };

const MAP_TILES = {
  street:    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  dark:      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  terrain:   'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
};

const MAP_ATTRIBUTIONS = {
  street:    '© OpenStreetMap',
  satellite: '© Esri',
  dark:      '© CartoDB',
  terrain:   '© OpenTopoMap',
};

function createIcon(risk, animate) {
  const color = riskColors[risk] || '#22c55e';
  const animStyle = animate && risk === 'critical'
    ? 'animation: pulse 1s ease-in-out infinite;'
    : '';
  return L.divIcon({
    className: '',
    html: `
      <style>
        @keyframes pulse {
          0%,100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.7; }
        }
      </style>
      <div style="
        width: 18px; height: 18px;
        border-radius: 50%;
        background: ${color};
        border: 2px solid white;
        box-shadow: 0 0 6px rgba(0,0,0,0.4);
        ${animStyle}
      "></div>`,
  });
}

function createHistoryDot(color) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width: 8px; height: 8px;
      border-radius: 50%;
      background: ${color};
      opacity: 0.6;
      border: 1px solid white;
    "></div>`,
  });
}

function FitBounds({ vehicles, autoCenter }) {
  const map = useMap();
  const fitted = useRef(false);
  useEffect(() => {
    if (!autoCenter || fitted.current || vehicles.length === 0) return;
    const bounds = vehicles.map(v => [v.lat, v.lng]);
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
    fitted.current = true;
  }, [vehicles, map, autoCenter]);
  return null;
}

function ZoomController({ defaultZoom }) {
  const map = useMap();
  const prevZoom = useRef(defaultZoom);
  useEffect(() => {
    if (prevZoom.current !== defaultZoom) {
      map.setZoom(defaultZoom);
      prevZoom.current = defaultZoom;
    }
  }, [defaultZoom, map]);
  return null;
}

function TileLayerController({ mapStyle }) {
  const map = useMap();
  const prevStyle = useRef(mapStyle);
  useEffect(() => {
    if (prevStyle.current !== mapStyle) {
      prevStyle.current = mapStyle;
      map.eachLayer(layer => {
        if (layer instanceof L.TileLayer) map.removeLayer(layer);
      });
      L.tileLayer(MAP_TILES[mapStyle] || MAP_TILES.street, {
        attribution: MAP_ATTRIBUTIONS[mapStyle] || '© OpenStreetMap'
      }).addTo(map);
    }
  }, [mapStyle, map]);
  return null;
}


export default function MapView({ vehicles, onSelectVehicle, height, settings, selectedVehicle }) {
  const mapStyle       = settings?.mapStyle       || 'street';
  const showMarkers    = settings?.showMarkers    !== false;
  const animateMarkers = settings?.animateMarkers !== false;
  const autoCenter     = settings?.autoCenter     !== false;
  const defaultZoom    = settings?.defaultZoom    || 14;

  return (
    <MapContainer
      center={[31.785, 35.218]}
      zoom={defaultZoom}
      style={{ height: height || '100%', width: '100%' }}
      preferCanvas={true} // אופטימיזציה חשובה לרינדור של הרבה אלמנטים
    >
      <TileLayer
        url={MAP_TILES[mapStyle] || MAP_TILES.street}
        attribution={MAP_ATTRIBUTIONS[mapStyle] || '© OpenStreetMap'}
      />
      
      <FitBounds vehicles={vehicles} autoCenter={autoCenter} />
      <ZoomController defaultZoom={defaultZoom} />
      <TileLayerController mapStyle={mapStyle} />

      {/* 1. הקלאסטר הראשי - כל הרכבים חייבים להיות בתוכו! */}
      {showMarkers && (
        <MarkerClusterGroup
          chunkedLoading // טעינה במנות כדי לא לתקוע את ה-UI
          maxClusterRadius={50} // רדיוס איחוד המרקרים
        >
          {vehicles.map(v => {
            // וידוא קואורדינטות - אם ב-JSON זה v.location.lat, נשתמש בזה
            const position = v.location ? [v.location.lat, v.location.lon] : [v.lat, v.lng];
            
            return (
              <Marker
                key={v.vehicle_id || v.id}
                position={position}
                icon={createIcon(v.risk_level?.toLowerCase() || 'ok', animateMarkers)}
                eventHandlers={{ click: () => onSelectVehicle(v) }}
              >
                <Popup>
                  <strong>{v.vehicle_id}</strong><br />
                  Driver: {v.owner_name}<br />
                  Temp: {v.internal_temp}°C
                </Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>
      )}

      {/* 2. היסטוריית מסלול לרכב הנבחר בלבד */}
      {selectedVehicle && selectedVehicle.history && selectedVehicle.history.length > 1 && (
        <>
          <Polyline
            positions={selectedVehicle.history}
            color={riskColors[selectedVehicle.risk_level?.toLowerCase()] || '#3b82f6'}
            weight={3}
            opacity={0.7}
            dashArray="6 4"
          />
          {/* נקודות היסטוריה מצוירות כנקודות קטנות ופשוטות */}
          {selectedVehicle.history.slice(0, -1).map((pos, i) => (
            <Marker
              key={`history-${i}`}
              position={pos}
              icon={createHistoryDot(riskColors[selectedVehicle.risk_level?.toLowerCase()] || '#3b82f6')}
            />
          ))}
        </>
      )}
    </MapContainer>
  );
}