import React from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { SignOutButton } from '@/components/SignOutButton';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Spacing } from '@/constants/Design';
import { withOpacity } from '@/utils/colorUtils';
import AppHeader from '@/components/AppHeader';
import SectionHeader from '@/components/SectionHeader';

export default function HomeScreen() {
  const primaryColor = useThemeColor({}, 'primary');
  const donationColor = useThemeColor({}, 'donation');
  const volunteerColor = useThemeColor({}, 'volunteer');
  const childrenColor = useThemeColor({}, 'children');
  const elderlyColor = useThemeColor({}, 'elderly');
  const borderColor = useThemeColor({}, 'border');

  const charityStats = [
    { label: 'خانواده‌های کمک شده', value: '۲,۵۰۰+', icon: '🏠', color: primaryColor },
    { label: 'کودکان تحت پوشش', value: '۱,۲۰۰+', icon: '👶', color: childrenColor },
    { label: 'داوطلبان فعال', value: '۳۵۰+', icon: '🤝', color: volunteerColor },
    { label: 'کمک‌های ارسالی', value: '۵,۰۰۰+', icon: '💝', color: donationColor },
  ];

  const recentActivities = [
    {
      title: 'توزیع بسته‌های غذایی',
      subtitle: 'برای ۱۰۰ خانواده مددجو',
      time: 'امروز',
      icon: '🍲',
      color: donationColor
    },
    {
      title: 'کلاس آموزشی کودکان',
      subtitle: 'آموزش کامپیوتر و زبان انگلیسی',
      time: 'دیروز',
      icon: '📚',
      color: childrenColor
    },
    {
      title: 'ویزیت پزشکی رایگان',
      subtitle: 'معاینه سالمندان محله',
      time: '۲ روز پیش',
      icon: '👨‍⚕️',
      color: elderlyColor
    }
  ];

  return (
    <ThemedView type="container" style={styles.container}>
      <AppHeader
        title="کامر 🏠"
        subtitle="جایی برای مهربانی و امید"
        rightAction={<SignOutButton />}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Mission Statement */}
        <ThemedView type="card" style={[styles.missionCard, { backgroundColor: withOpacity(primaryColor, 10) }]}>
          <ThemedText type="heading3" center style={[styles.missionTitle, { color: primaryColor }]}>
            ماموریت ما
          </ThemedText>
          <ThemedText type="body" center style={styles.missionText}>
            کمک به خانواده‌های مددجو، حمایت از کودکان و سالمندان، و ایجاد جامعه‌ای پر از مهربانی و همدلی
          </ThemedText>
        </ThemedView>

        {/* Statistics */}
        <SectionHeader title="تأثیر ما در جامعه" />
        <View style={styles.statsContainer}>
          {charityStats.map((stat, index) => (
            <ThemedView key={index} type="card" style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: withOpacity(stat.color, 20) }]}>
                <ThemedText style={styles.statIcon}>{stat.icon}</ThemedText>
              </View>
              <ThemedText type="heading3" style={[styles.statValue, { color: stat.color }]}>
                {stat.value}
              </ThemedText>
              <ThemedText type="caption" style={styles.statLabel}>
                {stat.label}
              </ThemedText>
            </ThemedView>
          ))}
        </View>

        {/* How to Help */}
        <SectionHeader title="چگونه کمک کنیم؟" />
        <View style={styles.helpGrid}>
          <TouchableOpacity style={styles.helpCard}>
            <ThemedView type="card" style={styles.helpCardContent}>
              <ThemedText style={styles.helpIcon}>💰</ThemedText>
              <ThemedText type="body" weight="medium" center>کمک مالی</ThemedText>
              <ThemedText type="caption" center style={styles.helpDescription}>
                با کمک‌های نقدی به خانواده‌های مددجو یاری برسانید
              </ThemedText>
            </ThemedView>
          </TouchableOpacity>

          <TouchableOpacity style={styles.helpCard}>
            <ThemedView type="card" style={styles.helpCardContent}>
              <ThemedText style={styles.helpIcon}>🤝</ThemedText>
              <ThemedText type="body" weight="medium" center>داوطلبی</ThemedText>
              <ThemedText type="caption" center style={styles.helpDescription}>
                وقت خود را در راستای کمک به دیگران اختصاص دهید
              </ThemedText>
            </ThemedView>
          </TouchableOpacity>
        </View>

        {/* Recent Activities */}
        <SectionHeader title="فعالیت‌های اخیر" />
        <View style={styles.activitiesContainer}>
          {recentActivities.map((activity, index) => (
            <View key={index} style={[styles.activityItem, { borderBottomColor: withOpacity(borderColor, 10) }]}>
              <View style={[styles.activityIconContainer, { backgroundColor: withOpacity(activity.color, 20) }]}>
                <ThemedText style={styles.activityIcon}>{activity.icon}</ThemedText>
              </View>
              <View style={styles.activityContent}>
                <ThemedText type="body" weight="medium">{activity.title}</ThemedText>
                <ThemedText type="caption" style={styles.activitySubtitle}>
                  {activity.subtitle}
                </ThemedText>
              </View>
              <ThemedText type="caption" style={styles.activityTime}>
                {activity.time}
              </ThemedText>
            </View>
          ))}
        </View>

        {/* Contact */}
        <ThemedView type="card" style={[styles.contactCard, { borderColor: withOpacity(primaryColor, 20), backgroundColor: withOpacity(primaryColor, 5) }]}>
          <ThemedText type="heading3" center style={[styles.contactTitle, { color: primaryColor }]}>
            با ما در تماس باشید
          </ThemedText>
          <ThemedText type="body" center style={[styles.contactInfo, { color: primaryColor }]}>
            📞 تلفن: ۰۲۱-۱۲۳۴۵۶۷۸
          </ThemedText>
          <ThemedText type="body" center style={[styles.contactInfo, { color: primaryColor }]}>
            📧 ایمیل: info@ashyaneh-mehr.ir
          </ThemedText>
          <ThemedText type="body" center style={[styles.contactInfo, { color: primaryColor }]}>
            📍 آدرس: تهران، خیابان آزادی، پلاک ۱۲۳
          </ThemedText>
        </ThemedView>

        {/* Sign Out Button */}
        <View style={styles.signOutContainer}>
          <SignOutButton />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  missionCard: {
    marginTop: Spacing.xl,
    marginBottom: Spacing['3xl'],
    padding: Spacing.xl,
  },
  missionTitle: {
    marginBottom: Spacing.md,
  },
  missionText: {
    lineHeight: 24,
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
    marginTop: Spacing.xl,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingVertical: Spacing.xl,
  },
  statIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  statIcon: {
    fontSize: 28,
  },
  statValue: {
    marginBottom: Spacing.xs,
  },
  statLabel: {
    textAlign: 'center',
    opacity: 0.7,
  },
  helpGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  helpCard: {
    width: '48%',
  },
  helpCardContent: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  helpIcon: {
    fontSize: 32,
    marginBottom: Spacing.md,
  },
  helpDescription: {
    marginTop: Spacing.sm,
    opacity: 0.7,
    textAlign: 'center',
  },
  activitiesContainer: {
    marginBottom: Spacing.xl,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.md,
  },
  activityIcon: {
    fontSize: 20,
  },
  activityContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  activitySubtitle: {
    opacity: 0.7,
    marginTop: Spacing.xs,
  },
  activityTime: {
    opacity: 0.5,
  },
  contactCard: {
    marginTop: Spacing.xl,
    marginBottom: Spacing['4xl'],
  },
  contactTitle: {
    marginBottom: Spacing.lg,
  },
  contactInfo: {
    marginBottom: Spacing.sm,
  },
  signOutContainer: {
    marginTop: Spacing.xl,
    marginBottom: Spacing['4xl'],
    alignItems: 'center',
  },
});
