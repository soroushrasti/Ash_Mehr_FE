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
  address: string;
  city: string;
  province: string;
  postalCode?: string;
  birthDate?: string;
  maritalStatus?: string;
  numberOfChildren?: number;
  jobStatus?: string;
  income?: number;
  description?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  latitude?: number;
  longitude?: number;
  createdAt?: string;
  updatedAt?: string;
  children?: Array<{
    name: string;
    age: number;
    gender: string;
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
        title={`${needyDetails.firstName} ${needyDetails.lastName}`}
        subtitle="جزئیات مددجو"
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Personal Information */}
        <DetailSection title="اطلاعات شخصی">
          <DetailRow label="نام" value={needyDetails.firstName} />
          <DetailRow label="نام خانوادگی" value={needyDetails.lastName} />
          <DetailRow label="کد ملی" value={needyDetails.nationalId} />
          <DetailRow label="شماره تلفن" value={needyDetails.phone} />
          <DetailRow label="ایمیل" value={needyDetails.email} />
          <DetailRow label="تاریخ تولد" value={needyDetails.birthDate} />
          <DetailRow label="وضعیت تأهل" value={needyDetails.maritalStatus} />
          <DetailRow label="تعداد فرزندان" value={needyDetails.numberOfChildren} />
        </DetailSection>

        {/* Address Information */}
        <DetailSection title="اطلاعات آدرس">
          <DetailRow label="استان" value={needyDetails.province} />
          <DetailRow label="شهر" value={needyDetails.city} />
          <DetailRow label="آدرس" value={needyDetails.address} />
          <DetailRow label="کد پستی" value={needyDetails.postalCode} />
          {needyDetails.latitude && needyDetails.longitude && (
            <>
              <DetailRow label="عرض جغرافیایی" value={needyDetails.latitude.toString()} />
              <DetailRow label="طول جغرافیایی" value={needyDetails.longitude.toString()} />
            </>
          )}
        </DetailSection>

        {/* Financial Information */}
        <DetailSection title="اطلاعات مالی و شغلی">
          <DetailRow label="وضعیت شغلی" value={needyDetails.jobStatus} />
          <DetailRow label="درآمد ماهانه" value={needyDetails.income ? `${needyDetails.income.toLocaleString()} تومان` : undefined} />
        </DetailSection>

        {/* Emergency Contact */}
        <DetailSection title="مخاطب اضطراری">
          <DetailRow label="نام مخاطب اضطراری" value={needyDetails.emergencyContact} />
          <DetailRow label="شماره تلفن اضطراری" value={needyDetails.emergencyPhone} />
        </DetailSection>

        {/* Children Information */}
        {needyDetails.children && needyDetails.children.length > 0 && (
          <DetailSection title="اطلاعات فرزندان">
            {needyDetails.children.map((child, index) => (
              <View key={index} style={[styles.childInfo, { borderColor }]}>
                <ThemedText style={[styles.childTitle, { color: primaryColor }]}>
                  فرزند {index + 1}
                </ThemedText>
                <DetailRow label="نام" value={child.name} />
                <DetailRow label="سن" value={child.age.toString()} />
                <DetailRow label="جنسیت" value={child.gender} />
                <DetailRow label="تحصیلات" value={child.education} />
              </View>
            ))}
          </DetailSection>
        )}

        {/* Description */}
        {needyDetails.description && (
          <DetailSection title="توضیحات">
            <ThemedText style={[styles.description, { color: textColor }]}>
              {needyDetails.description}
            </ThemedText>
          </DetailSection>
        )}

        {/* System Information */}
        <DetailSection title="اطلاعات سیستم">
          <DetailRow label="شناسه ثبت" value={needyDetails.register_id} />
          <DetailRow label="تاریخ ثبت" value={needyDetails.createdAt} />
          <DetailRow label="آخرین به‌روزرسانی" value={needyDetails.updatedAt} />
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
