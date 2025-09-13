import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, Dimensions, Animated, RefreshControl } from 'react-native';
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

const { width } = Dimensions.get('window');

interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  name?: string;
  info?: string;
}

export default function AdminHome() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const { userName } = useAuth();

  const primaryColor = useThemeColor({}, 'primary');
  const donationColor = useThemeColor({}, 'donation');
  const volunteerColor = useThemeColor({}, 'volunteer');
  const emergencyColor = useThemeColor({}, 'emergency');
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  const [needyInfo, setNeedyInfo] = useState<{ numberNeedyPersons: number; LastNeedycreatedTime: string; LastNeedyNameCreated: string } | null>(null);
  const [adminInfo, setAdminInfo] = useState<InfoAdminResponse | null>(null);
  const [mapPoints, setMapPoints] = useState<MapPoint[]>([]);
  const [adminMapPoints, setAdminMapPoints] = useState<MapPoint[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    try {
      const [ni, ai, ng, ag] = await Promise.all([
        apiService.getNeedyInfo(),
        apiService.getAdminInfo(),
        apiService.getNeedyGeoPoints(),
        apiService.getAdminGeoPoints(),
      ]);
      if (ni.success) setNeedyInfo(ni.data!);
      if (ai.success) setAdminInfo(ai.data!);
      if (ng.success && Array.isArray(ng.data)) setMapPoints(ng.data as MapPoint[]);
      if (ag.success && Array.isArray(ag.data)) setAdminMapPoints(ag.data as MapPoint[]);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Use sample data if API fails
      setSampleData();
    } finally {
      if (showRefreshing) setRefreshing(false);
    }
  }, []);

  const setSampleData = () => {
    const sampleNeedyFamilies: MapPoint[] = [
      { id: 'n1', lat: 35.7002, lng: 51.3911, name: 'خانواده احمدی', info: '۳ فرزند، نیاز به کمک غذایی' },
      { id: 'n2', lat: 35.7108, lng: 51.4052, name: 'خانواده حسینی', info: 'اجاره معوق، نیاز فوری' },
      { id: 'n3', lat: 35.6893, lng: 51.3924, name: 'خانواده رضایی', info: 'هزینه درمان' },
      { id: 'n4', lat: 35.6769, lng: 51.4201, name: 'خانواده موسوی', info: 'بسته ارزاق' },
      { id: 'n5', lat: 35.7055, lng: 51.4303, name: 'خانواده کریمی', info: 'لوازم‌التحریر دانش‌آموز' },
      { id: 'n6', lat: 35.7182, lng: 51.3701, name: 'خانواده جعفری', info: 'کمک نقدی' },
      { id: 'n7', lat: 35.6951, lng: 51.4452, name: 'خانواده عباسی', info: 'تعمیرات مسکن' },
      { id: 'n8', lat: 35.6856, lng: 51.4107, name: 'خانواده شریفی', info: 'کمک دارویی' },
    ];

    setMapPoints(sampleNeedyFamilies);
    setNeedyInfo({
      numberNeedyPersons: sampleNeedyFamilies.length,
      LastNeedycreatedTime: new Date().toISOString(),
      LastNeedyNameCreated: 'خانواده احمدی'
    });
  };

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

  const onRefresh = () => {
    fetchData(true);
  };

  const needyCount = needyInfo?.numberNeedyPersons || mapPoints.length;

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
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
            {
              backgroundColor: surfaceColor,
              borderColor,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.headerContent}>
            <View>
              <ThemedText style={[styles.greeting, { color: textColor }]}>
                سلام، {userName || 'مدیر'}
              </ThemedText>
              <ThemedText style={[styles.subtitle, { color: textColor, opacity: 0.7 }]}>
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
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: primaryColor }]}
            onPress={() => router.push('/admin/volunteer-management')}
          >
            <LinearGradient
              colors={[primaryColor, `${primaryColor}CC`]}
              style={styles.cardGradient}
            >
              <ThemedText style={styles.statNumber}>{needyCount}</ThemedText>
              <ThemedText style={styles.statLabel}>خانواده نیازمند</ThemedText>
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
              <ThemedText style={styles.statNumber}>
                {adminInfo?.numberAdminPersons || 0}
              </ThemedText>
              <ThemedText style={styles.statLabel}>مدیر</ThemedText>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: donationColor }]}
            onPress={() => router.push('/admin/reports')}
          >
            <LinearGradient
              colors={[donationColor, `${donationColor}CC`]}
              style={styles.cardGradient}
            >
              <ThemedText style={styles.statNumber}>
                {adminInfo?.numberGroupAdminPersons || 0}
              </ThemedText>
              <ThemedText style={styles.statLabel}>مدیر گروه</ThemedText>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Map Section */}
        <Animated.View
          style={[
            styles.mapSection,
            {
              backgroundColor: surfaceColor,
              borderColor,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
            نقشه خانواده‌های نیازمند
          </ThemedText>
          <ThemedText style={[styles.sectionSubtitle, { color: textColor, opacity: 0.7 }]}>
            موقعیت جغرافیایی خانواده‌ها و مدیران
          </ThemedText>

          <View style={styles.mapContainer}>
            <NeedyMap
              points={mapPoints}
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
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
            دسترسی سریع
          </ThemedText>

          <View style={styles.actionGrid}>
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: surfaceColor, borderColor }]}
              onPress={() => router.push('/admin/volunteer-management')}
            >
              <ThemedText style={[styles.actionTitle, { color: primaryColor }]}>
                مدیریت نیازمندان
              </ThemedText>
              <ThemedText style={[styles.actionDescription, { color: textColor, opacity: 0.7 }]}>
                مشاهده و مدیریت خانواده‌های نیازمند
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: surfaceColor, borderColor }]}
              onPress={() => router.push('/admin/admin-management')}
            >
              <ThemedText style={[styles.actionTitle, { color: volunteerColor }]}>
                مدیریت کاربران
              </ThemedText>
              <ThemedText style={[styles.actionDescription, { color: textColor, opacity: 0.7 }]}>
                مدیریت مدیران و مدیران گروه
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: surfaceColor, borderColor }]}
              onPress={() => router.push('/admin/reports')}
            >
              <ThemedText style={[styles.actionTitle, { color: donationColor }]}>
                گزارش‌گیری
              </ThemedText>
              <ThemedText style={[styles.actionDescription, { color: textColor, opacity: 0.7 }]}>
                مشاهده گزارش‌ها و آمار
              </ThemedText>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: Spacing.xl,
  },
  header: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderRadius: BorderRadius.lg,
    margin: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.small,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold as any,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.sizes.sm,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
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
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold as any,
    marginBottom: Spacing.xs,
  },
  sectionSubtitle: {
    fontSize: Typography.sizes.sm,
    marginBottom: Spacing.md,
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
  actionTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold as any,
    marginBottom: Spacing.xs,
  },
  actionDescription: {
    fontSize: Typography.sizes.sm,
    lineHeight: 20,
  },
});
