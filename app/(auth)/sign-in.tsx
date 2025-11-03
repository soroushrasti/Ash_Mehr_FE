import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, ScrollView, I18nManager, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/components/AuthContext';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { InputField } from '@/components/InputField';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Spacing } from '@/constants/Design';
import AppHeader from '@/components/AppHeader';
import { withOpacity } from '@/utils/colorUtils';
import { apiService } from '@/services/apiService';

// Enable RTL layout for Farsi
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

type LoginMode = 'select' | 'admin' | 'needy';

export default function SignInScreen() {
  const [mode, setMode] = useState<LoginMode>('select');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, getCachedCredentials } = useAuth();
  const router = useRouter();
  const primaryColor = useThemeColor({}, 'primary');
  const successColor = useThemeColor({}, 'success');

  // Load cached credentials on component mount (only for admin)
  useEffect(() => {
    const loadCachedCredentials = async () => {
      if (mode === 'admin') {
        try {
          const cached = await getCachedCredentials();
          if (cached) {
            setPhone(cached.phone);
            setPassword(cached.password);
          }
        } catch (error) {
          console.error('Failed to load cached credentials:', error);
        }
      }
    };

    loadCachedCredentials();
  }, [getCachedCredentials, mode]);

  const handleAdminSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      const resp = await apiService.login(phone, password);

      if (!resp.success) {
        setError(resp.error || 'ورود ناموفق بود');
        setLoading(false);
        return;
      }

      const data: any = resp.data || {};
      const adminId = String(data.adminID ?? data.id ?? '');
      const userRole: 'Admin' | 'GroupAdmin' | undefined = data.userRole;
      const displayName: string | null = (data.name as string) || [data.firstName, data.lastName].filter(Boolean).join(' ') || null;

      if (userRole === 'GroupAdmin') {
        await signIn('GroupAdmin', adminId, phone, password, displayName);
        router.replace('/group-admin');
      } else {
        await signIn('Admin', adminId, phone, password, displayName);
        router.replace('/admin');
      }
    } catch (e) {
      console.error('Login error:', e);
      setError('خطا در ورود. لطفاً دوباره تلاش کنید');
    } finally {
      setLoading(false);
    }
  };

  const handleNeedySignIn = async () => {
    setLoading(true);
    setError('');

    try {
      const resp = await apiService.signinNeedy(phone);
      if (!resp.success) {
        setError(resp.error || 'ورود ناموفق بود');
        setLoading(false);
        return;
      }

      const data: any = resp.data || {};
      const needyId = String(data.needyID ?? data.id ?? '');
      const displayName: string | null = (data.name as string) || [data.firstName, data.lastName].filter(Boolean).join(' ') || null;

      await signIn('Needy', needyId, phone, '', displayName);
      // Use setTimeout to ensure state is updated before navigation
      setTimeout(() => {
        router.replace('/needy');
      }, 100);
    } catch (e) {
      console.error('Needy signin error:', e);
      setError('خطا در ورود. لطفاً دوباره تلاش کنید');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setPhone('');
    setPassword('');
    setError('');
  };

  const handleModeChange = (newMode: LoginMode) => {
    setMode(newMode);
    resetForm();
  };

  // Selection Screen
  if (mode === 'select') {
    return (
      <ThemedView type="container" style={styles.container}>
        <AppHeader title="کامر" subtitle="خیریه‌ای برای همه" />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Logo and Welcome Section */}
          <ThemedView center style={styles.logoSection}>
            <View style={[styles.logoContainer, { borderColor: primaryColor, backgroundColor: withOpacity(primaryColor, 10) }]}>
              <Image source={require('@/assets/images/icon.png')} style={styles.logo} />
            </View>
            <ThemedText type="heading1" center style={styles.mainTitle}>
              خوش آمدید
            </ThemedText>
            <ThemedText type="body" center style={styles.subtitle}>
              لطفاً نوع کاربری خود را انتخاب کنید
            </ThemedText>
          </ThemedView>

          {/* User Type Selection */}
          <View style={styles.userTypeContainer}>
            {/* Admin/Group Admin Card */}
            <TouchableOpacity
              style={[styles.userTypeCard, { borderColor: primaryColor }]}
              onPress={() => handleModeChange('admin')}
              activeOpacity={0.7}
            >
              <View style={[styles.userTypeIcon, { backgroundColor: withOpacity(primaryColor, 15) }]}>
                <ThemedText style={styles.userTypeEmoji}>👨‍💼</ThemedText>
              </View>
              <ThemedText type="heading3" center style={[styles.userTypeTitle, { color: primaryColor }]}>
                مدیران و نمایندگان
              </ThemedText>
              <ThemedText type="caption" center style={styles.userTypeDesc}>
                ورود با نام کاربری و رمز عبور
              </ThemedText>
              <View style={styles.userTypeFeatures}>
                <ThemedText type="caption" style={styles.userTypeFeature}>• مدیریت مددجویان</ThemedText>
                <ThemedText type="caption" style={styles.userTypeFeature}>• نظارت بر فعالیت‌ها</ThemedText>
                <ThemedText type="caption" style={styles.userTypeFeature}>• گزارش‌گیری</ThemedText>
              </View>
            </TouchableOpacity>

            {/* Needy Person Card */}
            <TouchableOpacity
              style={[styles.userTypeCard, { borderColor: successColor }]}
              onPress={() => handleModeChange('needy')}
              activeOpacity={0.7}
            >
              <View style={[styles.userTypeIcon, { backgroundColor: withOpacity(successColor, 15) }]}>
                <ThemedText style={styles.userTypeEmoji}>🏠</ThemedText>
              </View>
              <ThemedText type="heading3" center style={[styles.userTypeTitle, { color: successColor }]}>
                مددجویان
              </ThemedText>
              <ThemedText type="caption" center style={styles.userTypeDesc}>
                ورود تنها با شماره تلفن
              </ThemedText>
              <View style={styles.userTypeFeatures}>
                <ThemedText type="caption" style={styles.userTypeFeature}>• مشاهده اطلاعات شخصی</ThemedText>
                <ThemedText type="caption" style={styles.userTypeFeature}>• دریافت اطلاعیه‌ها</ThemedText>
                <ThemedText type="caption" style={styles.userTypeFeature}>• تماس با مسئولان</ThemedText>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ThemedView>
    );
  }

  // Admin Login Form
  if (mode === 'admin') {
    return (
      <ThemedView type="container" style={styles.container}>
        <AppHeader title="کامر" subtitle="ورود مدیران و نمایندگان" />

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={() => handleModeChange('select')}>
              <ThemedText style={styles.backButtonText}>← بازگشت</ThemedText>
            </TouchableOpacity>

            {/* Admin Icon */}
            <ThemedView center style={styles.loginHeaderSection}>
              <View style={[styles.loginIcon, { backgroundColor: withOpacity(primaryColor, 15) }]}>
                <ThemedText style={styles.loginEmoji}>👨‍💼</ThemedText>
              </View>
              <ThemedText type="heading2" center style={styles.loginTitle}>
                ورود مدیران و نمایندگان
              </ThemedText>
              <ThemedText type="caption" center style={styles.loginSubtitle}>
                لطفا اطلاعات خود را وارد کنید
              </ThemedText>
            </ThemedView>

            {/* Login Form */}
            <ThemedView type="card" style={styles.formCard}>
              <InputField
                label="شماره تلفن"
                placeholder="09xxxxxxxxx"
                value={phone}
                onChangeText={(text) => {
                  // فقط اعداد و حداکثر ۱۱ رقم
                  const cleanText = text.replace(/[^0-9۰-۹]/g, '').slice(0, 11);
                  setPhone(cleanText);
                }}
                keyboardType="phone-pad"
                leftIcon={<ThemedText>📱</ThemedText>}
              />

              <InputField
                label="رمز عبور"
                placeholder="رمز عبور خود را وارد کنید"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                leftIcon={<ThemedText>🔒</ThemedText>}
                error={error}
              />

              <Button
                title="ورود"
                onPress={handleAdminSignIn}
                fullWidth
                loading={loading}
              />
            </ThemedView>
          </ScrollView>
        </KeyboardAvoidingView>
      </ThemedView>
    );
  }

  // Needy Login Form
  if (mode === 'needy') {
    return (
      <ThemedView type="container" style={styles.container}>
        <AppHeader title="کامر" subtitle="ورود مددجویان" />

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={() => handleModeChange('select')}>
              <ThemedText style={styles.backButtonText}>← بازگشت</ThemedText>
            </TouchableOpacity>

            {/* Needy Icon */}
            <ThemedView center style={styles.loginHeaderSection}>
              <View style={[styles.loginIcon, { backgroundColor: withOpacity(successColor, 15) }]}>
                <ThemedText style={styles.loginEmoji}>🏠</ThemedText>
              </View>
              <ThemedText type="heading2" center style={styles.loginTitle}>
                ورود مددجویان
              </ThemedText>
              <ThemedText type="caption" center style={styles.loginSubtitle}>
                تنها شماره تلفن خود را وارد کنید
              </ThemedText>
            </ThemedView>

            {/* Login Form */}
            <ThemedView type="card" style={styles.formCard}>
              <InputField
                label="شماره تلفن"
                placeholder="09xxxxxxxxx"
                value={phone}
                onChangeText={(text) => {
                  // فقط اعداد و حداکثر ۱۱ رقم
                  const cleanText = text.replace(/[^0-9۰-۹]/g, '').slice(0, 11);
                  setPhone(cleanText);
                }}
                keyboardType="phone-pad"
                leftIcon={<ThemedText>📱</ThemedText>}
                error={error}
              />

              <Button
                title="ورود"
                onPress={handleNeedySignIn}
                fullWidth
                loading={loading}
                variant="success"
              />

              <ThemedText type="caption" center style={styles.helpText}>
                با شماره تلفن ثبت شده در سیستم وارد شوید
              </ThemedText>
            </ThemedView>
          </ScrollView>
        </KeyboardAvoidingView>
      </ThemedView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: Spacing['2xl'],
    paddingHorizontal: Spacing.lg,
  },
  logoSection: {
    marginBottom: Spacing['4xl'],
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  mainTitle: {
    marginBottom: Spacing.md,
  },
  subtitle: {
    opacity: 0.7,
  },
  userTypeContainer: {
    gap: Spacing.xl,
  },
  userTypeCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 2,
    padding: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  userTypeIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  userTypeEmoji: {
    fontSize: 40,
  },
  userTypeTitle: {
    marginBottom: Spacing.sm,
  },
  userTypeDesc: {
    opacity: 0.7,
    marginBottom: Spacing.lg,
  },
  userTypeFeatures: {
    gap: Spacing.xs,
  },
  userTypeFeature: {
    opacity: 0.6,
    textAlign: 'right',
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  backButtonText: {
    fontSize: 16,
    opacity: 0.7,
  },
  loginHeaderSection: {
    marginBottom: Spacing['3xl'],
  },
  loginIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  loginEmoji: {
    fontSize: 36,
  },
  loginTitle: {
    marginBottom: Spacing.sm,
  },
  loginSubtitle: {
    opacity: 0.7,
  },
  formCard: {
    marginBottom: Spacing.xl,
  },
  helpText: {
    marginTop: Spacing.lg,
    opacity: 0.6,
  },
});
