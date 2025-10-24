"use client";

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Manually import Leaflet and icons to fix the Next.js bug
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon.src,
    iconRetinaUrl: markerIcon2x.src,
    shadowUrl: markerShadow.src,
});

export default function CharityMap({ charities, areaName }) {
  
  // --- THIS IS THE UPDATE ---
  // We no longer use mock data.
  // We filter the real charity list to find ones that have geo-coordinates.
  const charitiesWithGeo = charities.filter(
    (charity) => 
      charity.contact.geo && 
      charity.contact.geo.latitude && 
      charity.contact.geo.longitude
  );
  // --- END OF UPDATE ---

  // Get the center of the map from the first real charity
  const centerLat = charitiesWithGeo.length > 0 ? charitiesWithGeo[0].contact.geo.latitude : 51.5074; // Default to London
  const centerLon = charitiesWithGeo.length > 0 ? charitiesWithGeo[0].contact.geo.longitude : -0.1278; // Default to London

  return (
    <MapContainer 
      center={[centerLat, centerLon]} 
      zoom={11} 
      style={{ height: '400px', width: '100%', borderRadius: '8px' }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      
      {/* We now map over the REAL list: charitiesWithGeo */}
      {charitiesWithGeo.map((charity) => (
        <Marker 
          key={charity.id} 
          position={[
            charity.contact.geo.latitude, 
            charity.contact.geo.longitude
          ]}
        >
          <Popup>
            <strong className="text-gray-900">{charity.names[0].value}</strong>
            <p className="text-gray-700">{charity.activities.substring(0, 100)}...</p>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}