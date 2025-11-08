import React, { useState, useEffect } from 'react';

import { View, StyleSheet, ScrollView, Alert, ActivityIndicator, I18nManager, TouchableOpacity, TextInput, Button} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Spacing, BorderRadius } from '@/constants/Design';
import { apiService } from '@/services/apiService';
import AppHeader from '@/components/AppHeader';
import { withOpacity } from '@/utils/colorUtils';
import { useAuth } from '@/components/AuthContext';


export default function NeedyDetailsPage() {
  const { userId } = useAuth();
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [code, setCode] = useState('');

  const primaryColor = useThemeColor({}, 'primary');
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const [formData, setFormData] = useState({
    Phone: '',
    VerificationCode: ''
  });
  const [fieldErrors, setFieldErrors] = useState({});
   const { goodId } = useLocalSearchParams();

    // مدیریت حالت آرایه ای بودن پارامترها
   const id = Array.isArray(goodId) ? goodId[0] : goodId;

  const handleFieldChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // پاک کردن خطا هنگام تایپ
    if (fieldErrors[fieldName]) {
      setFieldErrors(prev => ({
        ...prev,
        [fieldName]: ''
      }));
    }
  };

  useEffect(() => {
    // Ensure RTL is enabled on mobile
    if (!I18nManager.isRTL) {
      I18nManager.allowRTL(true);
      I18nManager.forceRTL(true);
    }

    if (userId) {
      const loadData = async () => {
        setLoading(true);
        try {
          await loadNeedyDetails(userId as string);
          await loadGoodsData(userId as string);
        } catch (error) {
          console.error('Error loading data:', error);
          Alert.alert('خطا', 'خطا در بارگذاری اطلاعات');
        } finally {
          setLoading(false);
        }
      };

      loadData();
    } else {
      setLoading(false);
    }
  }, [userId]);

 const verifyCode = async (code: string) => {
    try {
      const response = await apiService.verifySMSCode(code, goodId);
      if (response.data) {
        window.alert( 'کد با موفقیت تایید شد');
        router.push('/needy/verify-goods');
      } else {
        window.alert( 'کد وارد شده معتبر نیست');
         setCode('');
      }
    } catch (error) {
      console.error('Error verifying code:', error);
      window.alert( 'خطا در تایید کد');
    }
  };

  const DetailSection = ({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) => (
    <ThemedView style={[styles.sectionCard, { backgroundColor: surfaceColor }]}>
      <View style={styles.sectionHeader}>
        <ThemedText style={[styles.sectionIcon, { color: primaryColor }]}>{icon}</ThemedText>
        <ThemedText style={[styles.sectionTitle, { color: textColor }]}>{title}</ThemedText>
      </View>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </ThemedView>
  );

  const DetailRow = ({ label, value }: { label: string; value?: string | number }) => (
    <View style={styles.detailRow}>
      <ThemedText style={[styles.label, { color: textColor }]}>
        {label}:
      </ThemedText>
      <ThemedText style={[styles.value, { color: textColor }]}>
        {value || 'مشخص نشده'}
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <AppHeader
        title= "تأیید کردن کمک"
      />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <TextInput
             label= "تأیید"
             value={formData.VerificationCode || ''} // اصلاح شده
             onChangeText={(text) => {
               // فقط اعداد فارسی و انگلیسی را قبول کند و حداکثر ۶ رقم
               const cleanedText = text.replace(/[^0-9۰-۹]/g, '').slice(0, 6);
               handleFieldChange('VerificationCode', cleanedText);
             }}
             placeholder= "کد ۶ رقمی ارسال شده به شماره خود را اینجا وارد کنید"
             keyboardType= "number-pad"
             error={fieldErrors.VerificationCode}
             style={styles.largeInput}
           />
            <Button
                title= "تأیید"
                onPress={() => {
                  if (formData.VerificationCode && formData.VerificationCode.length === 6) {
                    // صدا زدن تابع verify
                    verifyCode(parseInt(formData.VerificationCode)); // goodId باید مقدار داشته باشد
                  } else {
                    // نمایش خطا اگر کد کامل نباشد
                    setFieldErrors({
                      ...fieldErrors,
                      VerificationCode: 'لطفاً کد ۶ رقمی را کامل وارد کنید'
                    });
                  }
                }}
                disabled={!formData.VerificationCode || formData.VerificationCode.length !== 6} // اصلاح شده
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  loadingText: {
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
  errorText: {
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  headerCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  headerContent: {
    flexDirection: 'row-reverse', // RTL layout
    alignItems: 'center',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.md,
  },
  avatarText: {
    fontSize: 28,
  },
  headerInfo: {
    flex: 1,
    alignItems: 'flex-end', // Right align for RTL
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
    textAlign: 'right',
  },
  headerSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: Spacing.xs / 2,
    textAlign: 'right',
  },
  sectionCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: 'row-reverse', // RTL layout
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  sectionIcon: {
    fontSize: 24,
    marginLeft: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right',
  },
  sectionContent: {
    paddingVertical: Spacing.xs,
  },
  detailRow: {
    flexDirection: 'row-reverse', // RTL layout
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    alignItems: 'flex-start',
  },
  label: {
    flex: 1,
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'right',
    color: '#666',
    paddingLeft: Spacing.sm,
  },
  value: {
    flex: 2,
    fontSize: 14,
    textAlign: 'right',
    fontWeight: '500',
    paddingRight: Spacing.sm,
  },
  childCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  childTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  footer: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    gap: Spacing.md,
  },
  editButton: {
    marginBottom: Spacing.sm,
  },
  backButton: {
    marginTop: Spacing.xs,
  },
  toggleContainer: {
    marginBottom: 16,
    alignItems: 'center',
    // اینها را اضافه کنید:
    width: '100%',
    minHeight: 50, // حداقل ارتفاع
    justifyContent: 'center',
  },
  toggleButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  bottomToggleContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  bottomToggleButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bottomToggleActive: {
    backgroundColor: '#4CAF50',
  },
  bottomToggleInactive: {
    backgroundColor: '#f44336',
  },
  bottomToggleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
    largeInput: {
       height: 70,
      fontSize: 20,
      textAlign: 'center',
      padding: 20,
      marginVertical: 15,
      borderWidth: 2,
      borderColor: '#007AFF',
      borderRadius: 12,
      backgroundColor: '#f8f9fa',
    },
});
