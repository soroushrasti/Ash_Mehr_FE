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

interface NeedyRecord {
  id: string;
  name: string;
  phone: string;
  info: string;
}

export default function ReportsPage() {
  const [needyRecords, setNeedyRecords] = useState<NeedyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const primaryColor = useThemeColor({}, 'primary');
  const successColor = useThemeColor({}, 'success');
  const dangerColor = useThemeColor({}, 'danger');
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  const loadNeedyRecords = async () => {
    try {
      const response = await apiService.findNeedyRecords();
      if (response.success && response.data) {
        setNeedyRecords(response.data);
      } else {
        Alert.alert('خطا', 'دریافت اطلاعات مددجویان با خطا مواجه شد');
      }
    } catch (error) {
      console.error('Error loading needy records:', error);
      Alert.alert('خطا', 'خطا در دریافت اطلاعات');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadNeedyRecords();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadNeedyRecords();
  };

  const handleViewDetails = (record: NeedyRecord) => {
    router.push(`/admin/needy-details/${record.id}`);
  };

  const handleEdit = (record: NeedyRecord) => {
    router.push(`/admin/edit-needy/${record.id}`);
  };

  const handleDelete = (record: NeedyRecord) => {
    Alert.alert(
      'حذف مددجو',
      `آیا از حذف ${record.name} ${record.lastName} اطمینان دارید؟`,
      [
        { text: 'انصراف', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await apiService.deleteNeedy(record.id);
              if (response.success) {
                setNeedyRecords(prev => prev.filter(r => r.id !== record.id));
                Alert.alert('موفقیت', 'مددجو با موفقیت حذف شد');
              } else {
                Alert.alert('خطا', response.error || 'حذف با خطا مواجه شد');
              }
            } catch (error) {
              console.error('Error deleting needy:', error);
              Alert.alert('خطا', 'خطا در حذف مددجو');
            }
          }
        }
      ]
    );
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
            <ThemedText
                style={[
                    styles.tableCellText,
                    { color: isHeader ? 'white' : textColor },
                    isHeader && styles.tableHeaderText
                ]}
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
        <AppHeader title="گزارش‌گیری" subtitle="مدیریت اطلاعات مددجویان" />
        <View style={styles.loadingContainer}>
          <ThemedText>در حال بارگذاری...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <AppHeader title="گزارش‌گیری" subtitle="مدیریت اطلاعات مددجویان" />

      <View style={styles.content}>
        {/* Statistics Section */}
        <View style={[styles.statsContainer, { backgroundColor: surfaceColor, borderColor }]}>
          <View style={styles.statItem}>
            <ThemedText style={[styles.statNumber, { color: primaryColor }]}>
              {needyRecords.length}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: textColor }]}>
              تعداد مددجویان
            </ThemedText>
          </View>
        </View>

        {/* Table Section */}
        <View style={[styles.tableContainer, { backgroundColor: surfaceColor, borderColor }]}>
          <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
            لیست مددجویان
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
                {needyRecords.map((record, index) => (
                  <TableRow key={record.id || index} record={record} />
                ))}
              </ScrollView>
            </View>
          </ScrollView>

          {needyRecords.length === 0 && (
            <View style={styles.emptyContainer}>
              <ThemedText style={[styles.emptyText, { color: textColor }]}>
                هیچ مددجویی یافت نشد
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
          title="بازگشت به پنل مدیریت"
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
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: 16,
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
    minWidth: 600,
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
  addressCell: {
    flex: 2,
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
