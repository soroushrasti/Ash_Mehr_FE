import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, ActivityIndicator, I18nManager } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { InputField } from '@/components/InputField';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Spacing, BorderRadius } from '@/constants/Design';
import { apiService } from '@/services/apiService';
import AppHeader from '@/components/AppHeader';
import { KeyboardAwareContainer } from '@/components/KeyboardAwareContainer';
import { useAuth } from '@/components/AuthContext';
import { withOpacity } from '@/utils/colorUtils';

// Ensure RTL is enabled
if (!I18nManager.isRTL) {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
}

interface AdminEditData {
  FirstName: string;
  LastName: string;
  NationalID: string;
  Phone: string;
  Email: string;
  Street: string;
  City: string;
  Province: string;
  PostCode: string;
  UserRole: string;
  CreatedBy: string;
  Password: string;
  Latitude: string;
  Longitude: string;
}

export default function EditAdminPage() {
  const { registerId } = useLocalSearchParams();
  const router = useRouter();
  const { userId } = useAuth();
  const errorColor = useThemeColor({}, 'danger');

  const [formData, setFormData] = useState<AdminEditData>({
    FirstName: '',
    LastName: '',
    NationalID: '',
    Phone: '',
    Email: '',
    Street: '',
    City: '',
    Province: '',
    PostCode: '',
    UserRole: '',
    CreatedBy: '',
    Password: '',
    Latitude: '',
    Longitude: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});

  const primaryColor = useThemeColor({}, 'primary');
  const successColor = useThemeColor({}, 'success');
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
          FirstName: data.FirstName || '',
          LastName: data.LastName || '',
          NationalID: data.NationalID || '',
          Phone: data.Phone || '',
          Email: data.Email || '',
          Street: data.Street || '',
          City: data.City || '',
          Province: data.Province || '',
          PostCode: data.PostCode || '',
          UserRole: data.UserRole || '',
          CreatedBy: data.CreatedBy || '',
          Latitude: data.Latitude?.toString() || '',
          Longitude: data.Longitude?.toString() || '',
          Password: data.Password || ''
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

  const validateForm = () => {
    const errors: string[] = [];
    const fieldErrs: {[key: string]: string} = {};

    // Required field validation
    if (!formData.FirstName.trim()) {
      errors.push('نام الزامی است');
      fieldErrs.FirstName = 'نام الزامی است';
    }

    if (!formData.LastName.trim()) {
      errors.push('نام خانوادگی الزامی است');
      fieldErrs.LastName = 'نام خانوادگی الزامی است';
    }


    // Email validation (if provided)
    if (formData.Email && formData.Email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.Email)) {
        errors.push('فرمت ایمیل صحیح نیست');
        fieldErrs.Email = 'فرمت ایمیل صحیح نیست';
      }
    }

    // Phone validation (if provided)
    if (formData.Phone && formData.Phone.trim()) {
      const phoneRegex = /^09\d{9}$/;
      if (!phoneRegex.test(formData.Phone)) {
        errors.push('شماره موبایل باید با ۰۹ شروع شده و ۱۱ رقم باشد');
        fieldErrs.Phone = 'شماره موبایل باید با ۰۹ شروع شده و ۱۱ رقم باشد';
      }
    }

    // National ID validation (if provided)
    if (formData.NationalID && formData.NationalID.trim()) {
      if (formData.NationalID.length !== 10) {
        errors.push('کد ملی باید ۱۰ رقم باشد');
        fieldErrs.NationalID = 'کد ملی باید ۱۰ رقم باشد';
      }
    }

    // User ID validation
    if (!userId) {
      errors.push('شناسه کاربر ثبت‌کننده یافت نشد. لطفاً دوباره وارد شوید.');
    }

    setValidationErrors(errors);
    setFieldErrors(fieldErrs);
    return errors.length === 0;
  };

  const handleFieldChange = (field: keyof AdminEditData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear field-specific error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Clear general validation errors when user starts making changes
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return; // Stop submission if validation fails
    }

    setSaving(true);
    try {
      // Prepare data for API
      const apiData = {
        FirstName: formData.FirstName.trim(),
        LastName: formData.LastName.trim(),
        NationalID: formData.NationalID.trim(),
        Phone: formData.Phone.trim(),
        Email: formData.Email.trim() || undefined,
        Street: formData.Street.trim(),
        City: formData.City.trim(),
        Province: formData.Province.trim(),
        PostCode: formData.PostCode.trim() || undefined,
        UserRole: formData.UserRole.trim(),
        CreatedBy: Number(userId),
        Latitude: formData.Latitude ? parseFloat(formData.Latitude) : undefined,
        Longitude: formData.Longitude ? parseFloat(formData.Longitude) : undefined,
        Password: formData.Password.trim()
      };

      const response = await apiService.editAdmin(registerId as string, apiData);
      if (response.success) {
        Alert.alert(
          'موفقیت',
          'اطلاعات نماینده با موفقیت به‌روزرسانی شد',
          [
            {
              text: 'تأیید',
              onPress: () => router.replace('/admin')
            }
          ]
        );
      } else {
        setValidationErrors([response.error || 'خطا در به‌روزرسانی اطلاعات']);
      }
    } catch (error) {
      console.error('Error updating admin:', error);
      setValidationErrors(['خطا در اتصال به سرور']);
    } finally {
      setSaving(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return '👑';
      case 'groupadmin':
        return '👥';
      default:
        return '👤';
    }
  };

  const getRoleTitle = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'مدیر';
      case 'groupadmin':
        return 'نماینده گروه';
      default:
        return 'نماینده';
    }
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <AppHeader title="ویرایش نماینده" subtitle="در حال بارگذاری..." />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
          <ThemedText style={[styles.loadingText, { color: textColor }]}>
            در حال بارگذاری اطلاعات...
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <AppHeader
        title="ویرایش نماینده"
        subtitle={`${formData.FirstName} ${formData.LastName}`}
        showBackButton
      />

      <KeyboardAwareContainer>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            {/* Header Card */}
            <ThemedView style={[styles.headerCard, { backgroundColor: withOpacity(primaryColor, 5) }]}>
              <View style={styles.headerContent}>
                <View style={[styles.avatarContainer, { backgroundColor: withOpacity(primaryColor, 15) }]}>
                  <ThemedText style={[styles.avatarText, { color: primaryColor }]}>
                    {getRoleIcon(formData.UserRole)}
                  </ThemedText>
                </View>
                <View style={styles.headerInfo}>
                  <ThemedText style={[styles.headerTitle, { color: primaryColor }]}>
                    ویرایش اطلاعات {getRoleTitle(formData.UserRole)}
                  </ThemedText>
                  <ThemedText style={[styles.headerSubtitle, { color: textColor }]}>
                    شناسه: {registerId}
                  </ThemedText>
                </View>
              </View>
            </ThemedView>

            {/* Validation Error Bar */}
            {validationErrors.length > 0 && (
              <View style={[styles.errorContainer, { backgroundColor: withOpacity(errorColor, 10), borderColor: errorColor }]}>
                <ThemedText style={[styles.errorTitle, { color: errorColor }]}>
                  ⚠️ خطاهای اعتبارسنجی:
                </ThemedText>
                {validationErrors.map((error, index) => (
                  <ThemedText key={index} style={[styles.errorText, { color: errorColor }]}>
                    • {error}
                  </ThemedText>
                ))}
              </View>
            )}

            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>اطلاعات شخصی</ThemedText>

            <InputField
              label="نام *"
              value={formData.FirstName}
              onChangeText={(text) => handleFieldChange('FirstName', text)}
              placeholder="نام را وارد کنید"
              error={fieldErrors.FirstName}
              required
              style={styles.rtlInput}
            />

            <InputField
              label="نام خانوادگی *"
              value={formData.LastName}
              onChangeText={(text) => handleFieldChange('LastName', text)}
              placeholder="نام خانوادگی را وارد کنید"
              error={fieldErrors.LastName}
              required
              style={styles.rtlInput}
            />

            <InputField
              label="شماره موبایل"
              value={formData.Phone || ''}
              onChangeText={(text) => handleFieldChange('Phone', text)}
              placeholder="۰۹۱۲۳۴۵۶۷۸۹"
              keyboardType="phone-pad"
              error={fieldErrors.Phone}
              style={styles.rtlInput}
            />

            <InputField
              label="کد ملی"
              value={formData.NationalID || ''}
              onChangeText={(text) => handleFieldChange('NationalID', text)}
              placeholder="کد ملی ۱۰ رقمی"
              keyboardType="numeric"
              error={fieldErrors.NationalID}
              style={styles.rtlInput}
            />

            <InputField
              label="ایمیل"
              value={formData.Email || ''}
              onChangeText={(text) => handleFieldChange('Email', text)}
              placeholder="example@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              error={fieldErrors.Email}
              style={styles.rtlInput}
            />


            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>اطلاعات آدرس</ThemedText>

            <InputField
              label="استان"
              value={formData.Province || ''}
              onChangeText={(text) => handleFieldChange('Province', text)}
              placeholder="نام استان"
              style={styles.rtlInput}
            />

            <InputField
              label="شهر"
              value={formData.City || ''}
              onChangeText={(text) => handleFieldChange('City', text)}
              placeholder="نام شهر"
              style={styles.rtlInput}
            />

            <InputField
              label="آدرس"
              value={formData.Street || ''}
              onChangeText={(text) => handleFieldChange('Street', text)}
              placeholder="آدرس کامل"
              multiline
              style={[styles.rtlInput, styles.multilineInput]}
            />

            <InputField
              label="کد پستی"
              value={formData.PostCode || ''}
              onChangeText={(text) => handleFieldChange('PostCode', text)}
              placeholder="کد پستی"
              keyboardType="numeric"
              style={styles.rtlInput}
            />

            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>موقعیت جغرافیایی</ThemedText>

            <InputField
              label="عرض جغرافیایی"
              value={formData.Latitude}
              onChangeText={(text) => handleFieldChange('Latitude', text)}
              placeholder="35.6892"
              keyboardType="numeric"
              style={styles.rtlInput}
            />

            <InputField
              label="طول جغرافیایی"
              value={formData.Longitude}
              onChangeText={(text) => handleFieldChange('Longitude', text)}
              placeholder="51.3890"
              keyboardType="numeric"
              style={styles.rtlInput}
            />

            {formData.Latitude && formData.Longitude && (
              <View style={[styles.locationInfo, { backgroundColor: withOpacity(successColor, 10), borderColor: withOpacity(successColor, 30) }]}>
                <ThemedText style={[styles.locationLabel, { color: successColor }]}>📍 موقعیت فعلی:</ThemedText>
                <ThemedText style={[styles.locationText, { color: textColor }]}>
                  عرض جغرافیایی: {formData.Latitude}
                </ThemedText>
                <ThemedText style={[styles.locationText, { color: textColor }]}>
                  طول جغرافیایی: {formData.Longitude}
                </ThemedText>
              </View>
            )}
          </View>
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: surfaceColor }]}>
          <Button
            title="📍 انتخاب موقعیت در نقشه"
            onPress={() => {
              router.push({
                pathname: '/admin/register/map',
                params: {
                  formData: JSON.stringify(formData),
                  roleTitle: getRoleTitle(formData.UserRole),
                  roleIcon: getRoleIcon(formData.UserRole),
                  role: formData.UserRole,
                  city: formData.City || '',
                  province: formData.Province || '',
                  savedlocation: formData.Latitude && formData.Longitude
                    ? JSON.stringify({
                        latitude: parseFloat(formData.Latitude),
                        longitude: parseFloat(formData.Longitude)
                      })
                    : '',
                  editMode: 'true',
                  registerId: registerId as string
                }
              });
            }}
            variant="outline"
            style={styles.mapButton}
          />

          <Button
            title="❌ انصراف"
            onPress={() => router.back()}
            variant="outline"
            style={styles.cancelButton}
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
    padding: Spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  headerCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  avatarText: {
    fontSize: 24,
  },
  headerInfo: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    padding: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  errorTitle: {
    fontWeight: 'bold',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: Spacing.xs,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: Spacing.md,
    textAlign: 'right',
  },
  rtlInput: {
    textAlign: 'right',
  },
  multilineInput: {
    minHeight: 100,
    maxHeight: 150,
  },
  locationInfo: {
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    padding: Spacing.md,
    marginTop: Spacing.lg,
  },
  locationLabel: {
    fontWeight: 'bold',
  },
  locationText: {
    fontSize: 14,
    marginTop: Spacing.xs,
  },
  footer: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  mapButton: {
    marginBottom: Spacing.md,
  },
  saveButton: {
    marginBottom: Spacing.sm,
  },
  cancelButton: {
    marginBottom: Spacing.sm,
  },
});
