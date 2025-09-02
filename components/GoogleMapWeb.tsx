import React, { useEffect, useRef, useState } from 'react';

interface GoogleMapWebProps {
  onLocationSelect: (location: { latitude: number; longitude: number; address: string }) => void;
  initialLocation?: { latitude: number; longitude: number };
  apiKey: string;
  city?: string; // center by city when provided
  zoom?: number; // initial zoom level
  showControls?: boolean; // toggle map UI controls
}

export default function GoogleMapWeb({ onLocationSelect, initialLocation, apiKey, city, zoom = 13, showControls = true }: GoogleMapWebProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);

  useEffect(() => {
    if (!(window as any).google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker&loading=async`;
      script.async = true;
      script.onload = () => initMap();
      document.body.appendChild(script);
    } else {
      initMap();
    }
    // eslint-disable-next-line
  }, []);

  // Recenter based on city changes
  useEffect(() => {
    if (!map || !city || !(window as any).google) return;
    const geocoder = new (window as any).google.maps.Geocoder();
    geocoder.geocode({ address: city, region: 'IR' }, (results: any, status: any) => {
      if (status === 'OK' && results && results[0]) {
        const res = results[0];
        if (res.geometry?.viewport) {
          map.fitBounds(res.geometry.viewport);
        } else if (res.geometry?.location) {
          map.panTo(res.geometry.location);
          map.setZoom(Math.max(11, Math.min(16, zoom)));
        }
      }
    });
  }, [city, map, zoom]);

  const removeMarker = (m: any) => {
    if (!m) return;
    if (typeof m.setMap === 'function') {
      m.setMap(null);
    } else if ('map' in m) {
      m.map = null;
    }
  };

  const createMarker = (position: any, gMap: any, title?: string) => {
    const adv = (window as any).google?.maps?.marker?.AdvancedMarkerElement;
    if (adv) {
      const m = new adv({ map: gMap, position, title });
      return m;
    }
    return new (window as any).google.maps.Marker({ position, map: gMap, title });
  };

  const addMarkerClick = (m: any, handler: () => void) => {
    // Advanced markers fire 'gmp-click'
    if ((window as any).google?.maps?.marker?.AdvancedMarkerElement && m && typeof m.addListener === 'function') {
      m.addListener('gmp-click', handler);
    } else if (m && typeof m.addListener === 'function') {
      m.addListener('click', handler);
    }
  };

  const initMap = () => {
    if (!mapRef.current || !(window as any).google?.maps) return;
    const center = initialLocation || { latitude: 35.6892, longitude: 51.389 };
    const gMap = new (window as any).google.maps.Map(mapRef.current, {
      center: { lat: center.latitude, lng: center.longitude },
      zoom: Math.max(3, Math.min(20, zoom || 13)),
      mapTypeControl: !!showControls,
      zoomControl: !!showControls,
      streetViewControl: false,
      fullscreenControl: !!showControls,
    });
    setMap(gMap);

    // Add marker if initialLocation
    if (initialLocation) {
      const m = createMarker({ lat: center.latitude, lng: center.longitude }, gMap);
      setMarker(m);
    }

    // Add click listener
    gMap.addListener('click', (e: any) => {
      placeMarker(e.latLng, gMap);
    });

    // Add search box if Places library is available
    const placesNS = (window as any).google?.maps?.places;
    if (placesNS && placesNS.SearchBox) {
      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = 'جستجوی آدرس...';
      input.style.cssText = 'width:300px;margin:8px;padding:8px;border-radius:4px;border:1px solid #ccc;direction:rtl;';
      gMap.controls[(window as any).google.maps.ControlPosition.TOP_LEFT].push(input);
      const searchBox = new placesNS.SearchBox(input);
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
    }

    // If city was provided initially, center to it
    if (city) {
      const geocoder = new (window as any).google.maps.Geocoder();
      geocoder.geocode({ address: city, region: 'IR' }, (results: any, status: any) => {
        if (status === 'OK' && results && results[0]) {
          const res = results[0];
          if (res.geometry?.viewport) {
            gMap.fitBounds(res.geometry.viewport);
          } else if (res.geometry?.location) {
            gMap.panTo(res.geometry.location);
            gMap.setZoom(Math.max(11, Math.min(16, zoom)));
          }
        }
      });
    }
  };

  const placeMarker = (latLng: any, gMap: any, addr?: string) => {
    removeMarker(marker);
    const m = createMarker(latLng, gMap, addr);
    setMarker(m);
    setLoading(true);
    // Get address from latLng
    const geocoder = new (window as any).google.maps.Geocoder();
    geocoder.geocode({ location: latLng }, (results: any, status: any) => {
      setLoading(false);
      if (status === 'OK' && results && results[0]) {
        setAddress(addr || results[0].formatted_address);
        const lat = typeof latLng.lat === 'function' ? latLng.lat() : latLng.lat;
        const lng = typeof latLng.lng === 'function' ? latLng.lng() : latLng.lng;
        onLocationSelect({
          latitude: lat,
          longitude: lng,
          address: addr || results[0].formatted_address,
        });
      } else {
        setAddress('');
        const lat = typeof latLng.lat === 'function' ? latLng.lat() : latLng.lat;
        const lng = typeof latLng.lng === 'function' ? latLng.lng() : latLng.lng;
        onLocationSelect({
          latitude: lat,
          longitude: lng,
          address: '',
        });
      }
    });
  };

  return (
    <div style={{ width: '100%', height: 350, position: 'relative', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      {loading && (
        <div style={{ position: 'absolute', top: 8, right: 8, background: '#fff', padding: 8, borderRadius: 4 }}>در حال دریافت آدرس...</div>
      )}
      {address && (
        <div style={{ position: 'absolute', bottom: 8, left: 8, background: '#fff', padding: 8, borderRadius: 4, maxWidth: 300, fontSize: 14 }}>
          آدرس انتخاب‌شده: {address}
        </div>
      )}
    </div>
  );
}
