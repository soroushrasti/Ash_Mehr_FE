import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl, Platform, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Spacing, BorderRadius } from '@/constants/Design';
import { apiService } from '@/services/apiService';
import AppHeader from '@/components/AppHeader';

interface NeedyRecord {
    id: number; // Changed from string to number to match API response
    name: string;
    phone?: string;
    info: string;
    lat?: number;
    lng?: number;
    group_name?: string;
}

export default function ReportsPage() {
    const [needyRecords, setNeedyRecords] = useState<NeedyRecord[]>([]);
    const [filteredRecords, setFilteredRecords] = useState<NeedyRecord[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRepresentative, setSelectedRepresentative] = useState('');
    const [representatives, setRepresentatives] = useState<string[]>([]);
    const [showRepresentativeDropdown, setShowRepresentativeDropdown] = useState(false);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

    const primaryColor = useThemeColor({}, 'primary');
    const successColor = useThemeColor({}, 'success');
    const dangerColor = useThemeColor({}, 'error');
    const backgroundColor = useThemeColor({}, 'background');
    const surfaceColor = useThemeColor({}, 'surface');
    const textColor = useThemeColor({}, 'text');
    const borderColor = useThemeColor({}, 'border');

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

    // Filter and search functionality
    useEffect(() => {
        let filtered = needyRecords;

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(record =>
                record.name && record.name.toLowerCase().includes(searchTerm.toLowerCase())
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

    const handleViewDetails = (record: NeedyRecord) => {
        router.push(`/admin/needy-details/${record.id}`);
    };

    const handleEdit = (record: NeedyRecord) => {
        router.push(`/admin/edit-needy/${record.id}`);
    };

    const handleGood = (record: NeedyRecord) => {
        // Navigate to the dynamic route that expects :registerId
        router.push(`/admin/edit-good/${record.id}`);
    };

    const handleDelete = (record: NeedyRecord) => {
        console.log('Attempting to delete record:', record);
        const confirmMessage = `آیا از حذف ${record.name || 'این مددجو'} اطمینان دارید؟`;

        const performDelete = async () => {
            try {
                const response = await apiService.deleteNeedy(String(record.id));
                if (response.success) {
                    setNeedyRecords(prev => prev.filter(r => r.id !== record.id));
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
                console.error('Error deleting needy:', error);
                if (Platform.OS === 'web') {
                    // eslint-disable-next-line no-alert
                    window.alert('خطا در حذف مددجو');
                } else {
                    Alert.alert('خطا', 'خطا در حذف مددجو');
                }
            }
        };

        if (Platform.OS === 'web') {
            // eslint-disable-next-line no-alert
            const confirmed = window.confirm(confirmMessage);
            if (confirmed) void performDelete();
        } else {
            Alert.alert('حذف مددجو', confirmMessage, [
                { text: 'انصراف', style: 'cancel' },
                { text: 'حذف', style: 'destructive', onPress: () => { void performDelete(); } },
            ]);
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
            {/* Address */}
            <View style={[styles.tableCell, styles.addressCell]}>
                <ThemedText
                    style={[
                        styles.tableCellText,
                        { color: isHeader ? 'white' : textColor },
                        isHeader && styles.tableHeaderText
                    ]}
                    numberOfLines={2}
                >
                    {isHeader ? 'آدرس' : record.info}
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
                    {isHeader ? 'نماینده' : (record.group_name || 'نامشخص')}
                </ThemedText>
            </View>
            {/* Actions */}
            {!isHeader && (
                <View style={styles.actionsCell}>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: primaryColor }]}
                        onPress={() => handleViewDetails(record)}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                        accessibilityLabel="جزئیات"
                    >
                        <ThemedText style={styles.actionButtonText}>👁️</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: successColor }]}
                        onPress={() => handleEdit(record)}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                        accessibilityLabel="ویرایش"
                    >
                        <ThemedText style={styles.actionButtonText}>✏️</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: dangerColor }]}
                        onPress={() => handleDelete(record)}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                        accessibilityLabel="حذف"
                    >
                        <ThemedText style={styles.actionButtonText}>🗑️</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#9a8161' }]}
                        onPress={() => handleGood(record)}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                        accessibilityLabel="کمک ها"
                    >
                        <ThemedText style={styles.actionButtonText}>💰</ThemedText>
                    </TouchableOpacity>
                </View>
            )}
            {isHeader && (
                <View style={styles.actionsCell}>
                    <ThemedText
                        style={[styles.tableCellText, { color: 'white' }, styles.tableHeaderText]}
                        numberOfLines={1}
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
                <AppHeader title="گزارش‌گیری" subtitle="گزارش‌گیری" />
                <View style={styles.loadingContainer}>
                    <ThemedText>در حال بارگذاری...</ThemedText>
                </View>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={[styles.container, { backgroundColor }]}>
            <AppHeader title="لیست مددجویان" subtitle="مدیریت اطلاعات مددجویان" />

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
                        {/* Table Header */}
                        <TableRow record={{}} isHeader={true} />

                        {/* Table Rows - Direct rendering without nested ScrollView */}
                        {filteredRecords.map((record, index) => (
                            <TableRow key={record.id || index} record={record} />
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

const ACTION_BUTTON_SIZE = Platform.OS === 'android' ? 40 : 34;

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
        paddingHorizontal: Spacing.xs,
        minHeight: 64,
        width: '100%',
        alignItems: 'center'
    },
    tableCell: {
        flex: 1,
        paddingHorizontal: Spacing.xs,
        justifyContent: 'center',
        alignItems: 'flex-end',
        minWidth: 60,
    },
    addressCell: {
        flex: 2,
        minWidth: 120,
    },
    actionsCell: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 6,
        paddingHorizontal: Spacing.xs,
        flexShrink: 0,
        width: Platform.OS === 'android' ? 190 : 170,
    },
    tableCellText: {
        fontSize: 14,
        textAlign: 'right',
    },
    tableHeaderText: {
        fontWeight: 'bold',
        fontSize: 16,
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
        fontSize: Platform.OS === 'android' ? 18 : 16,
        lineHeight: Platform.OS === 'android' ? 20 : 18,
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
});
