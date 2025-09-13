import React from 'react';
import { Platform } from 'react-native';
import GoogleMapWeb from './GoogleMapWeb';

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

export default function UniversalMap(props: UniversalMapProps) {
  if (Platform.OS === 'web') {
    return <GoogleMapWeb {...props} />;
  }

  // For native platforms, this will be handled by the .native.tsx version
  return null;
}
