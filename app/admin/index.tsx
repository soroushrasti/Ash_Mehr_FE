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
import type { NeedyPoint } from '@/components/NeedyMap';
import type { InfoAdminResponse } from '@/types/api';
import { useAuth } from '@/components/AuthContext';

const { width } = Dimensions.get('window');

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
   const [mapPoints, setMapPoints] = useState<NeedyPoint[]>([]);
   const [adminMapPoints, setAdminMapPoints] = useState<NeedyPoint[]>([]);
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
       if (ng.success && Array.isArray(ng.data)) setMapPoints(ng.data as any);
       if (ag.success && Array.isArray(ag.data)) setAdminMapPoints(ag.data as any);
     } catch (error) {
       console.error('Error fetching data:', error);
     } finally {
       if (showRefreshing) setRefreshing(false);
     }
   }, []);

   // Refresh data when page comes into focus
   useFocusEffect(
     useCallback(() => {
       fetchData();
     }, [fetchData])
   );

   useEffect(() => {
     fetchData();
   }, [fetchData]);

   // Sample needy families data (replace with API data later)
   const needyFamilies = [
     { id: 'n1', lat: 35.7002, lng: 51.3911, name: 'خانواده احمدی', info: '۳ فرزند، نیاز به کمک غذایی' },
     { id: 'n2', lat: 35.7108, lng: 51.4052, name: 'خانواده حسینی', info: 'اجاره معوق، نیاز فوری' },
     { id: 'n3', lat: 35.6893, lng: 51.3924, name: 'خانواده رضایی', info: 'هزینه درمان' },
     { id: 'n4', lat: 35.6769, lng: 51.4201, name: 'خانواده موسوی', info: 'بسته ارزاق' },
     { id: 'n5', lat: 35.7055, lng: 51.4303, name: 'خانواده کریمی', info: 'لوازم‌التحریر دانش‌آموز' },
     { id: 'n6', lat: 35.7182, lng: 51.3701, name: 'خانواده جعفری', info: 'کمک نقدی' },
     { id: 'n7', lat: 35.6951, lng: 51.4452, name: 'خانواده عباسی', info: 'تعمیرات مسکن' },
     { id: 'n8', lat: 35.6856, lng: 51.4107, name: 'خانواده شریفی', info: 'کمک دارویی' },
   ];
   const needyCount = needyFamilies.length;

   useEffect(() => {
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
   }, [fadeAnim, slideAnim]);

   const quickActions = [
      {
         title: 'ثبت فرد جدید',
         subtitle: 'افزودن خانواده یا نماینده به سیستم',
         icon: '➕',
         gradient: ['#667eea', '#764ba2'],
         action: () => router.push('/admin/register/select-role')
      },
       {
           title: 'مدیریت اطلاعات',
           subtitle: 'مدیریت اطلاعات مددجویان و مدیران',
           icon: '🤝',
           gradient: ['#a8edea', '#fed6e3'],
           action: () => router.push('/admin/volunteer-management')
       },
      {
         title: 'مدیریت پیام ها',
         subtitle: 'پیگیری و پیام های کذاشته شده',
         icon: '📦',
         gradient: ['#f093fb', '#f5576c'],
         action: () => {}
      },
      {
         title: 'گزارش‌گیری',
         subtitle: 'مشاهده آمار و مدیریت مددجویان',
         icon: '📊',
         gradient: ['#4facfe', '#00f2fe'],
         action: () => router.push('/admin/reports')
      },

   ];

   const ActionCard = ({ action }: { action: any }) => (
      <Animated.View
         style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
         }}
      >
         <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: surfaceColor, borderColor }]}
            onPress={action.action}
            activeOpacity={0.7}
         >
            {/* Background pattern */}
            <View style={styles.actionBackground}>
               <LinearGradient
                  colors={[action.gradient[0], action.gradient[1], 'transparent']}
                  style={styles.actionBackgroundGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
               />
            </View>

            {/* Icon with glow effect */}
            <View style={styles.actionIconWrapper}>
               <LinearGradient
                  colors={action.gradient}
                  style={styles.actionIconContainer}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
               >
                  <ThemedText style={styles.actionIcon}>{action.icon}</ThemedText>
               </LinearGradient>

               {/* Glow effect */}
               <View style={[styles.actionGlow, {
                  backgroundColor: action.gradient[0] + '30'
               }]} />
            </View>

            {/* Content */}
            <View style={styles.actionContent}>
               <ThemedText style={[styles.actionTitle, { color: textColor }]}>
                  {action.title}
               </ThemedText>
               <ThemedText style={[styles.actionSubtitle, { color: textColor, opacity: 0.7 }]}>
                  {action.subtitle}
               </ThemedText>
            </View>

            {/* Arrow with animation */}
            <View style={[styles.actionArrow, { backgroundColor: primaryColor }]}>
               <ThemedText style={styles.arrowIcon}>←</ThemedText>
            </View>
         </TouchableOpacity>
      </Animated.View>
   );

   return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
         {/* Enhanced Header with floating elements */}
         <View style={styles.headerContainer}>
            <LinearGradient
               colors={[primaryColor, '#3b82f6', '#60a5fa', '#93c5fd']}
               style={styles.header}
               start={{ x: 0, y: 0 }}
               end={{ x: 1, y: 1 }}
            >
               {/* Floating decorative circles */}
               <View style={[styles.floatingCircle, styles.circle1]} />
               <View style={[styles.floatingCircle, styles.circle2]} />
               <View style={[styles.floatingCircle, styles.circle3]} />

               <Animated.View style={[styles.headerContent, {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
               }]}>
                  <View style={styles.welcomeSection}>
                     <ThemedText style={styles.greeting}>سلام{userName ? `، ${userName}` : '، نماینده گرامی'} 👋</ThemedText>
                     <ThemedText style={styles.welcomeText}>پنل نمایندگان کانون ایتام مهر راستی</ThemedText>
                     <ThemedText style={styles.dateText}>
                        {new Date().toLocaleDateString('fa-IR', {
                           weekday: 'long',
                           year: 'numeric',
                           month: 'long',
                           day: 'numeric'
                        })}
                     </ThemedText>
                  </View>

                  <SignOutButton variant="icon" size="medium" style={styles.signOutButton} />
               </Animated.View>
            </LinearGradient>
         </View>

         <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
               <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => fetchData(true)}
                  tintColor={primaryColor}
               />
            }
         >
          {/* Stats from API */}
          <ThemedView type="card" style={{ marginBottom: 12 }}>
            <ThemedText type="heading3" style={{ marginBottom: 8 }}>خلاصه آمار</ThemedText>
            <ThemedText type="body">تعداد مددجویان: {needyInfo?.numberNeedyPersons ?? '—'}</ThemedText>
            <ThemedText type="caption" style={{ opacity: 0.8 }}>
              آخرین ثبت مددجو: {needyInfo?.LastNeedyNameCreated ?? '—'}
              ({needyInfo?.LastNeedycreatedTime ?
                new Date(new Date(needyInfo.LastNeedycreatedTime).getTime() + (3.5 * 60 * 60 * 1000)).toLocaleString('fa-IR', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })
                : '—'})
            </ThemedText>
            <View style={{ height: 8 }} />
            <ThemedText type="body">نمایندگان کل: {adminInfo?.numberAdminPersons ?? '—'} | نمایندگان گروه: {adminInfo?.numberGroupAdminPersons ?? '—'}</ThemedText>
            <ThemedText type="caption" style={{ opacity: 0.8 }}>
              آخرین نماینده ثبت‌شده: {adminInfo?.LastAdminNameCreated ?? '—'}
              ({adminInfo?.LastAdminCreatedTime ?
                new Date(new Date(adminInfo.LastAdminCreatedTime).getTime() + (3.5 * 60 * 60 * 1000)).toLocaleString('fa-IR', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })
                : '—'})
            </ThemedText>
          </ThemedView>

          {/* Map + count section replacing previous stats */}
          <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }]}]}>
            <View style={styles.sectionHeader}>
              <ThemedText style={[styles.sectionTitle, { color: textColor }]}>🗺️ نقشه خانواده‌های مددجو</ThemedText>
              <View style={styles.sectionDivider} />
            </View>
            <ThemedView type="card" style={{ padding: 0, overflow: 'hidden' }}>
              <NeedyMap points={mapPoints} adminPoints={adminMapPoints} />
            </ThemedView>
            <ThemedText type="caption" style={{ marginTop: 8, opacity: 0.8 }}>
              تعداد خانواده‌های مددجو: {mapPoints.length}
            </ThemedText>
          </Animated.View>

          {/* Enhanced Quick Actions */}
          <Animated.View style={[styles.section, {
             opacity: fadeAnim,
             transform: [{ translateY: slideAnim }]
          }]}>
             <View style={styles.sectionHeader}>
                <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
                   ⚡ عملیات سریع
                </ThemedText>
                <View style={styles.sectionDivider} />
             </View>

             <View style={styles.actionsContainer}>
                {quickActions.map((action, index) => (
                   <ActionCard key={index} action={action} />
                ))}
             </View>
          </Animated.View>

          {/* Enhanced Recent Activity */}
          <Animated.View style={[styles.section, {
             opacity: fadeAnim,
             transform: [{ translateY: slideAnim }]
          }]}>
             <View style={styles.sectionHeader}>
                <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
                   🕒 فعالیت‌های اخیر
                </ThemedText>
                <View style={styles.sectionDivider} />
             </View>

             <View style={[styles.activityCard, { backgroundColor: surfaceColor, borderColor }]}>
                <View style={styles.activityItem}>
                   <View style={styles.activityIconContainer}>
                      <View style={[styles.activityDot, { backgroundColor: primaryColor }]} />
                      <View style={[styles.activityPulse, { backgroundColor: primaryColor + '20' }]} />
                   </View>
                   <View style={styles.activityContent}>
                      <ThemedText style={[styles.activityTitle, { color: textColor }]}>
                         👪 ثبت مددجو جدید: {needyInfo?.LastNeedyNameCreated ?? '—'}
                      </ThemedText>
                      <ThemedText style={[styles.activityTime, { color: textColor, opacity: 0.6 }]}>
                         {needyInfo?.LastNeedycreatedTime ? new Date(needyInfo.LastNeedycreatedTime).toLocaleString('fa-IR') : '—'}
                      </ThemedText>
                   </View>
                </View>

                <View style={styles.activityDivider} />

                <View style={styles.activityItem}>
                   <View style={styles.activityIconContainer}>
                      <View style={[styles.activityDot, { backgroundColor: volunteerColor }]} />
                      <View style={[styles.activityPulse, { backgroundColor: volunteerColor + '20' }]} />
                   </View>
                   <View style={styles.activityContent}>
                      <ThemedText style={[styles.activityTitle, { color: textColor }]}>
                         🧑‍💼 ثبت نماینده جدید: {adminInfo?.LastAdminNameCreated ?? '—'}
                      </ThemedText>
                      <ThemedText style={[styles.activityTime, { color: textColor, opacity: 0.6 }]}>
                         {adminInfo?.LastAdminCreatedTime ? new Date(adminInfo.LastAdminCreatedTime).toLocaleString('fa-IR') : '—'}
                      </ThemedText>
                   </View>
                </View>
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
  headerContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl + 10,
    borderBottomLeftRadius: BorderRadius.xxl,
    borderBottomRightRadius: BorderRadius.xxl,
    position: 'relative',
  },
  floatingCircle: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: BorderRadius.full,
  },
  circle1: {
    width: 120,
    height: 120,
    top: -60,
    right: -40,
  },
  circle2: {
    width: 80,
    height: 80,
    top: 20,
    left: -20,
  },
  circle3: {
    width: 60,
    height: 60,
    bottom: -10,
    right: 50,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    zIndex: 10,
  },
  welcomeSection: {
    flex: 1,
  },
  greeting: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 6,
    fontSize: 16,
  },
  welcomeText: {
    ...Typography.h2,
    color: 'white',
    fontWeight: '700',
    marginBottom: 4,
  },
  dateText: {
    ...Typography.small,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  profileButton: {
    padding: Spacing.sm,
  },
  profileIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  profileText: {
    fontSize: 28,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  section: {
    marginBottom: Spacing.xl + 8,
  },
  sectionHeader: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h3,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  sectionDivider: {
    height: 3,
    backgroundColor: '#3b82f6',
    borderRadius: BorderRadius.sm,
    width: 40,
  },
  actionsContainer: {
    gap: Spacing.md,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    ...Shadows.md,
    position: 'relative',
    overflow: 'hidden',
  },
  actionBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  actionBackgroundGradient: {
    flex: 1,
    opacity: 0.03,
  },
  actionIconWrapper: {
    position: 'relative',
    marginRight: Spacing.lg,
    zIndex: 2,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 26,
  },
  actionGlow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: BorderRadius.lg + 4,
    zIndex: -1,
  },
  actionContent: {
    flex: 1,
    zIndex: 1,
  },
  actionTitle: {
    ...Typography.body,
    fontWeight: '700',
    marginBottom: 6,
    fontSize: 17,
  },
  actionSubtitle: {
    ...Typography.caption,
    fontSize: 13,
  },
  actionArrow: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  arrowIcon: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  activityCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    ...Shadows.md,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  activityIconContainer: {
    position: 'relative',
    marginRight: Spacing.lg,
  },
  activityDot: {
    width: 14,
    height: 14,
    borderRadius: BorderRadius.full,
    zIndex: 2,
  },
  activityPulse: {
    position: 'absolute',
    top: -3,
    left: -3,
    width: 20,
    height: 20,
    borderRadius: BorderRadius.full,
    zIndex: 1,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    ...Typography.body,
    fontWeight: '600',
    marginBottom: 4,
    fontSize: 16,
  },
  activityTime: {
    ...Typography.small,
    fontSize: 12,
  },
  activityDivider: {
    height: 1,
    backgroundColor: 'rgba(156, 163, 175, 0.2)',
    marginVertical: Spacing.sm,
    marginLeft: 34,
  },
  signOutButton: {
    // Add any specific styles for the SignOutButton here if needed
  },
});
