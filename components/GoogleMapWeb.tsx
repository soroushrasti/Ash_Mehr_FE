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
    initGoogleMaps: () => void;
    googleMapsCallback: () => void;
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
  const [loadError, setLoadError] = useState<string | null>(null);
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear any existing timeouts on unmount
  useEffect(() => {
    return () => {
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
    };
  }, []);

  // Load Google Maps script with better error handling
  const loadGoogleMaps = useCallback(() => {
    if (typeof window === 'undefined' || Platform.OS !== 'web') return;

    // Check if already loaded
    if (window.google && window.google.maps) {
      setIsMapLoaded(true);
      return Promise.resolve();
    }

    return new Promise<void>((resolve, reject) => {
      // Check if script is already being loaded
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        // Wait for existing script to load
        const checkLoaded = () => {
          if (window.google && window.google.maps) {
            setIsMapLoaded(true);
            resolve();
          } else {
            setTimeout(checkLoaded, 100);
          }
        };
        checkLoaded();
        return;
      }

      // Create callback function name
      const callbackName = 'googleMapsCallback' + Date.now();

      // Set up callback
      (window as any)[callbackName] = () => {
        try {
          if (window.google && window.google.maps) {
            setIsMapLoaded(true);
            setLoadError(null);
            resolve();
          } else {
            throw new Error('Google Maps API not properly loaded');
          }
        } catch (error) {
          console.error('Google Maps callback error:', error);
          setLoadError('Failed to initialize Google Maps');
          reject(error);
        } finally {
          // Cleanup callback
          delete (window as any)[callbackName];
        }
      };

      // Create and load script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${Config.GOOGLE_MAPS_API_KEY}&libraries=geometry,places&callback=${callbackName}`;
      script.async = true;
      script.defer = true;

      script.onerror = () => {
        setLoadError('Failed to load Google Maps API');
        reject(new Error('Failed to load Google Maps script'));
      };

      // Set timeout for loading
      const timeout = setTimeout(() => {
        setLoadError('Google Maps API loading timeout');
        reject(new Error('Google Maps loading timeout'));
      }, 10000);

      script.onload = () => {
        clearTimeout(timeout);
      };

      document.head.appendChild(script);
    });
  }, []);

  // Initialize map with proper error handling
  const initializeMap = useCallback(() => {
    if (!isMapLoaded || !mapRef.current || mapInstanceRef.current) return;

    try {
      // Verify Google Maps is properly loaded
      if (!window.google || !window.google.maps || !window.google.maps.Map) {
        throw new Error('Google Maps API not properly initialized');
      }

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
        styles: [], // Add custom styles if needed
      };

      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, mapOptions);

      // Add click listener for location selection with better handling
      if (onLocationSelect) {
        mapInstanceRef.current.addListener('click', (event: any) => {
          try {
            const lat = event.latLng.lat();
            const lng = event.latLng.lng();
            console.log('Map clicked at:', { lat, lng });
            onLocationSelect({ latitude: lat, longitude: lng });
          } catch (error) {
            console.error('Error handling map click:', error);
          }
        });
      }

      console.log('Google Maps initialized successfully with click listener');
      setLoadError(null);
    } catch (error) {
      console.error('Error initializing map:', error);
      setLoadError('Failed to initialize map');
    }
  }, [isMapLoaded, initialRegion, onLocationSelect]);

  // Load Google Maps on component mount
  useEffect(() => {
    if (Platform.OS === 'web') {
      loadGoogleMaps().catch((error) => {
        console.error('Failed to load Google Maps:', error);
        setLoadError('Failed to load Google Maps API');
      });
    }
  }, [loadGoogleMaps]);

  // Initialize map when loaded
  useEffect(() => {
    if (isMapLoaded) {
      // Small delay to ensure DOM is ready
      initTimeoutRef.current = setTimeout(() => {
        initializeMap();
      }, 100);
    }
  }, [isMapLoaded, initializeMap]);

  // Update markers when points change
  const updateMarkers = useCallback(() => {
    if (!mapInstanceRef.current || !window.google || !isMapLoaded) return;

    try {
      // Clear existing markers
      markersRef.current.forEach(marker => {
        try {
          if (marker && marker.setMap) {
            marker.setMap(null);
          }
        } catch (error) {
          console.error('Error removing marker:', error);
        }
      });
      markersRef.current = [];

      // Clear existing clusterer
      if (clustererRef.current) {
        try {
          if (clustererRef.current.clearMarkers) {
            clustererRef.current.clearMarkers();
          }
        } catch (error) {
          console.error('Error clearing clusterer:', error);
        }
      }

      // Filter valid points
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

      console.log(`Creating ${validPoints.length} valid markers from ${points.length} points`);

      if (validPoints.length === 0) return;

      // Create markers with error handling
      const markers = validPoints.map(point => {
        try {
          const marker = new window.google.maps.Marker({
            position: { lat: point.lat, lng: point.lng },
            map: mapInstanceRef.current,
            title: point.name || `Location ${point.id}`,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#FF4444',
              fillOpacity: 0.8,
              strokeColor: '#FFFFFF',
              strokeWeight: 2,
            }
          });

          // Add info window with error handling
          if (point.info || point.name) {
            const infoWindow = new window.google.maps.InfoWindow({
              content: `
                <div style="padding: 8px; font-family: Arial, sans-serif;">
                  <h3 style="margin: 0 0 8px 0; font-size: 14px; color: #333;">${point.name || 'Location'}</h3>
                  ${point.info ? `<p style="margin: 0; font-size: 12px; color: #666;">${point.info}</p>` : ''}
                </div>
              `
            });

            marker.addListener('click', () => {
              try {
                infoWindow.open(mapInstanceRef.current, marker);
              } catch (error) {
                console.error('Error opening info window:', error);
              }
            });
          }

          return marker;
        } catch (error) {
          console.error('Error creating marker for point:', point, error);
          return null;
        }
      }).filter(Boolean);

      markersRef.current = markers;

      // --- Clustering (standard) -------------------------------------------------
      // Clear any existing clusterer safely
      if (clustererRef.current) {
        try {
          clustererRef.current.clearMarkers();
        } catch (e) {
          console.warn('Failed clearing previous clusterer', e);
        }
        clustererRef.current = null;
      }

      // Only cluster if we have more than one data marker
      if (markers.length > 1) {
        import('@googlemaps/markerclusterer')
          .then(({ MarkerClusterer, SuperClusterAlgorithm }) => {
            try {
              clustererRef.current = new MarkerClusterer({
                map: mapInstanceRef.current,
                markers,
                // SuperClusterAlgorithm gives nice collapsing / expanding behavior
                algorithm: new SuperClusterAlgorithm({
                  radius: 80, // tweak if clusters look too dense / too sparse
                  maxZoom: 19,
                })
              });
            } catch (clusterErr) {
              console.error('Error creating clusterer', clusterErr);
            }
          })
          .catch(err => console.error('Error loading markerclusterer lib', err));
      }
      // ---------------------------------------------------------------------------

      // Fit bounds to show all markers (skip if none)
      if (markers.length > 0) {
        try {
          const bounds = new window.google.maps.LatLngBounds();
          markers.forEach(marker => {
            if (marker && marker.getPosition) bounds.extend(marker.getPosition());
          });
          if (!bounds.isEmpty()) {
            mapInstanceRef.current.fitBounds(bounds);
            const listener = window.google.maps.event.addListener(mapInstanceRef.current, 'bounds_changed', () => {
              if (mapInstanceRef.current.getZoom() > 15) {
                mapInstanceRef.current.setZoom(15);
              }
              window.google.maps.event.removeListener(listener);
            });
          }
        } catch (boundsError) {
          console.error('Error fitting bounds:', boundsError);
        }
      }

    } catch (error) {
      console.error('Error updating markers:', error);
    }
  }, [points, isMapLoaded]);

  useEffect(() => {
    if (isMapLoaded && mapInstanceRef.current) {
      updateMarkers();
    }
  }, [isMapLoaded, updateMarkers]);

  // Handle selected location
  useEffect(() => {
    if (!mapInstanceRef.current || !window.google || !selectedLocation || !isMapLoaded) return;

    try {
      // Remove previous selected marker
      if (selectedMarkerRef.current) {
        selectedMarkerRef.current.setMap(null);
        selectedMarkerRef.current = null;
      }

      // Create a more visible selected marker with custom icon
      selectedMarkerRef.current = new window.google.maps.Marker({
        position: {
          lat: selectedLocation.latitude,
          lng: selectedLocation.longitude
        },
        map: mapInstanceRef.current,
        title: 'Selected Location',
        // Use a more visible icon for selected location
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" fill="#4CAF50" stroke="#FFFFFF" stroke-width="4"/>
              <circle cx="20" cy="20" r="8" fill="#FFFFFF"/>
              <circle cx="20" cy="20" r="4" fill="#4CAF50"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(40, 40),
          anchor: new window.google.maps.Point(20, 20),
        },
        zIndex: 1000, // Make sure it appears above other markers
      });

      // Add info window for selected location
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; font-family: Arial, sans-serif; direction: rtl;">
            <h3 style="margin: 0 0 8px 0; font-size: 14px; color: #4CAF50;">📍 موقعیت انتخاب شده</h3>
            <p style="margin: 0; font-size: 12px; color: #666;">
              عرض جغرافیایی: ${selectedLocation.latitude.toFixed(6)}<br/>
              طول جغرافیایی: ${selectedLocation.longitude.toFixed(6)}
            </p>
          </div>
        `
      });

      // Show info window when marker is clicked
      selectedMarkerRef.current.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current, selectedMarkerRef.current);
      });

      // Center map on selected location with slight zoom
      mapInstanceRef.current.setCenter({
        lat: selectedLocation.latitude,
        lng: selectedLocation.longitude
      });

      // Set appropriate zoom level
      if (mapInstanceRef.current.getZoom() < 15) {
        mapInstanceRef.current.setZoom(15);
      }

      console.log('Selected location marker created:', selectedLocation);
    } catch (error) {
      console.error('Error handling selected location:', error);
    }
  }, [selectedLocation, isMapLoaded]);

  if (Platform.OS !== 'web') {
    return null;
  }

  if (loadError) {
    return (
      <View style={[styles.container, style, styles.errorContainer]}>
        <div style={styles.errorText}>
          Error loading map: {loadError}
        </div>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '100%',
          minHeight: 300,
          backgroundColor: '#f0f0f0',
        }}
      />
      {!isMapLoaded && (
        <div style={styles.loadingOverlay}>
          <div style={styles.loadingText}>Loading map...</div>
        </div>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 300,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    textAlign: 'center',
    padding: 20,
  } as any,
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(240, 240, 240, 0.8)',
  } as any,
  loadingText: {
    fontSize: 14,
    color: '#666',
  } as any,
});

export default GoogleMapWeb;
