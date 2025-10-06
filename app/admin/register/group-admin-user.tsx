import React, { useState } from 'react';
import { StyleSheet, View, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { InputField } from '@/components/InputField';
import { Button } from '@/components/Button';
import AppHeader from '@/components/AppHeader';
import { Spacing, BorderRadius } from '@/constants/Design';
import { apiService } from '@/services/apiService';
import { AdminCreate } from '@/types/api';
import { KeyboardAwareContainer } from '@/components/KeyboardAwareContainer';
import { useAuth } from '@/components/AuthContext';

export default function GroupAdminUserRegister() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { userId } = useAuth();

  const [formData, setFormData] = useState<AdminCreate>({
    FirstName: '',
    LastName: '',
    Phone: '',
    Email: '',
    Password: '',
    City: '',
    Province: '',
    Street: '',
    NationalID: '',
    CreatedBy: '',
    UserRole: 'GroupAdmin',
    Latitude: params.latitude ? String(params.latitude) : '',
    Longitude: params.longitude ? String(params.longitude) : '',
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.FirstName.trim() || !formData.LastName.trim()) {
      Alert.alert('خطا', 'نام و نام خانوادگی الزامی است');
      return;
    }
    if (!formData.Password || formData.Password.length < 6) {
      Alert.alert('خطا', 'رمز عبور باید حداقل ۶ کاراکتر باشد');
      return;
    }
    if (!userId) {
      Alert.alert('خطا', 'شناسه ثبت‌کننده یافت نشد؛ لطفاً دوباره وارد شوید.');
      return;
    }

    const payload: AdminCreate = { ...formData, CreatedBy: Number(userId) };

    setLoading(true);
    try {
      const response = await apiService.createAdmin(payload);
      if (response.success) {
        Alert.alert('موفق', 'نماینده گروه با موفقیت ثبت شد', [
          { text: 'تایید', onPress: () => router.push('/admin') }
        ]);
      } else {
        Alert.alert('خطا', response.error || 'خطا در ثبت اطلاعات');
      }
    } catch (e) {
      console.error('GroupAdmin create error', e);
      Alert.alert('خطا', 'اشکال در اتصال به سرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <AppHeader title="ثبت نماینده گروه" showBackButton />
      <KeyboardAwareContainer>
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            <ThemedText style={styles.sectionTitle}>اطلاعات شخصی</ThemedText>
            <InputField label="نام *" value={formData.FirstName} onChangeText={(t)=>setFormData(p=>({...p,FirstName:t}))} placeholder="نام" />
            <InputField label="نام خانوادگی *" value={formData.LastName} onChangeText={(t)=>setFormData(p=>({...p,LastName:t}))} placeholder="نام خانوادگی" />
            <InputField label="شماره موبایل" value={formData.Phone||''} onChangeText={(t)=>setFormData(p=>({...p,Phone:t}))} placeholder="09123456789" keyboardType="phone-pad" />
            <InputField label="کد ملی" value={formData.NationalID||''} onChangeText={(t)=>setFormData(p=>({...p,NationalID:t}))} placeholder="کد ملی" keyboardType="numeric" />
            <InputField label="رمز عبور *" value={formData.Password} onChangeText={(t)=>setFormData(p=>({...p,Password:t}))} placeholder="حداقل ۶ کاراکتر" secureTextEntry />
            <InputField label="ایجاد شده توسط" value={formData.CreatedBy} onChangeText={(t)=>setFormData(p=>({...p,CreatedBy:t}))} placeholder="ایجاد شده توسط" />
            <ThemedText style={styles.sectionTitle}>آدرس</ThemedText>
            <InputField label="استان" value={formData.Province||''} onChangeText={(t)=>setFormData(p=>({...p,Province:t}))} placeholder="نام استان" />
            <InputField label="شهر" value={formData.City||''} onChangeText={(t)=>setFormData(p=>({...p,City:t}))} placeholder="نام شهر" />
            <InputField label="آدرس" value={formData.Street||''} onChangeText={(t)=>setFormData(p=>({...p,Street:t}))} placeholder="آدرس کامل" multiline />

            {params.latitude && params.longitude && (
              <View style={styles.locationInfo}>
                <ThemedText style={styles.locationLabel}>موقعیت انتخاب شده:</ThemedText>
                <ThemedText style={styles.locationText}>عرض: {params.latitude}</ThemedText>
                <ThemedText style={styles.locationText}>طول: {params.longitude}</ThemedText>
              </View>
            )}
          </View>
        </ScrollView>
        <View style={styles.footer}>
          <Button title={loading? 'در حال ثبت...' : 'ثبت نماینده گروه'} onPress={handleSubmit} disabled={loading} style={styles.submitButton} />
          <Button title="انتخاب موقعیت در نقشه" onPress={()=>router.push('/admin/register/map')} variant="outline" style={styles.mapButton} />
        </View>
      </KeyboardAwareContainer>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container:{flex:1},
  scroll:{flex:1},
  form:{padding:Spacing.lg},
  sectionTitle:{fontSize:18,fontWeight:'bold',marginTop:Spacing.lg,marginBottom:Spacing.md},
  locationInfo:{marginTop:Spacing.md,padding:Spacing.md,backgroundColor:'rgba(76,175,80,0.1)',borderRadius:BorderRadius.md},
  locationLabel:{fontWeight:'bold',marginBottom:Spacing.xs},
  locationText:{fontSize:14,opacity:0.8},
  footer:{padding:Spacing.lg,gap:Spacing.md},
  submitButton:{marginBottom:Spacing.sm},
  mapButton:{marginBottom:Spacing.sm}
});
