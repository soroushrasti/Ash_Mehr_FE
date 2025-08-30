import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Spacing, BorderRadius } from '@/constants/Design';

export default function AdminHome() {
  const { signOut, userId } = useAuth();
  const router = useRouter();
  const primaryColor = useThemeColor({}, 'primary');
  const donationColor = useThemeColor({}, 'donation');
  const volunteerColor = useThemeColor({}, 'volunteer');
  const emergencyColor = useThemeColor({}, 'emergency');

  const stats = [
    { label: 'کل کمک‌ها', value: '۱۲,۵۰۰', subtitle: 'تومان', color: donationColor, icon: '💰' },
    { label: 'داوطلبان فعال', value: '۸۵', subtitle: 'نفر', color: volunteerColor, icon: '👥' },
    { label: 'موارد اضطراری', value: '۳', subtitle: 'فوری', color: emergencyColor, icon: '🚨' },
    { label: 'خانواده‌های تحت پوشش', value: '۱۲۰', subtitle: 'خانواده', color: primaryColor, icon: '🏠' },
  ];

  const quickActions = [
    { title: 'ثبت نیازمند جدید', subtitle: 'افزودن خانواده به سیستم', icon: '➕', action: () => router.push('/admin/register/select-role') },
    { title: 'مدیریت کمک‌ها', subtitle: 'پیگیری و تخصیص کمک‌ها', icon: '📦', action: () => {} },
    { title: 'گزارش‌گیری', subtitle: 'مشاهده آمار و گزارشات', icon: '📊', action: () => {} },
    { title: 'مدیریت داوطلبان', subtitle: 'هماهنگی با داوطلبان', icon: '🤝', action: () => {} },
  ];

  return (
    <ThemedView type="container" style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <ThemedText type="heading2" style={styles.welcome}>
              سلام، مدیر گرامی! 👋
            </ThemedText>
            <ThemedText type="body" style={styles.subtitle}>
              آمار امروز خیریه آشیانه مهر
            </ThemedText>
          </View>
          <TouchableOpacity onPress={signOut} style={styles.signOutButton}>
            <ThemedText type="caption" style={[styles.signOutText, { color: emergencyColor }]}>
              خروج 🚪
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Statistics Cards */}
        <ThemedText type="heading3" style={styles.sectionTitle}>
          آمار کلی
        </ThemedText>
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <ThemedView key={index} type="card" style={[styles.statCard, { borderTopColor: stat.color }]}>
              <View style={styles.statHeader}>
                <ThemedText style={styles.statIcon}>{stat.icon}</ThemedText>
                <ThemedText type="caption" style={styles.statLabel}>
                  {stat.label}
                </ThemedText>
              </View>
              <ThemedText type="heading3" style={[styles.statValue, { color: stat.color }]}>
                {stat.value}
              </ThemedText>
              <ThemedText type="caption" style={styles.statSubtitle}>
                {stat.subtitle}
              </ThemedText>
            </ThemedView>
          ))}
        </View>

        {/* Quick Actions */}
        <ThemedText type="heading3" style={styles.sectionTitle}>
          اقدامات سریع
        </ThemedText>
        <View style={styles.actionsGrid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity key={index} onPress={action.action}>
              <ThemedView type="card" style={styles.actionCard}>
                <ThemedText style={styles.actionIcon}>{action.icon}</ThemedText>
                <ThemedText type="body" weight="medium" style={styles.actionTitle}>
                  {action.title}
                </ThemedText>
                <ThemedText type="caption" style={styles.actionSubtitle}>
                  {action.subtitle}
                </ThemedText>
              </ThemedView>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Activity */}
        <ThemedText type="heading3" style={styles.sectionTitle}>
          فعالیت‌های اخیر
        </ThemedText>
        <ThemedView type="card" style={styles.activityCard}>
          <View style={styles.activityItem}>
            <View style={[styles.activityDot, { backgroundColor: donationColor }]} />
            <View style={styles.activityContent}>
              <ThemedText type="body" weight="medium">کمک نقدی دریافت شد</ThemedText>
              <ThemedText type="caption">خانواده احمدی - ۵۰۰,۰۰۰ تومان</ThemedText>
            </View>
            <ThemedText type="caption" style={styles.activityTime}>۲ ساعت پیش</ThemedText>
          </View>

          <View style={styles.activityItem}>
            <View style={[styles.activityDot, { backgroundColor: volunteerColor }]} />
            <View style={styles.activityContent}>
              <ThemedText type="body" weight="medium">داوطلب جدید ثبت‌نام کرد</ThemedText>
              <ThemedText type="caption">محمد رضایی - آماده کمک</ThemedText>
            </View>
            <ThemedText type="caption" style={styles.activityTime}>۴ ساعت پیش</ThemedText>
          </View>

          <View style={styles.activityItem}>
            <View style={[styles.activityDot, { backgroundColor: primaryColor }]} />
            <View style={styles.activityContent}>
              <ThemedText type="body" weight="medium">نیازمند جدید ثبت شد</ThemedText>
              <ThemedText type="caption">خانواده کریمی - ۴ نفره</ThemedText>
            </View>
            <ThemedText type="caption" style={styles.activityTime}>۶ ساعت پیش</ThemedText>
          </View>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xl,
  },
  welcome: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    opacity: 0.7,
  },
  signOutButton: {
    padding: Spacing.sm,
  },
  signOutText: {
    fontSize: 12,
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
    marginTop: Spacing.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    marginBottom: Spacing.md,
    borderTopWidth: 3,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statIcon: {
    fontSize: 20,
    marginLeft: Spacing.sm,
  },
  statLabel: {
    flex: 1,
    opacity: 0.7,
  },
  statValue: {
    marginBottom: Spacing.xs,
  },
  statSubtitle: {
    opacity: 0.5,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: 160,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: Spacing.md,
  },
  actionTitle: {
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  actionSubtitle: {
    textAlign: 'center',
    opacity: 0.7,
  },
  activityCard: {
    marginBottom: Spacing.xl,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: Spacing.md,
  },
  activityContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  activityTime: {
    opacity: 0.5,
  },
});
