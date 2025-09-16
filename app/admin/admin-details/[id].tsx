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
  birthDate: string
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
    if (adminDetails?.admin_id) {
      router.push(`/admin/edit-admin/${adminDetails.admin_id}`);
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

  const DetailSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={[styles.section, { backgroundColor: surfaceColor, borderColor }]}>
      <ThemedText style={[styles.sectionTitle, { color: getRoleColor(adminDetails?.role || '') }]}>
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
        <AppHeader title="جزئیات نماینده" subtitle="اطلاعات کامل" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
          <ThemedText style={{ marginTop: Spacing.lg, color: textColor }}>
            در حال بارگذاری...
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
          <ThemedText style={{ color: textColor }}>
            اطلاعات نماینده یافت نشد
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
        title={`${adminDetails.FirstName} ${adminDetails.LastName}`}
        subtitle="جزئیات نماینده"
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Role Badge */}
        <View style={[styles.roleSection, { backgroundColor: surfaceColor, borderColor }]}>
          <View style={[styles.roleBadge, { backgroundColor: getRoleColor(adminDetails.UserRole) }]}>
            <ThemedText style={styles.roleText}>
              {getRoleLabel(adminDetails.UserRole)}
            </ThemedText>
          </View>
        </View>

        {/* Personal Information */}
        <DetailSection title="اطلاعات شخصی">
          <DetailRow label="نام" value={adminDetails.FirstName} />
          <DetailRow label="نام خانوادگی" value={adminDetails.LastName} />
          <DetailRow label="کد ملی" value={adminDetails.NationalID} />
          <DetailRow label="شماره تلفن" value={adminDetails.Phone} />
          <DetailRow label="ایمیل" value={adminDetails.Email} />
          <DetailRow label="پسورد" value={adminDetails.Password} />
        </DetailSection>

        {/* Address Information */}
        <DetailSection title="اطلاعات آدرس">
          <DetailRow label="استان" value={adminDetails.Province} />
          <DetailRow label="شهر" value={adminDetails.City} />
          <DetailRow label="خیابان" value={adminDetails.Street} />
          <DetailRow label="کد پستی" value={adminDetails.PostCode} />
          {adminDetails.Latitude && adminDetails.Longitude && (
            <>
              <DetailRow label="عرض جغرافیایی" value={adminDetails.Latitude.toString()} />
              <DetailRow label="طول جغرافیایی" value={adminDetails.Longitude.toString()} />
            </>
          )}
        </DetailSection>

        {/* Administrative Information */}
        <DetailSection title="اطلاعات اداری">
          <DetailRow label="نقش" value={getRoleLabel(adminDetails.UserRole)} />
          <DetailRow label="ایجاد شده توسط" value={adminDetails.CreatedBy} />
        </DetailSection>

        {/* System Information */}
        <DetailSection title="اطلاعات سیستم">
          <DetailRow label="شناسه ثبت" value={adminDetails.AdminID} />
          <DetailRow label="تاریخ ثبت" value={adminDetails.CreatedDate} />
          <DetailRow label="آخرین به‌روزرسانی" value={adminDetails.UpdatedDate} />
        </DetailSection>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title="ویرایش اطلاعات"
            onPress={handleEdit}
            style={[styles.actionButton, { backgroundColor: getRoleColor(adminDetails.UserRole) }]}
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
  roleSection: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    alignItems: 'center',
  },
  roleBadge: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  roleText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
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
  permissionsContainer: {
    paddingVertical: Spacing.sm,
  },
  permissionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  permissionBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  permissionText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionButtons: {
    gap: Spacing.lg,
    marginVertical: Spacing.xl,
  },
  actionButton: {
    marginBottom: Spacing.sm,
  },
});
