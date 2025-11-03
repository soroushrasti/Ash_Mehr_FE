import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl, Platform, TextInput , Switch } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Spacing, BorderRadius } from '@/constants/Design';
import { apiService } from '@/services/apiService';
import AppHeader from '@/components/AppHeader';
import { useAuth } from '@/components/AuthContext';

interface GoodsDetails {
  id: string;
  typeGood: string;
  numberGood: number;
  verified: boolean;
  smsCode: string;
  givenToWhome: number
}
interface NeedyRecord {
    id: number; // Changed from string to number to match API response
    name: string;
    phone?: string;
    info: string;
    lat?: number;
    lng?: number;
    group_name?: string;
}
interface CombinedRecord extends NeedyRecord {
    typeGood?: string;
    numberGood?: number;
    givenToWhome?: number;
}

export default function ReportsPage() {
  const { id } = useLocalSearchParams();
    const [combinedData, setCombinedData] = useState<any[]>([]);
    const [goodsDetails, setGoodsDetails] = useState<GoodsDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const {userType} = useAuth();
    const [refreshing, setRefreshing] = useState(false);
    const [needyRecords, setNeedyRecords] = useState<NeedyRecord[]>([]);
    const [filteredRecords, setFilteredRecords] = useState<NeedyRecord[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRepresentative, setSelectedRepresentative] = useState('');
    const [representatives, setRepresentatives] = useState<string[]>([]);
    const [showRepresentativeDropdown, setShowRepresentativeDropdown] = useState(false);
    const primaryColor = useThemeColor({}, 'primary');
    const successColor = useThemeColor({}, 'success');
    const backgroundColor = useThemeColor({}, 'background');
    const surfaceColor = useThemeColor({}, 'surface');
    const textColor = useThemeColor({}, 'text');
    const borderColor = useThemeColor({}, 'border');

    useEffect(() => {
      if (id) {
        loadGoodsDetails(id as string);
        loadNeedyRecords();
      }
    }, [id]);

    const loadGoodsDetails = async (needyId: string) => {
      try {
        const response = await apiService.getGoodsDetails(needyId);
        if (response.success && response.data) {
          setGoodsDetails(response.data);
          if (Array.isArray(response.data)) {
                  const uniqueReps = [...new Set(response.data
                      .map(record => record.group_name)
                      .filter(name => name && name.trim() !== '')
                  )];
                  setRepresentatives(uniqueReps);
        } else {
          Alert.alert('خطا', 'دریافت جزئیات کمک با خطا مواجه شد');
          router.back();
        }
    }
      } catch (error) {
        console.error('Error loading needy details:', error);
        Alert.alert('خطا', 'خطا در دریافت اطلاعات');
        router.back();
      } finally {
        setLoading(false);
      }
    };

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

useEffect(() => {
    if (goodsDetails && needyRecords.length > 0) {
        const combined = needyRecords.map(record => ({
            ...record,
            typeGood: goodsDetails.typeGood,
            numberGood: goodsDetails.numberGood,
            givenToWhome: goodsDetails.givenToWhome // استفاده از مقدار اصلی
        }));
        setCombinedData(combined);
        setFilteredRecords(combined);
    }
}, [goodsDetails, needyRecords]);

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

    }, [needyRecords, searchTerm, selectedRepresentative]);

    useEffect(() => {
        loadNeedyRecords();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadNeedyRecords();
    };

    const handleVerificationToggle = async (id, value) => {
         if (!value) return; // فقط وقتی فعال میشه عمل کن

            setIsLoading(true);
            try
            {
                const smsResponse = await apiService.sendSMSCode(needyRecords.phone,id);
                if (smsResponse.ok) {
                        // Step 2: Show verification modal
                        setShowVerificationModal(true);
                      } else {
                        console.error('پیامک ارسال نشد');
                        // Reset toggle if SMS fails
                        // You might want to call onValueChange(false) here
                      }
                    } catch (error) {
                      console.error('خطا در ارسال پیامک:', error);
                    } finally {
                      setIsLoading(false);
                    }
                  };

  const handleVerificationSubmit = async () => {
    if (!verificationCode.trim()) return;

    setIsLoading(true);
try{
       const result = await apiService.verifySMSCode(smsCode, id);

      if (result.success || result === true) {
        // Step 4: Update toggle state to true
        // You need to pass this back to parent component
        // or manage state accordingly
        setShowVerificationModal(false);
        setVerificationCode('');

        // Call parent callback if provided
        if (props.onVerificationSuccess) {
          props.onVerificationSuccess(record.id.toString(), true);
        }
       else {
        alert('کد تایید نامعتبر است');
      }
  }
    } catch (error) {
      console.error('Error verifying code:', error);
      alert('خطا در تایید کد');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowVerificationModal(false);
    setVerificationCode('');
    // Reset toggle if user closes modal without verification
    // You might want to call onValueChange(false) here
  };

    const TableRow = ({ record, isHeader = false }: { record: any; isHeader?: boolean }) => (
        <View style={[
            styles.tableRow,
            {
                backgroundColor: isHeader ? primaryColor : surfaceColor,
                borderBottomColor: borderColor
            }
        ]}>
            {/* Name */}
            <View style={styles.tableCell}>
                <ThemedText
                    style={[
                        styles.tableCellText,
                        { color: isHeader ? 'white' : textColor },
                        isHeader && styles.tableHeaderText
                    ]}
                    numberOfLines={1}
                >
                    {isHeader ? 'نام' : `${record.name}`}
                </ThemedText>
            </View>
            {/* typegood */}
            <View style={[styles.tableCell, styles.addressCell]}>
                <ThemedText
                    style={[
                        styles.tableCellText,
                        { color: isHeader ? 'white' : textColor },
                        isHeader && styles.tableHeaderText
                    ]}
                    numberOfLines={1}
                >
                    {isHeader ? 'نوع کمک' : record.info}
                </ThemedText>
            </View>
            {/* Representative */}
            <View style={styles.tableCell}>
                <ThemedText
                    style={[
                        styles.tableCellText,
                        { color: isHeader ? 'white' : textColor },
                        isHeader && styles.tableHeaderText
                    ]}
                    numberOfLines={1}
                >
                    {isHeader ? 'مقدار کمک' : record.info}
                </ThemedText>
            </View>

            {isHeader && userType === 'Admin'&& (
                <View style={styles.actionsCell}>
                    <ThemedText
                        style={[styles.tableCellText, { color: 'white' }, styles.tableHeaderText]}
                        numberOfLines={1}
                    >
                        تایید
                    </ThemedText>
                </View>
            )}
        </View>
    );

    if (loading) {
        return (
            <ThemedView style={[styles.container, { backgroundColor }]}>
                <AppHeader title="گزارش‌گیری" subtitle="گزارش‌گیری" />
                <View style={styles.loadingContainer}>
                    <ThemedText>در حال بارگذاری...</ThemedText>
                </View>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={[styles.container, { backgroundColor }]}>
            <AppHeader title="لیست مددجویان" subtitle="مدیریت کمک های مددجویان" />

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
                    <View style={styles.statItem}>
                        <ThemedText style={[styles.statNumber, { color: primaryColor }]}>
                            {needyRecords.length}
                        </ThemedText>
                        <ThemedText style={[styles.statLabel, { color: textColor }]}>
                            تعداد مددجویان
                        </ThemedText>
                    </View>
                </View>

                {/* Search and Filter Section */}
                <View style={[styles.filterContainer, { backgroundColor: surfaceColor, borderColor }]}>
                    <View style={styles.searchContainer}>
                        <TextInput
                            style={[styles.searchInput, { color: textColor, borderColor, backgroundColor: surfaceColor }]}
                            placeholder="جستجوی نام مددجو"
                            placeholderTextColor="#999"
                            value={searchTerm}
                            onChangeText={setSearchTerm}
                        />
                    </View>

                    <View style={styles.filterPickerContainer}>
                        <TouchableOpacity
                            style={[styles.filterPicker, { borderColor, backgroundColor: surfaceColor }]}
                            onPress={() => setShowRepresentativeDropdown(prev => !prev)}
                        >
                            <ThemedText style={{ color: textColor }}>
                                {selectedRepresentative || 'انتخاب نماینده'}
                            </ThemedText>
                        </TouchableOpacity>

                        {showRepresentativeDropdown && (
                            <View style={styles.dropdownContainer}>
                                <TouchableOpacity
                                    style={styles.dropdownItem}
                                    onPress={() => {
                                        setSelectedRepresentative('');
                                        setShowRepresentativeDropdown(false);
                                    }}
                                >
                                    <ThemedText style={styles.dropdownItemText}>
                                        همه نمایندگان
                                    </ThemedText>
                                </TouchableOpacity>

                                {representatives.map(rep => (
                                    <TouchableOpacity
                                        key={rep}
                                        style={styles.dropdownItem}
                                        onPress={() => {
                                            setSelectedRepresentative(rep);
                                            setShowRepresentativeDropdown(false);
                                        }}
                                    >
                                        <ThemedText style={styles.dropdownItemText}>
                                            {rep}
                                        </ThemedText>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>
                </View>

                {/* Table Section */}
                <View style={[styles.tableContainer, { backgroundColor: surfaceColor, borderColor }]}>
                    <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
                        لیست مددجویان
                    </ThemedText>

                    <View style={styles.tableWrapper}>
                      <TableRow record={{}} isHeader={true} />
                        {/* Table Rows */}
                        {filteredRecords.map((record, index) => (
                            <View key={`${record.id}-${index}`} style={[styles.tableRow, { borderBottomColor: borderColor }]}>
                                <ThemedText style={[styles.tableCell, { color: textColor }]}>
                                    {record.name || '-'}
                                </ThemedText>
                                <ThemedText style={[styles.tableCell, { color: textColor }]}>
                                    {record.typeGood || '-'}
                                </ThemedText>
                                <ThemedText style={[styles.tableCell, { color: textColor }]}>
                                    {record.numberGood || '-'}
                                </ThemedText>
                                <View style={styles.tableToggle}>
                                    <Toggle
                                        value = {goodsDetails?.verified || false}
                                        onValueChange={(value) => handleVerificationToggle(record.id.toString(), value)}
                                        disabled={isLoading}
                                    />
                                </View>

                                     {showVerificationModal && (
                                       <View style={styles.modalOverlay}>
                                         <View style={styles.modalContent}>
                                           <ThemedText
                                           type="title"
                                           style={styles.modalTitle}>
                                             تایید شماره موبایل
                                           </ThemedText>
                                           <ThemedText style={styles.modalText}>
                                             کد ارسال شده به شماره موبایل خود را وارد کنید
                                           </ThemedText>
                                           {/* بقیه محتوای مودال */}
                                         </View>
                                       </View>
                                     )}
                            </View>
                        ))}
                    </View>

                    {filteredRecords.length === 0 && (
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
                    onPress={() => router.push('/admin')}
                    variant="outline"
                    style={styles.backButton}
                />
            </ScrollView>
        </ThemedView>
    );
}

const ACTION_BUTTON_SIZE = Platform.OS === 'android' ? 28 : 34;
const ACTION_BUTTON_GAP = Platform.OS === 'android' ? 3 : 6;

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
        textAlign: 'center',
    },
    statLabel: {
        fontSize: 16,
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
        paddingBottom: Spacing.lg,
    },
    tableRow: {
        flexDirection: 'row-reverse',
        borderBottomWidth: 1,
        borderColor: '#E0E0E0',
        paddingVertical: Spacing.sm,
        paddingHorizontal: Platform.OS === 'android' ? 4 : Spacing.xs,
        minHeight: 64,
        width: '100%',
        alignItems: 'center'
    },
    tableCell: {
        flex: 1,
        paddingHorizontal: Platform.OS === 'android' ? 4 : Spacing.xs,
        paddingRight: Platform.OS === 'android' ? 8 : Spacing.sm,
        paddingLeft: Platform.OS === 'android' ? 2 : 0,
        paddingLeft: Platform.OS === 'android' ? 2 : 0,
        justifyContent: 'center',
        alignItems: 'flex-end',
        minWidth: Platform.OS === 'android' ? 50 : 60,
    },
    tableToggle: {
        flex: 1,
        paddingHorizontal: Platform.OS === 'android' ? 4 : Spacing.xs,
        paddingRight: Platform.OS === 'android' ? 8 : Spacing.sm,
        paddingLeft: Platform.OS === 'android' ? 1 : 0,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: Platform.OS === 'android' ? 50 : 60,
    },
    addressCell: {
        flex: Platform.OS === 'android' ? 1.5 : 2,
        minWidth: Platform.OS === 'android' ? 80 : 120,
    },
    actionsCell: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: ACTION_BUTTON_GAP,
        paddingHorizontal: Platform.OS === 'android' ? 2 : Spacing.xs,
        flexShrink: 0,
        width: Platform.OS === 'android' ? 135 : 170,
        minWidth: Platform.OS === 'android' ? 135 : 170,
    },
    tableCellText: {
        fontSize: Platform.OS === 'android' ? 12 : 14,
        textAlign: 'right',
    },
    tableHeaderText: {
        fontWeight: 'bold',
        fontSize: Platform.OS === 'android' ? 14 : 16,
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
        textAlign: 'center'
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
        marginBottom: Spacing.lg,
    },
    filterContainer: {
        flexDirection: 'column',
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        marginBottom: Spacing.lg,
        gap: Spacing.md,
        position: 'relative',
        zIndex: 10,
    },
    searchContainer: {
        width: '100%',
        zIndex: 1,
    },
    searchInput: {
        height: 40,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        paddingHorizontal: Spacing.md,
        fontSize: 14,
        position: 'relative',
        zIndex: 1,
    },
    filterPickerContainer: {
        width: '100%',
        zIndex: 20,
        position: 'relative',
    },
    filterPicker: {
        height: 40,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        paddingHorizontal: Spacing.md,
        fontSize: 14,
        position: 'relative',
        zIndex: 20,
    },
    dropdownContainer: {
        position: 'absolute',
        top: 50,
        right: 0,
        left: 0,
        backgroundColor: 'white',
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        zIndex: 30,
        elevation: 5,
    },
    dropdownItem: {
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderBottomWidth: 1,
        borderColor: '#E0E0E0',
    },
    dropdownItemText: {
        fontSize: 14,
        color: '#333',
    },
modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    margin: Spacing.md,
    minWidth: 300,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  modalText: {
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
});
