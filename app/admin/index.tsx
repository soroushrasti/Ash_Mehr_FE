import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, RefreshControl, TouchableOpacity, ScrollView, StyleSheet, View, I18nManager } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { SignOutButton } from '@/components/SignOutButton';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Spacing, BorderRadius, Shadows, Typography } from '@/constants/Design';
import NeedyMap from '@/components/NeedyMap';
import { apiService } from '@/services/apiService';
import type { InfoAdminResponse } from '@/types/api';
import { useAuth } from '@/components/AuthContext';
import { RTLPicker } from '@/components/RTLPicker';
import { useLocalSearchParams } from 'expo-router';


// Force RTL layout
if (!I18nManager.isRTL) {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
}

// Local MapPoint type to align with API points
interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  name?: string;
  info?: string;
  group_name?: string;
}

export default function AdminHome() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const { userName } = useAuth();

  const [role, setRole] = useState(null);

      useEffect(() => {
          // اطمینان از اینکه router.isReady و router.query وجود دارند
          if (router.isReady && router.query.role) {
              setRole(router.query.role);
          }
      }, [router.isReady, router.query]);

  // Theme colors
  const primaryColor = useThemeColor({}, 'primary');
  const donationColor = useThemeColor({}, 'donation');
  const volunteerColor = useThemeColor({}, 'volunteer');
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  const [needyInfo, setNeedyInfo] = useState<{ numberNeedyPersons: number; LastNeedycreatedTime: string; LastNeedyNameCreated: string } | null>(null);
  const [adminInfo, setAdminInfo] = useState<InfoAdminResponse | null>(null);
  const [mapPoints, setMapPoints] = useState<MapPoint[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('');
  const [availableGroups, setAvailableGroups] = useState<string[]>([]);

  const fetchData = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    try {
      const [ni, ai, ng] = await Promise.all([
        apiService.getNeedyInfo(),
        apiService.getAdminInfo(),
        apiService.getNeedyGeoPoints(),
      ]);
      if (ni.success) setNeedyInfo(ni.data!);
      if (ai.success) setAdminInfo(ai.data!);
      if (ng.success && Array.isArray(ng.data)) {
        const points = ng.data as unknown as MapPoint[];
        setMapPoints(points);
        const groups = [...new Set(
          points
            .map(p => p.group_name)
            .filter((g): g is string => !!g && g.trim() !== '')
        )];
        setAvailableGroups(groups);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      if (showRefreshing) setRefreshing(false);
    }
  }, []);

  const filteredMapPoints = useMemo(() => {
      console.log('Filtering map points with group filter:', selectedGroupFilter);
      console.log('Total map points before filtering:', mapPoints.length);

      const result = !selectedGroupFilter
        ? mapPoints
        : mapPoints.filter(p => p.group_name === selectedGroupFilter);

      console.log('Filtered result length:', result.length);
      console.log('Filtered result sample:', result.slice(0, 2));

      return result;
  }, [mapPoints, selectedGroupFilter]);


  // Refresh data when page comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  useEffect(() => {
    fetchData();

    // Animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fetchData, fadeAnim, slideAnim]);

  const onRefresh = () => fetchData(true);

  const needyCount = needyInfo?.numberNeedyPersons ?? mapPoints.length;

  return (
    <ThemedView style={[styles.container, { backgroundColor }]} rtl={true}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            styles.rtlHeader,
            {
              backgroundColor: surfaceColor,
              borderColor,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.headerContent}>
            <View style={styles.rtlHeaderText}>
              <ThemedText style={[styles.greeting, { color: textColor }]} rtl={true}>
                سلام، {userName || 'نماینده'}
              </ThemedText>
              <ThemedText style={[styles.subtitle, { color: textColor, opacity: 0.7 }]} rtl={true}>
                پنل مدیریت آشیانه مهر
              </ThemedText>
            </View>
            <SignOutButton />
          </View>
        </Animated.View>

        {/* Statistics Cards */}
        <Animated.View
          style={[
            styles.statsContainer,
            styles.rtlStatsContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: primaryColor }]}
            onPress={() => router.push('/admin/needy-management')}
          >
            <LinearGradient
              colors={[primaryColor, `${primaryColor}CC`]}
              style={styles.cardGradient}
            >
              <ThemedText style={styles.statNumber} rtl={false}>{needyCount}</ThemedText>
              <ThemedText style={styles.statLabel} rtl={true}>خانواده مددجو</ThemedText>
            </LinearGradient>
          </TouchableOpacity>


          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: volunteerColor }]}
            onPress={() => router.push('/admin/admin-management')}
          >
            <LinearGradient
              colors={[volunteerColor, `${volunteerColor}CC`]}
              style={styles.cardGradient}
            >
              <ThemedText style={styles.statNumber} rtl={false}>
                {adminInfo?.numberGroupAdminPersons || 0}
              </ThemedText>
              <ThemedText style={styles.statLabel} rtl={true}>نماینده گروه</ThemedText>
            </LinearGradient>
          </TouchableOpacity>

            <TouchableOpacity
                style={[styles.statCard, { backgroundColor: donationColor }]}
                onPress={() => router.push('/admin/admin-management')}
            >
                <LinearGradient
                    colors={[donationColor, `${donationColor}CC`]}
                    style={styles.cardGradient}
                >
                    <ThemedText style={styles.statNumber} rtl={false}>
                        {adminInfo?.numberAdminPersons || 0}
                    </ThemedText>
                    <ThemedText style={styles.statLabel} rtl={true}>مدیر</ThemedText>
                </LinearGradient>
            </TouchableOpacity>

        </Animated.View>

        {/* Map Section */}
        <Animated.View
          style={[
            styles.mapSection,
            styles.rtlSection,
            { backgroundColor: surfaceColor, borderColor, opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <ThemedText style={[styles.sectionTitle, { color: textColor }]} rtl={true}>نقشه</ThemedText>
          <ThemedText style={[styles.sectionSubtitle, { color: textColor, opacity: 0.7 }]} rtl={true}>
            موقعیت جغرافیایی مددجوها بر اساس نمایندگان
          </ThemedText>

          {/* Group Filter Picker */}
          <View style={styles.filterContainer}>
            <RTLPicker
              style={styles.rtlPicker}
              items={[{ label: 'همه نمایندگان', value: '' }, ...availableGroups.map(g => ({ label: g, value: g }))]}
              selectedValue={selectedGroupFilter}
              onValueChange={(val) => setSelectedGroupFilter(val)}
              placeholder="انتخاب نماینده"
            />
          </View>

          <View style={styles.mapContainer}>
            <NeedyMap
              points={filteredMapPoints}
              initialRegion={{
                latitude: 35.6892,
                longitude: 51.3890,
                latitudeDelta: 0.1,
                longitudeDelta: 0.1,
              }}
              style={styles.map}
            />
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View
          style={[
            styles.actionsSection,
            styles.rtlSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <ThemedText style={[styles.sectionTitle, { color: textColor }]} rtl={true}>
            دسترسی سریع
          </ThemedText>

          <View style={styles.actionGrid}>
            {/* Registration Actions */}
            <TouchableOpacity
              style={[styles.actionCard, styles.registrationCard, styles.rtlActionCard, { backgroundColor: primaryColor, borderColor: primaryColor }]}
              onPress={() => router.push('/admin/register/needy-form')}
            >
              <View style={styles.actionCardHeader}>
                <ThemedText style={[styles.actionTitle, { color: '#FFFFFF' }]} rtl={true}>
                  ثبت خانواده مددجو
                </ThemedText>
                <ThemedText style={styles.registrationIcon}>👨‍👩‍👧‍👦</ThemedText>
              </View>
              <ThemedText style={[styles.actionDescription, { color: '#FFFFFF', opacity: 0.9 }]} rtl={true}>
                افزودن خانواده مددجو جدید به سیستم
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, styles.registrationCard, styles.rtlActionCard, { backgroundColor: volunteerColor, borderColor: volunteerColor }]}
              onPress={() => router.push('/admin/register/group-admin-form')}
            >
              <View style={styles.actionCardHeader}>
                <ThemedText style={[styles.actionTitle, { color: '#FFFFFF' }]} rtl={true}>
                  ثبت نماینده جدید
                </ThemedText>
                <ThemedText style={styles.registrationIcon}>👨‍💼</ThemedText>
              </View>
              <ThemedText style={[styles.actionDescription, { color: '#FFFFFF', opacity: 0.9 }]} rtl={true}>
                افزودن نماینده گروه جدید
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, styles.registrationCard, styles.rtlActionCard, { backgroundColor: donationColor, borderColor: donationColor }]}
              onPress={() => router.push('/admin/register/admin-form')}
            >
              <View style={styles.actionCardHeader}>
                <ThemedText style={[styles.actionTitle, { color: '#FFFFFF' }]} rtl={true}>
                  ثبت مدیر
                </ThemedText>
                <ThemedText style={styles.registrationIcon}>👑</ThemedText>
              </View>
              <ThemedText style={[styles.actionDescription, { color: '#FFFFFF', opacity: 0.9 }]} rtl={true}>
                افزودن مدیر جدید
              </ThemedText>
            </TouchableOpacity>

            {/* Management Actions */}
            <TouchableOpacity
              style={[styles.actionCard, styles.rtlActionCard, { backgroundColor: surfaceColor, borderColor }]}
              onPress={() => router.push(`/admin/info-management?role=${role}`)}
            >
              <View style={styles.actionCardHeader}>
                <ThemedText style={[styles.actionTitle, { color: primaryColor }]} rtl={true}>
                  مدیریت اطلاعات
                </ThemedText>
                <ThemedText style={styles.managementIcon}>📋</ThemedText>
              </View>
              <ThemedText style={[styles.actionDescription, { color: textColor, opacity: 0.7 }]} rtl={true}>
                مشاهده و مدیریت اطلاعات
              </ThemedText>
            </TouchableOpacity>

            {/* plot data */}
                        <TouchableOpacity
                          style={[styles.actionCard, styles.rtlActionCard, { backgroundColor: "#FDFF00", borderColor }]}
                          onPress={() => router.push('/admin/plot-data')}
                        >
                          <View style={styles.actionCardHeader}>
                            <ThemedText style={[styles.actionTitle, { color: primaryColor }]} rtl={true}>
                              نمودار داده ها
                            </ThemedText>
                            <ThemedText style={styles.managementIcon}>📈</ThemedText>
                          </View>
                          <ThemedText style={[styles.actionDescription, { color: textColor, opacity: 0.7 }]} rtl={true}>
                            مشاهده آمار داده ها
                          </ThemedText>
                        </TouchableOpacity>

          </View>
        </Animated.View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { paddingBottom: Spacing.xl },
  header: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderRadius: BorderRadius.lg,
    margin: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.small,
  },
  rtlHeader: {
    direction: 'rtl',
  },
  headerContent: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rtlHeaderText: {
    alignItems: 'flex-end',
  },
  greeting: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold as any,
    marginBottom: Spacing.xs,
    textAlign: 'right',
  },
  subtitle: {
    fontSize: Typography.sizes.sm,
    textAlign: 'right',
  },
  statsContainer: {
    flexDirection: 'row-reverse',
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  rtlStatsContainer: {
    writingDirection: 'rtl',
  },
  statCard: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.medium,
  },
  cardGradient: {
    padding: Spacing.md,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold as any,
    color: '#FFFFFF',
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: Typography.sizes.sm,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  mapSection: {
    margin: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    ...Shadows.small,
  },
  rtlSection: {
    writingDirection: 'rtl',
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold as any,
    marginBottom: Spacing.xs,
    textAlign: 'right',
  },
  sectionSubtitle: {
    fontSize: Typography.sizes.sm,
    marginBottom: Spacing.md,
    textAlign: 'right',
  },
  filterContainer: {
    marginBottom: Spacing.md,
  },
  rtlPicker: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
  },
  mapContainer: {
    height: 300,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  actionsSection: {
    paddingHorizontal: Spacing.md,
  },
  actionGrid: {
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  actionCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    ...Shadows.small,
  },
  rtlActionCard: {
    direction: 'rtl',
    alignItems: 'flex-end',
  },
  registrationCard: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  actionCardHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: Spacing.xs,
    width: '100%',
  },
  registrationIcon: {
    fontSize: 24,
    marginLeft: Spacing.md,
  },
  managementIcon: {
    fontSize: 20,
    marginLeft: Spacing.md,
  },
  actionTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold as any,
    marginBottom: Spacing.xs,
    textAlign: 'right',
    flex: 1,
  },
  actionDescription: {
    fontSize: Typography.sizes.sm,
    lineHeight: 20,
    textAlign: 'right',
    width: '100%',
  },
});
