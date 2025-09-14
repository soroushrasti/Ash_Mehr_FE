import React, { useState } from 'react';
import { StyleSheet, View, Alert, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { InputField } from '@/components/InputField';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Spacing, BorderRadius } from '@/constants/Design';
import { withOpacity } from '@/utils/colorUtils';
import AppHeader from '@/components/AppHeader';
import { KeyboardAwareContainer } from '@/components/KeyboardAwareContainer';
import { apiService } from '@/services/apiService';
import { AdminCreate } from '@/types/api';
import { useAuth } from '@/components/AuthContext';

// Types
interface FieldOption {
  label: string;
  value: string;
}

interface FieldDef {
  key: string;
  label: string;
  placeholder?: string;
  required: boolean;
  type?: 'phone' | 'number' | 'email' | 'select' | 'password';
  secure?: boolean;
  multiline?: boolean;
  options?: FieldOption[];
}

type FormState = Record<string, string>;

// Field definitions for Group Admin registration
const groupAdminFields: FieldDef[] = [
  { key: 'firstName', label: 'نام', placeholder: 'نام خود را وارد کنید', required: true },
  { key: 'lastName', label: 'نام خانوادگی', placeholder: 'نام خانوادگی خود را وارد کنید', required: true },
  { key: 'phone', label: 'شماره تلفن', placeholder: '09xxxxxxxxx', required: true, type: 'phone' },
  { key: 'nationalId', label: 'کد ملی', placeholder: 'کد ملی ۱۰ رقمی', required: true, type: 'number' },
  { key: 'email', label: 'ایمیل', placeholder: 'example@email.com', required: false, type: 'email' },
  { key: 'password', label: 'رمز عبور', placeholder: 'حداقل ۶ کاراکتر', required: true, type: 'password', secure: true },
  { key: 'province', label: 'استان', placeholder: 'استان تحت پوشش گروه', required: true },
  { key: 'city', label: 'شهر', placeholder: 'شهر تحت پوشش گروه', required: true },
  { key: 'street', label: 'آدرس مقر گروه', placeholder: 'آدرس کامل مقر گروه', required: true, multiline: true },
  { key: 'groupName', label: 'نام گروه', placeholder: 'نام گروه یا تشکل خیریه', required: false },
  { key: 'groupDescription', label: 'توضیحات گروه', placeholder: 'توضیحی درباره فعالیت‌های گروه', required: false, multiline: true },
];

export default function GroupAdminRegisterForm() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { userId } = useAuth();

  const [formData, setFormData] = useState<FormState>(() => {
    const initialData: FormState = {};
    groupAdminFields.forEach(field => {
      initialData[field.key] = '';
    });
    return initialData;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const primaryColor = useThemeColor({}, 'primary');
  const successColor = useThemeColor({}, 'success');
  const errorColor = useThemeColor({}, 'error');

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    groupAdminFields.forEach(field => {
      if (field.required && !formData[field.key]?.trim()) {
        newErrors[field.key] = `${field.label} الزامی است`;
      }
    });

    // Specific validations
    if (formData.phone && !/^09\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'شماره تلفن باید با ۰۹ شروع شده و ۱۱ رقم باشد';
    }

    if (formData.nationalId && !/^\d{10}$/.test(formData.nationalId)) {
      newErrors.nationalId = 'کد ملی باید ۱۰ رقم باشد';
    }

    if (formData.email && formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'فرمت ایمیل صحیح نیست';
    }

    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'رمز عبور باید حداقل ۶ کاراکتر باشد';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));

    // Clear error when user starts typing
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('خطا', 'لطفاً فیلدهای الزامی را پر کنید');
      return;
    }

    if (!userId) {
      Alert.alert('خطا', 'شناسه کاربر ثبت‌کننده یافت نشد. لطفاً دوباره وارد شوید.');
      return;
    }

    setLoading(true);
    try {
      // Prepare data for API
      const adminData: AdminCreate = {
        FirstName: formData.firstName,
        LastName: formData.lastName,
        Phone: formData.phone,
        Email: formData.email,
        Password: formData.password,
        City: formData.city,
        Province: formData.province,
        Street: formData.street,
        NationalID: formData.nationalId,
        UserRole: 'GroupAdmin', // Set as GroupAdmin role
        Latitude: params.latitude ? String(params.latitude) : '',
        Longitude: params.longitude ? String(params.longitude) : '',
        CreatedBy: Number(userId),
      };

      const response = await apiService.createAdmin(adminData);

      if (response.success) {
        Alert.alert(
          'موفق',
          'اطلاعات مدیر گروه با موفقیت ثبت شد',
          [
            {
              text: 'تایید',
              onPress: () => router.push('/group-admin/register/confirm')
            }
          ]
        );
      } else {
        Alert.alert('خطا', response.error || 'خطا در ثبت اطلاعات');
      }
    } catch (error) {
      Alert.alert('خطا', 'خطا در اتصال به سرور');
      console.error('Group Admin registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const ProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={[styles.progressStep, { backgroundColor: successColor }]}>
        <ThemedText style={styles.progressText}>✓</ThemedText>
      </View>
      <View style={[styles.progressLine, { backgroundColor: primaryColor }]} />
      <View style={[styles.progressStep, { backgroundColor: primaryColor }]}>
        <ThemedText style={styles.progressText}>۲</ThemedText>
      </View>
      <View style={[styles.progressLine, { backgroundColor: '#ddd' }]} />
      <View style={[styles.progressStep, { backgroundColor: '#ddd' }]}>
        <ThemedText style={styles.progressText}>۳</ThemedText>
      </View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <AppHeader title="ثبت اطلاعات مدیر گروه" showBackButton />

      <KeyboardAwareContainer>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Progress Bar */}
          <ProgressBar />

          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.roleIconContainer, { backgroundColor: withOpacity(primaryColor, 20) }]}>
              <ThemedText style={styles.roleIcon}>👥</ThemedText>
            </View>
            <ThemedText style={styles.title}>
              ثبت اطلاعات مدیر گروه
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              اطلاعات مدیر گروه خیریه را وارد کنید
            </ThemedText>
          </View>

          {/* Group Info Badge */}
          <View style={[styles.infoBadge, { backgroundColor: withOpacity(primaryColor, 10), borderColor: withOpacity(primaryColor, 20) }]}>
            <ThemedText style={styles.infoBadgeIcon}>ℹ️</ThemedText>
            <ThemedText style={styles.infoBadgeText}>
              مدیران گروه مسئول مدیریت و نظارت بر فعالیت‌های خیریه در منطقه تحت پوشش خود هستند
            </ThemedText>
          </View>

          <View style={styles.form}>
            {/* Personal Information Section */}
            <ThemedText style={styles.sectionTitle}>اطلاعات شخصی</ThemedText>

            {groupAdminFields.slice(0, 6).map((field) => (
              <InputField
                key={field.key}
                label={field.label}
                placeholder={field.placeholder}
                value={formData[field.key]}
                onChangeText={(value) => handleInputChange(field.key, value)}
                keyboardType={field.type === 'phone' ? 'phone-pad' : field.type === 'number' ? 'numeric' : field.type === 'email' ? 'email-address' : 'default'}
                secureTextEntry={field.secure}
                multiline={field.multiline}
                error={errors[field.key]}
                required={field.required}
              />
            ))}

            {/* Location Information Section */}
            <ThemedText style={styles.sectionTitle}>اطلاعات منطقه تحت پوشش</ThemedText>

            {groupAdminFields.slice(6, 9).map((field) => (
              <InputField
                key={field.key}
                label={field.label}
                placeholder={field.placeholder}
                value={formData[field.key]}
                onChangeText={(value) => handleInputChange(field.key, value)}
                multiline={field.multiline}
                error={errors[field.key]}
                required={field.required}
              />
            ))}

            {/* Group Information Section */}
            <ThemedText style={styles.sectionTitle}>اطلاعات گروه (اختیاری)</ThemedText>

            {groupAdminFields.slice(9).map((field) => (
              <InputField
                key={field.key}
                label={field.label}
                placeholder={field.placeholder}
                value={formData[field.key]}
                onChangeText={(value) => handleInputChange(field.key, value)}
                multiline={field.multiline}
                error={errors[field.key]}
                required={field.required}
              />
            ))}

            {/* Location Selection */}
            {params.latitude && params.longitude && (
              <View style={[styles.locationInfo, { backgroundColor: withOpacity(successColor, 10) }]}>
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

        {/* Action Buttons */}
        <View style={styles.footer}>
          <Button
            title={loading ? 'در حال ثبت...' : 'ثبت اطلاعات'}
            onPress={handleSubmit}
            disabled={loading}
            style={styles.submitButton}
          />

          <Button
            title="انتخاب موقعیت در نقشه"
            onPress={() => router.push('/group-admin/register/map')}
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
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
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
  progressText: {
    color: 'white',
    fontWeight: 'bold',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  roleIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  roleIcon: {
    fontSize: 36,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  infoBadge: {
    flexDirection: 'row',
    padding: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  infoBadgeIcon: {
    fontSize: 20,
    marginLeft: Spacing.sm,
  },
  infoBadgeText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  form: {
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
    color: '#2E7D32',
  },
  locationInfo: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  locationLabel: {
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
    color: '#4CAF50',
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
