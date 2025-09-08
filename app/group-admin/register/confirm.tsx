/* eslint-disable import/no-unused-modules */
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, Alert, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/components/AuthContext';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Spacing } from '@/constants/Design';
import {NeedyCreateWithChildren} from "@/types/api";
import {apiService} from "@/services/apiService";

// Helper function to convert hex to rgba
function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function GroupAdminRegisterConfirm() {
  const router = useRouter();
  const { formData, role, roleTitle, roleIcon, location } = useLocalSearchParams();
  const { userId } = useAuth();
  const [loading, setLoading] = useState(false);

  const primaryColor = useThemeColor({}, 'primary');
  const successColor = useThemeColor({}, 'success');

  const parsedFormData = formData ? JSON.parse(formData as string) : {};
  const parsedLocation = location ? JSON.parse(location as string) : {};

  // Same data organization as admin confirm page
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
    router.back();
  };

  const handleEditLocation = () => {
    router.back();
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      // Prepare registration data with Group Admin context
      const registrationData = {
        ...parsedFormData,
        location: parsedLocation,
        role,
        registeredByGroupAdmin: userId, // Group Admin ID
        registrationDate: new Date().toISOString(),
        isGroupAdminRegistration: true,
      };

      // Simulate API call to POST /signup-admin with GroupAdminID in payload
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
            CreatedBy: userId,
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
        } as NeedyCreateWithChildren;
        console.log('Submitting registration data:', registerData);
        const result = await apiService.createNeedyPerson(registerData);


      Alert.alert(
        'ثبت‌نام موفق',
        `${roleTitle} با موفقیت در سیستم ثبت شد و تحت پوشش گروه شما قرار گرفت.`,
        [
          {
            text: 'تأیید',
            onPress: () => {
              router.replace('/group-admin');
            }
          }
        ]
      );

    } catch (error) {
      console.error('Registration error:', error); // Added error logging
      Alert.alert('خطا', 'در ثبت‌نام خطایی رخ داد. لطفاً دوباره تلاش کنید.');
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
      <ScrollView
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'on-drag' : 'none'}
        contentInsetAdjustmentBehavior="always"
        nestedScrollEnabled
        overScrollMode={Platform.OS === 'android' ? 'always' : undefined}
        removeClippedSubviews={false}
        scrollEnabled
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, padding: Spacing.xl, paddingBottom: Spacing['4xl'] }}
      >
        {/* Progress Bar */}
        <ProgressBar />

        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.roleIconContainer, { backgroundColor: hexToRgba(successColor, 0.2) }]}>
            <ThemedText style={styles.roleIcon}>{roleIcon}</ThemedText>
          </View>
          <ThemedText type="heading2" center style={styles.title}>
            تأیید نهایی ثبت‌نام
          </ThemedText>
          <ThemedText type="body" center style={styles.subtitle}>
            ثبت‌نام توسط مدیر گروه
          </ThemedText>
        </View>

        {/* Group Admin Registration Summary */}
        <ThemedView type="card" style={[styles.summaryCard, { backgroundColor: hexToRgba(primaryColor, 0.1) }]}>
          <View style={styles.summaryHeader}>
            <ThemedText style={styles.summaryIcon}>👥</ThemedText>
            <View>
              <ThemedText type="heading3" style={[styles.summaryTitle, { color: primaryColor }]}>
                ثبت‌نام {roleTitle} توسط مدیر گروه
              </ThemedText>
              <ThemedText type="caption" style={styles.summarySubtitle}>
                این فرد تحت پوشش گروه شما قرار خواهد گرفت
              </ThemedText>
            </View>
          </View>
        </ThemedView>

        {/* Information Sections */}
        <InfoSection
          title="اطلاعات شخصی"
          data={personalInfo}
          onEdit={handleEditForm}
          editTitle="ویرایش"
        />

        <InfoSection
          title="اطلاعات آدرس"
          data={addressInfo}
          onEdit={handleEditForm}
          editTitle="ویرایش"
        />

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
    marginBottom: Spacing.xl * 2, // Changed from Spacing['3xl']
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
    marginBottom: Spacing.xl * 2, // Changed from Spacing['3xl']
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
    borderColor: 'rgba(46, 125, 50, 0.2)',
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
    marginBottom: Spacing.xl * 3, // Changed from Spacing['4xl']
  },
});
