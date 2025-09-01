import React, { useEffect, useMemo, useRef } from 'react';

export type NeedyPoint = {
  id: string;
  lat: number;
  lng: number;
  name?: string;
  info?: string;
};

interface NeedyMapProps {
  points: NeedyPoint[];
  initialCenter?: { lat: number; lng: number };
}

export default function NeedyMap({ points, initialCenter }: NeedyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapObj = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const infoWindowsRef = useRef<any[]>([]);
  const clustererRef = useRef<any>(null);

  const center = useMemo(() => initialCenter || { lat: points[0]?.lat || 35.6892, lng: points[0]?.lng || 51.389 }, [initialCenter, points]);

  useEffect(() => {
    let cleanup = () => {};
    const init = async () => {
      if (!(window as any).google) {
        await loadGoogleMaps();
      }
      const { Map } = (window as any).google.maps;
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
      markersRef.current.forEach(m => m.setMap(null));
      infoWindowsRef.current.forEach(iw => iw.close());
      markersRef.current = [];
      infoWindowsRef.current = [];

      // Create markers
      points.forEach(p => {
        const marker = new Marker({
          position: { lat: p.lat, lng: p.lng },
          map,
          icon: {
            path: (window as any).google.maps.SymbolPath.CIRCLE,
            scale: 6,
            fillColor: '#ef4444',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
        });
        markersRef.current.push(marker);

        const info = new (window as any).google.maps.InfoWindow({
          content: `<div style="font-size:12px;font-weight:600">${p.name || 'نیازمند'}</div><div style="font-size:11px;opacity:.8">${p.info || ''}</div>`,
          disableAutoPan: true,
        });
        infoWindowsRef.current.push(info);
        marker.addListener('click', () => {
          info.open({ anchor: marker, map });
        });
      });

      // Clusterer
      clustererRef.current = new MarkerClusterer({ markers: markersRef.current, map });

      const onZoom = () => {
        const z = map.getZoom();
        if (z >= 15) {
          // show labels
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
    };

    init();
    return () => cleanup();
  }, [center, points]);

  return <div style={{ width: '100%', height: 300, borderRadius: 12, overflow: 'hidden' }} ref={mapRef} />;
}

function loadGoogleMaps(): Promise<void> {
  return new Promise((resolve) => {
    const existing = document.querySelector('script[data-google-maps]') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve());
      if ((window as any).google) return resolve();
      return;
    }
    const apiKey = 'AIzaSyCx8-7Y3c7sPHyDfltKMvBitIAmdUwvLFk';
    const script = document.createElement('script');
    script.dataset.googleMaps = 'true';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.onload = () => resolve();
    document.body.appendChild(script);
  });
}
