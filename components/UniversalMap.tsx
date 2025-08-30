import React from 'react';
import { Platform, View } from 'react-native';
import GoogleMapWeb from './GoogleMapWeb';

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

export default function UniversalMap({ location, onLocationSelect, mapType = 'standard', zoom = 0.05, showControls = true }: UniversalMapProps) {
  if (Platform.OS === 'web') {
    return (
      <GoogleMapWeb
        apiKey="AIzaSyCx8-7Y3c7sPHyDfltKMvBitIAmdUwvLFk"
        onLocationSelect={onLocationSelect}
        initialLocation={location ? { latitude: location.latitude, longitude: location.longitude } : undefined}
      />
    );
  }

  // On native platforms, this should never be reached because UniversalMap.native.tsx will be used
  return (
    <View style={{ width: '100%', height: 300, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' }}>
      {/* Fallback for native platforms if .native.tsx file is not found */}
    </View>
  );
}
