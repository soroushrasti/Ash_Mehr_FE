import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, ScrollView, I18nManager, KeyboardAvoidingView, Platform } from 'react-native';
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

export default function SignInScreen() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, getCachedCredentials } = useAuth();
  const router = useRouter();
  const primaryColor = useThemeColor({}, 'primary');

  // Load cached credentials on component mount
  useEffect(() => {
    const loadCachedCredentials = async () => {
      try {
        const cached = await getCachedCredentials();
        if (cached) {
          setPhone(cached.phone);
          setPassword(cached.password);
        }
      } catch (error) {
        console.error('Failed to load cached credentials:', error);
      }
    };

    loadCachedCredentials();
  }, [getCachedCredentials]);

  const handleSignIn = async () => {
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
      const adminId = String(data.adminId ?? data.id ?? '');
      const userRole: 'Admin' | 'GroupAdmin' | undefined = data.userRole;
      const displayName: string | null = (data.name as string) || [data.firstName, data.lastName].filter(Boolean).join(' ') || null;

      if (userRole === 'GroupAdmin') {
        await signIn('GroupAdmin', adminId || 'group-id', phone, password, displayName);
        router.replace('/group-admin');
      } else {
        await signIn('Admin', adminId || 'admin-id', phone, password, displayName);
        router.replace('/admin');
      }
    } catch (e) {
      console.error('Login error:', e);
      setError('خطا در ورود. لطفاً دوباره تلاش کنید');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView type="container" style={styles.container}>
      <AppHeader title="آشیانه مهر" subtitle="خیریه‌ای برای همه" />

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
          {/* Logo and Welcome Section */}
          <ThemedView center style={styles.logoSection}>
            <View style={[styles.logoContainer, { borderColor: primaryColor, backgroundColor: withOpacity(primaryColor, 10) }]}>
              <Image source={require('@/assets/images/icon.png')} style={styles.logo} />
            </View>
            <ThemedText type="heading2" center style={styles.title}>
              خوش آمدید
            </ThemedText>
            <ThemedText type="caption" center style={styles.subtitle}>
              لطفا اطلاعات خود را وارد کنید
            </ThemedText>
          </ThemedView>

          {/* Login Form */}
          <ThemedView type="card" style={styles.formCard}>
            <InputField
              label="شماره تلفن"
              placeholder="09xxxxxxxxx"
              value={phone}
              onChangeText={setPhone}
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
              onPress={handleSignIn}
              fullWidth
              loading={loading}
            />

            <ThemedText type="caption" center style={styles.helpText}>
              برای کمک به نیازمندان وارد شوید
            </ThemedText>
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: Spacing['4xl'],
    paddingBottom: Spacing['4xl'],
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
  title: {
    marginBottom: Spacing.sm,
  },
  subtitle: {
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
