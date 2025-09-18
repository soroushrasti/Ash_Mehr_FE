import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { InputField } from '@/components/InputField';
import { Button } from '@/components/Button';
import AppHeader from '@/components/AppHeader';
import { Spacing, BorderRadius } from '@/constants/Design';
import { apiService } from '@/services/apiService';
import { AdminCreate } from '@/types/api';
import { KeyboardAwareContainer } from '@/components/KeyboardAwareContainer';
import { useAuth } from '@/components/AuthContext';

export default function AdminUserRegister() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { userId } = useAuth();

  const [formData, setFormData] = useState<AdminCreate>({
    FirstName: '',
    LastName: '',
    Phone: '',
    Email: '',
    Password: '',
    City: '',
    Province: '',
    PostCode: '',
    Street: '',
    NationalID: '',
    CreatedBy: '',
    UserRole: 'Admin',
    Latitude: params.latitude ? String(params.latitude) : '',
    Longitude: params.longitude ? String(params.longitude) : '',
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Validation
    if (!formData.FirstName.trim() || !formData.LastName.trim()) {
      Alert.alert('خطا', 'نام و نام خانوادگی الزامی است');
      return;
    }

    if (!formData.Password || formData.Password.length < 6) {
      Alert.alert('خطا', 'رمز عبور باید حداقل ۶ کاراکتر باشد');
      return;
    }

    if (!userId) {
      Alert.alert('خطا', 'شناسه کاربر ثبت‌کننده یافت نشد. لطفاً دوباره وارد شوید.');
      return;
    }

    const payload = { ...formData, CreatedBy: Number(userId) };

    setLoading(true);
    try {
      const response = await apiService.createAdmin(payload);
      if (response.success) {
        Alert.alert(
          'موفق',
          'اطلاعات نماینده با موفقیت ثبت شد',
          [
            {
              text: 'تایید',
              onPress: () => router.push('/admin/register/confirm')
            }
          ]
        );
      } else {
        Alert.alert('خطا', response.error || 'خطا در ثبت اطلاعات');
      }
    } catch (error) {
      Alert.alert('خطا', 'خطا در اتصال به سرور');
      console.error('Admin registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <AppHeader title="ثبت اطلاعات نماینده" showBackButton />

      <KeyboardAwareContainer>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            <ThemedText style={styles.sectionTitle}>اطلاعات شخصی</ThemedText>

            <InputField
              label="نام *"
              value={formData.FirstName}
              onChangeText={(text) => setFormData(prev => ({ ...prev, FirstName: text }))}
              placeholder="نام خود را وارد کنید"
            />

            <InputField
              label="نام خانوادگی *"
              value={formData.LastName}
              onChangeText={(text) => setFormData(prev => ({ ...prev, LastName: text }))}
              placeholder="نام خانوادگی خود را وارد کنید"
            />

            <InputField
              label="شماره موبایل"
              value={formData.Phone || ''}
              onChangeText={(text) => setFormData(prev => ({ ...prev, Phone: text }))}
              placeholder="09123456789"
              keyboardType="phone-pad"
            />

            <InputField
              label="کد ملی"
              value={formData.NationalID || ''}
              onChangeText={(text) => setFormData(prev => ({ ...prev, NationalID: text }))}
              placeholder="کد ملی ۱۰ رقمی"
              keyboardType="numeric"
            />

            <InputField
              label="ایمیل"
              value={formData.Email || ''}
              onChangeText={(text) => setFormData(prev => ({ ...prev, Email: text }))}
              placeholder="example@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <InputField
              label="رمز عبور *"
              value={formData.Password}
              onChangeText={(text) => setFormData(prev => ({ ...prev, Password: text }))}
              placeholder="حداقل ۶ کاراکتر"
              secureTextEntry
            />

            <InputField
              label="ایجاد شده توسط"
              value={formData.CreatedBy}
              onChangeText={(text) => setFormData(prev => ({ ...prev, CreatedBy: text }))}
              placeholder="توسط کدام نماینده ایجاد شده"
            />

            <ThemedText style={styles.sectionTitle}>آدرس</ThemedText>

            <InputField
              label="استان"
              value={formData.Province || ''}
              onChangeText={(text) => setFormData(prev => ({ ...prev, Province: text }))}
              placeholder="نام استان"
            />

            <InputField
              label="شهر"
              value={formData.City || ''}
              onChangeText={(text) => setFormData(prev => ({ ...prev, City: text }))}
              placeholder="نام شهر"
            />

            <InputField
              label="آدرس"
              value={formData.Street || ''}
              onChangeText={(text) => setFormData(prev => ({ ...prev, Street: text }))}
              placeholder="آدرس کامل"
              multiline
            />

             <InputField
               label="کد پستی"
               value={formData.PostCode || ''}
               onChangeText={(text) => setFormData(prev => ({ ...prev, PostCode: text }))}
               placeholder="کد پستی"
             />

            {params.latitude && params.longitude && (
              <View style={styles.locationInfo}>
                <ThemedText style={styles.locationLabel}>موقعیت انتخاب شده:</ThemedText>
                <ThemedText style={styles.locationText}>
                  عرض جغرافیایی: {params.latitude}
                </ThemedText>
                <ThemedText style={styles.locationText}>
                  طول جغرافیایی: {params.longitude}
                </ThemedText>
              </View>
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title={loading ? 'در حال ثبت...' : 'ثبت اطلاعات'}
            onPress={handleSubmit}
            disabled={loading}
            style={styles.submitButton}
          />

          <Button
            title="انتخاب موقعیت در نقشه"
            onPress={() => router.push('/admin/register/map')}
            variant="outline"
            style={styles.mapButton}
          />
        </View>
      </KeyboardAwareContainer>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  locationInfo: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: BorderRadius.md,
  },
  locationLabel: {
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
  },
  locationText: {
    fontSize: 14,
    opacity: 0.8,
  },
  footer: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  submitButton: {
    marginBottom: Spacing.sm,
  },
  mapButton: {
    marginBottom: Spacing.sm,
  },
});
