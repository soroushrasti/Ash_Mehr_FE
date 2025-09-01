import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, ScrollView, I18nManager } from 'react-native';
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

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
        console.log('Login attempt:', phone, password);
      if (phone === '1234' && password === 'admin') {
        console.log('Admin login matched, calling signIn...');
        await signIn('Admin', 'admin-id-001', phone, password);
        console.log('signIn completed, redirecting to admin...');
        router.replace('/admin');
      } else if (phone === '12345' && password === 'group') {
        console.log('Group admin login matched, calling signIn...');
        await signIn('GroupAdmin', 'group-id-001', phone, password);
        console.log('signIn completed, redirecting to group-admin...');
        router.replace('/group-admin');
      } else {
        console.log('Login failed - credentials do not match');
        setError('شماره تلفن یا رمز عبور اشتباه است');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('خطا در ذخیره اطلاعات ورود');
    }

    setLoading(false);
  };

  return (
    <ThemedView type="container" style={styles.container}>
      <AppHeader title="آشیانه مهر" subtitle="خیریه‌ای برای همه" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
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

        {/* Demo Credentials */}
        <ThemedView type="card" style={[styles.demoCard, { backgroundColor: withOpacity(primaryColor, 5), borderColor: withOpacity(primaryColor, 20) }]}>
          <ThemedText type="body" weight="medium" center style={[styles.demoTitle, { color: primaryColor }]}>
            اطلاعات ورود نمونه:
          </ThemedText>
          <ThemedText type="caption" center style={[styles.demoText, { color: primaryColor }]}>
            مدیر کل: 1234 / admin
          </ThemedText>
          <ThemedText type="caption" center style={[styles.demoText, { color: primaryColor }]}>
            مدیر گروه: 12345 / group
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: Spacing['4xl'],
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
  demoCard: {
    borderWidth: 1,
  },
  demoTitle: {
    marginBottom: Spacing.md,
  },
  demoText: {
    marginBottom: Spacing.xs,
  },
});
