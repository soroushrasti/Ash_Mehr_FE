import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Spacing } from '@/constants/Design';
import { withOpacity } from '@/utils/colorUtils';

export default function GroupAdminSelectRole() {
  const router = useRouter();
  const primaryColor = useThemeColor({}, 'primary');
  const childrenColor = useThemeColor({}, 'children');
  const elderlyColor = useThemeColor({}, 'elderly');
  const volunteerColor = useThemeColor({}, 'volunteer');

  // Group Admin can only register needy families (RegisterAdmin role is hardcoded as per requirements)
  const roles = [
    {
      id: 'needyFamily',
      title: 'خانواده مددجو',
      subtitle: 'ثبت خانواده‌ای که نیاز به کمک دارد',
      icon: '🏠',
      color: primaryColor,
      description: 'برای خانواده‌هایی که نیاز به حمایت مالی، غذایی یا سایر کمک‌ها دارند و تحت پوشش گروه شما قرار می‌گیرند',
      route: '/group-admin/register/form?role=NeedyFamily'
    },
    {
      id: 'child',
      title: 'کودک مددجو',
      subtitle: 'ثبت کودک تحت پوشش گروه',
      icon: '👶',
      color: childrenColor,
      description: 'برای کودکانی که نیاز به حمایت تحصیلی، غذایی یا درمانی دارند و در منطقه تحت پوشش شما زندگی می‌کنند',
      route: '/group-admin/register/form?role=Child'
    }
  ];

  return (
    <ThemedView type="container" style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="heading2" center style={styles.title}>
            انتخاب نوع ثبت‌نام
          </ThemedText>
          <ThemedText type="body" center style={styles.subtitle}>
            به عنوان نماینده گروه، می‌توانید افراد زیر را ثبت کنید
          </ThemedText>
        </View>

        {/* Role Cards */}
        <View style={styles.rolesContainer}>
          {roles.map((role, index) => (
            <TouchableOpacity key={index} onPress={() => router.push(role.route)}>
              <ThemedView type="card" style={styles.roleCard}>
                <View style={styles.roleContent}>
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

        {/* Group Admin Info */}
        <ThemedView type="card" style={styles.infoCard}>
          <ThemedText type="body" weight="medium" center style={styles.infoTitle}>
            اختیارات نماینده گروه 👥
          </ThemedText>
          <ThemedText type="caption" center style={styles.infoText}>
            شما به عنوان نماینده گروه می‌توانید مددجویان منطقه خود را ثبت کنید
          </ThemedText>
          <ThemedText type="caption" center style={styles.infoText}>
            تمام ثبت‌نام‌ها با شناسه نماینده گروه شما ذخیره می‌شوند
          </ThemedText>
        </ThemedView>

        {/* Help Section */}
        <ThemedView type="card" style={styles.helpCard}>
          <ThemedText type="body" weight="medium" center style={styles.helpTitle}>
            نیاز به راهنمایی دارید؟ 🤔
          </ThemedText>
          <ThemedText type="caption" center style={styles.helpText}>
            برای سوالات مربوط به ثبت‌نام یا تعیین نوع مددجو، با نماینده کل تماس بگیرید
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
  roleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  infoCard: {
    backgroundColor: 'rgba(46, 125, 50, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(46, 125, 50, 0.2)',
    marginBottom: Spacing.lg,
  },
  infoTitle: {
    marginBottom: Spacing.md,
    color: '#2E7D32',
  },
  infoText: {
    marginBottom: Spacing.sm,
    opacity: 0.7,
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
