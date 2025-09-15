import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Spacing, BorderRadius } from '@/constants/Design';
import { apiService } from '@/services/apiService';
import AppHeader from '@/components/AppHeader';
import {NeedyPersonLocation} from "@/types/api";

interface AdminRecord {
  id: string;
  register_id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  role: string;
  city: string;
  province: string;
  createdAt?: string;
}

export default function AdminManagementPage() {
  const [adminRecords, setAdminRecords] = useState<NeedyPersonLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const primaryColor = useThemeColor({}, 'primary');
  const successColor = useThemeColor({}, 'success');
  const dangerColor = useThemeColor({}, 'danger');
  const warningColor = useThemeColor({}, 'warning');
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  const loadAdminRecords = async () => {
    try {
      const response = await apiService.getAdminGeoPoints();
      if (response.success && response.data) {
        setAdminRecords(response.data);
      } else {
        Alert.alert('خطا', 'دریافت اطلاعات نمایندگان با خطا مواجه شد');
      }
    } catch (error) {
      console.error('Error loading admin records:', error);
      Alert.alert('خطا', 'خطا در دریافت اطلاعات');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAdminRecords();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadAdminRecords();
  };

  const handleViewDetails = (record: AdminRecord) => {
    router.push(`/admin/admin-details/${record.id}`);
  };

  const handleEdit = (record: AdminRecord) => {
    router.push(`/admin/edit-admin/${record.id}`);
  };

  const handleDelete = (record: AdminRecord) => {
    Alert.alert(
      'حذف نماینده',
      `آیا از حذف ${record.FirstName} ${record.LastName} اطمینان دارید؟`,
      [
        { text: 'انصراف', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await apiService.deleteAdmin(record.register_id);
              if (response.success) {
                setAdminRecords(prev => prev.filter(r => r.register_id !== record.register_id));
                Alert.alert('موفقیت', 'نماینده با موفقیت حذف شد');
              } else {
                Alert.alert('خطا', response.error || 'حذف با خطا مواجه شد');
              }
            } catch (error) {
              console.error('Error deleting admin:', error);
              Alert.alert('خطا', 'خطا در حذف نماینده');
            }
          }
        }
      ]
    );
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
        return 'نماینده کل';
      case 'groupadmin':
        return 'نماینده گروه';
      default:
        return role || 'نامشخص';
    }
  };

  const TableRow = ({ record, isHeader = false }: { record: any; isHeader?: boolean }) => (
    <View style={[
      styles.tableRow,
      {
        backgroundColor: isHeader ? primaryColor : surfaceColor,
        borderBottomColor: borderColor
      }
    ]}>
      <View style={styles.tableCell}>
        <ThemedText
          style={[
            styles.tableCellText,
            { color: isHeader ? 'white' : textColor },
            isHeader && styles.tableHeaderText
          ]}
        >
          {isHeader ? 'نام' : `${record.name}`}
        </ThemedText>
      </View>


      <View style={styles.tableCell}>
        {isHeader ? (
          <ThemedText
            style={[styles.tableCellText, { color: 'white' }, styles.tableHeaderText]}
          >
            نقش
          </ThemedText>
        ) : (
          <View style={[styles.roleBadge, { backgroundColor: getRoleColor(record.role) + '20' }]}>
            <ThemedText
              style={[styles.roleText, { color: getRoleColor(record.role) }]}
            >
              {getRoleLabel(record.role)}
            </ThemedText>
          </View>
        )}
      </View>

      <View style={styles.tableCell}>
        <ThemedText
          style={[
            styles.tableCellText,
            { color: isHeader ? 'white' : textColor },
            isHeader && styles.tableHeaderText
          ]}
          numberOfLines={isHeader ? 1 : 2}
        >
          {isHeader ? 'آدرس' : record.info}
        </ThemedText>
      </View>

      {!isHeader && (
        <View style={styles.actionsCell}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: primaryColor }]}
            onPress={() => handleViewDetails(record)}
          >
            <ThemedText style={styles.actionButtonText}>👁️</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: successColor }]}
            onPress={() => handleEdit(record)}
          >
            <ThemedText style={styles.actionButtonText}>✏️</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: dangerColor }]}
            onPress={() => handleDelete(record)}
          >
            <ThemedText style={styles.actionButtonText}>🗑️</ThemedText>
          </TouchableOpacity>
        </View>
      )}

      {isHeader && (
        <View style={styles.actionsCell}>
          <ThemedText
            style={[styles.tableCellText, { color: 'white' }, styles.tableHeaderText]}
          >
            عملیات
          </ThemedText>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <AppHeader title="مدیریت اطلاعات نماینده" subtitle="مدیریت اطلاعات مدیران و نمایندگان" />
        <View style={styles.loadingContainer}>
          <ThemedText>در حال بارگذاری...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  const adminCount = adminRecords.filter(r => r.role?.toLowerCase() === 'admin').length;
  const groupAdminCount = adminRecords.filter(r => r.role?.toLowerCase() === 'groupadmin').length;

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <AppHeader title="مدیریت اطلاعات نماینده" subtitle="مدیریت اطلاعات مدیران و نمایندگان" />

      <View style={styles.content}>
        {/* Statistics Section */}
        <View style={[styles.statsContainer, { backgroundColor: surfaceColor, borderColor }]}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <ThemedText style={[styles.statNumber, { color: primaryColor }]}>
                {adminCount}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: textColor }]}>
                نماینده کل
              </ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={[styles.statNumber, { color: successColor }]}>
                {groupAdminCount}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: textColor }]}>
                نماینده گروه
              </ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={[styles.statNumber, { color: warningColor }]}>
                {adminRecords.length}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: textColor }]}>
                کل مدیران
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Table Section */}
        <View style={[styles.tableContainer, { backgroundColor: surfaceColor, borderColor }]}>
          <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
            لیست مدیران و نمایندگان
          </ThemedText>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            <View style={styles.table}>
              {/* Table Header */}
              <TableRow record={{}} isHeader={true} />

              {/* Table Rows */}
              <ScrollView showsVerticalScrollIndicator={false}>
                {adminRecords.map((record, index) => (
                  <TableRow key={record.id || index} record={record} />
                ))}
              </ScrollView>
            </View>
          </ScrollView>

          {adminRecords.length === 0 && (
            <View style={styles.emptyContainer}>
              <ThemedText style={[styles.emptyText, { color: textColor }]}>
                هیچ مدیری یافت نشد
              </ThemedText>
              <Button
                title="به‌روزرسانی"
                onPress={onRefresh}
                variant="outline"
              />
            </View>
          )}
        </View>

        {/* Back Button */}
        <Button
          title="بازگشت به مدیریت داوطلبان"
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
  },
  statsContainer: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  tableContainer: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  table: {
    minWidth: 700,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  tableCell: {
    flex: 1,
    paddingHorizontal: Spacing.xs,
    justifyContent: 'center',
  },
  actionsCell: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
  tableCellText: {
    fontSize: 14,
    textAlign: 'center',
  },
  tableHeaderText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  roleBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    alignSelf: 'center',
  },
  roleText: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 12,
    color: 'white',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing['2xl'],
    gap: Spacing.lg,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.7,
  },
  backButton: {
    marginTop: Spacing.lg,
  },
});
