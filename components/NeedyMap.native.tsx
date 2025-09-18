import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import Constants from 'expo-constants';

interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  name?: string;
  info?: string;
}

interface NeedyMapProps {
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

export default function NeedyMap({
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
}: NeedyMapProps) {
  const [region, setRegion] = useState(initialRegion);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const mapRef = useRef<any>(null);
  const [MapView, setMapView] = useState<any>(null);
  const [Marker, setMarker] = useState<any>(null);
  const [mapsError, setMapsError] = useState<string | null>(null);

  // Check if we're in Expo Go
  const isExpoGo = Constants?.appOwnership === 'expo';

  const addLog = (message: string) => {
    console.log('[NeedyMap]', message);
    setDebugLogs(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    // Don't try to load native maps in Expo Go
    if (isExpoGo) {
      setMapsError('react-native-maps is not available in Expo Go. Please create a development build.');
      return;
    }

    // Try to dynamically load react-native-maps WITHOUT clustering
    const loadMaps = async () => {
      try {
        const mapModule = require('react-native-maps');

        setMapView(() => mapModule.default);
        setMarker(() => mapModule.Marker);
        setMapsError(null);
        addLog('Maps loaded successfully without clustering');
      } catch (error) {
        console.error('Error loading react-native-maps:', error);
        setMapsError('react-native-maps is not properly installed. Please run expo prebuild and rebuild your app.');
        addLog('Failed to load maps module');
      }
    };

    loadMaps();
  }, [isExpoGo]);

  useEffect(() => {
    addLog(`Received ${points.length} points`);

    // Validate points data
    const validPoints = points.filter(point =>
      point &&
      typeof point.lat === 'number' &&
      typeof point.lng === 'number' &&
      !isNaN(point.lat) &&
      !isNaN(point.lng)
    );

    addLog(`${validPoints.length} valid points after filtering`);

    if (validPoints.length > 0 && mapRef.current && MapView) {
      try {
        // Fit map to show all points
        const coordinates = validPoints.map(point => ({
          latitude: point.lat,
          longitude: point.lng,
        }));

        mapRef.current.fitToCoordinates(coordinates, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
        addLog('Map fitted to coordinates');
      } catch (error) {
        console.error('Error fitting coordinates:', error);
        addLog('Error fitting coordinates');
      }
    }
  }, [points, MapView]);

  const handleMapPress = (event: any) => {
    if (onLocationSelect) {
      const { latitude, longitude } = event.nativeEvent.coordinate;
      addLog(`Location selected: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
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

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.webFallback}>
          Map view is not available on web platform. Please use a mobile device.
        </Text>
      </View>
    );
  }

  // Show error message if maps can't be loaded
  if (mapsError || !MapView || !Marker) {
    return (
      <View style={[styles.container, style, styles.errorContainer]}>
        <Text style={styles.errorTitle}>نقشه در دسترس نیست</Text>
        <Text style={styles.errorMessage}>
          {mapsError || 'در حال بارگذاری نقشه...'}
        </Text>
        {isExpoGo && (
          <Text style={styles.errorSubtext}>
            برای استفاده از نقشه، لطفاً یک Development Build بسازید.
          </Text>
        )}
        {!isExpoGo && (
          <Text style={styles.errorSubtext}>
            لطفاً دستورات زیر را اجرا کنید:{'\n'}
            1. npx expo prebuild --clean{'\n'}
            2. npx expo run:android
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
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

      {__DEV__ && (
        <View style={styles.debugContainer}>
          <Text style={styles.debugTitle}>Debug Info:</Text>
          <Text style={styles.debugText}>Points: {validPoints.length}/{points.length}</Text>
          <Text style={styles.debugText}>
            Region: {region.latitude.toFixed(4)}, {region.longitude.toFixed(4)}
          </Text>
          {debugLogs.map((log, index) => (
            <Text key={index} style={styles.debugText} numberOfLines={1}>
              {log}
            </Text>
          ))}
        </View>
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
  webFallback: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 16,
    color: '#666',
    padding: 20,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  errorSubtext: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
  debugContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 8,
    borderRadius: 4,
    maxWidth: 200,
  },
  debugTitle: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  debugText: {
    color: '#FFF',
    fontSize: 10,
    lineHeight: 12,
  },
});
