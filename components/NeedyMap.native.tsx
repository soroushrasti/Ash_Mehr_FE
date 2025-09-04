import React, { useMemo, useState, useRef } from 'react';
import { View, StyleSheet, Text, LayoutChangeEvent, Platform } from 'react-native';
import Constants from 'expo-constants';

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
  const containerSize = useRef<{ w: number; h: number }>({ w: 0, h: 0 });

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    containerSize.current = { w: width, h: height };
  };

  const defaultRegion: any = useMemo(() => ({
    latitude: initialRegion?.latitude ?? (points[0]?.lat || 35.6892),
    longitude: initialRegion?.longitude ?? (points[0]?.lng || 51.389),
    latitudeDelta: initialRegion?.latitudeDelta ?? 0.2,
    longitudeDelta: initialRegion?.longitudeDelta ?? 0.2,
  }), [initialRegion, points]);

  const isExpoGo = Constants?.appOwnership === 'expo';

  const mapsModule = React.useMemo(() => {
    if (isExpoGo) return null;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return require('react-native-maps');
    } catch {
      return null;
    }
  }, [isExpoGo]);

  if (!mapsModule) {
    return (
      <View onLayout={onLayout} style={[styles.container, { alignItems: 'center', justifyContent: 'center', backgroundColor: '#f2f2f2' }]}>
        <Text>نمایش نقشه در این نسخه در دسترس نیست.</Text>
        <Text style={{ marginTop: 6, opacity: 0.8, fontSize: 12 }}>برای مشاهده نقشه، اپلیکیشن را با پکیج react-native-maps بیلد کنید.</Text>
      </View>
    );
  }

  const MapView = (mapsModule.default || mapsModule.MapView) as any;
  const Marker = mapsModule.Marker as any;
  const Callout = mapsModule.Callout as any;

  // Choose clustering component without using hooks (avoid conditional hook after early return)
  const ClusterComponent: any = (() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mod = require('react-native-map-clustering');
      const DefaultExport = mod && (mod.default || mod);
      if (typeof DefaultExport === 'function') {
        return DefaultExport;
      }
    } catch {}
    return MapView;
  })();

  const isZoomedIn = (reg: any | undefined) => {
    if (!reg) return false;
    return reg.latitudeDelta < 0.05; // threshold for showing labels
  };

  return (
    <View style={styles.container} onLayout={onLayout}>
      <ClusterComponent
        style={styles.map}
        provider={Platform.OS === 'android' ? mapsModule.PROVIDER_GOOGLE : undefined}
        initialRegion={defaultRegion}
        region={region}
        onRegionChangeComplete={(r: any) => setRegion(r)}
      >
        {points.map((p) => (
          <Marker key={p.id} coordinate={{ latitude: p.lat, longitude: p.lng }}>
            <View style={styles.redDot} />
            {isZoomedIn(region) && (
              <View style={styles.labelBubble}>
                <Text style={styles.labelText} numberOfLines={1}>{p.name || 'نیازمند'}</Text>
              </View>
            )}
            <Callout>
              <View style={{ maxWidth: 220 }}>
                <Text style={{ fontWeight: '700', marginBottom: 4 }}>{p.name || 'نیازمند'}</Text>
                <Text>{p.info || 'اطلاعات بیشتر در دسترس نیست'}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </ClusterComponent>
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
});
