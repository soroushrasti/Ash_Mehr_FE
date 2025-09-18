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

export default function NeedyMap(props: NeedyMapProps) {
  // Only render GoogleMapWeb on web platform
  if (Platform.OS === 'web') {
    return <GoogleMapWeb {...props} />;
  }

  // For native platforms, this will be handled by the .native.tsx version
  return null;
}
