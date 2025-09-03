import React, { useEffect, useRef, useState } from 'react';
import { Config } from '@/constants/Config';

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
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  const log = (msg: string) => {
    const line = `[web-map] ${new Date().toISOString()} ${msg}`;
    // eslint-disable-next-line no-console
    console.log(line);
    setDebugLogs((prev) => [...prev.slice(-150), line]);
  };

  useEffect(() => {
    const el = mapRef.current;
    if (el) {
      const { offsetWidth, offsetHeight } = el;
      const cs = window.getComputedStyle(el);
      log(`container size ${offsetWidth}x${offsetHeight}; display=${cs.display}; visibility=${cs.visibility}`);
    }
  }, []);

  useEffect(() => {
    if (!(window as any).google) {
      const sExisting = document.querySelector('script[data-google-maps]') as HTMLScriptElement | null;
      if (!sExisting) {
        const script = document.createElement('script');
        script.dataset.googleMaps = 'true';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker&loading=async`;
        script.async = true;
        script.onload = () => { log('google maps script onload'); initMap(); };
        script.onerror = (e) => { log('google maps script onerror'); };
        document.body.appendChild(script);
        log('google maps script appended');
      } else {
        sExisting.onload = () => { log('google maps existing script onload'); initMap(); };
        sExisting.onerror = () => { log('google maps existing script onerror'); };
      }

      const t = window.setTimeout(() => {
        if (!(window as any).google) {
          log('google not present after timeout (10s)');
        }
      }, 10000);
      return () => window.clearTimeout(t);
    } else {
      log('google already present; initializing map');
      initMap();
    }
    // eslint-disable-next-line
  }, []);

  // Recenter based on city changes
  useEffect(() => {
    if (!map || !city || !(window as any).google) return;
    const geocoder = new (window as any).google.maps.Geocoder();
    geocoder.geocode({ address: city, region: 'IR' }, (results: any, status: any) => {
      log(`geocode city status=${status}`);
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
    try {
      if (typeof m.setMap === 'function') {
        m.setMap(null);
      } else if ('map' in m) {
        (m as any).map = null;
      }
    } catch (e: any) {
      log(`removeMarker error: ${String(e?.message || e)}`);
    }
  };

  const createMarker = (position: any, gMap: any, title?: string) => {
    try {
      // Coerce literal objects to numbers if present
      if (position && typeof position.lat !== 'function') {
        const latN = Number(position.lat);
        const lngN = Number(position.lng);
        position = { lat: isFinite(latN) ? latN : 0, lng: isFinite(lngN) ? lngN : 0 };
      }
      const adv = (window as any).google?.maps?.marker?.AdvancedMarkerElement;
      if (adv) {
        const m = new adv({ map: gMap, position, title });
        return m;
      }
      return new (window as any).google.maps.Marker({ position, map: gMap, title });
    } catch (e: any) {
      log(`createMarker error: ${String(e?.message || e)}`);
      return null;
    }
  };

  const addMarkerClick = (m: any, handler: () => void) => {
    try {
      // Advanced markers fire 'gmp-click'
      if ((window as any).google?.maps?.marker?.AdvancedMarkerElement && m && typeof m.addListener === 'function') {
        m.addListener('gmp-click', handler);
      } else if (m && typeof m.addListener === 'function') {
        m.addListener('click', handler);
      }
    } catch (e: any) {
      log(`addMarkerClick error: ${String(e?.message || e)}`);
    }
  };

  const initMap = () => {
    try {
      if (!mapRef.current || !(window as any).google?.maps) {
        log('initMap aborted: missing mapRef or google.maps');
        return;
      }
      const centerRaw = initialLocation || { latitude: 35.6892, longitude: 51.389 };
      const latN = Number((centerRaw as any).latitude);
      const lngN = Number((centerRaw as any).longitude);
      const center = { lat: isFinite(latN) ? latN : 35.6892, lng: isFinite(lngN) ? lngN : 51.389 };

      const gMap = new (window as any).google.maps.Map(mapRef.current, {
        center,
        zoom: Math.max(3, Math.min(20, zoom || 13)),
        mapTypeControl: !!showControls,
        zoomControl: !!showControls,
        streetViewControl: false,
        fullscreenControl: !!showControls,
      });
      setMap(gMap);
      log(`map created center=(${center.lat},${center.lng}) zoom=${zoom}`);

      gMap.addListener('idle', () => log('map idle'));
      gMap.addListener('tilesloaded', () => log('map tilesloaded'));

      // Add marker if initialLocation
      if (initialLocation) {
        const m = createMarker(center, gMap);
        setMarker(m);
        log('initial marker added');
      }

      // Add click listener
      gMap.addListener('click', (e: any) => {
        log(`map click lat=${e?.latLng?.lat?.()} lng=${e?.latLng?.lng?.()}`);
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
          log(`places_changed count=${places?.length ?? 0}`);
          if (places && places.length > 0) {
            const place = places[0];
            if (place.geometry && place.geometry.location) {
              gMap.panTo(place.geometry.location);
              gMap.setZoom(15);
              placeMarker(place.geometry.location, gMap, place.formatted_address);
            }
          }
        });
      } else {
        log('places library not available');
      }

      // If city was provided initially, center to it
      if (city) {
        const geocoder = new (window as any).google.maps.Geocoder();
        geocoder.geocode({ address: city, region: 'IR' }, (results: any, status: any) => {
          log(`initial geocode city status=${status}`);
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
    } catch (e: any) {
      log(`initMap error: ${String(e?.message || e)}`);
    }
  };

  const placeMarker = (latLng: any, gMap: any, addr?: string) => {
    try {
      removeMarker(marker);
      const m = createMarker(latLng, gMap, addr);
      setMarker(m);
      setLoading(true);
      // Get address from latLng
      const geocoder = new (window as any).google.maps.Geocoder();
      geocoder.geocode({ location: latLng }, (results: any, status: any) => {
        setLoading(false);
        log(`reverse geocode status=${status}`);
        const lat = typeof latLng.lat === 'function' ? latLng.lat() : latLng.lat;
        const lng = typeof latLng.lng === 'function' ? latLng.lng() : latLng.lng;
        if (status === 'OK' && results && results[0]) {
          setAddress(addr || results[0].formatted_address);
          onLocationSelect({ latitude: lat, longitude: lng, address: addr || results[0].formatted_address });
        } else {
          setAddress('');
          onLocationSelect({ latitude: lat, longitude: lng, address: '' });
        }
      });
    } catch (e: any) {
      setLoading(false);
      log(`placeMarker error: ${String(e?.message || e)}`);
    }
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
      {Config.DEBUG_MODE && (
        <div style={{ position: 'absolute', top: 8, left: 8, right: 8, maxHeight: 180, overflow: 'auto', background: 'rgba(0,0,0,0.65)', borderRadius: 8, padding: 8 }}>
          <div style={{ color: '#fff', fontSize: 11, marginBottom: 4 }}>apiKey length: {apiKey?.length || 0}</div>
          {debugLogs.map((l, i) => (
            <div key={i} style={{ color: '#fff', fontSize: 10, marginBottom: 2 }}>{l}</div>
          ))}
        </div>
      )}
    </div>
  );
}
