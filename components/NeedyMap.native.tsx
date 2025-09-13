import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import MapViewClustering from 'react-native-map-clustering';

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
  const [region, setRegion] = useState<Region>(initialRegion);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const mapRef = useRef<MapView>(null);

  const addLog = (message: string) => {
    console.log('[NeedyMap]', message);
    setDebugLogs(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

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
      addLog(`Location selected: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
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

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.webFallback}>
          Map view is not available on web platform. Please use a mobile device.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
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
