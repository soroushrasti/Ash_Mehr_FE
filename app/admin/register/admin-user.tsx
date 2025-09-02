import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { InputField } from '@/components/InputField';
import { Button } from '@/components/Button';
import AppHeader from '@/components/AppHeader';
import { Spacing } from '@/constants/Design';
import { apiService } from '@/services/apiService';
import { AdminCreate } from '@/types/api';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useAuth } from '@/components/AuthContext';

export default function AdminUserForm() {
  const { mode } = useLocalSearchParams(); // 'volunteer' | 'admin'
  const router = useRouter();
  const { userId } = useAuth();

  const isVolunteer = mode === 'volunteer';
  const title = isVolunteer ? 'افزودن داوطلب (مدیر گروه)' : 'افزودن مدیر جدید';
  const primary = useThemeColor({}, 'primary');

  const [form, setForm] = useState({
    FirstName: '',
    LastName: '',
    Phone: '',
    PostCode: '',
    Email: '',
    City: '',
    Province: '',
    Street: '',
    NationalID: '',
    Password: ''
  });
  const [loading, setLoading] = useState(false);

  const setField = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const onSubmit = async () => {
    const numericUserId = typeof userId === 'string' && !isNaN(Number(userId)) ? Number(userId) : undefined;

    const payload: AdminCreate = {
      FirstName: form.FirstName,
      LastName: form.LastName,
      Phone: form.Phone || undefined,
      PostCode: form.PostCode || undefined,
      Email: form.Email || undefined,
      City: form.City || undefined,
      Province: form.Province || undefined,
      Street: form.Street || undefined,
      NationalID: form.NationalID || undefined,
      UserRole: isVolunteer ? 'GroupAdmin' : 'Admin',
      Password: form.Password,
    };

    setLoading(true);
    const res = await apiService.createAdmin(payload);
    setLoading(false);

    if (res.success) {
      Alert.alert('موفق', isVolunteer ? 'داوطلب با نقش مدیرگروه ایجاد شد.' : 'مدیر جدید ایجاد شد.', [
        { text: 'باشه', onPress: () => router.back() },
      ]);
    } else {
      Alert.alert('خطا', res.error || 'خطای ناشناخته');
    }
  };

  return (
    <ThemedView type="container" style={{ flex: 1 }}>
      <AppHeader title={title} subtitle={isVolunteer ? 'نقش: مدیر گروه' : 'نقش: مدیر کل'} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <ThemedView type="card" style={{ marginBottom: Spacing.xl }}>
          <ThemedText type="heading3" style={{ marginBottom: Spacing.md, color: primary }}>
            اطلاعات کاربر
          </ThemedText>

          <InputField label="نام" value={form.FirstName} onChangeText={v => setField('FirstName', v)} />
          <InputField label="نام خانوادگی" value={form.LastName} onChangeText={v => setField('LastName', v)} />
          <InputField label="رمز عبور" value={form.Password} onChangeText={v => setField('Password', v)} secureTextEntry />
          <InputField label="شماره تلفن" value={form.Phone} onChangeText={v => setField('Phone', v)} keyboardType="phone-pad" />
          <InputField label="ایمیل" value={form.Email} onChangeText={v => setField('Email', v)} keyboardType="email-address" />
          <InputField label="کد پستی" value={form.PostCode} onChangeText={v => setField('PostCode', v)} />
          <InputField label="استان" value={form.Province} onChangeText={v => setField('Province', v)} />
          <InputField label="شهر" value={form.City} onChangeText={v => setField('City', v)} />
          <InputField label="خیابان/آدرس" value={form.Street} onChangeText={v => setField('Street', v)} />
          <InputField label="کد ملی" value={form.NationalID} onChangeText={v => setField('NationalID', v)} />

          <Button title="ثبت" onPress={onSubmit} fullWidth loading={loading} />
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing.xl,
  },
});
