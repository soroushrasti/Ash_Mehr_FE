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

interface NeedyEditData {
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
  maritalStatus: string;
  numberOfChildren: string;
  jobStatus: string;
  income: string;
  description: string;
  emergencyContact: string;
  emergencyPhone: string;
  latitude: string;
  longitude: string;
}

export default function EditNeedyPage() {
  const { registerId } = useLocalSearchParams();
  const [formData, setFormData] = useState<NeedyEditData>({
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
    maritalStatus: '',
    numberOfChildren: '',
    jobStatus: '',
    income: '',
    description: '',
    emergencyContact: '',
    emergencyPhone: '',
    latitude: '',
    longitude: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<NeedyEditData>>({});
  const router = useRouter();

  const primaryColor = useThemeColor({}, 'primary');
  const successColor = useThemeColor({}, 'success');
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  useEffect(() => {
    if (registerId) {
      loadNeedyData(registerId as string);
    }
  }, [registerId]);

  const loadNeedyData = async (id: string) => {
    try {
      const response = await apiService.getNeedyDetails(id);
      if (response.success && response.data) {
        const data = response.data;
        setFormData({
          firstName: data.FirstName || '',
          lastName: data.LastName || '',
          nationalId: data.NationalID || '',
          phone: data.Phone || '',
          email: data.Email || '',
          address: data.Address || '',
          city: data.City || '',
          province: data.Province || '',
          postalCode: data.PostalCode || '',
          birthDate: data.birthDate || '',
          maritalStatus: data.maritalStatus || '',
          numberOfChildren: data.numberOfChildren?.toString() || '',
          jobStatus: data.jobStatus || '',
          income: data.income?.toString() || '',
          description: data.description || '',
          emergencyContact: data.emergencyContact || '',
          emergencyPhone: data.emergencyPhone || '',
          latitude: data.Latitude?.toString() || '',
          longitude: data.Longitude?.toString() || '',
        });
      } else {
        Alert.alert('خطا', 'دریافت اطلاعات مددجو با خطا مواجه شد');
        router.back();
      }
    } catch (error) {
      console.error('Error loading needy data:', error);
      Alert.alert('خطا', 'خطا در دریافت اطلاعات');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<NeedyEditData> = {};

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
        maritalStatus: formData.maritalStatus.trim() || undefined,
        numberOfChildren: formData.numberOfChildren ? parseInt(formData.numberOfChildren) : undefined,
        jobStatus: formData.jobStatus.trim() || undefined,
        income: formData.income ? parseFloat(formData.income) : undefined,
        description: formData.description.trim() || undefined,
        emergencyContact: formData.emergencyContact.trim() || undefined,
        emergencyPhone: formData.emergencyPhone.trim() || undefined,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
      };

      const response = await apiService.editNeedy(registerId as string, apiData);
      if (response.success) {
        Alert.alert(
          'موفقیت',
          'اطلاعات مددجو با موفقیت به‌روزرسانی شد',
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
      console.error('Error updating needy:', error);
      Alert.alert('خطا', 'خطا در به‌روزرسانی اطلاعات');
    } finally {
      setSaving(false);
    }
  };

  const updateFormData = (field: keyof NeedyEditData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <AppHeader title="ویرایش مددجو" subtitle="در حال بارگذاری..." />
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
      <AppHeader title="ویرایش مددجو" subtitle="ویرایش اطلاعات" />

      <KeyboardAwareContainer>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Personal Information */}
          <View style={[styles.section, { backgroundColor: surfaceColor, borderColor }]}>
            <ThemedText style={[styles.sectionTitle, { color: primaryColor }]}>
              اطلاعات شخصی
            </ThemedText>

            <InputField
              label="نام *"
              value={formData.firstName}
              onChangeText={(value) => updateFormData('firstName', value)}
              error={errors.firstName}
              placeholder={formData.firstName}
            />

            <InputField
              label="نام خانوادگی *"
              value={formData.lastName}
              onChangeText={(value) => updateFormData('lastName', value)}
              error={errors.lastName}
              placeholder={formData.lastName}
            />

            <InputField
              label="کد ملی *"
              value={formData.nationalId}
              onChangeText={(value) => updateFormData('nationalId', value)}
              error={errors.nationalId}
              placeholder={formData.nationalId}
              keyboardType="numeric"
              maxLength={10}
            />

            <InputField
              label="شماره تلفن *"
              value={formData.phone}
              onChangeText={(value) => updateFormData('phone', value)}
              error={errors.phone}
              placeholder={formData.phone}
              keyboardType="phone-pad"
              maxLength={11}
            />

            <InputField
              label="ایمیل"
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              error={errors.email}
              placeholder={formData.email}
              keyboardType="email-address"
            />

            <InputField
              label="تاریخ تولد"
              value={formData.birthDate}
              onChangeText={(value) => updateFormData('birthDate', value)}
              placeholder={formData.birthDate}
            />

            <InputField
              label="وضعیت تأهل"
              value={formData.maritalStatus}
              onChangeText={(value) => updateFormData('maritalStatus', value)}
              placeholder={formData.maritalStatus}
            />

            <InputField
              label="تعداد فرزندان"
              value={formData.numberOfChildren}
              onChangeText={(value) => updateFormData('numberOfChildren', value)}
              placeholder={formData.numberOfChildren}
              keyboardType="numeric"
            />
          </View>

          {/* Address Information */}
          <View style={[styles.section, { backgroundColor: surfaceColor, borderColor }]}>
            <ThemedText style={[styles.sectionTitle, { color: primaryColor }]}>
              اطلاعات آدرس
            </ThemedText>

            <InputField
              label="استان *"
              value={formData.province}
              onChangeText={(value) => updateFormData('province', value)}
              error={errors.province}
              placeholder={formData.province}
            />

            <InputField
              label="شهر *"
              value={formData.city}
              onChangeText={(value) => updateFormData('city', value)}
              error={errors.city}
              placeholder={formData.city}
            />

            <InputField
              label="آدرس *"
              value={formData.address}
              onChangeText={(value) => updateFormData('address', value)}
              error={errors.address}
              placeholder={formData.address}
              multiline
              numberOfLines={3}
            />

            <InputField
              label="کد پستی"
              value={formData.postalCode}
              onChangeText={(value) => updateFormData('postalCode', value)}
              placeholder={formData.postalCode}
              keyboardType="numeric"
              maxLength={10}
            />
          </View>

          {/* Financial and Job Information */}
          <View style={[styles.section, { backgroundColor: surfaceColor, borderColor }]}>
            <ThemedText style={[styles.sectionTitle, { color: primaryColor }]}>
              اطلاعات شغلی و مالی
            </ThemedText>

            <InputField
              label="وضعیت شغلی"
              value={formData.jobStatus}
              onChangeText={(value) => updateFormData('jobStatus', value)}
              placeholder={formData.jobStatus}
            />

            <InputField
              label="درآمد ماهانه (تومان)"
              value={formData.income}
              onChangeText={(value) => updateFormData('income', value)}
              placeholder={formData.income}
              keyboardType="numeric"
            />
          </View>

          {/* Emergency Contact */}
          <View style={[styles.section, { backgroundColor: surfaceColor, borderColor }]}>
            <ThemedText style={[styles.sectionTitle, { color: primaryColor }]}>
              مخاطب اضطراری
            </ThemedText>

            <InputField
              label="نام مخاطب اضطراری"
              value={formData.emergencyContact}
              onChangeText={(value) => updateFormData('emergencyContact', value)}
              placeholder={formData.emergencyContact}
            />

            <InputField
              label="شماره تلفن اضطراری"
              value={formData.emergencyPhone}
              onChangeText={(value) => updateFormData('emergencyPhone', value)}
              placeholder={formData.emergencyPhone}
              keyboardType="phone-pad"
              maxLength={11}
            />
          </View>

          {/* Location */}
          <View style={[styles.section, { backgroundColor: surfaceColor, borderColor }]}>
            <ThemedText style={[styles.sectionTitle, { color: primaryColor }]}>
              موقعیت جغرافیایی
            </ThemedText>

            <InputField
              label="عرض جغرافیایی"
              value={formData.latitude}
              onChangeText={(value) => updateFormData('latitude', value)}
              placeholder={formData.latitude}
              keyboardType="numeric"
            />

            <InputField
              label="طول جغرافیایی"
              value={formData.longitude}
              onChangeText={(value) => updateFormData('longitude', value)}
              placeholder={formData.longitude}
              keyboardType="numeric"
            />
          </View>

          {/* Description */}
          <View style={[styles.section, { backgroundColor: surfaceColor, borderColor }]}>
            <ThemedText style={[styles.sectionTitle, { color: primaryColor }]}>
              توضیحات
            </ThemedText>

            <InputField
              label="توضیحات"
              value={formData.description}
              onChangeText={(value) => updateFormData('description', value)}
              placeholder={formData.description}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Button
              title="ذخیره تغییرات"
              onPress={handleSave}
              loading={saving}
              style={[styles.actionButton, { backgroundColor: successColor }]}
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
  actionButtons: {
    gap: Spacing.lg,
    marginVertical: Spacing.xl,
    paddingBottom: Spacing['2xl'],
  },
  actionButton: {
    marginBottom: Spacing.sm,
  },
});
