import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { InputField } from '@/components/InputField';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Spacing, BorderRadius } from '@/constants/Design';
import { apiService } from '@/services/apiService';
import AppHeader from '@/components/AppHeader';
import KeyboardAwareContainer from '@/components/KeyboardAwareContainer';

interface AdminEditData {
  firstName: string;
  lastName: string;
  nationalId: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  birthDate: string;
  role: string;
  department: string;
  emergencyContact: string;
  emergencyPhone: string;
  latitude: string;
  longitude: string;
}

export default function EditAdminPage() {
  const { registerId } = useLocalSearchParams();
  const [formData, setFormData] = useState<AdminEditData>({
    firstName: '',
    lastName: '',
    nationalId: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    birthDate: '',
    role: '',
    department: '',
    emergencyContact: '',
    emergencyPhone: '',
    latitude: '',
    longitude: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<AdminEditData>>({});
  const router = useRouter();

  const primaryColor = useThemeColor({}, 'primary');
  const successColor = useThemeColor({}, 'success');
  const warningColor = useThemeColor({}, 'warning');
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  useEffect(() => {
    if (registerId) {
      loadAdminData(registerId as string);
    }
  }, [registerId]);

  const loadAdminData = async (id: string) => {
    try {
      const response = await apiService.getAdminDetails(id);
      if (response.success && response.data) {
        const data = response.data;
        setFormData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          nationalId: data.nationalId || '',
          phone: data.phone || '',
          email: data.email || '',
          address: data.address || '',
          city: data.city || '',
          province: data.province || '',
          postalCode: data.postalCode || '',
          birthDate: data.birthDate || '',
          role: data.role || '',
          department: data.department || '',
          emergencyContact: data.emergencyContact || '',
          emergencyPhone: data.emergencyPhone || '',
          latitude: data.latitude?.toString() || '',
          longitude: data.longitude?.toString() || '',
        });
      } else {
        Alert.alert('خطا', 'دریافت اطلاعات نماینده با خطا مواجه شد');
        router.back();
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
      Alert.alert('خطا', 'خطا در دریافت اطلاعات');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<AdminEditData> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'نام الزامی است';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'نام خانوادگی الزامی است';
    }
    if (!formData.nationalId.trim()) {
      newErrors.nationalId = 'کد ملی الزامی است';
    } else if (!/^\d{10}$/.test(formData.nationalId)) {
      newErrors.nationalId = 'کد ملی باید ۱۰ رقم باشد';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'شماره تلفن الزامی است';
    } else if (!/^09\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'شماره تلفن نامعتبر است';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'شهر الزامی است';
    }
    if (!formData.province.trim()) {
      newErrors.province = 'استان الزامی است';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'آدرس الزامی است';
    }
    if (!formData.role.trim()) {
      newErrors.role = 'نقش الزامی است';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('خطا', 'لطفاً فیلدهای اجباری را تکمیل کنید');
      return;
    }

    setSaving(true);
    try {
      // Prepare data for API
      const apiData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        nationalId: formData.nationalId.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        address: formData.address.trim(),
        city: formData.city.trim(),
        province: formData.province.trim(),
        postalCode: formData.postalCode.trim() || undefined,
        birthDate: formData.birthDate.trim() || undefined,
        role: formData.role.trim(),
        department: formData.department.trim() || undefined,
        emergencyContact: formData.emergencyContact.trim() || undefined,
        emergencyPhone: formData.emergencyPhone.trim() || undefined,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
      };

      const response = await apiService.editAdmin(registerId as string, apiData);
      if (response.success) {
        Alert.alert(
          'موفقیت',
          'اطلاعات نماینده با موفقیت به‌روزرسانی شد',
          [
            {
              text: 'تایید',
              onPress: () => router.back()
            }
          ]
        );
      } else {
        Alert.alert('خطا', response.error || 'به‌روزرسانی با خطا مواجه شد');
      }
    } catch (error) {
      console.error('Error updating admin:', error);
      Alert.alert('خطا', 'خطا در به‌روزرسانی اطلاعات');
    } finally {
      setSaving(false);
    }
  };

  const updateFormData = (field: keyof AdminEditData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const getRoleColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return primaryColor;
      case 'groupadmin':
        return successColor;
      default:
        return warningColor;
    }
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <AppHeader title="ویرایش نماینده" subtitle="در حال بارگذاری..." />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
          <ThemedText style={{ marginTop: Spacing.lg, color: textColor }}>
            در حال بارگذاری اطلاعات...
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <AppHeader title="ویرایش مدیر" subtitle="ویرایش اطلاعات مدیر" />

      <KeyboardAwareContainer>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Personal Information */}
          <View style={[styles.section, { backgroundColor: surfaceColor, borderColor }]}>
            <ThemedText style={[styles.sectionTitle, { color: getRoleColor(formData.role) }]}>
              اطلاعات شخصی
            </ThemedText>

            <InputField
              label="نام *"
              value={formData.firstName}
              onChangeText={(value) => updateFormData('firstName', value)}
              error={errors.firstName}
              placeholder="نام"
            />

            <InputField
              label="نام خانوادگی *"
              value={formData.lastName}
              onChangeText={(value) => updateFormData('lastName', value)}
              error={errors.lastName}
              placeholder="نام خانوادگی"
            />

            <InputField
              label="کد ملی *"
              value={formData.nationalId}
              onChangeText={(value) => updateFormData('nationalId', value)}
              error={errors.nationalId}
              placeholder="کد ملی ۱۰ رقمی"
              keyboardType="numeric"
              maxLength={10}
            />

            <InputField
              label="شماره تلفن *"
              value={formData.phone}
              onChangeText={(value) => updateFormData('phone', value)}
              error={errors.phone}
              placeholder="09xxxxxxxxx"
              keyboardType="phone-pad"
              maxLength={11}
            />

            <InputField
              label="ایمیل"
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              error={errors.email}
              placeholder="example@email.com"
              keyboardType="email-address"
            />

            <InputField
              label="تاریخ تولد"
              value={formData.birthDate}
              onChangeText={(value) => updateFormData('birthDate', value)}
              placeholder="1370/01/01"
            />
          </View>

          {/* Address Information */}
          <View style={[styles.section, { backgroundColor: surfaceColor, borderColor }]}>
            <ThemedText style={[styles.sectionTitle, { color: getRoleColor(formData.role) }]}>
              اطلاعات آدرس
            </ThemedText>

            <InputField
              label="استان *"
              value={formData.province}
              onChangeText={(value) => updateFormData('province', value)}
              error={errors.province}
              placeholder="استان"
            />

            <InputField
              label="شهر *"
              value={formData.city}
              onChangeText={(value) => updateFormData('city', value)}
              error={errors.city}
              placeholder="شهر"
            />

            <InputField
              label="آدرس *"
              value={formData.address}
              onChangeText={(value) => updateFormData('address', value)}
              error={errors.address}
              placeholder="آدرس کامل"
              multiline
              numberOfLines={3}
            />

            <InputField
              label="کد پستی"
              value={formData.postalCode}
              onChangeText={(value) => updateFormData('postalCode', value)}
              placeholder="کد پستی ۱۰ رقمی"
              keyboardType="numeric"
              maxLength={10}
            />
          </View>

          {/* Administrative Information */}
          <View style={[styles.section, { backgroundColor: surfaceColor, borderColor }]}>
            <ThemedText style={[styles.sectionTitle, { color: getRoleColor(formData.role) }]}>
              اطلاعات اداری
            </ThemedText>

            <View style={styles.roleContainer}>
              <ThemedText style={[styles.fieldLabel, { color: textColor }]}>
                نقش *
              </ThemedText>
              <View style={styles.roleButtons}>
                <Button
                  title="نماینده کل"
                  onPress={() => updateFormData('role', 'Admin')}
                  variant={formData.role === 'Admin' ? 'primary' : 'outline'}
                  style={styles.roleButton}
                />
                <Button
                  title="نماینده گروه"
                  onPress={() => updateFormData('role', 'GroupAdmin')}
                  variant={formData.role === 'GroupAdmin' ? 'success' : 'outline'}
                  style={styles.roleButton}
                />
              </View>
              {errors.role && (
                <ThemedText style={styles.errorText}>{errors.role}</ThemedText>
              )}
            </View>

            <InputField
              label="دپارتمان"
              value={formData.department}
              onChangeText={(value) => updateFormData('department', value)}
              placeholder="نام دپارتمان"
            />
          </View>

          {/* Emergency Contact */}
          <View style={[styles.section, { backgroundColor: surfaceColor, borderColor }]}>
            <ThemedText style={[styles.sectionTitle, { color: getRoleColor(formData.role) }]}>
              مخاطب اضطراری
            </ThemedText>

            <InputField
              label="نام مخاطب اضطراری"
              value={formData.emergencyContact}
              onChangeText={(value) => updateFormData('emergencyContact', value)}
              placeholder="نام و نام خانوادگی"
            />

            <InputField
              label="شماره تلفن اضطراری"
              value={formData.emergencyPhone}
              onChangeText={(value) => updateFormData('emergencyPhone', value)}
              placeholder="09xxxxxxxxx"
              keyboardType="phone-pad"
              maxLength={11}
            />
          </View>

          {/* Location */}
          <View style={[styles.section, { backgroundColor: surfaceColor, borderColor }]}>
            <ThemedText style={[styles.sectionTitle, { color: getRoleColor(formData.role) }]}>
              موقعیت جغرافیایی
            </ThemedText>

            <InputField
              label="عرض جغرافیایی"
              value={formData.latitude}
              onChangeText={(value) => updateFormData('latitude', value)}
              placeholder="35.7219"
              keyboardType="numeric"
            />

            <InputField
              label="طول جغرافیایی"
              value={formData.longitude}
              onChangeText={(value) => updateFormData('longitude', value)}
              placeholder="51.3347"
              keyboardType="numeric"
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Button
              title="ذخیره تغییرات"
              onPress={handleSave}
              loading={saving}
              style={[styles.actionButton, { backgroundColor: getRoleColor(formData.role) }]}
            />
            <Button
              title="انصراف"
              onPress={() => router.back()}
              variant="outline"
              style={styles.actionButton}
            />
          </View>
        </ScrollView>
      </KeyboardAwareContainer>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  roleContainer: {
    marginBottom: Spacing.lg,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: Spacing.sm,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  roleButton: {
    flex: 1,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: Spacing.xs,
  },
  actionButtons: {
    gap: Spacing.lg,
    marginVertical: Spacing.xl,
    paddingBottom: Spacing['2xl'],
  },
  actionButton: {
    marginBottom: Spacing.sm,
  },
});
