import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Config } from '../constants/Config';

interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  name?: string;
  info?: string;
}

interface GoogleMapWebProps {
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

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

const GoogleMapWeb: React.FC<GoogleMapWebProps> = ({
  points = [],
  onLocationSelect,
  selectedLocation,
  initialRegion = {
    latitude: 35.6892,
    longitude: 51.3890,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  style,
  showCurrentLocation = false,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const clustererRef = useRef<any>(null);
  const selectedMarkerRef = useRef<any>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Load Google Maps script
  useEffect(() => {
    if (typeof window === 'undefined' || Platform.OS !== 'web') return;

    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setIsMapLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${Config.GOOGLE_MAPS_API_KEY}&libraries=geometry,places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setIsMapLoaded(true);
      };
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current || mapInstanceRef.current) return;

    try {
      const mapOptions = {
        center: {
          lat: initialRegion.latitude,
          lng: initialRegion.longitude
        },
        zoom: 12,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        gestureHandling: 'cooperative',
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      };

      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, mapOptions);

      // Add click listener for location selection
      if (onLocationSelect) {
        mapInstanceRef.current.addListener('click', (event: any) => {
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();
          onLocationSelect({ latitude: lat, longitude: lng });
        });
      }

      console.log('Map initialized successfully');
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }, [isMapLoaded, initialRegion, onLocationSelect]);

  // Update markers when points change
  const updateMarkers = useCallback(() => {
    if (!mapInstanceRef.current || !window.google) return;

    try {
      // Clear existing markers
      markersRef.current.forEach(marker => {
        if (marker && marker.setMap) {
          marker.setMap(null);
        }
      });
      markersRef.current = [];

      // Clear existing clusterer
      if (clustererRef.current && clustererRef.current.clearMarkers) {
        clustererRef.current.clearMarkers();
      }

      // Filter valid points
      const validPoints = points.filter(point =>
        point &&
        typeof point.lat === 'number' &&
        typeof point.lng === 'number' &&
        !isNaN(point.lat) &&
        !isNaN(point.lng)
      );

      console.log('Valid points for markers:', validPoints.length);

      if (validPoints.length === 0) return;

      // Create markers
      const markers = validPoints.map(point => {
        try {
          const marker = new window.google.maps.Marker({
            position: { lat: point.lat, lng: point.lng },
            map: mapInstanceRef.current,
            title: point.name || `Location ${point.id}`,
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" fill="#FF4444" stroke="#FFFFFF" stroke-width="2"/>
                  <circle cx="12" cy="12" r="4" fill="#FFFFFF"/>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(24, 24),
            }
          });

          // Add info window
          if (point.info || point.name) {
            const infoWindow = new window.google.maps.InfoWindow({
              content: `
                <div style="padding: 8px;">
                  <h3 style="margin: 0 0 8px 0; font-size: 14px;">${point.name || 'Location'}</h3>
                  ${point.info ? `<p style="margin: 0; font-size: 12px;">${point.info}</p>` : ''}
                </div>
              `
            });

            marker.addListener('click', () => {
              infoWindow.open(mapInstanceRef.current, marker);
            });
          }

          return marker;
        } catch (error) {
          console.error('Error creating marker for point:', point, error);
          return null;
        }
      }).filter(Boolean);

      markersRef.current = markers;

      // Setup clustering if we have multiple markers
      if (markers.length > 1) {
        try {
          // Import MarkerClusterer dynamically
          import('@googlemaps/markerclusterer').then(({ MarkerClusterer }) => {
            if (clustererRef.current) {
              clustererRef.current.clearMarkers();
            }

            clustererRef.current = new MarkerClusterer({
              markers,
              map: mapInstanceRef.current,
              algorithm: new window.google.maps.marker.SuperClusterAlgorithm({
                radius: 100,
              }),
            });
          }).catch(error => {
            console.error('Error loading MarkerClusterer:', error);
          });
        } catch (error) {
          console.error('Error setting up clustering:', error);
        }
      }

      // Fit bounds to show all markers
      if (markers.length > 0) {
        const bounds = new window.google.maps.LatLngBounds();
        markers.forEach(marker => {
          if (marker && marker.getPosition) {
            bounds.extend(marker.getPosition());
          }
        });
        mapInstanceRef.current.fitBounds(bounds);

        // Ensure minimum zoom level
        const listener = window.google.maps.event.addListener(mapInstanceRef.current, 'bounds_changed', () => {
          if (mapInstanceRef.current.getZoom() > 15) {
            mapInstanceRef.current.setZoom(15);
          }
          window.google.maps.event.removeListener(listener);
        });
      }

    } catch (error) {
      console.error('Error updating markers:', error);
    }
  }, [points]);

  useEffect(() => {
    if (isMapLoaded && mapInstanceRef.current) {
      updateMarkers();
    }
  }, [isMapLoaded, updateMarkers]);

  // Handle selected location
  useEffect(() => {
    if (!mapInstanceRef.current || !window.google || !selectedLocation) return;

    try {
      // Remove previous selected marker
      if (selectedMarkerRef.current) {
        selectedMarkerRef.current.setMap(null);
      }

      // Add new selected marker
      selectedMarkerRef.current = new window.google.maps.Marker({
        position: {
          lat: selectedLocation.latitude,
          lng: selectedLocation.longitude
        },
        map: mapInstanceRef.current,
        title: 'Selected Location',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="#4CAF50" stroke="#FFFFFF" stroke-width="2"/>
              <circle cx="12" cy="12" r="4" fill="#FFFFFF"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32),
        }
      });

      // Center map on selected location
      mapInstanceRef.current.setCenter({
        lat: selectedLocation.latitude,
        lng: selectedLocation.longitude
      });
    } catch (error) {
      console.error('Error handling selected location:', error);
    }
  }, [selectedLocation]);

  if (Platform.OS !== 'web') {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '100%',
          minHeight: 300,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 300,
  },
});

export default GoogleMapWeb;
