/* eslint-disable react/no-unescaped-entities */
import React, { useState } from 'react';
import { ScrollView as RNScrollView, StyleSheet, View, Alert, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/components/AuthContext';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Spacing } from '@/constants/Design';
import { withOpacity } from '@/utils/colorUtils';
import { apiService } from '@/services/apiService';
import { NeedyCreateWithChildren } from '@/types/api';

export default function AdminRegisterConfirm() {
  const router = useRouter();
  const { formData, roleTitle, roleIcon, location, role, registerId, editMode } = useLocalSearchParams();
  console.log('Form Data:', formData);
  console.log('Location Data:', location);
  console.log('Role:', role, 'Role Title:', roleTitle, 'Role Icon:', roleIcon, 'Register ID:', registerId, 'Edit Mode:', editMode);
  const roleParam = Array.isArray(role) ? role[0] : role;
  const registerIdString = Array.isArray(registerId) ? registerId[0] : registerId;
  const { userId } = useAuth();
  const [loading, setLoading] = useState(false);

  const successColor = useThemeColor({}, 'success');

  const parsedFormData = formData ? JSON.parse(formData as string) : {};
  const parsedLocation = location ? JSON.parse(location as string) : {};

  // Organize form data for display
  const personalInfo = [
    { label: 'نام', value: parsedFormData.FirstName },
    { label: 'نام خانوادگی', value: parsedFormData.LastName },
    { label: 'شماره تلفن', value: parsedFormData.Phone },
    { label: 'کد ملی', value: parsedFormData.NationalID },
    { label: 'ایمیل', value: parsedFormData.Email },
  ];

  const addressInfo = [
    { label: 'استان', value: parsedFormData.Province },
    { label: 'شهر', value: parsedFormData.City },
    { label: 'آدرس', value: parsedFormData.Street },
  ];

  const additionalInfo = [
    { label: 'سن', value: parsedFormData.Age },
    { label: 'جنسیت', value: parsedFormData.Gender === 'Male' ? 'مرد' : parsedFormData.gender === 'Female' ? 'زن' : parsedFormData.gender },
    { label: 'منطقه', value: parsedFormData.Region },
    { label: 'سطح تحصیلات', value: getEducationLabel(parsedFormData.EducationLevel) },
    { label: 'درآمد ماهانه', value: parsedFormData.IncomeAmount ? `${parsedFormData.IncomeAmount} تومان` : '' },
    { label: 'نام همسر', value: parsedFormData.HousebandLastName && parsedFormData.HousebandFirstName ? `${parsedFormData.HousebandFirstName} ${parsedFormData.HousebandLastName}` : '' },
    { label: 'دلیل غیبت همسر', value: parsedFormData.ReasonMissingHusband },
    { label: 'سازمان حامی', value: parsedFormData.UnderOrganizationName },
  ].filter(item => item.value); // Only show fields with values

   const childInfo = [
      { label: 'نام', value: parsedFormData.children_of_registre.FirstName },
      { label: 'نام خانوادگی', value: parsedFormData.children_of_registre.LastName },
      { label: 'سن', value: parsedFormData.children_of_registre.Age },
      { label: 'جنسیت', value: parsedFormData.children_of_registre.Gender },
      { label: 'کد ملی', value: parsedFormData.children_of_registre.NationalID },
      { label: 'تحصیلات', value: parsedFormData.children_of_registre.EducationLevel },
    ].filter(item => item.value);

  function getEducationLabel(value: string) {
    const educationMap = {
      'None': 'بی‌سواد',
      'Primary': 'ابتدایی',
      'Secondary': 'راهنمایی',
      'High School': 'دبیرستان',
      'Diploma': 'دیپلم',
      'Associate Degree': 'فوق‌دیپلم',
      'Bachelor': 'لیسانس',
      'Master': 'فوق‌لیسانس',
      'PhD': 'دکتری',
    };
    return educationMap[value as keyof typeof educationMap] || value;
  }

  const handleEditForm = () => {
    router.back();
    router.back(); // Go back two steps to form
  };

  const handleEditLocation = () => {
    router.back(); // Go back one step to map
  };

  const handleSubmit = async () => {
    if (!userId) {
      Alert.alert('خطا', 'شناسه کاربر ثبت‌کننده موجود نیست. لطفاً دوباره وارد شوید.');
      return;
    }
    setLoading(true);

    try {
        console.log('Submitting with editMode:', editMode);
      const isAdminRole = roleParam === 'Admin' || roleParam === 'GroupAdmin';

      if (isAdminRole && editMode !== 'true') {
        // Validate password
        if (!parsedFormData.Password || parsedFormData.Password.length < 6) {
          Alert.alert('خطا', 'رمز عبور معتبر وارد نشده است.');
          setLoading(false);
          return;
        }
        const adminPayload = {
          ...parsedFormData,
          UserRole: roleParam === 'GroupAdmin' ? 'GroupAdmin' : 'Admin',
          CreatedBy: Number(userId),
          BirthDate: parsedFormData.BirthDate || undefined,
          Latitude: parsedLocation.latitude?.toString() || parsedFormData.Latitude || undefined,
          Longitude: parsedLocation.longitude?.toString() || parsedFormData.Longitude || undefined,
        };
        const result = await apiService.createAdmin(adminPayload as any);
        if (!result.success) {
          Alert.alert('خطا', result.error || 'ثبت نماینده ناموفق بود');
          setLoading(false);
          return;
        }
      }

        if (isAdminRole && editMode === 'true' && registerIdString) {
            // Validate password
            if (!parsedFormData.Password || parsedFormData.Password.length < 6) {
                Alert.alert('خطا', 'رمز عبور معتبر وارد نشده است.');
                setLoading(false);
                return;
            }
            const adminPayload = {
                ...parsedFormData,
                UserRole: roleParam === 'GroupAdmin' ? 'GroupAdmin' : 'Admin',
                CreatedBy: Number(userId),
                BirthDate: parsedFormData.BirthDate || undefined,
                Latitude: parsedLocation.latitude?.toString() || parsedFormData.Latitude || undefined,
                Longitude: parsedLocation.longitude?.toString() || parsedFormData.Longitude || undefined,
            };
            const result = await apiService.editAdmin(registerIdString, adminPayload as any);
            if (!result.success) {
                Alert.alert('خطا', result.error || 'ثبت نماینده ناموفق بود');
                setLoading(false);
                return;
            }
        }


      // Needy roles flow
        const isNeedy = roleParam === 'Needy' || roleParam === 'needy';

        if (isNeedy && !registerId) {
             const validChildren = parsedFormData.children_of_registre.filter(child =>
                    child.FirstName && child.LastName && child.NationalID && child.EducationLevel && child.Age && child.Gender
                );
            const registerData: NeedyCreateWithChildren = {
                ...parsedFormData,
                CreatedBy: Number(userId),
                Latitude: parsedLocation.latitude?.toString() || undefined,
                Longitude: parsedLocation.longitude?.toString() || undefined,
                children_of_registre: validChildren,
            } as NeedyCreateWithChildren;
            const result = await apiService.createNeedyPerson(registerData);

            if (!result.success) {
                Alert.alert('خطا', result.error || 'در ذخیره خطایی رخ داد.');
                setLoading(false);
                return;
            }

        }
        if (isNeedy && editMode === 'true' && registerIdString) {
            console.log(isNeedy, editMode, registerIdString);
            const registerData: NeedyCreateWithChildren = {
                ...parsedFormData,
                CreatedBy: Number(userId),
                Latitude: parsedLocation.latitude?.toString() || undefined,
                Longitude: parsedLocation.longitude?.toString() || undefined,
                children_of_registre: null,
            } as NeedyCreateWithChildren;
            const result = await apiService.editNeedy(registerIdString, registerData);
            console.log('Edit needy result:', result);
            if (!result.success) {
                Alert.alert('خطا', result.error || 'در ذخیره خطایی رخ داد.');
                setLoading(false);
                return;
            }


        }

        if (Platform.OS === 'web') {
            alert(`${roleTitle} با موفقیت در سیستم ثبت شد.`);
        }
        Alert.alert(
            'ذخیره موفق',
            `${roleTitle} با موفقیت در سیستم ثبت شد.`,
            [
                {
                    text: 'تأیید',
                    onPress: () => {
                        router.replace('/admin');
                    }
                }
            ]
        );
        router.replace('/admin');
        setLoading(false);
        return;

    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('خطا', error instanceof Error ? error.message : 'در ذخیره خطایی رخ داد. لطفاً دوباره تلاش کنید.');
    } finally {
      setLoading(false);
    }
  };

  const INSET_BEHAVIOR: any = 'always';
  const ANDROID_OVERSCROLL: any = Platform.OS === 'android' ? 'always' : undefined;

  const ProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={[styles.progressStep, { backgroundColor: successColor }]}>
        <ThemedText style={styles.progressText}>✓</ThemedText>
      </View>
      <View style={[styles.progressLine, { backgroundColor: successColor }]} />
      <View style={[styles.progressStep, { backgroundColor: successColor }]}>
        <ThemedText style={styles.progressText}>✓</ThemedText>
      </View>
      <View style={[styles.progressLine, { backgroundColor: successColor }]} />
      <View style={[styles.progressStep, { backgroundColor: successColor }]}>
        <ThemedText style={styles.progressText}>✓</ThemedText>
      </View>
    </View>
  );

  const InfoSection = ({ title, data, onEdit, editTitle }: { title: string, data: any[], onEdit: () => void, editTitle: string }) => (
    <ThemedView type="card" style={styles.infoCard}>
      <View style={styles.cardHeader}>
        <ThemedText type="heading3" style={styles.cardTitle}>{title}</ThemedText>
        <Button
          title={editTitle}
          onPress={onEdit}
          variant="outline"
          size="small"
        />
      </View>
      {data.map((item, index) => (
        item.value && (
          <View key={index} style={styles.infoRow}>
            <ThemedText type="caption" style={styles.infoLabel}>{item.label}:</ThemedText>
            <ThemedText type="body" style={styles.infoValue}>{item.value}</ThemedText>
          </View>
        )
      ))}
    </ThemedView>
  );

  return (
    <ThemedView type="container" style={styles.container}>
      <View style={[styles.topBar, { backgroundColor: withOpacity(successColor, 10) }]}>
        <Button
          title="تأیید و ذخیره"
          onPress={handleSubmit}
          loading={loading}
          variant="success"
          size="small"
        />
      </View>
      <RNScrollView
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode={Platform.OS === 'ios' ? 'on-drag' : 'none'}
        contentInsetAdjustmentBehavior={INSET_BEHAVIOR}
        nestedScrollEnabled
        overScrollMode={ANDROID_OVERSCROLL}
        removeClippedSubviews={false}
        scrollEnabled
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, padding: Spacing.xl, paddingBottom: Spacing['4xl'] }}
      >
        {/* Progress Bar */}
        <ProgressBar />

        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.roleIconContainer, { backgroundColor: withOpacity(successColor, 20) }]}>
            <ThemedText style={styles.roleIcon}>{roleIcon}</ThemedText>
          </View>
          <ThemedText type="heading2" center style={styles.title}>
            تأیید نهایی
          </ThemedText>
          <ThemedText type="body" center style={styles.subtitle}>
            لطفاً اطلاعات را بررسی کرده و در صورت صحت، تأیید نمایید
          </ThemedText>
        </View>

        {/* Admin Registration Summary */}
        <ThemedView type="card" style={[styles.summaryCard, { backgroundColor: withOpacity(successColor, 10) }]}>
          <View style={styles.summaryHeader}>
            <ThemedText style={styles.summaryIcon}>✅</ThemedText>
            <View>
              <ThemedText type="heading3" style={[styles.summaryTitle, { color: successColor }]}>
                آماده ذخیره {roleTitle}
              </ThemedText>
              <ThemedText type="caption" style={styles.summarySubtitle}>
                همه اطلاعات تکمیل شده است
              </ThemedText>
            </View>
          </View>
        </ThemedView>

        {/* Personal Information */}
        <InfoSection
          title="اطلاعات شخصی"
          data={personalInfo}
          onEdit={handleEditForm}
          editTitle="ویرایش"
        />

        {/* Address Information */}
        <InfoSection
          title="اطلاعات آدرس"
          data={addressInfo}
          onEdit={handleEditForm}
          editTitle="ویرایش"
        />

         {/* children Information */}
         <InfoSection
           title="اطلاعات فرزندان"
           data={childInfo}
           onEdit={handleEditForm}
           editTitle="ویرایش"
         />

        {/* Additional Information (for needy families) */}
        {additionalInfo.length > 0 && (
          <InfoSection
            title="اطلاعات تکمیلی"
            data={additionalInfo}
            onEdit={handleEditForm}
            editTitle="ویرایش"
          />
        )}

        {/* Location Information */}
        <ThemedView type="card" style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <ThemedText type="heading3" style={styles.cardTitle}>موقعیت جغرافیایی</ThemedText>
            <Button
              title="ویرایش"
              onPress={handleEditLocation}
              variant="outline"
              size="small"
            />
          </View>
          <View style={styles.locationInfo}>
            <ThemedText style={styles.locationIcon}>📍</ThemedText>
            <View style={styles.locationDetails}>
              <ThemedText type="caption" style={styles.infoLabel}>
                عرض جغرافیایی: {parsedLocation.latitude?.toFixed(6)}
              </ThemedText>
              <ThemedText type="caption" style={styles.infoLabel}>
                طول جغرافیایی: {parsedLocation.longitude?.toFixed(6)}
              </ThemedText>
            </View>
          </View>
        </ThemedView>

        {/* Submit Button */}
        <View style={styles.buttonContainer}>
          <Button
            title="تأیید و ذخیره نهایی"
            onPress={handleSubmit}
            loading={loading}
            variant="success"
            icon={<ThemedText>🎉</ThemedText>}
          />
        </View>
      </RNScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.06)'
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxl,
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
  progressText: {
    color: 'white',
    fontWeight: 'bold',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
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
    marginBottom: Spacing.sm,
  },
  subtitle: {
    opacity: 0.7,
    textAlign: 'center',
  },
  summaryCard: {
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.2)',
  },
  summaryHeader: {
    flexDirection: 'row-reverse', // RTL layout for Persian text
    alignItems: 'center',
  },
  summaryIcon: {
    fontSize: 24, // Reduced from 32 to 24 for better proportion
    marginRight: Spacing.md, // Changed from marginLeft to marginRight for RTL
  },
  summaryTitle: {
    marginBottom: Spacing.xs,
    textAlign: 'right', // Right align for Persian text
  },
  summarySubtitle: {
    opacity: 0.7,
    textAlign: 'right', // Right align for Persian text
  },
  infoCard: {
    marginBottom: Spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  cardTitle: {
    color: '#2E7D32',
    textAlign: 'right',
  },
  infoRow: {
    flexDirection: 'row-reverse', // RTL layout
    marginBottom: Spacing.md,
    alignItems: 'flex-start',
    textAlign: 'right',
  },
  infoLabel: {
    width: '35%',
    opacity: 0.7,
    textAlign: 'right',
    paddingLeft: Spacing.sm,
  },
  infoValue: {
    flex: 1,
    fontWeight: '500',
    textAlign: 'right',
    paddingRight: Spacing.sm,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  locationIcon: {
    fontSize: 20,
    marginLeft: Spacing.md,
    marginTop: 2,
  },
  locationDetails: {
    flex: 1,
  },
  buttonContainer: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.xxl,
  },
});
