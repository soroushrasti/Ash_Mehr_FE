/* eslint-disable import/no-unused-modules */
import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, Alert, Platform, ScrollView as RNScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import UniversalMap from '@/components/UniversalMap';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Spacing, BorderRadius } from '@/constants/Design';
import { Config } from '@/constants/Config';
import { withOpacity } from '@/utils/colorUtils';
import AppHeader from '@/components/AppHeader';
import * as Location from 'expo-location';

// Google Geocoding service
const geocodeCity = async (city: string, province?: string): Promise<{ latitude: number; longitude: number } | null> => {
  try {
    const address = `${city}${province ? `, ${province}` : ''}, Iran`;
    const encodedAddress = encodeURIComponent(address);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${Config.GOOGLE_MAPS_API_KEY}`;

    console.log('Geocoding request for:', address);

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      const result = {
        latitude: location.lat,
        longitude: location.lng
      };

      console.log('Geocoding successful:', result);
      return result;
    } else {
      console.log('Geocoding failed:', data.status, data.error_message);
      return null;
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

export default function AdminRegisterMap() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Get city and province from URL parameters
  const city = params.city as string;
  const province = params.province as string;

  const { formData, role, roleTitle, roleIcon, next, savedlocation } = params;
  const targetForm = Array.isArray(next) ? next[0] : (next || 'admin-user');
  const roleIconSafe = typeof roleIcon === 'string' ? roleIcon : Array.isArray(roleIcon) ? roleIcon[0] : '📍';
    const parsedSavedLocation = savedlocation ? JSON.parse(savedlocation as string) : null;

  const [location, setLocation] = useState<{ latitude: number; longitude: number; address?: string } | null>(parsedSavedLocation);
  const [initialRegion, setInitialRegion] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(parsedSavedLocation);

  useEffect(() => {

    const initializeMapWithCity = async () => {
        console.log('Initializing map with saved location:', savedlocation);

        if (savedlocation) {
        const parsedSavedLocation = savedlocation ? JSON.parse(savedlocation as string) : null;

        setInitialRegion({
          latitude: parsedSavedLocation.latitude,
          longitude: parsedSavedLocation.longitude,
          latitudeDelta: 0.05, // City-level zoom
          longitudeDelta: 0.05,
        });

        // Set as suggested location
            setSelectedLocation({
          latitude: parsedSavedLocation.latitude,
          longitude: parsedSavedLocation.longitude,
        });
        return;
      }
      // If city is provided, use Google API to geocode and zoom to that area
      if (city && city.trim()) {
        try {
          const cityCoords = await geocodeCity(city.trim(), province?.trim());

          if (cityCoords) {
            // Set initial region to zoom into the city area
            setInitialRegion({
              latitude: cityCoords.latitude,
              longitude: cityCoords.longitude,
              latitudeDelta: 0.05, // City-level zoom
              longitudeDelta: 0.05,
            });

            // Set as suggested location
            setLocation({
              latitude: cityCoords.latitude,
              longitude: cityCoords.longitude,
              address: `${city}${province ? `, ${province}` : ''}`,
            });

            console.log('Map initialized for city:', city, cityCoords);
          } else {
            // If geocoding fails, use default Tehran location
            setInitialRegion({
              latitude: 35.6892,
              longitude: 51.3890,
              latitudeDelta: 0.1,
              longitudeDelta: 0.1,
            });
          }
        } catch (error) {
          console.error('Error initializing map with city:', error);
          // Fallback to Tehran
          setInitialRegion({
            latitude: 35.6892,
            longitude: 51.3890,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          });
        }
      } else {
        // No city provided, use default location
        setInitialRegion({
          latitude: 35.6892,
          longitude: 51.3890,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        });
      }
    };

    initializeMapWithCity();
  }, [city, province, savedlocation]);

  const primaryColor = useThemeColor({}, 'primary');
  const successColor = useThemeColor({}, 'success');
  const errorColor = useThemeColor({}, 'error');

  const handleLocationSelect = (newLocation: { latitude: number; longitude: number }) => {
    setSelectedLocation(newLocation);
    setLocation(newLocation);
  };

  const handleConfirm = () => {
    if (!selectedLocation && !location) {
      Alert.alert('خطا', 'لطفاً موقعیت خود را روی نقشه انتخاب کنید');
      return;
    }

    const finalLocation = selectedLocation || location;
    if (!finalLocation) return;

    router.push({
      pathname: `/admin/register/confirm`,
      params: {
        ...params,
        location: JSON.stringify({
          latitude: finalLocation.latitude,
          longitude: finalLocation.longitude,
          address: finalLocation.address || `${finalLocation.latitude}, ${finalLocation.longitude}`
        }),
      },
    });
  };

  const handleSkip = () => {
    router.push('/admin/register/admin-user');
  };

  return (
    <ThemedView type="container" style={styles.container}>
      <AppHeader
        title="انتخاب موقعیت جغرافیایی"
        subtitle={city ? `برای ${city}${province ? `, ${province}` : ''}` : "موقعیت خود را انتخاب کنید"}
      />

      <RNScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* City Info Display */}
        {city && (
          <View style={[styles.cityInfo, { backgroundColor: withOpacity(primaryColor, 10), borderColor: primaryColor }]}>
            <ThemedText style={[styles.cityInfoText, { color: primaryColor }]}>
              📍 نقشه برای: {city}
            </ThemedText>
          </View>
        )}

        {/* Map Container */}
        <View style={styles.mapContainer}>
          {initialRegion ? (
            <UniversalMap
              style={styles.map}
              initialRegion={initialRegion}
              onLocationSelect={handleLocationSelect}
              selectedLocation={selectedLocation || location}
              showCurrentLocation={true}
              points={[]}
            />
          ) : (
            <View style={styles.loadingContainer}>
              <ThemedText>در حال بارگذاری نقشه...</ThemedText>
            </View>
          )}
        </View>

        {/* Location Info */}
        {(selectedLocation || location) && (
          <View style={[styles.locationInfo, { backgroundColor: withOpacity(successColor, 10) }]}>
            <ThemedText style={[styles.locationTitle, { color: successColor }]}>
              ✅ موقعیت انتخاب شده:
            </ThemedText>
            <ThemedText style={styles.locationText}>
              عرض جغرافیایی: {(selectedLocation || location)!.latitude.toFixed(6)}
            </ThemedText>
            <ThemedText style={styles.locationText}>
              طول جغرافیایی: {(selectedLocation || location)!.longitude.toFixed(6)}
            </ThemedText>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.footer}>
          <Button
            title="تأیید موقعیت"
            onPress={handleConfirm}
            disabled={!selectedLocation && !location}
            style={styles.confirmButton}
          />
        </View>
      </RNScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  cityInfo: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    margin: Spacing.md,
  },
  cityInfoText: {
    textAlign: 'center',
    fontWeight: '500',
  },
  mapContainer: {
    // no flex here to allow ScrollView to control height
    margin: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    minHeight: 300, // ensure a large, comfortable viewport for the map
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationInfo: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    margin: Spacing.md,
  },
  locationTitle: {
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
  },
  locationText: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: Spacing.xs,
  },
  footer: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  confirmButton: {
    marginBottom: Spacing.sm,
  },
  skipButton: {
    marginBottom: Spacing.sm,
  },
});
