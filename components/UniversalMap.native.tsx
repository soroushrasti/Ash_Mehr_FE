import React from 'react';
import { View, Image, Button } from 'react-native';

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
}

import MapView, { Marker } from 'react-native-maps';

export default function UniversalMap({ location, onLocationSelect, mapType = 'standard', zoom = 0.05, showControls = true }: UniversalMapProps) {
  return (
    <View>
      {showControls && (
        <View style={{ flexDirection: 'row', marginBottom: 8 }}>
          <Button title="Standard" onPress={() => onLocationSelect({ ...location, mapType: 'standard' })} />
          <Button title="Satellite" onPress={() => onLocationSelect({ ...location, mapType: 'satellite' })} />
          <Button title="Terrain" onPress={() => onLocationSelect({ ...location, mapType: 'terrain' })} />
          <Button title="Zoom In" onPress={() => onLocationSelect({ ...location, zoom: Math.max(zoom / 2, 0.002) })} />
          <Button title="Zoom Out" onPress={() => onLocationSelect({ ...location, zoom: Math.min(zoom * 2, 1) })} />
        </View>
      )}
      <MapView
        style={{ width: '100%', height: 300, borderRadius: 12, marginBottom: 16 }}
        initialRegion={{
          latitude: location?.latitude || 35.6892,
          longitude: location?.longitude || 51.389,
          latitudeDelta: zoom,
          longitudeDelta: zoom,
        }}
        region={location ? {
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: zoom,
          longitudeDelta: zoom,
        } : undefined}
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
        {location && <Marker coordinate={location}>
          <Image source={require('@/assets/images/icon.png')} style={{ width: 32, height: 32 }} />
        </Marker>}
      </MapView>
    </View>
  );
}

