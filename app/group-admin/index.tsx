import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Spacing, BorderRadius } from '@/constants/Design';
import { withOpacity } from '@/utils/colorUtils';

export default function GroupAdminHome() {
  const { signOut, userId } = useAuth();
  const router = useRouter();
  const primaryColor = useThemeColor({}, 'primary');
  const childrenColor = useThemeColor({}, 'children');
  const elderlyColor = useThemeColor({}, 'elderly');
  const educationColor = useThemeColor({}, 'education');
  const healthColor = useThemeColor({}, 'health');
  const emergencyColor = useThemeColor({}, 'error');
  const volunteerColor = useThemeColor({}, 'warning');
  const donationColor = useThemeColor({}, 'success');

  const myGroupStats = [
    { label: 'کودکان تحت پوشش', value: '۲۵', subtitle: 'کودک', color: childrenColor, icon: '👶' },
    { label: 'سالمندان', value: '۱۸', subtitle: 'نفر', color: elderlyColor, icon: '👴' },
    { label: 'دانش‌آموزان', value: '۳۲', subtitle: 'نفر', color: educationColor, icon: '🎓' },
    { label: 'بیماران', value: '۱۲', subtitle: 'نفر', color: healthColor, icon: '🏥' },
  ];

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
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <ThemedText type="heading2" style={styles.welcome}>
              سلام مدیر گروه عزیز! 👋
            </ThemedText>
            <ThemedText type="body" style={styles.subtitle}>
              گروه شما: کودکان و نوجوانان منطقه ۲
            </ThemedText>
          </View>
          <TouchableOpacity onPress={signOut} style={styles.signOutButton}>
            <ThemedText type="caption" style={[styles.signOutText, { color: useThemeColor({}, 'error') }]}>
              خروج 🚪
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Group Statistics */}
        <ThemedText type="heading3" style={styles.sectionTitle}>
          آمار گروه شما
        </ThemedText>
        <View style={styles.statsGrid}>
          {myGroupStats.map((stat, index) => (
            <ThemedView key={index} type="card" style={[styles.statCard, { borderLeftColor: stat.color, borderLeftWidth: 4 }]}>
              <View style={styles.statHeader}>
                <ThemedText style={styles.statIcon}>{stat.icon}</ThemedText>
                <View style={styles.statContent}>
                  <ThemedText type="heading3" style={[styles.statValue, { color: stat.color }]}>
                    {stat.value}
                  </ThemedText>
                  <ThemedText type="caption" style={styles.statLabel}>
                    {stat.label}
                  </ThemedText>
                </View>
              </View>
            </ThemedView>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsRow}>
          <Button
            title="ثبت نیازمند جدید"
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
        <ThemedText type="heading3" style={styles.sectionTitle}>
          وظایف من
        </ThemedText>
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
        <ThemedText type="heading3" style={styles.sectionTitle}>
          آخرین به‌روزرسانی‌ها
        </ThemedText>
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
