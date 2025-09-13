import React, { useEffect, useMemo, useState, useRef } from 'react';
import { View, Button, Text, Platform, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import MapViewClustering from 'react-native-map-clustering';

interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  name?: string;
  info?: string;
}

interface UniversalMapProps {
  points: MapPoint[];
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

export default function UniversalMap({
  points = [],
  initialRegion = {
    latitude: 35.6892,
    longitude: 51.3890,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  onLocationSelect,
  selectedLocation,
  style,
  showCurrentLocation = false,
}: UniversalMapProps) {
  const [region, setRegion] = useState<Region>(initialRegion);
  const mapRef = useRef<MapView>(null);
  const [MapsMod, setMapsMod] = useState<any>(null);
  const [mapsError, setMapsError] = useState<string | null>(null);

  const onLayout = () => {
    // no-op layout handler
  };

  const safeMapType = Platform.OS === 'ios' && 'terrain' ? 'standard' : 'standard';

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
    } catch {
      setMapsError('react-native-maps load failed');
    }
  }, []);

  useEffect(() => {
    // Validate points data
    const validPoints = points.filter(point =>
      point &&
      typeof point.lat === 'number' &&
      typeof point.lng === 'number' &&
      !isNaN(point.lat) &&
      !isNaN(point.lng)
    );

    if (validPoints.length > 0 && mapRef.current) {
      // Fit map to show all points
      const coordinates = validPoints.map(point => ({
        latitude: point.lat,
        longitude: point.lng,
      }));

      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  }, [points]);

  const handleMapPress = (event: any) => {
    if (onLocationSelect) {
      const { latitude, longitude } = event.nativeEvent.coordinate;
      onLocationSelect({ latitude, longitude });
    }
  };

  const handleRegionChange = (newRegion: Region) => {
    setRegion(newRegion);
  };

  // Filter and validate points
  const validPoints = points.filter(point =>
    point &&
    typeof point.lat === 'number' &&
    typeof point.lng === 'number' &&
    !isNaN(point.lat) &&
    !isNaN(point.lng) &&
    point.lat >= -90 &&
    point.lat <= 90 &&
    point.lng >= -180 &&
    point.lng <= 180
  );

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

  return (
    <View onLayout={onLayout} style={[styles.container, style]}>
      {validPoints.length > 0 && (
        <MapViewClustering
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={region}
          onRegionChangeComplete={handleRegionChange}
          onPress={handleMapPress}
          showsUserLocation={showCurrentLocation}
          showsMyLocationButton={showCurrentLocation}
          clusterColor="#FF4444"
          clusterTextColor="#FFFFFF"
          clusterFontFamily={Platform.OS === 'ios' ? 'Arial' : 'Roboto'}
          radius={50}
          extent={512}
          nodeSize={64}
          animationEnabled={true}
          layoutAnimationConf={{
            type: 'spring',
            springDamping: 0.8,
            springSpeed: 0.5,
          }}
        >
          {validPoints.map((point) => (
            <Marker
              key={point.id}
              coordinate={{
                latitude: point.lat,
                longitude: point.lng
              }}
              title={point.name || `Location ${point.id}`}
              description={point.info}
              pinColor="#FF4444"
            />
          ))}

          {selectedLocation && (
            <Marker
              coordinate={{
                latitude: selectedLocation.latitude,
                longitude: selectedLocation.longitude,
              }}
              title="Selected Location"
              pinColor="#4CAF50"
            />
          )}
        </MapViewClustering>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 300,
  },
  map: {
    flex: 1,
    minHeight: 300,
  },
});
