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

interface GoodsDetails {
  id: string;
  typeGood: string;
  numberGood: number;
  verified: bool;
  smsCode: string
}

export default function goodsDetailsPage() {
  const { id } = useLocalSearchParams();
  const [goodsDetails, setGoodsDetails] = useState<GoodsDetails | null>(null);
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
      loadGoodsDetails(id as string);
    }
  }, [id]);

  const loadNeedyRecords = async () => {
        try {
            const response = await apiService.findNeedyRecords();
            if (response.success && response.data) {
                setNeedyRecords(response.data);
                // Extract unique representatives
                const uniqueReps = [...new Set(response.data
                    .map(record => record.group_name)
                    .filter(name => name && name.trim() !== '')
                )];
                setRepresentatives(uniqueReps);
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

  const loadGoodsDetails = async (needyId: string) => {
    try {
      const response = await apiService.getGoodsDetails(needyId);
      if (response.success && response.data) {
        setGoodsDetails(response.data);
      } else {
        Alert.alert('خطا', 'دریافت جزئیات کمک با خطا مواجه شد');
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

// Filter and search functionality
    useEffect(() => {
        let filtered = needyRecords;

        // Apply search filter
       if (searchTerm) {
           filtered = filtered.filter(record =>
               (record.name && record.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
               (record.phone && record.phone.includes(searchTerm))
           );
       }


        // Apply representative filter
        if (selectedRepresentative) {
            filtered = filtered.filter(record =>
                record.group_name === selectedRepresentative
            );
        }

        setFilteredRecords(filtered);
    }, [needyRecords, searchTerm, selectedRepresentative]);

    useEffect(() => {
        loadNeedyRecords();
    }, []);

  const onRefresh = () => {
        setRefreshing(true);
        loadNeedyRecords();
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
      console.log("*****", goodsDetails);

  if (loading) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <AppHeader title="جزئیات کمک" subtitle="در حال بارگذاری..." />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
          <ThemedText style={[styles.loadingText, { color: textColor }]}>
            در حال بارگذاری اطلاعات...
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (!goodsDetails) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <AppHeader title="جزئیات کمک" subtitle="اطلاعات یافت نشد" />
        <View style={styles.loadingContainer}>
          <ThemedText style={[styles.errorText, { color: textColor }]}>
            اطلاعات کمک یافت نشد
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
        title="جزئیات کمک"
        showBackButton
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

        {/* Personal Information */}
        <DetailSection title="اطلاعات کمک" icon="💰">
          <DetailRow label="نوع کمک" value={goodsDetails.TypeGood} />
          <DetailRow label="مقدار کمک " value={goodsDetails.NumberGood} />

        </DetailSection>

      {/* Footer Actions */}
      <View style={[styles.footer, { backgroundColor: surfaceColor }]}>
        <Button
          title="❌ بازگشت"
          onPress={() => router.back()}
          variant="outline"
          style={styles.backButton}
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
