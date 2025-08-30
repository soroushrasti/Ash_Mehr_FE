import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Spacing } from '@/constants/Design';
import { withOpacity } from '@/utils/colorUtils';

export default function AdminSelectRole() {
  const router = useRouter();
  const primaryColor = useThemeColor({}, 'primary');
  const childrenColor = useThemeColor({}, 'children');
  const elderlyColor = useThemeColor({}, 'elderly');
  const volunteerColor = useThemeColor({}, 'volunteer');

  const roles = [
    {
      id: 'needyFamily',
      title: 'خانواده نیازمند',
      subtitle: 'ثبت خانواده‌ای که نیاز به کمک دارد',
      icon: '🏠',
      color: primaryColor,
      description: 'برای خانواده‌هایی که نیاز به حمایت مالی، غذایی یا سایر کمک‌ها دارند',
      route: '/admin/register/form?role=NeedyFamily'
    },
    {
      id: 'child',
      title: 'کودک نیازمند',
      subtitle: 'ثبت کودک تحت پوشش خیریه',
      icon: '👶',
      color: childrenColor,
      description: 'برای کودکانی که نیاز به حمایت تحصیلی، غذایی یا درمانی دارند',
      route: '/admin/register/form?role=Child'
    },
    {
      id: 'elderly',
      title: 'سالمند نیازمند',
      subtitle: 'ثبت سالمند تحت پوشش خیریه',
      icon: '👴',
      color: elderlyColor,
      description: 'برای سالمندانی که نیاز به مراقبت، دارو یا کمک‌های درمانی دارند',
      route: '/admin/register/form?role=Elderly'
    },
    {
      id: 'volunteer',
      title: 'داوطلب جدید',
      subtitle: 'ثبت فرد داوطلب برای کمک',
      icon: '🤝',
      color: volunteerColor,
      description: 'برای افرادی که می‌خواهند به عنوان داوطلب در فعالیت‌های خیریه شرکت کنند',
      route: '/admin/register/form?role=Volunteer'
    }
  ];

  const handleRoleSelect = (role) => {
    router.push(role.route);
  };

  return (
    <ThemedView type="container" style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="heading2" center style={styles.title}>
            انتخاب نوع ثبت‌نام
          </ThemedText>
          <ThemedText type="body" center style={styles.subtitle}>
            لطفاً نوع فردی که می‌خواهید ثبت کنید را انتخاب نمایید
          </ThemedText>
        </View>

        {/* Role Cards */}
        <View style={styles.rolesContainer}>
          {roles.map((role) => (
            <TouchableOpacity
              key={role.id}
              onPress={() => router.push(role.route)}
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
        <ThemedView type="card" style={styles.helpCard}>
          <ThemedText type="body" weight="medium" center style={styles.helpTitle}>
            نیاز به راهنمایی دارید؟ 🤔
          </ThemedText>
          <ThemedText type="caption" center style={styles.helpText}>
            اگر مطمئن نیستید که کدام نوع ثبت‌نام مناسب است، با تیم پشتیبانی تماس بگیرید
          </ThemedText>
          <ThemedText type="caption" center style={[styles.contactInfo, { color: primaryColor }]}>
            تلفن: ۰۲۱-۱۲۳۴۵۶۷۸
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
  header: {
    marginBottom: Spacing['4xl'],
    paddingTop: Spacing.xl,
  },
  title: {
    marginBottom: Spacing.md,
  },
  subtitle: {
    opacity: 0.7,
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
    backgroundColor: 'rgba(46, 125, 50, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(46, 125, 50, 0.2)',
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
