import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import UniversalMap from '@/components/UniversalMap';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Spacing } from '@/constants/Design';
import { withOpacity } from '@/utils/colorUtils';
import AppHeader from '@/components/AppHeader';
import * as Location from 'expo-location';

export default function AdminRegisterMap() {
  const router = useRouter();
  const { formData, role, roleTitle, roleIcon } = useLocalSearchParams();
  const [location, setLocation] = useState<{ latitude: number; longitude: number; address?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locError, setLocError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocError('مجوز دسترسی به موقعیت داده نشد. لطفاً به صورت دستی مکان را انتخاب کنید.');
          return;
        }
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      } catch {
        setLocError('امکان دریافت موقعیت فعلی وجود ندارد.');
      }
    })();
  }, []);

  // Extract city from serialized formData (supports both lower and upper case keys)
  const formDataStr = Array.isArray(formData) ? formData[0] : (formData as string | undefined);
  let city: string | undefined = undefined;
  try {
    if (formDataStr) {
      const parsed = JSON.parse(formDataStr);
      city = parsed.city || parsed.City || parsed?.address?.city;
    }
  } catch {
    // ignore parse errors
  }

  const primaryColor = useThemeColor({}, 'primary');
  const successColor = useThemeColor({}, 'success');
  const errorColor = useThemeColor({}, 'error');

  const handleFinalize = async () => {
    if (!location) {
      setError('لطفاً روی نقشه موقعیت را انتخاب کنید');
      Alert.alert('خطا', 'لطفاً روی نقشه موقعیت را انتخاب کنید');
      return;
    }

    setError('');
    setLoading(true);

    // Navigate to confirmation page
    setTimeout(() => {
      router.push({
        pathname: '/admin/register/confirm',
        params: {
          formData,
          role,
          roleTitle,
          roleIcon,
          location: JSON.stringify(location),
        },
      });
      setLoading(false);
    }, 500);
  };

  const ProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={[styles.progressStep, { backgroundColor: successColor }]}>
        <ThemedText style={styles.progressText}>✓</ThemedText>
      </View>
      <View style={[styles.progressLine, { backgroundColor: successColor }]} />
      <View style={[styles.progressStep, { backgroundColor: successColor }]}>
        <ThemedText style={styles.progressText}>✓</ThemedText>
      </View>
      <View style={[styles.progressLine, { backgroundColor: primaryColor }]} />
      <View style={[styles.progressStep, { backgroundColor: primaryColor }]}>
        <ThemedText style={styles.progressText}>۳</ThemedText>
      </View>
    </View>
  );

  return (
    <ThemedView type="container" style={styles.container}>
      <AppHeader title="انتخاب موقعیت جغرافیایی" subtitle={`برای ${roleTitle}`} />

      {/* Progress Bar */}
      <ProgressBar />

      {/* Header with Role Badge */}
      <View style={styles.header}>
        <View style={[styles.roleIconContainer, { backgroundColor: withOpacity(primaryColor, 20) }]}>
          <ThemedText style={styles.roleIcon}>{roleIcon}</ThemedText>
        </View>
        <ThemedText type="heading2" center style={styles.title}>
          انتخاب موقعیت جغرافیایی
        </ThemedText>
        <ThemedText type="body" center style={styles.subtitle}>
          لطفاً موقعیت دقیق را روی نقشه مشخص کنید
        </ThemedText>
      </View>

      {/* Map Section */}
      <ThemedView type="card" style={styles.mapCard}>
        <ThemedText type="heading3" style={styles.mapTitle}>
          انتخاب آدرس روی نقشه
        </ThemedText>

        <View style={styles.mapContainer}>
          <UniversalMap
            location={location}
            onLocationSelect={(loc) => {
              setLocation(loc);
              setError('');
            }}
            mapType="standard"
            zoom={13}
            showControls={true}
            city={city}
          />
        </View>

        {!!locError && (
          <ThemedText type="caption" style={{ color: 'red', marginBottom: Spacing.sm }}>
            {locError}
          </ThemedText>
        )}

        {location && (
          <ThemedView type="surface" style={styles.locationInfo}>
            <View style={styles.locationHeader}>
              <ThemedText style={styles.locationIcon}>📍</ThemedText>
              <ThemedText type="body" weight="medium" style={styles.locationTitle}>
                موقعیت انتخاب شده
              </ThemedText>
            </View>
            <ThemedText type="caption" style={styles.coordinates}>
              عرض جغرافیایی: {location.latitude.toFixed(6)}
            </ThemedText>
            <ThemedText type="caption" style={styles.coordinates}>
              طول جغرافیایی: {location.longitude.toFixed(6)}
            </ThemedText>
            {location.address && (
              <ThemedText type="body" style={styles.address}>
                آدرس: {location.address}
              </ThemedText>
            )}
          </ThemedView>
        )}

        {/* Error State */}
        {error && (
          <ThemedView style={[styles.errorContainer, { backgroundColor: withOpacity(errorColor, 10), borderColor: withOpacity(errorColor, 20) }]}>
            <ThemedText type="caption" style={[styles.errorText, { color: errorColor }]}>
              ⚠️ {error}
            </ThemedText>
          </ThemedView>
        )}
      </ThemedView>

      {/* Instructions */}
      <ThemedView type="card" style={[styles.instructionsCard, { backgroundColor: withOpacity(primaryColor, 5), borderColor: withOpacity(primaryColor, 20) }]}>
        <ThemedText type="body" weight="medium" style={styles.instructionsTitle}>
          راهنمای استفاده از نقشه:
        </ThemedText>
        <ThemedText type="caption" style={styles.instructionText}>
          • روی نقشه کلیک کنید تا موقعیت انتخاب شود
        </ThemedText>
        <ThemedText type="caption" style={styles.instructionText}>
          • با دو انگشت روی نقشه حرکت کنید تا بزرگ یا کوچک شود
        </ThemedText>
        <ThemedText type="caption" style={styles.instructionText}>
          • موقعیت انتخابی با نشانگر قرمز مشخص می‌شود
        </ThemedText>
      </ThemedView>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Button
          title="بازگشت"
          onPress={() => router.back()}
          variant="outline"
          style={styles.backButton}
        />
        <Button
          title="تأیید و ادامه"
          onPress={handleFinalize}
          loading={loading}
          disabled={!location}
          style={styles.continueButton}
          icon={<ThemedText>✓</ThemedText>}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing['3xl'],
    paddingHorizontal: Spacing.xl,
  },
  progressStep: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressLine: {
    flex: 1,
    height: 2,
    marginHorizontal: Spacing.sm,
  },
  progressText: { color: 'white', fontWeight: 'bold' },
  header: { alignItems: 'center', marginBottom: Spacing['3xl'] },
  roleIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  roleIcon: { fontSize: 36 },
  title: { marginBottom: Spacing.sm },
  subtitle: { opacity: 0.7, textAlign: 'center' },
  mapCard: { marginBottom: Spacing.xl },
  mapTitle: { marginBottom: Spacing.lg },
  mapContainer: { height: 300, borderRadius: 12, overflow: 'hidden', marginBottom: Spacing.md },
  locationInfo: { padding: Spacing.md, borderRadius: 8, marginBottom: Spacing.md },
  locationHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  locationIcon: { fontSize: 20, marginLeft: Spacing.sm },
  locationTitle: { flex: 1 },
  coordinates: { opacity: 0.7, marginBottom: Spacing.xs },
  address: { marginTop: Spacing.sm },
  errorContainer: { padding: Spacing.md, borderRadius: 8, borderWidth: 1 },
  errorText: { textAlign: 'center' },
  instructionsCard: { marginBottom: Spacing.xl, borderWidth: 1 },
  instructionsTitle: { marginBottom: Spacing.md },
  instructionText: { marginBottom: Spacing.xs, opacity: 0.8 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing['4xl'] },
  backButton: { flex: 0.45 },
  continueButton: { flex: 0.45 },
});
