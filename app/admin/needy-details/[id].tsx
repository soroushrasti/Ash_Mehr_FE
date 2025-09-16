import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Spacing, BorderRadius } from '@/constants/Design';
import { apiService } from '@/services/apiService';
import AppHeader from '@/components/AppHeader';

interface NeedyDetails {
  id: string;
  register_id: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  phone: string;
  email?: string;
  street: string;
  city: string;
  province: string;
  age: string;
  region:string;
  gender: string;
  nameFather: string;
  husbandFirstName: string;
  HusbandLastName: string;
  reasonMissingHusband: string;
  underOrganizationName: string;
  educationLevel: string;
  postCode?: string;
  birthDate?: string;
  incomeForm?: number;
  underWhichAdmin: string;
  latitude?: number;
  longitude?: number;
  createdAt?: string;
  updatedAt?: string;
  children?: Array<{
    firstName: string;
    lastName: string;
    age: number;
    gender: string;
    nationalId: string;
    education?: string;
  }>;
}

export default function NeedyDetailsPage() {
  const { id } = useLocalSearchParams();
  const [needyDetails, setNeedyDetails] = useState<NeedyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const primaryColor = useThemeColor({}, 'primary');
  const successColor = useThemeColor({}, 'success');
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  useEffect(() => {
    if (id) {
      loadNeedyDetails(id as string);
    }
  }, [id]);

  const loadNeedyDetails = async (needyId: string) => {
    try {
      const response = await apiService.getNeedyDetails(needyId);
      if (response.success && response.data) {
        setNeedyDetails(response.data);
      } else {
        Alert.alert('خطا', 'دریافت جزئیات مددجو با خطا مواجه شد');
        router.back();
      }
    } catch (error) {
      console.error('Error loading needy details:', error);
      Alert.alert('خطا', 'خطا در دریافت اطلاعات');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (needyDetails?.register_id) {
      router.push(`/admin/edit-needy/${needyDetails.register_id}`);
    }
  };

  const DetailSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={[styles.section, { backgroundColor: surfaceColor, borderColor }]}>
      <ThemedText style={[styles.sectionTitle, { color: primaryColor }]}>
        {title}
      </ThemedText>
      {children}
    </View>
  );

  const DetailRow = ({ label, value }: { label: string; value?: string | number }) => (
    <View style={styles.detailRow}>
      <ThemedText style={[styles.label, { color: textColor }]}>
        {label}:
      </ThemedText>
      <ThemedText style={[styles.value, { color: textColor }]}>
        {value || 'مشخص نشده'}
      </ThemedText>
    </View>
  );

  if (loading) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <AppHeader title="جزئیات مددجو" subtitle="اطلاعات کامل" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
          <ThemedText style={{ marginTop: Spacing.lg, color: textColor }}>
            در حال بارگذاری...
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (!needyDetails) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <AppHeader title="جزئیات مددجو" subtitle="اطلاعات یافت نشد" />
        <View style={styles.loadingContainer}>
          <ThemedText style={{ color: textColor }}>
            اطلاعات مددجو یافت نشد
          </ThemedText>
          <Button
            title="بازگشت"
            onPress={() => router.back()}
            style={{ marginTop: Spacing.lg }}
          />
        </View>
      </ThemedView>
    );
  }

  return (

    <ThemedView style={[styles.container, { backgroundColor }]}>
      <AppHeader
       title={`${needyDetails.FirstName} ${needyDetails.LastName}`}
        subtitle="جزئیات مددجو"
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Personal Information */}
        <DetailSection title="اطلاعات شخصی">
          <DetailRow label="نام" value={needyDetails.FirstName} />
          <DetailRow label="نام خانوادگی" value={needyDetails.LastName} />
          <DetailRow label="کد ملی" value={needyDetails.NationalID} />
          <DetailRow label="تاریخ تولد" value={needyDetails.BirthDate} />
          <DetailRow label="شماره تلفن" value={needyDetails.Phone} />
          <DetailRow label="سن" value={needyDetails.Age} />
          <DetailRow label="جنسیت" value={needyDetails.Gender} />
          <DetailRow label="نام همسر" value={needyDetails.HusbandFirstName} />
          <DetailRow label="نام خانوادگی همسر" value={needyDetails.HusbandLastName} />
          <DetailRow label="علت نبود همسر" value={needyDetails.ReasonMissingHusband} />
          <DetailRow label="نام سازمان تحت حمایت" value={needyDetails.UnderOrganizationName} />
          <DetailRow label="سطح تحصیلات" value={needyDetails.EducationLevel} />
        </DetailSection>

        {/* Address Information */}
        <DetailSection title="اطلاعات آدرس">
          <DetailRow label="استان" value={needyDetails.Province} />
          <DetailRow label="شهر" value={needyDetails.City} />
          <DetailRow label="آدرس" value={needyDetails.Street} />
          <DetailRow label="کد پستی" value={needyDetails.PostCode} />
          <DetailRow label="منظقه" value={needyDetails.Region} />
          {needyDetails.Latitude && needyDetails.Longitude && (
            <>
              <DetailRow label="عرض جغرافیایی" value={needyDetails.Latitude.toString()} />
              <DetailRow label="طول جغرافیایی" value={needyDetails.Longitude.toString()} />
            </>
          )}
        </DetailSection>

        {/* Financial Information */}
        <DetailSection title="اطلاعات مالی و شغلی">
          <DetailRow label="درآمد ماهانه" value={needyDetails.IncomeForm ? `${needyDetails.IncomeForm.toLocaleString()} تومان` : undefined} />
        </DetailSection>

        {/* Children Information */}
        {needyDetails.children && needyDetails.children.length > 0 && (
          <DetailSection title="اطلاعات فرزندان">
            {needyDetails.children.map((child, index) => (
              <View key={index} style={[styles.childInfo, { borderColor }]}>
                <ThemedText style={[styles.childTitle, { color: primaryColor }]}>
                  فرزند {index + 1}
                </ThemedText>
                <DetailRow label="نام" value={child.FirstName} />
                <DetailRow label="نام خانوادگی" value={child.LastName} />
                <DetailRow label="سن" value={child.Age.toString()} />
                <DetailRow label="کد ملی" value={child.NationalID} />
                <DetailRow label="جنسیت" value={child.Gender} />
                <DetailRow label="تحصیلات" value={child.EducationLevel} />
              </View>
            ))}
          </DetailSection>
        )}

        {/* System Information */}
        <DetailSection title="اطلاعات سیستم">
          <DetailRow label="شناسه ثبت" value={needyDetails.RegisterID} />
          <DetailRow label="تاریخ ثبت" value={needyDetails.CreatedDate} />
          <DetailRow label="آخرین به‌روزرسانی" value={needyDetails.UpdatedDate} />
        </DetailSection>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title="ویرایش اطلاعات"
            onPress={handleEdit}
            style={[styles.actionButton, { backgroundColor: successColor }]}
          />
          <Button
            title="بازگشت"
            onPress={() => router.back()}
            variant="outline"
            style={styles.actionButton}
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
  detailRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 14,
  },
  value: {
    flex: 2,
    fontSize: 14,
    textAlign: 'right',
  },
  childInfo: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  childTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'justify',
  },
  actionButtons: {
    gap: Spacing.lg,
    marginVertical: Spacing.xl,
  },
  actionButton: {
    marginBottom: Spacing.sm,
  },
});
