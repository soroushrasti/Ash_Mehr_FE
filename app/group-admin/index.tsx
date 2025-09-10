import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { SignOutButton } from '@/components/SignOutButton';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Spacing, BorderRadius } from '@/constants/Design';
import { withOpacity } from '@/utils/colorUtils';
import AppHeader from '@/components/AppHeader';
import SectionHeader from '@/components/SectionHeader';
import NeedyMap from '@/components/NeedyMap';
import { useAuth } from '@/components/AuthContext';

export default function GroupAdminHome() {
  const router = useRouter();
  const { userName } = useAuth();
  const primaryColor = useThemeColor({}, 'primary');
  const childrenColor = useThemeColor({}, 'children');
  const elderlyColor = useThemeColor({}, 'elderly');
  const educationColor = useThemeColor({}, 'education');
  const healthColor = useThemeColor({}, 'health');
  const emergencyColor = useThemeColor({}, 'error');
  const volunteerColor = useThemeColor({}, 'warning');
  const donationColor = useThemeColor({}, 'success');

  // Sample needy families data (replace with API later)
  const needyFamilies = [
    { id: 'g1', lat: 35.7062, lng: 51.392, name: 'خانواده قاسمی', info: 'نیاز به بسته ارزاق' },
    { id: 'g2', lat: 35.699, lng: 51.415, name: 'خانواده احمدی', info: 'اجاره معوق' },
    { id: 'g3', lat: 35.716, lng: 51.404, name: 'خانواده محمدی', info: 'درمان' },
    { id: 'g4', lat: 35.689, lng: 51.43, name: 'خانواده مرادی', info: 'لوازم‌التحریر' },
    { id: 'g5', lat: 35.68, lng: 51.41, name: 'خانواده یوسفی', info: 'کمک نقدی' },
  ];
  const needyCount = needyFamilies.length;

  const myTasks = [
    { title: 'ویزیت ماهانه', subtitle: 'خانواده‌های تحت پوشش', priority: 'high', icon: '🏠', dueDate: 'امروز' },
    { title: 'بررسی درخواست کمک', subtitle: 'خانواده جدید', priority: 'medium', icon: '📋', dueDate: 'فردا' },
    { title: 'گزارش فعالیت‌ها', subtitle: 'گزارش هفتگی', priority: 'low', icon: '📊', dueDate: '۳ روز دیگر' },
    { title: 'هماهنگی با داوطلبان', subtitle: 'برنامه‌ریزی کمک‌ها', priority: 'medium', icon: '🤝', dueDate: 'هفته آینده' },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return emergencyColor;
      case 'Medium': return volunteerColor;
      case 'Low': return donationColor;
      default: return primaryColor;
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'فوری';
      case 'medium': return 'متوسط';
      case 'low': return 'عادی';
      default: return 'عادی';
    }
  };

  return (
    <ThemedView type="container" style={styles.container}>
      <AppHeader
        title={`سلام${userName ? `، ${userName}` : ''} 👋`}
        subtitle="گروه شما: کودکان و نوجوانان منطقه ۲"
        rightAction={<SignOutButton />}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Map + Count Section */}
        <SectionHeader title="نقشه خانواده‌های مددجو" />
        <ThemedView type="card" style={{ padding: 0, overflow: 'hidden' }}>
          <NeedyMap points={needyFamilies} />
        </ThemedView>
        <ThemedText type="caption" style={{ marginTop: Spacing.sm, opacity: 0.8 }}>
          تعداد خانواده‌های مددجو: {needyCount}
        </ThemedText>

        {/* Quick Actions */}
        <SectionHeader title="عملیات سریع" />
        <View style={styles.quickActionsRow}>
          <Button
            title="ثبت مددجو جدید"
            onPress={() => router.push('/group-admin/register/select-role')}
            variant="primary"
            size="medium"
            icon={<ThemedText>➕</ThemedText>}
          />
          <Button
            title="درخواست کمک"
            onPress={() => {}}
            variant="secondary"
            size="medium"
            icon={<ThemedText>🆘</ThemedText>}
          />
        </View>

        {/* My Tasks */}
        <SectionHeader title="وظایف من" />
        <View style={styles.tasksContainer}>
          {myTasks.map((task, index) => (
            <ThemedView key={index} type="card" style={styles.taskCard}>
              <View style={styles.taskHeader}>
                <ThemedText type="body" weight="medium" style={styles.taskTitle}>
                  {task.title}
                </ThemedText>
                <View style={[styles.priorityBadge, { backgroundColor: withOpacity(getPriorityColor(task.priority), 20) }]}>
                  <ThemedText type="caption" style={[styles.priorityText, { color: getPriorityColor(task.priority) }]}>
                    {getPriorityText(task.priority)}
                  </ThemedText>
                </View>
              </View>
              <ThemedText type="caption" style={styles.taskSubtitle}>{task.subtitle}</ThemedText>
              <ThemedText type="caption" style={styles.dueDate}>{task.dueDate}</ThemedText>
            </ThemedView>
          ))}
        </View>

        {/* Recent Updates */}
        <SectionHeader title="آخرین به‌روزرسانی‌ها" />
        <ThemedView type="card" style={styles.updatesCard}>
          <View style={styles.updateItem}>
            <View style={[styles.updateDot, { backgroundColor: childrenColor }]} />
            <View style={styles.updateContent}>
              <ThemedText type="body" weight="medium">کمک جدید برای کودکان</ThemedText>
              <ThemedText type="caption">بسته‌های لوازم‌التحریر تحویل داده شد</ThemedText>
            </View>
            <ThemedText type="caption" style={styles.updateTime}>۱ ساعت پیش</ThemedText>
          </View>

          <View style={styles.updateItem}>
            <View style={[styles.updateDot, { backgroundColor: healthColor }]} />
            <View style={styles.updateContent}>
              <ThemedText type="body" weight="medium">ویزیت پزشکی انجام شد</ThemedText>
              <ThemedText type="caption">بررسی سلامت سالمندان گروه</ThemedText>
            </View>
            <ThemedText type="caption" style={styles.updateTime}>۳ ساعت پیش</ThemedText>
          </View>

          <View style={styles.updateItem}>
            <View style={[styles.updateDot, { backgroundColor: educationColor }]} />
            <View style={styles.updateContent}>
              <ThemedText type="body" weight="medium">کلاس آموزشی برگزار شد</ThemedText>
              <ThemedText type="caption">کلاس کامپیوتر برای نوجوانان</ThemedText>
            </View>
            <ThemedText type="caption" style={styles.updateTime}>۱ روز پیش</ThemedText>
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
  welcome: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    opacity: 0.7,
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
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 24,
    marginLeft: Spacing.md,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    marginBottom: Spacing.xs,
  },
  statLabel: {
    opacity: 0.7,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.lg,
  },
  tasksContainer: {
    marginBottom: Spacing.xl,
  },
  taskCard: {
    marginBottom: Spacing.md,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskTitle: {
    flex: 1,
  },
  taskSubtitle: {
    opacity: 0.7,
    marginTop: Spacing.xs,
  },
  taskMeta: {
    alignItems: 'flex-end',
  },
  priorityBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xs,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  dueDate: {
    opacity: 0.5,
  },
  updatesCard: {
    marginBottom: Spacing.xl,
  },
  updateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  updateDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: Spacing.md,
  },
  updateContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  updateTime: {
    opacity: 0.5,
  },
});
