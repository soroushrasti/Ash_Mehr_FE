import {React, useState, useEffect} from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Spacing, BorderRadius } from '@/constants/Design';
import AppHeader from '@/components/AppHeader';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/components/AuthContext';

export default function VolunteerManagementPage() {
  const router = useRouter();
  const { user } = useAuth();

  const primaryColor = useThemeColor({}, 'primary');
  const successColor = useThemeColor({}, 'success');
  const warningColor = useThemeColor({}, 'warning');
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  const managementOptions = [
    {
      title: 'مدیریت اطلاعات مددجو',
      subtitle: 'مشاهده، ویرایش و حذف اطلاعات مددجویان',
      icon: '👥',
      gradient: ['#4facfe', '#00f2fe'],
      route: '/admin/needy-management',
      color: primaryColor,
      features: [
        'مشاهده لیست کامل مددجویان',
        'جزئیات کامل هر مددجو',
        'ویرایش اطلاعات',
        'حذف مددجو از سیستم',
        'ویرایش کمک ها'
      ]
    },
    {
      title: 'مدیریت اطلاعات مدیران و نماینده',
      subtitle: 'مشاهده، ویرایش و حذف اطلاعات مدیران و نمایندگان',
      icon: '👨‍💼',
      gradient: ['#667eea', '#764ba2'],
      route: '/admin/admin-management',
      color: successColor,
      features: [
        'مشاهده لیست مدیران و نمایندگان',
        'جزئیات کامل هر نماینده',
        'ویرایش اطلاعات نمایندگان',
        'حذف نماینده از سیستم'
      ]
    },
    {
      title: 'مدیریت اطلاعات مددجوهایی که قطع واریزی',
      subtitle: 'مشاهده، ویرایش و حذف اطلاعات مددجویان',
      icon: '👥',
      gradient: ['#8B5CF6', '#C084FC'],
      route: '/admin/disconnected-needy-management',
      color: primaryColor,
      features: [
        'مشاهده لیست کامل مددجویان',
        'جزئیات کامل هر مددجو',
        'ویرایش اطلاعات',
        'حذف مددجو از سیستم',
        'ویرایش کمک ها'
      ]
    },

  ];

  const ManagementCard = ({ option }: { option: typeof managementOptions[0] }) => (
    <TouchableOpacity
      style={[styles.managementCard, { backgroundColor: surfaceColor, borderColor }]}
      onPress={() => router.push(option.route as any)}
      activeOpacity={0.7}
    >
      {/* Background gradient */}
      <View style={styles.cardBackground}>
        <LinearGradient
          colors={[option.gradient[0], option.gradient[1], 'transparent']}
          style={styles.cardBackgroundGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </View>

      {/* Header with icon */}
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: option.color + '20' }]}>
          <ThemedText style={styles.cardIcon}>{option.icon}</ThemedText>
        </View>
        <View style={styles.cardTitleContainer}>
          <ThemedText style={[styles.cardTitle, { color: option.color }]}>
            {option.title}
          </ThemedText>
          <ThemedText style={[styles.cardSubtitle, { color: textColor }]}>
            {option.subtitle}
          </ThemedText>
        </View>
      </View>

      {/* Features list */}
      <View style={styles.featuresContainer}>
        {option.features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <View style={[styles.featureDot, { backgroundColor: option.color }]} />
            <ThemedText style={[styles.featureText, { color: textColor }]}>
              {feature}
            </ThemedText>
          </View>
        ))}
      </View>

      {/* Action arrow */}
      <View style={styles.cardFooter}>
        <View style={[styles.actionArrow, { backgroundColor: option.color }]}>
          <ThemedText style={styles.arrowIcon}>←</ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <AppHeader title="مدیریت اطلاعات" subtitle="مدیریت اطلاعات مددجویان و مدیران" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={[styles.headerSection, { backgroundColor: surfaceColor, borderColor }]}>
          <ThemedText style={[styles.headerTitle, { color: primaryColor }]}>
            🤝 مدیریت اطلاعات مددجویان و مدیران
          </ThemedText>
          <ThemedText style={[styles.headerDescription, { color: textColor }]}>
            از این بخش می‌توانید اطلاعات مددجویان و نمایندگان سیستم را مشاهده، ویرایش و مدیریت کنید.
          </ThemedText>
        </View>

        {/* Management Options */}
        <View style={styles.optionsContainer}>
          {managementOptions.map((option, index) => (
            <ManagementCard key={index} option={option} />
          ))}
        </View>

        {/* Quick Stats */}
        <View style={[styles.statsSection, { backgroundColor: surfaceColor, borderColor }]}>
          <ThemedText style={[styles.statsTitle, { color: textColor }]}>
            آمار سریع
          </ThemedText>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <ThemedText style={[styles.statNumber, { color: primaryColor }]}>
                👥
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: textColor }]}>
                مددجویان
              </ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={[styles.statNumber, { color: successColor }]}>
                👨‍💼
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: textColor }]}>
                مدیران
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Back Button */}
        <Button
          title="بازگشت به پنل مدیریت"
          onPress={() => router.back()}
          variant="outline"
          style={styles.backButton}
        />
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
  headerSection: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  headerDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.8,
  },
  optionsContainer: {
    gap: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  managementCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.xl,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardBackgroundGradient: {
    flex: 1,
    opacity: 0.05,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    zIndex: 1,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  cardIcon: {
    fontSize: 28,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
  },
  cardSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
  featuresContainer: {
    marginBottom: Spacing.lg,
    zIndex: 1,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: Spacing.sm,
  },
  featureText: {
    fontSize: 14,
    flex: 1,
  },
  cardFooter: {
    alignItems: 'flex-end',
    zIndex: 1,
  },
  actionArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowIcon: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statsSection: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  backButton: {
    marginBottom: Spacing['2xl'],
  },
});
