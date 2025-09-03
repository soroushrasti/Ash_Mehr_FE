import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { InputField } from '@/components/InputField';
import { Button } from '@/components/Button';
import AppHeader from '@/components/AppHeader';
import { Spacing } from '@/constants/Design';
import { apiService } from '@/services/apiService';
import { AdminCreate } from '@/types/api';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useAuth } from '@/components/AuthContext';
import UniversalMap from '@/components/UniversalMap';
import * as Location from 'expo-location';

export default function AdminUserForm() {
  const { mode } = useLocalSearchParams(); // 'volunteer' | 'admin'
  const router = useRouter();
  const { userId } = useAuth();

  const isVolunteer = mode === 'volunteer';
  const title = isVolunteer ? 'افزودن داوطلب (مدیر گروه)' : 'افزودن مدیر جدید';
  const primary = useThemeColor({}, 'primary');

  const [form, setForm] = useState({
    FirstName: '',
    LastName: '',
    Phone: '',
    PostCode: '',
    Email: '',
    City: '',
    Province: '',
    Street: '',
    NationalID: '',
    Password: ''
  });
  const [loading, setLoading] = useState(false);

  // Location state for GroupAdmin creation
  const [location, setLocation] = useState<{ latitude: number; longitude: number; address?: string } | null>(null);
  const [locError, setLocError] = useState<string | null>(null);

  useEffect(() => {
    if (!isVolunteer) return;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocError('برای تعیین موقعیت مدیر گروه، مجوز دسترسی به موقعیت لازم است.');
          return;
        }
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      } catch (e) {
        setLocError('خطا در دریافت موقعیت فعلی');
      }
    })();
  }, [isVolunteer]);

  const setField = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const onSubmit = async () => {
    const numericUserId = typeof userId === 'string' && !isNaN(Number(userId)) ? Number(userId) : undefined;

    const payload: AdminCreate = {
      FirstName: form.FirstName,
      LastName: form.LastName,
      Phone: form.Phone || undefined,
      PostCode: form.PostCode || undefined,
      Email: form.Email || undefined,
      City: form.City || undefined,
      Province: form.Province || undefined,
      Street: form.Street || undefined,
      NationalID: form.NationalID || undefined,
      UserRole: isVolunteer ? 'GroupAdmin' : 'Admin',
      Password: form.Password,
      Latitude: isVolunteer && location ? String(location.latitude) : undefined,
      Longitude: isVolunteer && location ? String(location.longitude) : undefined,
    };

    if (isVolunteer && !location) {
      Alert.alert('خطا', 'لطفاً موقعیت مدیر گروه را روی نقشه انتخاب کنید.');
      return;
    }

    setLoading(true);
    const res = await apiService.createAdmin(payload);
    setLoading(false);

    if (res.success) {
      Alert.alert('موفق', isVolunteer ? 'داوطلب با نقش مدیرگروه ایجاد شد.' : 'مدیر جدید ایجاد شد.', [
        { text: 'باشه', onPress: () => router.back() },
      ]);
    } else {
      Alert.alert('خطا', res.error || 'خطای ناشناخته');
    }
  };

  return (
    <ThemedView type="container" style={{ flex: 1 }}>
      <AppHeader title={title} subtitle={isVolunteer ? 'نقش: مدیر گروه' : 'نقش: مدیر کل'} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <ThemedView type="card" style={{ marginBottom: Spacing.xl }}>
          <ThemedText type="heading3" style={{ marginBottom: Spacing.md, color: primary }}>
            اطلاعات کاربر
          </ThemedText>

          <InputField label="نام" value={form.FirstName} onChangeText={v => setField('FirstName', v)} />
          <InputField label="نام خانوادگی" value={form.LastName} onChangeText={v => setField('LastName', v)} />
          <InputField label="رمز عبور" value={form.Password} onChangeText={v => setField('Password', v)} secureTextEntry />
          <InputField label="شماره تلفن" value={form.Phone} onChangeText={v => setField('Phone', v)} keyboardType="phone-pad" />
          <InputField label="ایمیل" value={form.Email} onChangeText={v => setField('Email', v)} keyboardType="email-address" />
          <InputField label="کد پستی" value={form.PostCode} onChangeText={v => setField('PostCode', v)} />
          <InputField label="استان" value={form.Province} onChangeText={v => setField('Province', v)} />
          <InputField label="شهر" value={form.City} onChangeText={v => setField('City', v)} />
          <InputField label="خیابان/آدرس" value={form.Street} onChangeText={v => setField('Street', v)} />
          <InputField label="کد ملی" value={form.NationalID} onChangeText={v => setField('NationalID', v)} />

          {isVolunteer && (
            <>
              <ThemedText type="heading3" style={{ marginVertical: Spacing.md, color: primary }}>
                انتخاب موقعیت مدیر گروه
              </ThemedText>
              <ThemedText type="caption" style={{ marginBottom: Spacing.sm, opacity: 0.8 }}>
                ابتدا مجوز دسترسی به موقعیت را تایید کنید. سپس نشانگر را روی موقعیت دقیق قرار دهید.
              </ThemedText>
              <View style={{ height: 300, borderRadius: 12, overflow: 'hidden', marginBottom: Spacing.md }}>
                <UniversalMap
                  location={location}
                  onLocationSelect={(loc) => setLocation(loc)}
                  zoom={13}
                  showControls
                />
              </View>
              {location && (
                <ThemedText type="caption" style={{ opacity: 0.8, marginBottom: Spacing.sm }}>
                  مختصات: {location.latitude.toFixed(6)} , {location.longitude.toFixed(6)}
                </ThemedText>
              )}
              {!!locError && (
                <ThemedText type="caption" style={{ color: 'red', marginBottom: Spacing.sm }}>
                  {locError}
                </ThemedText>
              )}
            </>
          )}

          <Button title="ثبت" onPress={onSubmit} fullWidth loading={loading} />
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.xl,
  },
});
