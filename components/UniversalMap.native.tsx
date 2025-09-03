import React, { useEffect, useMemo, useState } from 'react';
import { View, Image, Button, Text, ScrollView, LayoutChangeEvent } from 'react-native';
import Constants from 'expo-constants';
import { Config } from '@/constants/Config';

interface UniversalMapProps {
  location: {
    latitude: number;
    longitude: number;
    address?: string;
    mapType?: string;
    zoom?: number;
  } | null;
  onLocationSelect: (loc: {
    latitude: number;
    longitude: number;
    address?: string;
    mapType?: string;
    zoom?: number;
  }) => void;
  mapType?: 'standard' | 'satellite' | 'terrain';
  zoom?: number;
  showControls?: boolean;
  city?: string;
}

export default function UniversalMap({ location, onLocationSelect, mapType = 'standard', zoom = 0.05, showControls = true }: UniversalMapProps) {
  const [MapsMod, setMapsMod] = useState<any>(null);
  const [mapsError, setMapsError] = useState<string | null>(null);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  const log = (msg: string) => {
    const line = `[native-universal-map] ${new Date().toISOString()} ${msg}`;
    // eslint-disable-next-line no-console
    console.log(line);
    setDebugLogs((p) => [...p.slice(-100), line]);
  };

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    log(`container onLayout width=${width} height=${height}`);
  };

  // Compute region unconditionally to satisfy hooks rule
  const region = useMemo(() => ({
    latitude: location?.latitude || 35.6892,
    longitude: location?.longitude || 51.389,
    latitudeDelta: zoom,
    longitudeDelta: zoom,
  }), [location, zoom]);

  useEffect(() => {
    const isExpoGo = Constants?.appOwnership === 'expo';
    if (isExpoGo) {
      setMapsMod(null);
      const msg = 'react-native-maps is not available in Expo Go';
      setMapsError(msg);
      log(msg);
      return;
    }
    try {
      // Lazily require to avoid crashing when the native module isn't bundled (Expo Go)
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mod = require('react-native-maps');
      setMapsMod(mod);
      log('react-native-maps module loaded');
    } catch (e: any) {
      const msg = `react-native-maps load failed: ${String(e?.message || e)}`;
      setMapsError(msg);
      log(msg);
    }
  }, []);

  // Fallback UI if maps module unavailable
  if (!MapsMod) {
    return (
      <View onLayout={onLayout} style={{ width: '100%', height: 300, borderRadius: 12, marginBottom: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f2f2f2', padding: 12 }}>
        <Text style={{ textAlign: 'center' }}>نمایش نقشه در این نسخه در دسترس نیست.</Text>
        <Text style={{ textAlign: 'center', marginTop: 6, opacity: 0.8 }}>
          برای استفاده از نقشه، یک Development Client بسازید یا پکیج react-native-maps را در بیلد نیتیو اضافه کنید.
        </Text>
        {!!mapsError && (
          <Text style={{ textAlign: 'center', marginTop: 6, fontSize: 12, color: '#666' }}>{mapsError}</Text>
        )}
        {Config.DEBUG_MODE && (
          <ScrollView style={{ position: 'absolute', top: 8, left: 8, right: 8, maxHeight: 160, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 8 }} contentContainerStyle={{ padding: 8 }}>
            {debugLogs.map((l, i) => (<Text key={i} style={{ color: '#fff', fontSize: 10, marginBottom: 2 }}>{l}</Text>))}
          </ScrollView>
        )}
      </View>
    );
  }

  const MapView = (MapsMod.default || MapsMod.MapView) as any;
  const Marker = MapsMod.Marker as any;

  return (
    <View onLayout={onLayout}>
      {showControls && (
        <View style={{ flexDirection: 'row', marginBottom: 8 }}>
          <Button title="Standard" onPress={() => onLocationSelect({ ...(location || region), latitude: region.latitude, longitude: region.longitude, mapType: 'standard', zoom })} />
          <Button title="Satellite" onPress={() => onLocationSelect({ ...(location || region), latitude: region.latitude, longitude: region.longitude, mapType: 'satellite', zoom })} />
          <Button title="Terrain" onPress={() => onLocationSelect({ ...(location || region), latitude: region.latitude, longitude: region.longitude, mapType: 'terrain', zoom })} />
          <Button title="Zoom In" onPress={() => onLocationSelect({ ...(location || region), latitude: region.latitude, longitude: region.longitude, mapType, zoom: Math.max(zoom / 2, 0.002) })} />
          <Button title="Zoom Out" onPress={() => onLocationSelect({ ...(location || region), latitude: region.latitude, longitude: region.longitude, mapType, zoom: Math.min(zoom * 2, 1) })} />
        </View>
      )}
      <MapView
        style={{ width: '100%', height: 300, borderRadius: 12, marginBottom: 16 }}
        initialRegion={region}
        region={region}
        mapType={mapType}
        onMapReady={() => log('onMapReady')}
        onMapLoaded={() => log('onMapLoaded')}
        onRegionChangeComplete={(r: any) => log(`onRegionChangeComplete lat=${r?.latitude} lng=${r?.longitude} dLat=${r?.latitudeDelta} dLng=${r?.longitudeDelta}`)}
        // @ts-expect-error: Android only
        onUserLocationChange={(e: any) => log(`onUserLocationChange lat=${e?.nativeEvent?.coordinate?.latitude} lng=${e?.nativeEvent?.coordinate?.longitude}`)}
        onPress={(e: any) => {
          const coord = e.nativeEvent.coordinate;
          log(`onPress lat=${coord?.latitude} lng=${coord?.longitude}`);
          onLocationSelect({
            latitude: coord.latitude,
            longitude: coord.longitude,
            mapType,
            zoom,
          });
        }}
      >
        {location && (
          <Marker coordinate={location as any} onPress={() => log('marker press')}>
            <Image source={require('@/assets/images/icon.png')} style={{ width: 32, height: 32 }} />
          </Marker>
        )}
      </MapView>

      {Config.DEBUG_MODE && (
        <ScrollView style={{ position: 'absolute', top: 8, left: 8, right: 8, maxHeight: 160, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 8 }} contentContainerStyle={{ padding: 8 }}>
          {debugLogs.map((l, i) => (<Text key={i} style={{ color: '#fff', fontSize: 10, marginBottom: 2 }}>{l}</Text>))}
        </ScrollView>
      )}
    </View>
  );
}
