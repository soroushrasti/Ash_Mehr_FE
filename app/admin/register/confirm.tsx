import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, Alert } from 'react-native';
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
  const { formData, role, roleTitle, roleIcon, location } = useLocalSearchParams();
  const { userId, userType } = useAuth();
  const [loading, setLoading] = useState(false);

  const primaryColor = useThemeColor({}, 'primary');
  const successColor = useThemeColor({}, 'success');

  const parsedFormData = formData ? JSON.parse(formData as string) : {};
  const parsedLocation = location ? JSON.parse(location as string) : {};

  // Organize form data for display
  const personalInfo = [
    { label: 'نام', value: parsedFormData.firstName },
    { label: 'نام خانوادگی', value: parsedFormData.lastName },
    { label: 'شماره تلفن', value: parsedFormData.phone },
    { label: 'کد ملی', value: parsedFormData.nationalId },
    { label: 'ایمیل', value: parsedFormData.email },
  ];

  const addressInfo = [
    { label: 'استان', value: parsedFormData.province },
    { label: 'شهر', value: parsedFormData.city },
    { label: 'آدرس', value: parsedFormData.street },
  ];

  const additionalInfo = [
    { label: 'سن', value: parsedFormData.age },
    { label: 'جنسیت', value: parsedFormData.gender === 'Male' ? 'مرد' : parsedFormData.gender === 'Female' ? 'زن' : parsedFormData.gender },
    { label: 'منطقه', value: parsedFormData.region },
    { label: 'سطح تحصیلات', value: getEducationLabel(parsedFormData.educationLevel) },
    { label: 'درآمد ماهانه', value: parsedFormData.incomeAmount ? `${parsedFormData.incomeAmount} تومان` : '' },
    { label: 'نام همسر', value: parsedFormData.housebandFirstName && parsedFormData.housebandLastName ? `${parsedFormData.housebandFirstName} ${parsedFormData.housebandLastName}` : '' },
    { label: 'دلیل غیبت همسر', value: parsedFormData.reasonMissingHouseband },
    { label: 'سازمان حامی', value: parsedFormData.underOrganizationName },
  ].filter(item => item.value); // Only show fields with values

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
    setLoading(true);

    try {
      // Map form data to RegisterCreateWithChildren schema
      const registerData: NeedyCreateWithChildren = {
        FirstName: parsedFormData.firstName || '',
        LastName: parsedFormData.lastName || '',
        Phone: parsedFormData.phone || undefined,
        Email: parsedFormData.email || undefined,
        City: parsedFormData.city || undefined,
        Province: parsedFormData.province || undefined,
        Street: parsedFormData.street || undefined,
        NameFather: parsedFormData.nameFather || undefined,
        NationalID: parsedFormData.nationalId || undefined,
        CreatedBy: typeof userId === 'string' && !isNaN(Number(userId)) ? Number(userId) : undefined,
        Age: parsedFormData.age ? Number(parsedFormData.age) : undefined,
        Region: parsedFormData.region || undefined,
        Gender: parsedFormData.gender || undefined,
        HusbandFirstName: parsedFormData.housebandFirstName || undefined,
        HusbandLastName: parsedFormData.housebandLastName || undefined,
        ReasonMissingHusband: parsedFormData.reasonMissingHouseband || undefined,
        UnderOrganizationName: parsedFormData.underOrganizationName || undefined,
        EducationLevel: parsedFormData.educationLevel || undefined,
        IncomeForm: parsedFormData.incomeAmount ? String(parsedFormData.incomeAmount) : undefined,
        Latitude: parsedLocation.latitude?.toString() || undefined,
        Longitude: parsedLocation.longitude?.toString() || undefined,
        children_of_registre: null,
      };

      const result = await apiService.createNeedyPerson(registerData);

      if (result.success) {
        Alert.alert(
          'ثبت‌نام موفق',
          `${roleTitle} با موفقیت در سیستم ثبت شد.`,
          [
            {
              text: 'تأیید',
              onPress: () => {
                // Navigate back to appropriate dashboard
                if (userType === 'Admin') {
                  router.replace('/admin');
                } else if (userType === 'GroupAdmin') {
                  router.replace('/group-admin');
                }
              }
            }
          ]
        );
      } else {
        throw new Error(result.error || 'Registration failed');
      }

    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('خطا', error instanceof Error ? error.message : 'در ثبت‌نام خطایی رخ داد. لطفاً دوباره تلاش کنید.');
    } finally {
      setLoading(false);
    }
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
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Progress Bar */}
        <ProgressBar />

        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.roleIconContainer, { backgroundColor: withOpacity(successColor, 20) }]}>
            <ThemedText style={styles.roleIcon}>{roleIcon}</ThemedText>
          </View>
          <ThemedText type="heading2" center style={styles.title}>
            تأیید نهایی ثبت‌نام
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
                آماده ثبت‌نام {roleTitle}
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
              {parsedLocation.address && (
                <ThemedText type="body" style={styles.infoValue}>
                  {parsedLocation.address}
                </ThemedText>
              )}
            </View>
          </View>
        </ThemedView>

        {/* Submit Button */}
        <View style={styles.buttonContainer}>
          <Button
            title="تأیید و ثبت‌نام نهایی"
            onPress={handleSubmit}
            loading={loading}
            fullWidth
            variant="success"
            icon={<ThemedText>🎉</ThemedText>}
          />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  progressText: {
    color: 'white',
    fontWeight: 'bold',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing['3xl'],
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryIcon: {
    fontSize: 32,
    marginLeft: Spacing.md,
  },
  summaryTitle: {
    marginBottom: Spacing.xs,
  },
  summarySubtitle: {
    opacity: 0.7,
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
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    alignItems: 'flex-start',
  },
  infoLabel: {
    width: '35%',
    opacity: 0.7,
  },
  infoValue: {
    flex: 1,
    fontWeight: '500',
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
    marginBottom: Spacing['4xl'],
  },
});
