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

interface AdminDetails {
  id: string;
  admin_id: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  phone: string;
  email: string;
  street: string;
  city: string;
  province: string;
  postCode: string;
  userRole: string;
  password: string;
  createdBy: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
  birthDate: string;
}

export default function AdminDetailsPage() {
  const { id } = useLocalSearchParams();
  const [adminDetails, setAdminDetails] = useState<AdminDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const primaryColor = useThemeColor({}, 'primary');
  const successColor = useThemeColor({}, 'success');
  const warningColor = useThemeColor({}, 'warning');
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  useEffect(() => {
    if (id) {
      loadAdminDetails(id as string);
    }
  }, [id]);

  const loadAdminDetails = async (adminId: string) => {
    try {
      const response = await apiService.getAdminDetails(adminId);
      if (response.success && response.data) {
        setAdminDetails(response.data);
      } else {
        Alert.alert('خطا', 'دریافت جزئیات نماینده با خطا مواجه شد');
        router.back();
      }
    } catch (error) {
      console.error('Error loading admin details:', error);
      Alert.alert('خطا', 'خطا در دریافت اطلاعات');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (adminDetails?.AdminID) {
      router.push(`/admin/edit-admin/${adminDetails.AdminID}`);
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

  const getRoleLabel = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'مدیر';
      case 'groupadmin':
        return 'نماینده گروه';
      default:
        return role || 'نامشخص';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return '👤';
      case 'groupadmin':
        return '👥';
      default:
        return '👤';
    }
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
        <AppHeader title="جزئیات نماینده" subtitle="در حال بارگذاری..." />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
          <ThemedText style={[styles.loadingText, { color: textColor }]}>
            در حال بارگذاری اطلاعات...
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (!adminDetails) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <AppHeader title="جزئیات نماینده" subtitle="اطلاعات یافت نشد" />
        <View style={styles.loadingContainer}>
          <ThemedText style={[styles.errorText, { color: textColor }]}>
            اطلاعات نماینده یافت نشد
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
        title={`${adminDetails.FirstName} ${adminDetails.LastName}`}
        subtitle="جزئیات نماینده"
        showBackButton
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Card */}
        <ThemedView style={[styles.headerCard, { backgroundColor: withOpacity(getRoleColor(adminDetails.UserRole), 5) }]}>
          <View style={styles.headerContent}>
            <View style={[styles.avatarContainer, { backgroundColor: withOpacity(getRoleColor(adminDetails.UserRole), 15) }]}>
              <ThemedText style={[styles.avatarText, { color: getRoleColor(adminDetails.UserRole) }]}>
                {getRoleIcon(adminDetails.UserRole)}
              </ThemedText>
            </View>
            <View style={styles.headerInfo}>
              <ThemedText style={[styles.headerTitle, { color: getRoleColor(adminDetails.UserRole) }]}>
                {adminDetails.FirstName} {adminDetails.LastName}
              </ThemedText>
              <ThemedText style={[styles.headerSubtitle, { color: textColor }]}>
                {getRoleLabel(adminDetails.UserRole)}
              </ThemedText>
              <ThemedText style={[styles.headerSubtitle, { color: textColor }]}>
                شناسه: {adminDetails.AdminID}
              </ThemedText>
            </View>
          </View>
        </ThemedView>

        {/* Role Badge */}
        <ThemedView style={[styles.roleBadgeContainer, { backgroundColor: withOpacity(getRoleColor(adminDetails.UserRole), 10) }]}>
          <View style={[styles.roleBadge, { backgroundColor: getRoleColor(adminDetails.UserRole) }]}>
            <ThemedText style={styles.roleText}>
              {getRoleIcon(adminDetails.UserRole)} {getRoleLabel(adminDetails.UserRole)}
            </ThemedText>
          </View>
        </ThemedView>

        {/* Personal Information */}
        <DetailSection title="اطلاعات شخصی" icon="👤">
          <DetailRow label="نام" value={adminDetails.FirstName} />
          <DetailRow label="نام خانوادگی" value={adminDetails.LastName} />
          <DetailRow label="کد ملی" value={adminDetails.NationalID} />
          <DetailRow label="تاریخ تولد" value={adminDetails.BirthDate} />
          <DetailRow label="شماره موبایل" value={adminDetails.Phone} />
        </DetailSection>

        {/* Address Information */}
        <DetailSection title="اطلاعات آدرس" icon="🏠">
          <DetailRow label="استان" value={adminDetails.Province} />
          <DetailRow label="شهر" value={adminDetails.City} />
          <DetailRow label="آدرس" value={adminDetails.Street} />
          <DetailRow label="کد پستی" value={adminDetails.PostCode} />
          {adminDetails.Latitude && adminDetails.Longitude && (
            <>
              <DetailRow
                label="عرض جغرافیایی"
                value={typeof adminDetails.Latitude === 'number'
                  ? adminDetails.Latitude.toFixed(6)
                  : parseFloat(adminDetails.Latitude.toString()).toFixed(6)
                }
              />
              <DetailRow
                label="طول جغرافیایی"
                value={typeof adminDetails.Longitude === 'number'
                  ? adminDetails.Longitude.toFixed(6)
                  : parseFloat(adminDetails.Longitude.toString()).toFixed(6)
                }
              />
            </>
          )}
        </DetailSection>

        {/* Administrative Information */}
        <DetailSection title="اطلاعات اداری" icon="⚙️">
          <DetailRow label="نقش" value={getRoleLabel(adminDetails.UserRole)} />
        </DetailSection>

        {/* System Information */}
        <DetailSection title="اطلاعات سیستم" icon="📊">
          <DetailRow label="شناسه ثبت" value={adminDetails.AdminID} />
          <DetailRow label="تاریخ ثبت" value={adminDetails.CreatedDate} />
          <DetailRow label="آخرین به‌روزرسانی" value={adminDetails.UpdatedDate} />
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
  roleBadgeContainer: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  roleBadge: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  roleText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
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
