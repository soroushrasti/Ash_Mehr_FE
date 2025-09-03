import React from 'react';
import { Platform, View } from 'react-native';
import GoogleMapWeb from './GoogleMapWeb';
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
  city?: string; // new: hint for centering/zooming by city
}

export default function UniversalMap({ location, onLocationSelect, zoom, showControls = true, city }: UniversalMapProps) {
  if (Platform.OS === 'web') {
    return (
      <GoogleMapWeb
        apiKey={Config.GOOGLE_MAPS_API_KEY}
        onLocationSelect={onLocationSelect}
        initialLocation={location ? { latitude: Number(location.latitude as any), longitude: Number(location.longitude as any) } : undefined}
        zoom={zoom}
        showControls={showControls}
        city={city}
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
