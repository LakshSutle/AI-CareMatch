// CaregiverMap — Google Maps cab-booking style component
// Uses direct script loading (compatible with all versions)
import { useEffect, useRef, useState } from 'react';

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY;
const isConfigured = MAPS_KEY && !MAPS_KEY.includes('your-');

const DEFAULT_CENTER = { lat: 17.4400, lng: 78.4489 };

function loadGoogleMaps(apiKey) {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      resolve(window.google.maps);
      return;
    }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google.maps);
    script.onerror = () => reject(new Error('Google Maps failed to load'));
    document.head.appendChild(script);
  });
}

export default function CaregiverMap({ caregivers = [], userLocation = null, selectedId = null, onSelectCaregiver }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);
  const routeRendererRef = useRef(null);
  const userCircleRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [userPos, setUserPos] = useState(userLocation || DEFAULT_CENTER);
  const [gm, setGm] = useState(null);
  const [mapError, setMapError] = useState(null);

  // Get user's real location
  useEffect(() => {
    if (!userLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setUserPos(DEFAULT_CENTER),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, [userLocation]);

  // Load Google Maps script & initialize
  useEffect(() => {
    if (!isConfigured || !mapRef.current || mapLoaded) return;

    loadGoogleMaps(MAPS_KEY).then((maps) => {
      setGm(maps);
      const map = new maps.Map(mapRef.current, {
        center: userPos,
        zoom: 13,
        styles: [
          { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
          { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a2e' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#8b8fa3' }] },
          { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2a2a4a' }] },
          { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
          { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1626' }] },
          { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
          { featureType: 'transit', stylers: [{ visibility: 'off' }] },
        ],
        disableDefaultUI: true,
        zoomControl: true,
      });
      mapInstanceRef.current = map;
      setMapLoaded(true);
    }).catch((err) => {
      console.error('Map error:', err);
      setMapError('Google Maps failed to load. Check API key and billing.');
    });
  }, [mapLoaded, userPos]);

  // Add markers
  useEffect(() => {
    if (!mapLoaded || !gm || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    // Clear old user marker when position updates
    if (userMarkerRef.current) {
      userMarkerRef.current.setMap(null);
      userMarkerRef.current = null;
    }
    if (userCircleRef.current) {
      userCircleRef.current.setMap(null);
      userCircleRef.current = null;
    }

    // User marker — always re-create at latest position
    if (userPos) {
      userMarkerRef.current = new gm.Marker({
        position: userPos, map,
        icon: { path: gm.SymbolPath.CIRCLE, scale: 10, fillColor: '#4F46E5', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 3 },
        title: 'Your Location', zIndex: 200,
      });
      // Accuracy ring around user
      userCircleRef.current = new gm.Circle({ map, center: userPos, radius: 300, fillColor: '#4F46E5', fillOpacity: 0.1, strokeColor: '#4F46E5', strokeOpacity: 0.3, strokeWeight: 1 });
      // Re-center map on user
      map.panTo(userPos);
    }

    // Caregiver markers
    caregivers.forEach((cg) => {
      const isSel = cg.id === selectedId;
      const marker = new gm.Marker({
        position: { lat: cg.location.lat, lng: cg.location.lng }, map, title: cg.name,
        icon: { path: gm.SymbolPath.CIRCLE, scale: isSel ? 14 : 10, fillColor: cg.govVerified ? '#10B981' : '#F59E0B', fillOpacity: 0.9, strokeColor: isSel ? '#818CF8' : '#fff', strokeWeight: isSel ? 3 : 2 },
        zIndex: isSel ? 100 : 1,
      });

      const info = new gm.InfoWindow({
        content: `<div style="font-family:Inter,sans-serif;padding:8px;min-width:180px;color:#1a1a2e">
          <strong>${cg.name}</strong>
          <div style="font-size:11px;color:#666;margin:4px 0">${cg.govVerified ? '🏛️ Verified' : '⏳ Pending'} • ${cg.domain === 'child' ? '👶 Child' : cg.domain === 'human' ? '🧑 Human' : '🐾 Pet'}</div>
          <div style="font-size:12px">⭐ Trust: ${cg.trustScore}/100 • ₹${cg.dailyCost}/day</div>
          <div style="font-size:11px;color:#666">${cg.specializations.slice(0, 3).join(', ')}</div>
        </div>`,
      });

      marker.addListener('click', () => { info.open(map, marker); onSelectCaregiver?.(cg.id); });
      if (isSel) { info.open(map, marker); map.panTo({ lat: cg.location.lat, lng: cg.location.lng }); }
      markersRef.current.push(marker);
    });
  }, [caregivers, gm, mapLoaded, onSelectCaregiver, selectedId, userPos]);

  // Route to selected caregiver
  useEffect(() => {
    if (!mapLoaded || !gm || !selectedId || !userPos) return;
    const map = mapInstanceRef.current;
    const cg = caregivers.find(c => c.id === selectedId);
    if (!cg) return;

    if (routeRendererRef.current) routeRendererRef.current.setMap(null);

    const renderer = new gm.DirectionsRenderer({
      map, suppressMarkers: true,
      polylineOptions: { strokeColor: '#818CF8', strokeOpacity: 0.8, strokeWeight: 4 },
    });
    routeRendererRef.current = renderer;

    new gm.DirectionsService().route({
      origin: userPos,
      destination: { lat: cg.location.lat, lng: cg.location.lng },
      travelMode: gm.TravelMode.DRIVING,
    }, (result, status) => { if (status === 'OK') renderer.setDirections(result); });
  }, [caregivers, gm, mapLoaded, selectedId, userPos]);

  if (!isConfigured) {
    return (
      <div className="map-placeholder glass-card">
        <div className="map-placeholder-inner"><span>🗺️</span><p>Configure <code>VITE_GOOGLE_MAPS_KEY</code> to enable live map</p></div>
        <style>{`.map-placeholder{padding:var(--space-8);text-align:center}.map-placeholder-inner{display:flex;flex-direction:column;align-items:center;gap:var(--space-2);color:var(--text-muted)}.map-placeholder span{font-size:2rem}.map-placeholder code{color:var(--primary-400);font-size:var(--fs-xs)}`}</style>
      </div>
    );
  }

  if (mapError) {
    return (
      <div className="map-placeholder glass-card">
        <div className="map-placeholder-inner"><span>⚠️</span><p>{mapError}</p></div>
        <style>{`.map-placeholder{padding:var(--space-8);text-align:center}.map-placeholder-inner{display:flex;flex-direction:column;align-items:center;gap:var(--space-2);color:var(--text-muted)}.map-placeholder span{font-size:2rem}`}</style>
      </div>
    );
  }

  return (
    <div className="caregiver-map">
      <div ref={mapRef} className="map-container" />
      <div className="map-legend">
        <span className="legend-item"><span className="legend-dot green" /> Verified</span>
        <span className="legend-item"><span className="legend-dot amber" /> Pending</span>
        <span className="legend-item"><span className="legend-dot purple" /> You</span>
      </div>
      <style>{`
        .caregiver-map{position:relative;border-radius:var(--radius-xl);overflow:hidden;border:1px solid var(--border-glass)}
        .map-container{width:100%;height:400px}
        .map-legend{position:absolute;bottom:12px;left:12px;display:flex;gap:var(--space-3);background:rgba(15,13,26,0.85);backdrop-filter:blur(10px);padding:var(--space-2) var(--space-3);border-radius:var(--radius-full);border:1px solid var(--border-glass);font-size:var(--fs-xs)}
        .legend-item{display:flex;align-items:center;gap:4px;color:var(--text-secondary)}
        .legend-dot{width:8px;height:8px;border-radius:50%}
        .legend-dot.green{background:#10B981}.legend-dot.amber{background:#F59E0B}.legend-dot.purple{background:#4F46E5}
        @media(max-width:768px){.map-container{height:300px}}
      `}</style>
    </div>
  );
}
