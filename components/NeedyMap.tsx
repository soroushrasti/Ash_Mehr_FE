import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Config } from '@/constants/Config';

export type NeedyPoint = {
  id: string;
  lat: number;
  lng: number;
  name?: string;
  info?: string;
};

interface NeedyMapProps {
  points: NeedyPoint[];
  adminPoints?: NeedyPoint[]; // new: admins with different color
  initialCenter?: { lat: number; lng: number };
}

export default function NeedyMap({ points, adminPoints = [], initialCenter }: NeedyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapObj = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const infoWindowsRef = useRef<any[]>([]);
  const clustererRef = useRef<any>(null);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  const log = (msg: string) => {
    const line = `[web-needy-map] ${new Date().toISOString()} ${msg}`;
    // eslint-disable-next-line no-console
    console.log(line);
    setDebugLogs((prev) => [...prev.slice(-150), line]);
  };

  const center = useMemo(() => initialCenter || { lat: (points[0]?.lat ?? adminPoints[0]?.lat ?? 35.6892), lng: (points[0]?.lng ?? adminPoints[0]?.lng ?? 51.389) }, [initialCenter, points, adminPoints]);

  useEffect(() => {
    let cleanup = () => {};
    const init = async () => {
      try {
        if (!(window as any).google) {
          log('google missing, injecting script');
          await loadGoogleMaps(log);
        }
        const { Map } = (window as any).google.maps;
        if (!mapRef.current) { log('mapRef missing, abort init'); return; }
        const map = new Map(mapRef.current!, {
          center,
          zoom: 12,
          mapTypeControl: false,
          streetViewControl: false,
        });
        mapObj.current = map;
        log(`map created center=(${center.lat},${center.lng})`);

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
        log(`render markers needy=${points.length} admins=${adminPoints.length}`);
        points.forEach(p => addMarker(p, '#ef4444', 'نیازمند'));
        adminPoints.forEach(p => addMarker(p, '#2563eb', 'مدیر'));

        // Clusterer
        clustererRef.current = new MarkerClusterer({ markers: markersRef.current, map });
        log('clusterer initialized');

        const onZoom = () => {
          const z = map.getZoom();
          log(`zoom_changed z=${z}`);
          if (z >= 15) {
            infoWindowsRef.current.forEach((iw, idx) => iw.open({ anchor: markersRef.current[idx], map }));
          } else {
            infoWindowsRef.current.forEach(iw => iw.close());
          }
        };
        map.addListener('zoom_changed', onZoom);

        cleanup = () => {
          log('cleanup listeners and markers');
          map && (window as any).google.maps.event.clearInstanceListeners(map);
          markersRef.current.forEach(m => (window as any).google.maps.event.clearInstanceListeners(m));
          infoWindowsRef.current.forEach(iw => iw.close());
          clustererRef.current && clustererRef.current.clearMarkers();
        };
      } catch (e: any) {
        log(`init error: ${String(e?.message || e)}`);
      }
    };

    init();
    return () => cleanup();
  }, [center, points, adminPoints]);

  return (
    <div style={{ width: '100%', height: 300, borderRadius: 12, overflow: 'hidden', position: 'relative' }} ref={mapRef}>
      {Config.DEBUG_MODE && (
        <div style={{ position: 'absolute', top: 8, left: 8, right: 8, maxHeight: 160, overflow: 'auto', background: 'rgba(0,0,0,0.65)', borderRadius: 8, padding: 8 }}>
          {debugLogs.map((l, i) => (<div key={i} style={{ color: '#fff', fontSize: 10, marginBottom: 2 }}>{l}</div>))}
        </div>
      )}
    </div>
  );
}

function loadGoogleMaps(log?: (m: string) => void): Promise<void> {
  return new Promise((resolve) => {
    const existing = document.querySelector('script[data-google-maps]') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => { log?.('script existing onload'); resolve(); });
      if ((window as any).google) { log?.('google already present'); return resolve(); }
      return;
    }
    const apiKey = Config.GOOGLE_MAPS_API_KEY;
    const script = document.createElement('script');
    script.dataset.googleMaps = 'true';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.onload = () => { log?.('script onload'); resolve(); };
    script.onerror = () => { log?.('script onerror'); resolve(); };
    document.body.appendChild(script);
    log?.('script appended');
  });
}
