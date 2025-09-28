import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, ActivityIndicator, I18nManager } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Spacing, BorderRadius } from '@/constants/Design';
import { apiService } from '@/services/apiService';
import AppHeader from '@/components/AppHeader';
import { withOpacity } from '@/utils/colorUtils';

// Ensure RTL is enabled
if (!I18nManager.isRTL) {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
}

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
  region: string;
  gender: string;
  nameFather: string;
  husbandFirstName: string;
  husbandLastName: string;
  reasonMissingHusband: string;
  underOrganizationName: string;
  educationLevel: string;
  postCode?: string;
  birthDate?: string;
  incomeForm?: number;
  underWhichAdmin: string;
  underSecondAdminId: string;
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

  const getEducationLabel = (value: string) => {
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
  };

  const getGenderLabel = (value: string) => {
    return value === 'Male' ? 'مرد' : value === 'Female' ? 'زن' : value;
  };

  const DetailSection = ({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) => (
    <ThemedView style={[styles.sectionCard, { backgroundColor: surfaceColor }]}>
      <View style={styles.sectionHeader}>
        <ThemedText style={[styles.sectionIcon, { color: primaryColor }]}>{icon}</ThemedText>
        <ThemedText style={[styles.sectionTitle, { color: textColor }]}>{title}</ThemedText>
      </View>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </ThemedView>
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
        <AppHeader title="جزئیات مددجو" subtitle="در حال بارگذاری..." />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
          <ThemedText style={[styles.loadingText, { color: textColor }]}>
            در حال بارگذاری اطلاعات...
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
          <ThemedText style={[styles.errorText, { color: textColor }]}>
            اطلاعات مددجو یافت نشد
          </ThemedText>
          <Button
            title="بازگشت"
            onPress={() => router.back()}
            style={styles.backButton}
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
        showBackButton
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Card */}
        <ThemedView style={[styles.headerCard, { backgroundColor: withOpacity(primaryColor, 5) }]}>
          <View style={styles.headerContent}>
            <View style={[styles.avatarContainer, { backgroundColor: withOpacity(primaryColor, 15) }]}>
              <ThemedText style={[styles.avatarText, { color: primaryColor }]}>👤</ThemedText>
            </View>
            <View style={styles.headerInfo}>
              <ThemedText style={[styles.headerTitle, { color: primaryColor }]}>
                {needyDetails.FirstName} {needyDetails.LastName}
              </ThemedText>
              <ThemedText style={[styles.headerSubtitle, { color: textColor }]}>
                شناسه: {needyDetails.RegisterID}
              </ThemedText>
              <ThemedText style={[styles.headerSubtitle, { color: textColor }]}>
                کد ملی: {needyDetails.NationalID}
              </ThemedText>
            </View>
          </View>
        </ThemedView>

        {/* Personal Information */}
        <DetailSection title="اطلاعات شخصی" icon="👤">
          <DetailRow label="نام" value={needyDetails.FirstName} />
          <DetailRow label="نام خانوادگی" value={needyDetails.LastName} />
          <DetailRow label="نام پدر" value={needyDetails.NameFather} />
          <DetailRow label="کد ملی" value={needyDetails.NationalID} />
          <DetailRow label="تاریخ تولد" value={needyDetails.BirthDate} />
          <DetailRow label="شماره موبایل" value={needyDetails.Phone} />
          <DetailRow label="ایمیل" value={needyDetails.Email} />
          <DetailRow label="جنسیت" value={getGenderLabel(needyDetails.Gender)} />
        </DetailSection>

        {/* Address Information */}
        <DetailSection title="اطلاعات آدرس" icon="🏠">
          <DetailRow label="استان" value={needyDetails.Province} />
          <DetailRow label="شهر" value={needyDetails.City} />
          <DetailRow label="منطقه" value={needyDetails.Region} />
          <DetailRow label="آدرس" value={needyDetails.Street} />
          {needyDetails.Latitude && needyDetails.Longitude && (
            <>
              <DetailRow
                label="عرض جغرافیایی"
                value={typeof needyDetails.Latitude === 'number'
                  ? needyDetails.Latitude.toFixed(6)
                  : parseFloat(needyDetails.Latitude.toString()).toFixed(6)
                }
              />
              <DetailRow
                label="طول جغرافیایی"
                value={typeof needyDetails.Longitude === 'number'
                  ? needyDetails.Longitude.toFixed(6)
                  : parseFloat(needyDetails.Longitude.toString()).toFixed(6)
                }
              />
            </>
          )}
        </DetailSection>

        {/* Spouse Information */}
        <DetailSection title="اطلاعات همسر" icon="👫">
          <DetailRow label="نام همسر" value={needyDetails.HusbandFirstName} />
          <DetailRow label="نام خانوادگی همسر" value={needyDetails.HusbandLastName} />
          <DetailRow label="دلیل غیبت همسر" value={needyDetails.ReasonMissingHusband} />
        </DetailSection>

        {/* Education and Work Information */}
        <DetailSection title="اطلاعات تحصیلی و شغلی" icon="🎓">
          <DetailRow label="سطح تحصیلات" value={getEducationLabel(needyDetails.EducationLevel)} />
          <DetailRow
            label="درآمد ماهانه"
            value={needyDetails.IncomeForm ? `${needyDetails.IncomeForm.toLocaleString('fa-IR')} تومان` : undefined}
          />
          <DetailRow label="سازمان حامی" value={needyDetails.UnderOrganizationName} />
        </DetailSection>

        {needyDetails.children && needyDetails.children.length > 0 && (
          <DetailSection title="اطلاعات فرزندان" icon="👨‍👩‍👧‍👦">
            {needyDetails.children.map((child, index) => (
              <View key={index} style={[styles.childCard, { backgroundColor: withOpacity(primaryColor, 5), borderColor: withOpacity(primaryColor, 20) }]}>
                <ThemedText style={[styles.childTitle, { color: primaryColor }]}>
                  👶 فرزند {index + 1}
                </ThemedText>
                <DetailRow label="نام" value={child.FirstName} />
                <DetailRow label="نام خانوادگی" value={child.LastName} />
                <DetailRow label="سن" value={child.Age?.toString()} />
                <DetailRow label="کد ملی" value={child.NationalID} />
                <DetailRow label="جنسیت" value={getGenderLabel(child.Gender)} />
                <DetailRow label="سطح تحصیلات" value={getEducationLabel(child.EducationLevel)} />
              </View>
            ))}
          </DetailSection>
        )}

        {/* System Information */}
        <DetailSection title="اطلاعات سیستم" icon="⚙️">
          <DetailRow label="شناسه ثبت" value={needyDetails.RegisterID} />
          <DetailRow label="شناسه ثبت فرعی" value={needyDetails.UnderSecondAdminID} />
          <DetailRow label="تاریخ ثبت" value={needyDetails.CreatedDate} />
          <DetailRow label="آخرین به‌روزرسانی" value={needyDetails.UpdatedDate} />
        </DetailSection>
      </ScrollView>

      {/* Footer Actions */}
      <View style={[styles.footer, { backgroundColor: surfaceColor }]}>
        <Button
          title="❌ بازگشت"
          onPress={() => router.back()}
          variant="outline"
          style={styles.backButton}
        />
      </View>
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
    padding: Spacing.lg,
  },
  loadingText: {
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
  errorText: {
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  headerCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  headerContent: {
    flexDirection: 'row-reverse', // RTL layout
    alignItems: 'center',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.md,
  },
  avatarText: {
    fontSize: 28,
  },
  headerInfo: {
    flex: 1,
    alignItems: 'flex-end', // Right align for RTL
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
    textAlign: 'right',
  },
  headerSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: Spacing.xs / 2,
    textAlign: 'right',
  },
  sectionCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: 'row-reverse', // RTL layout
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  sectionIcon: {
    fontSize: 24,
    marginLeft: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right',
  },
  sectionContent: {
    paddingVertical: Spacing.xs,
  },
  detailRow: {
    flexDirection: 'row-reverse', // RTL layout
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    alignItems: 'flex-start',
  },
  label: {
    flex: 1,
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'right',
    color: '#666',
    paddingLeft: Spacing.sm,
  },
  value: {
    flex: 2,
    fontSize: 14,
    textAlign: 'right',
    fontWeight: '500',
    paddingRight: Spacing.sm,
  },
  childCard: {
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
  footer: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    gap: Spacing.md,
  },
  editButton: {
    marginBottom: Spacing.sm,
  },
  backButton: {
    marginTop: Spacing.xs,
  },
});
