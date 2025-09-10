import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Spacing } from '@/constants/Design';
import { withOpacity } from '@/utils/colorUtils';
import AppHeader from '@/components/AppHeader';
import SectionHeader from '@/components/SectionHeader';

export default function AdminSelectRole() {
  const router = useRouter();
  const primaryColor = useThemeColor({}, 'primary');
  const childrenColor = useThemeColor({}, 'children');
  const elderlyColor = useThemeColor({}, 'elderly');
  const volunteerColor = useThemeColor({}, 'volunteer');

  const roles = [
    {
      id: 'needyFamily',
      title: 'خانواده مددجو',
      subtitle: 'ثبت خانواده‌ای که نیاز به کمک دارد',
      icon: '🏠',
      color: primaryColor,
      description: 'برای خانواده‌هایی که نیاز به حمایت مالی، غذایی یا سایر کمک‌ها دارند',
      route: '/admin/register/form?role=NeedyFamily'
    },
    {
      id: 'child',
      title: 'کودک مددجو',
      subtitle: 'ثبت کودک تحت پوشش خیریه',
      icon: '👶',
      color: childrenColor,
      description: 'برای کودکانی که نیاز به حمایت تحصیلی، غذایی یا درمانی دارند',
      route: '/admin/register/form?role=Child'
    },
    {
      id: 'volunteer',
      title: 'نماینده گروه جدید',
      subtitle: 'ثبت فرد نماینده گروه',
      icon: '🤝',
      color: volunteerColor,
      description: 'ایجاد کاربر داوطلب با نقش نماینده گروه برای مدیریت گروه‌ها',
      route: '/admin/register/admin-user?mode=volunteer'
    },
    {
      id: 'admin',
      title: 'نماینده جدید',
      subtitle: 'افزودن نماینده سیستم',
      icon: '🧩',
      color: primaryColor,
      description: 'ایجاد کاربر نماینده با نقش نماینده برای مدیریت کل سیستم',
      route: '/admin/register/admin-user?mode=admin'
    }
  ];

  return (
    <ThemedView type="container" style={styles.container}>
      <AppHeader title="انتخاب نوع ثبت‌نام" subtitle="لطفاً نوع مورد نظر را انتخاب کنید" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <SectionHeader title="انواع ثبت‌نام" />
        <View style={styles.rolesContainer}>
          {roles.map((role) => (
            <TouchableOpacity
              key={role.id}
              onPress={() => router.push({ pathname: role.route as any })}
              style={styles.roleCardWrapper}
            >
              <ThemedView type="card" style={[styles.roleCard, { borderRightColor: role.color, borderRightWidth: 4 }]}>
                <View style={styles.roleHeader}>
                  <View style={[styles.iconContainer, { backgroundColor: withOpacity(role.color, 20) }]}>
                    <ThemedText style={styles.roleIcon}>{role.icon}</ThemedText>
                  </View>
                  <View style={styles.roleInfo}>
                    <ThemedText type="heading3" style={[styles.roleTitle, { color: role.color }]}>
                      {role.title}
                    </ThemedText>
                    <ThemedText type="caption" style={styles.roleSubtitle}>
                      {role.subtitle}
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.arrowIcon}>←</ThemedText>
                </View>
                <ThemedText type="body" style={styles.roleDescription}>
                  {role.description}
                </ThemedText>
              </ThemedView>
            </TouchableOpacity>
          ))}
        </View>

        {/* Help Section */}
        <ThemedView type="card" style={[styles.helpCard, { backgroundColor: withOpacity(primaryColor, 5), borderColor: withOpacity(primaryColor, 20) }]}>
          <ThemedText type="body" weight="medium" center style={[styles.helpTitle, { color: primaryColor }]}>
            نیاز به راهنمایی دارید؟ 🤔
          </ThemedText>
          <ThemedText type="caption" center style={styles.helpText}>
            اگر مطمئن نیستید که کدام نوع ثبت‌نام مناسب است، با تیم پشتیبانی تماس بگیرید
          </ThemedText>
          <ThemedText type="caption" center style={[styles.contactInfo, { color: primaryColor }]}>
            تلفن: ۰۳۱۳۴۵۱۱۰۳۲-
          </ThemedText>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  rolesContainer: {
    marginBottom: Spacing['3xl'],
  },
  roleCardWrapper: {
    marginBottom: Spacing.lg,
  },
  roleCard: {
    padding: Spacing.xl,
  },
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.md,
  },
  roleIcon: {
    fontSize: 24,
  },
  roleInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  roleTitle: {
    marginBottom: Spacing.xs,
  },
  roleSubtitle: {
    opacity: 0.7,
  },
  arrowIcon: {
    fontSize: 18,
    opacity: 0.5,
  },
  roleDescription: {
    opacity: 0.8,
    lineHeight: 22,
  },
  helpCard: {
    borderWidth: 1,
  },
  helpTitle: {
    marginBottom: Spacing.md,
  },
  helpText: {
    marginBottom: Spacing.md,
    opacity: 0.7,
  },
  contactInfo: {
    fontWeight: 'bold',
  },
});
