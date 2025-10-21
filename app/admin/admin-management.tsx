import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Spacing, BorderRadius } from '@/constants/Design';
import { apiService } from '@/services/apiService';
import AppHeader from '@/components/AppHeader';
import {NeedyPersonLocation} from "@/types/api";
import { useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/components/AuthContext';

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

const ACTION_BUTTON_SIZE = Platform.OS === 'android' ? 28 : 34;
const ACTION_BUTTON_GAP = Platform.OS === 'android' ? 3 : 6;

export default function AdminManagementPage() {
  const [adminRecords, setAdminRecords] = useState<NeedyPersonLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
   const { user } = useAuth();
  const {userType} = useAuth();

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
        console.log('Attempting to delete record:', record);
        const confirmMessage = `آیا از حذف ${record.name || 'این نماینده'} اطمینان دارید؟`;

        const performDelete = async () => {
            try {
                const response = await apiService.deleteAdmin(String(record.id));
                if (response.success) {
                    setAdminRecords(prev => prev.filter(r => r.id !== record.id));
                } else {
                    const errMsg = response.error || 'حذف با خطا مواجه شد';
                    if (Platform.OS === 'web') {
                        // eslint-disable-next-line no-alert
                        window.alert(errMsg);
                    } else {
                        Alert.alert('خطا', errMsg);
                    }
                }
            } catch (error) {
                console.error('Error deleting admin:', error);
                if (Platform.OS === 'web') {
                    // eslint-disable-next-line no-alert
                    window.alert('خطا در حذف نماینده');
                } else {
                    Alert.alert('خطا', 'خطا در حذف نماینده');
                }
            }
        };

        if (Platform.OS === 'web') {
            // eslint-disable-next-line no-alert
            const confirmed = window.confirm(confirmMessage);
            if (confirmed) void performDelete();
        } else {
            Alert.alert('حذف نماینده', confirmMessage, [
                { text: 'انصراف', style: 'cancel' },
                { text: 'حذف', style: 'destructive', onPress: () => { void performDelete(); } },
            ]);
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
            style={[styles.tableCellText, { color: 'white' }, styles.tableHeaderText, styles.centerAlignedHeader]}
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

      {!isHeader&& userType === 'Admin' && (

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
               style={[styles.actionButton, { backgroundColor: '#ff0000' }]}
               onPress={() => handleDelete(record)}
           >
               <ThemedText style={styles.actionButtonText}>🗑️</ThemedText>
           </TouchableOpacity>
        </View>
      )}

      {isHeader&& userType === 'Admin' && (
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
        <AppHeader title="مدیریت اطلاعات مدیر و نماینده" subtitle="مدیریت اطلاعات مدیران و نمایندگان" />
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
      <AppHeader title="مدیریت اطلاعات مدیر و نماینده" subtitle="مدیریت اطلاعات مدیران و نمایندگان" />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={true}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Statistics Section */}
        <View style={[styles.statsContainer, { backgroundColor: surfaceColor, borderColor }]}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <ThemedText style={[styles.statNumber, { color: primaryColor }]}>
                {adminCount}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: textColor }]}>
                مدیر
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

          <View style={styles.tableWrapper}>
            {/* Table Header */}
            <TableRow record={{}} isHeader={true} />

            {/* Table Rows - Direct rendering without nested ScrollView */}
            {adminRecords.map((record, index) => (
              <TableRow key={record.id || index} record={record} />
            ))}
          </View>

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
          title="بازگشت به مدیریت اطلاعات"
          onPress={() => router.push('/admin')}
          variant="outline"
          style={styles.backButton}
        />
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
  statsContainer: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  statsRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
  tableContainer: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: Spacing.lg,
    textAlign: 'right',
  },
  tableWrapper: {
    flex: 1,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  scrollContainer: {
    paddingBottom: Spacing.md,
  },
  tableRow: {
    flexDirection: 'row-reverse',
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
    paddingVertical: Spacing.md,
    paddingHorizontal: Platform.OS === 'android' ? 4 : Spacing.sm,
    minHeight: 60,
    width: '100%',
  },
  tableCell: {
    flex: 1,
    paddingHorizontal: Platform.OS === 'android' ? 4 : Spacing.xs,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  actionsCell: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: ACTION_BUTTON_GAP,
    paddingHorizontal: Platform.OS === 'android' ? 2 : Spacing.xs,
    flexShrink: 0,
    width: Platform.OS === 'android' ? 110 : 140,
    minWidth: Platform.OS === 'android' ? 110 : 140,
  },
  tableCellText: {
    fontSize: Platform.OS === 'android' ? 12 : 14,
    textAlign: 'right',
  },
  tableHeaderText: {
    fontWeight: 'bold',
    fontSize: Platform.OS === 'android' ? 14 : 16,
  },
  roleBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    alignSelf: 'center',
    minWidth: 60,
  },
  roleText: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  actionButton: {
    width: ACTION_BUTTON_SIZE,
    height: ACTION_BUTTON_SIZE,
    borderRadius: ACTION_BUTTON_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  actionButtonText: {
    fontSize: Platform.OS === 'android' ? 12 : 16,
    lineHeight: Platform.OS === 'android' ? 14 : 18,
    color: 'white',
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.lg,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  backButton: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg, // Add bottom margin for better spacing
  },
  centerAlignedHeader: {
    textAlign: 'center',
  },
});
