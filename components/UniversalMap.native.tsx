import React, { useEffect, useMemo, useState } from 'react';
import { View, Image, Button, Text } from 'react-native';
import Constants from 'expo-constants';

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

  const onLayout = () => {
    // no-op layout handler
  };

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
      setMapsError('react-native-maps is not available in Expo Go');
      return;
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mod = require('react-native-maps');
      setMapsMod(mod);
    } catch (e: any) {
      setMapsError('react-native-maps load failed');
    }
  }, []);

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
        onPress={(e: any) => {
          const coord = e.nativeEvent.coordinate;
          onLocationSelect({
            latitude: coord.latitude,
            longitude: coord.longitude,
            mapType,
            zoom,
          });
        }}
      >
        {location && (
          <Marker coordinate={location as any}>
            <Image source={require('@/assets/images/icon.png')} style={{ width: 32, height: 32 }} />
          </Marker>
        )}
      </MapView>
    </View>
  );
}
