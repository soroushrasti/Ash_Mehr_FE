import React, { useEffect, useRef, useState } from 'react';

interface GoogleMapWebProps {
  onLocationSelect: (location: { latitude: number; longitude: number; address: string }) => void;
  initialLocation?: { latitude: number; longitude: number };
  apiKey: string;
}

export default function GoogleMapWeb({ onLocationSelect, initialLocation, apiKey }: GoogleMapWebProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);

  useEffect(() => {
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.onload = () => initMap();
      document.body.appendChild(script);
    } else {
      initMap();
    }
    // eslint-disable-next-line
  }, []);

  const initMap = () => {
    if (!mapRef.current) return;
    const center = initialLocation || { latitude: 35.6892, longitude: 51.389 };
    const gMap = new window.google.maps.Map(mapRef.current, {
      center: { lat: center.latitude, lng: center.longitude },
      zoom: 13,
      mapTypeControl: true,
      zoomControl: true,
      streetViewControl: false,
    });
    setMap(gMap);
    // Add marker if initialLocation
    if (initialLocation) {
      const gMarker = new window.google.maps.Marker({
        position: { lat: center.latitude, lng: center.longitude },
        map: gMap,
      });
      setMarker(gMarker);
    }
    // Add click listener
    gMap.addListener('click', (e: any) => {
      placeMarker(e.latLng, gMap);
    });
    // Add search box
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Search address...';
    input.style.cssText = 'width:300px;margin:8px;padding:8px;border-radius:4px;border:1px solid #ccc;';
    gMap.controls[window.google.maps.ControlPosition.TOP_LEFT].push(input);
    const searchBox = new window.google.maps.places.SearchBox(input);
    searchBox.addListener('places_changed', () => {
      const places = searchBox.getPlaces();
      if (places && places.length > 0) {
        const place = places[0];
        if (place.geometry && place.geometry.location) {
          gMap.panTo(place.geometry.location);
          gMap.setZoom(15);
          placeMarker(place.geometry.location, gMap, place.formatted_address);
        }
      }
    });
  };

  const placeMarker = (latLng: any, gMap: any, addr?: string) => {
    if (marker) marker.setMap(null);
    const gMarker = new window.google.maps.Marker({
      position: latLng,
      map: gMap,
    });
    setMarker(gMarker);
    setLoading(true);
    // Get address from latLng
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: latLng }, (results: any, status: any) => {
      setLoading(false);
      if (status === 'OK' && results && results[0]) {
        setAddress(addr || results[0].formatted_address);
        onLocationSelect({
          latitude: latLng.lat(),
          longitude: latLng.lng(),
          address: addr || results[0].formatted_address,
        });
      } else {
        setAddress('');
        onLocationSelect({
          latitude: latLng.lat(),
          longitude: latLng.lng(),
          address: '',
        });
      }
    });
  };

  return (
    <div style={{ width: '100%', height: 350, position: 'relative', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      {loading && <div style={{ position: 'absolute', top: 8, right: 8, background: '#fff', padding: 8, borderRadius: 4 }}>Loading address...</div>}
      {address && <div style={{ position: 'absolute', bottom: 8, left: 8, background: '#fff', padding: 8, borderRadius: 4, maxWidth: 300, fontSize: 14 }}>Selected Address: {address}</div>}
    </div>
  );
}

