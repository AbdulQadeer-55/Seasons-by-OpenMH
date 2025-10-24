"use client";

// We import the map components from 'react-leaflet'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

// We import the CSS for Leaflet
import 'leaflet/dist/leaflet.css';

// --- This is the critical fix for an icon bug in Next.js ---
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css';
import 'leaflet-defaulticon-compatibility';
// --- End of fix ---

// This component receives the list of charities from our API
export default function CharityMap({ charities, areaName }) {
  
  // We need to find the lat/lon for the charities
  // Note: Your CharityBase query doesn't ask for geo-coordinates.
  // We will need to update our API query later to get real lat/lon.
  // For now, this component is a placeholder.
  
  // --- TEMPORARY MOCK DATA ---
  // We'll use this until we update our API
  const mockCharitiesWithGeo = charities.map((charity, index) => ({
    ...charity,
    lat: 51.5074 + (index * 0.01), // Fake latitude near London
    lon: -0.1278 + (index * 0.01), // Fake longitude near London
  }));
  // --- END OF MOCK DATA ---

  // Get the center of the map
  const centerLat = mockCharitiesWithGeo.length > 0 ? mockCharitiesWithGeo[0].lat : 51.5074;
  const centerLon = mockCharitiesWithGeo.length > 0 ? mockCharitiesWithGeo[0].lon : -0.1278;

  return (
    <MapContainer 
      center={[centerLat, centerLon]} 
      zoom={11} 
      style={{ height: '400px', width: '100%', borderRadius: '8px' }}
    >
      {/* This adds the dark map "tiles" (the map image) */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      
      {/* We loop over each charity and create a map pin (Marker) */}
      {mockCharitiesWithGeo.map((charity) => (
        <Marker key={charity.id} position={[charity.lat, charity.lon]}>
          <Popup>
            {/* This is the little bubble that opens when you click a pin */}
            <strong className="text-gray-900">{charity.names[0].value}</strong>
            <p className="text-gray-700">{charity.activities.substring(0, 100)}...</p>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}