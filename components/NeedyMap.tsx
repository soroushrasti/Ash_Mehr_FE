import React, { useEffect, useMemo, useRef } from 'react';
import { Config } from '@/constants/Config';
import { Platform } from 'react-native';
import GoogleMapWeb from './GoogleMapWeb';

export type NeedyPoint = {
  id: string;
  lat: number;
  lng: number;
  name?: string;
  info?: string;
};

interface NeedyMapProps {
  points: NeedyPoint[];
  adminPoints?: NeedyPoint[]; // admins with different color
  initialCenter?: { lat: number; lng: number };
  onLocationSelect?: (location: { latitude: number; longitude: number }) => void;
  selectedLocation?: { latitude: number; longitude: number } | null;
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  style?: any;
  showCurrentLocation?: boolean;
}

export default function NeedyMap({ points, adminPoints = [], initialCenter, ...props }: NeedyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapObj = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const infoWindowsRef = useRef<any[]>([]);
  const clustererRef = useRef<any>(null);

  const center = useMemo(() => initialCenter || { lat: (points[0]?.lat ?? adminPoints[0]?.lat ?? 35.6892), lng: (points[0]?.lng ?? adminPoints[0]?.lng ?? 51.389) }, [initialCenter, points, adminPoints]);

  useEffect(() => {
    let cleanup = () => {};
    const init = async () => {
      try {
        if (!(window as any).google) {
          await loadGoogleMaps();
        }
        const { Map } = (window as any).google.maps;
        if (!mapRef.current) { return; }
        const map = new Map(mapRef.current!, {
          center,
          zoom: 12,
          mapTypeControl: false,
          streetViewControl: false,
        });
        mapObj.current = map;

        const { Marker } = (window as any).google.maps;
        const { MarkerClusterer } = await import('@googlemaps/markerclusterer');

        // Clear previous
        markersRef.current.forEach(m => m.setMap && m.setMap(null));
        infoWindowsRef.current.forEach(iw => iw.close && iw.close());
        markersRef.current = [];
        infoWindowsRef.current = [];

        // Helper to build marker
        const addMarker = (p: NeedyPoint, color: string, label: string) => {
          const marker = new Marker({
            position: { lat: p.lat, lng: p.lng },
            map,
            icon: {
              path: (window as any).google.maps.SymbolPath.CIRCLE,
              scale: 6,
              fillColor: color,
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            },
          });
          markersRef.current.push(marker);
          const info = new (window as any).google.maps.InfoWindow({
            content: `<div style="font-size:12px;font-weight:600">${p.name || label}</div><div style="font-size:11px;opacity:.8">${p.info || ''}</div>`,
            disableAutoPan: true,
          });
          infoWindowsRef.current.push(info);
          marker.addListener('click', () => info.open({ anchor: marker, map }));
        };

        // Create markers for needy (red) and admins (blue)
        points.forEach(p => addMarker(p, '#ef4444', 'مددجو'));
        adminPoints.forEach(p => addMarker(p, '#2563eb', 'نماینده'));

        // Clusterer
        clustererRef.current = new MarkerClusterer({ markers: markersRef.current, map });

        const onZoom = () => {
          const z = map.getZoom();
          if (z >= 15) {
            infoWindowsRef.current.forEach((iw, idx) => iw.open({ anchor: markersRef.current[idx], map }));
          } else {
            infoWindowsRef.current.forEach(iw => iw.close());
          }
        };
        map.addListener('zoom_changed', onZoom);

        cleanup = () => {
          map && (window as any).google.maps.event.clearInstanceListeners(map);
          markersRef.current.forEach(m => (window as any).google.maps.event.clearInstanceListeners(m));
          infoWindowsRef.current.forEach(iw => iw.close());
          clustererRef.current && clustererRef.current.clearMarkers();
        };
      } catch {
        // no-op
      }
    };

    if (Platform.OS === 'web') {
      init();
    }
    return () => cleanup();
  }, [center, points, adminPoints]);

  if (Platform.OS === 'web') {
    return <GoogleMapWeb {...props} />;
  }

  return (
    <div style={{ width: '100%', height: 300, borderRadius: 12, overflow: 'hidden', position: 'relative' }} ref={mapRef} />
  );
}

function loadGoogleMaps(): Promise<void> {
  return new Promise((resolve) => {
    const existing = document.querySelector('script[data-google-maps]') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => { resolve(); });
      if ((window as any).google) { return resolve(); }
      return;
    }
    const script = document.createElement('script');
    script.dataset.googleMaps = 'true';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${Config.GOOGLE_MAPS_API_KEY}`;
    script.async = true;
    script.onload = () => { resolve(); };
    script.onerror = () => { resolve(); };
    document.body.appendChild(script);
  });
}
