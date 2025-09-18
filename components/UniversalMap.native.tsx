import React, { useEffect, useMemo, useState, useRef } from 'react';
import { View, Button, Text, Platform, StyleSheet } from 'react-native';
import Constants from 'expo-constants';

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
  const [region, setRegion] = useState(initialRegion);
  const mapRef = useRef<any>(null);
  const [MapView, setMapView] = useState<any>(null);
  const [Marker, setMarker] = useState<any>(null);
  const [mapsError, setMapsError] = useState<string | null>(null);

  const onLayout = () => {
    // no-op layout handler
  };

  useEffect(() => {
    const isExpoGo = Constants?.appOwnership === 'expo';
    if (isExpoGo) {
      setMapsError('react-native-maps is not available in Expo Go');
      return;
    }

    // Try to load react-native-maps without clustering to avoid RNMapsAirModule error
    try {
      const mapModule = require('react-native-maps');
      setMapView(() => mapModule.default);
      setMarker(() => mapModule.Marker);
      setMapsError(null);
    } catch (error) {
      console.error('react-native-maps load failed:', error);
      setMapsError('react-native-maps load failed. Please run expo prebuild and rebuild your app.');
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

    if (validPoints.length > 0 && mapRef.current && MapView) {
      // Fit map to show all points
      const coordinates = validPoints.map(point => ({
        latitude: point.lat,
        longitude: point.lng,
      }));

      try {
        mapRef.current.fitToCoordinates(coordinates, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
      } catch (error) {
        console.error('Error fitting to coordinates:', error);
      }
    }
  }, [points, MapView]);

  const handleMapPress = (event: any) => {
    if (onLocationSelect) {
      const { latitude, longitude } = event.nativeEvent.coordinate;
      onLocationSelect({ latitude, longitude });
    }
  };

  const handleRegionChange = (newRegion: any) => {
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

  if (!MapView || !Marker || mapsError) {
    return (
      <View onLayout={onLayout} style={[styles.container, style]}>
        <View style={styles.fallbackContainer}>
          <Text style={styles.fallbackTitle}>نمایش نقشه در این نسخه در دسترس نیست</Text>
          <Text style={styles.fallbackMessage}>
            {mapsError || 'در حال بارگذاری نقشه...'}
          </Text>
          <Text style={styles.fallbackSubtext}>
            برای استفاده از نقشه، لطفاً دستورات زیر را اجرا کنید:{'\n'}
            1. npx expo prebuild --clean{'\n'}
            2. npx expo run:android
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View onLayout={onLayout} style={[styles.container, style]}>
      {/* Use regular MapView without clustering to avoid RNMapsAirModule error */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? 'google' : undefined}
        initialRegion={region}
        onRegionChangeComplete={handleRegionChange}
        onPress={handleMapPress}
        showsUserLocation={showCurrentLocation}
        showsMyLocationButton={showCurrentLocation}
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
      </MapView>
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
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    padding: 16,
  },
  fallbackTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  fallbackMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  fallbackSubtext: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
});
