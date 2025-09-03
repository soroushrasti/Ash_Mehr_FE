import React, { useMemo, useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, LayoutChangeEvent, ScrollView } from 'react-native';
import Constants from 'expo-constants';
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
  initialRegion?: any; // keep loose to avoid importing Region type from react-native-maps at module scope
}

export default function NeedyMap({ points, initialRegion }: NeedyMapProps) {
  const [region, setRegion] = useState<any | undefined>(initialRegion);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const containerSize = useRef<{ w: number; h: number }>({ w: 0, h: 0 });

  const log = (msg: string) => {
    const line = `[native-map] ${new Date().toISOString()} ${msg}`;
    // eslint-disable-next-line no-console
    console.log(line);
    setDebugLogs((prev) => [...prev.slice(-80), line]);
  };

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    containerSize.current = { w: width, h: height };
    log(`container onLayout width=${width} height=${height}`);
  };

  const defaultRegion: any = useMemo(() => ({
    latitude: initialRegion?.latitude ?? (points[0]?.lat || 35.6892),
    longitude: initialRegion?.longitude ?? (points[0]?.lng || 51.389),
    latitudeDelta: initialRegion?.latitudeDelta ?? 0.2,
    longitudeDelta: initialRegion?.longitudeDelta ?? 0.2,
  }), [initialRegion, points]);

  const isExpoGo = Constants?.appOwnership === 'expo';

  // Compute map module without logging during render to avoid re-render loops
  const mapsModule = useMemo(() => {
    if (isExpoGo) return null;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return require('react-native-maps');
    } catch {
      return null;
    }
  }, [isExpoGo]);

  useEffect(() => {
    if (isExpoGo) {
      log('running in Expo Go; react-native-maps not available');
    } else if (mapsModule) {
      log('react-native-maps module loaded');
    } else {
      log('failed to load react-native-maps');
    }
  }, [isExpoGo, !!mapsModule]);

  useEffect(() => {
    log(`initial points=${points.length}, initialRegion=${JSON.stringify(initialRegion || {})}`);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!mapsModule) {
    return (
      <View onLayout={onLayout} style={[styles.container, { alignItems: 'center', justifyContent: 'center', backgroundColor: '#f2f2f2' }]}>
        <Text>نمایش نقشه در این نسخه در دسترس نیست.</Text>
        <Text style={{ marginTop: 6, opacity: 0.8, fontSize: 12 }}>برای مشاهده نقشه، اپلیکیشن را با پکیج react-native-maps بیلد کنید.</Text>
        {Config.DEBUG_MODE && (
          <ScrollView style={styles.debugOverlay} contentContainerStyle={{ padding: 8 }}>
            {debugLogs.map((l, i) => (<Text key={i} style={styles.debugText}>{l}</Text>))}
          </ScrollView>
        )}
      </View>
    );
  }

  const MapView = (mapsModule.default || mapsModule.MapView) as any;
  const Marker = mapsModule.Marker as any;
  const Callout = mapsModule.Callout as any;

  // Compute clustering component without logging during render
  const ClusterComponent: any = useMemo(() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mod = require('react-native-map-clustering');
      const DefaultExport = mod && (mod.default || mod);
      if (typeof DefaultExport === 'function') {
        return DefaultExport;
      }
    } catch {}
    return MapView;
  }, [MapView]);

  useEffect(() => {
    if (ClusterComponent === MapView) {
      log('react-native-map-clustering not available');
    } else {
      log('react-native-map-clustering loaded');
    }
  // We intentionally do not include MapView in deps to avoid noisy logs
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ClusterComponent]);

  const isZoomedIn = (reg: any | undefined) => {
    if (!reg) return false;
    return reg.latitudeDelta < 0.05; // threshold for showing labels
  };

  return (
    <View style={styles.container} onLayout={onLayout}>
      <ClusterComponent
        style={styles.map}
        initialRegion={defaultRegion}
        region={region}
        onRegionChangeComplete={(r: any) => {
          log(`onRegionChangeComplete lat=${r.latitude} lng=${r.longitude} dLat=${r.latitudeDelta} dLng=${r.longitudeDelta}`);
          setRegion(r);
        }}
        onMapReady={() => log('onMapReady fired')}
        onMapLoaded={() => log('onMapLoaded fired')}
        // @ts-expect-error: Android only
        onUserLocationChange={(e: any) => log(`onUserLocationChange lat=${e?.nativeEvent?.coordinate?.latitude} lng=${e?.nativeEvent?.coordinate?.longitude}`)}
        onPress={(e: any) => log(`onPress at lat=${e?.nativeEvent?.coordinate?.latitude}, lng=${e?.nativeEvent?.coordinate?.longitude}`)}
      >
        {points.map((p) => (
          <Marker key={p.id} coordinate={{ latitude: p.lat, longitude: p.lng }} onPress={() => log(`marker press id=${p.id}`)}>
            <View style={styles.redDot} />
            {isZoomedIn(region) && (
              <View style={styles.labelBubble}>
                <Text style={styles.labelText} numberOfLines={1}>{p.name || 'نیازمند'}</Text>
              </View>
            )}
            <Callout onPress={() => log(`callout press id=${p.id}`)}>
              <View style={{ maxWidth: 220 }}>
                <Text style={{ fontWeight: '700', marginBottom: 4 }}>{p.name || 'نیازمند'}</Text>
                <Text>{p.info || 'اطلاعات بیشتر در دسترس نیست'}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </ClusterComponent>

      {Config.DEBUG_MODE && (
        <ScrollView style={styles.debugOverlay} contentContainerStyle={{ padding: 8 }}>
          <Text style={styles.debugText}>apiKey(meta) present: unknown (native)</Text>
          <Text style={styles.debugText}>container: {containerSize.current.w}x{containerSize.current.h}</Text>
          {debugLogs.map((l, i) => (<Text key={i} style={styles.debugText}>{l}</Text>))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', height: 300, borderRadius: 12, overflow: 'hidden' },
  map: { width: '100%', height: '100%' },
  redDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#ef4444',
    borderWidth: 2,
    borderColor: 'white',
  },
  labelBubble: {
    position: 'absolute',
    bottom: 18,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  labelText: { color: '#fff', fontSize: 11 },
  debugOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    maxHeight: 160,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 8,
  },
  debugText: { color: '#fff', fontSize: 10, marginBottom: 2 },
});
