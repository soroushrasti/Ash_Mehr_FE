import React, { useState, useEffect } from 'react';

import { View, StyleSheet, ScrollView, Alert, ActivityIndicator, I18nManager, TouchableOpacity, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Spacing, BorderRadius } from '@/constants/Design';
import { apiService } from '@/services/apiService';
import AppHeader from '@/components/AppHeader';
import { withOpacity } from '@/utils/colorUtils';
import { useAuth } from '@/components/AuthContext';
import { SignOutButton } from '@/components/SignOutButton';

interface NeedyDetails {
  UserID?: string;
  RegisterID?: string;
  FirstName?: string;
  LastName?: string;
  NationalID?: string;
  Phone?: string;
  Email?: string;
  Street?: string;
  City?: string;
  Province?: string;
  Region?: string;
  Gender?: string;
  NameFather?: string;
  HusbandFirstName?: string;
  HusbandLastName?: string;
  ReasonMissingHusband?: string;
  UnderOrganizationName?: string;
  EducationLevel?: string;
  PostCode?: string;
  BirthDate?: string;
  IncomeForm?: number;
  UnderWhichAdmin?: string;
  UnderSecondAdminID?: string;
  Latitude?: number | string;
  Longitude?: number | string;
  CreatedDate?: string;
  UpdatedDate?: string;
  children?: Array<{
    FirstName?: string;
    LastName?: string;
    Age?: number;
    Gender?: string;
    NationalID?: string;
    EducationLevel?: string;
  }>;
  goods_of_registre?: Array<{
    id: string;
    TypeGood: string;
    NumberGood: number;
  }>;
}

export default function NeedyDetailsPage() {
  const { userId } = useAuth();
  const [needyDetails, setNeedyDetails] = useState<NeedyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [isSmsVerified, setIsSmsVerified] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [isSendingSms, setIsSendingSms] = useState(false);
  const [code, setCode] = useState('');

  const [isToggleActive, setIsToggleActive] = useState(false);
  const primaryColor = useThemeColor({}, 'primary');
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');


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


  const loadNeedyDetails = async (needyId: string) => {
    try {
      const response = await apiService.getNeedyDetails(needyId);
      if (response.success && response.data) {
        setNeedyDetails(response.data);
      } else {
        console.error('Failed to load needy details:', response.error);
        Alert.alert('خطا', response.error || 'دریافت جزئیات مددجو با خطا مواجه شد');
      }
    } catch (error) {
      console.error('Error loading needy details:', error);
      Alert.alert('خطا', 'خطا در دریافت اطلاعات');
    }
  };

 const loadGoodsData = async (id: string) => {
     try {
       const response = await apiService.getGoodsDetails(id);
       if (response.success && response.data) {
         const data = response.data;
         const list = Array.isArray(data.goods) ? data.goods : Array.isArray(data) ? data : [];

         setNeedyDetails(prev => {
           if (!prev) return prev;
           return {
             ...prev,
             goods_of_registre: list.map((g: any) => ({
               TypeGood: g.TypeGood ?? g.type ?? '',
               NumberGood: Number(g.NumberGood ?? g.number ?? 0)
             }))
           };
         });
       } else {
         setNeedyDetails(prev => {
           if (!prev) return prev;
           return {
             ...prev,
             goods_of_registre: []
           };
         });

       }
     } catch (error) {
       console.error('Error loading goods data:', error);
       // Goods data is optional, don't show alert
     }
 };

const sendSms = async (goodId: string) => {
  setShowCodeInput(true);

//   setIsSendingSms(true);
//   try {
//     const response = await apiService.sendSms(needyDetails.phone, goodId); // یا شماره موبایل مددجو
//     if (response.success) {
//       setShowCodeInput(true);
//     } else {
//       Alert.alert('خطا', 'ارسال پیامک با خطا مواجه شد');
//     }
//   } catch (error) {
//     console.error('Error sending SMS:', error);
//     Alert.alert('خطا', 'خطا در ارسال پیامک');
//   } finally {
//     setIsSendingSms(false);
//   }

};
//
const verifyCode = async (code: string, goodId: string) => {
    setIsToggleActive(true);
    setShowCodeInput(false);
//   try {
//     const response = await apiService.verifySMSCode(code, goodId);
//     if (response.success) {
//       setIsToggleActive(true);
//       setShowCodeInput(false);
//       Alert.alert('موفق', 'کد با موفقیت تایید شد');
//     } else {
//       Alert.alert('خطا', 'کد وارد شده معتبر نیست');
//     }
//   } catch (error) {
//     console.error('Error verifying code:', error);
//     Alert.alert('خطا', 'خطا در تایید کد');
//   }
};

  const getEducationLabel = (value?: string) => {
    if (!value) return 'مشخص نشده';
    const educationMap = {
      'None': 'بی‌سواد',
      'Primary': 'ابتدایی',
      'Secondary': 'راهنمایی',
      'High School': 'دبیرستان',
      'Diploma': 'دیپلم',
      'Associate Degree': 'فوق‌دیپلم',
      'Bachelor': 'لیسانس',
      'Master': 'فوق‌لیسانس',
      'PhD': 'دکتری',
    };
    return educationMap[value as keyof typeof educationMap] || value;
  };

  const getGenderLabel = (value?: string) => {
    if (!value) return 'مشخص نشده';
    return value === 'Male' ? 'مرد' : value === 'Female' ? 'زن' : value;
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

  if (loading) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <AppHeader title="جزئیات مددجو" subtitle="در حال بارگذاری..." />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
          <ThemedText style={[styles.loadingText, { color: textColor }]}>
            در حال بارگذاری اطلاعات...
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (!needyDetails) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <AppHeader title="جزئیات مددجو" subtitle="اطلاعات یافت نشد" />
        <View style={styles.loadingContainer}>
          <ThemedText style={[styles.errorText, { color: textColor }]}>
            اطلاعات مددجو یافت نشد
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <AppHeader
        title={`${needyDetails.FirstName} ${needyDetails.LastName}`}
        subtitle="جزئیات مددجو"
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Card */}
        <ThemedView style={[styles.headerCard, { backgroundColor: withOpacity(primaryColor, 5) }]}>
          <View style={styles.headerContent}>
            <View style={[styles.avatarContainer, { backgroundColor: withOpacity(primaryColor, 15) }]}>
              <ThemedText style={[styles.avatarText, { color: primaryColor }]}>👤</ThemedText>
            </View>
            <View style={styles.headerInfo}>
              <ThemedText style={[styles.headerTitle, { color: primaryColor }]}>
                {needyDetails.FirstName} {needyDetails.LastName}
              </ThemedText>
              <ThemedText style={[styles.headerSubtitle, { color: textColor }]}>
                شناسه: {needyDetails.RegisterID}
              </ThemedText>
              <ThemedText style={[styles.headerSubtitle, { color: textColor }]}>
                کد ملی: {needyDetails.NationalID}
              </ThemedText>
            </View>
          </View>
        </ThemedView>

        {/* Personal Information */}
        <DetailSection title="اطلاعات شخصی" icon="👤">
          <DetailRow label="نام" value={needyDetails.FirstName} />
          <DetailRow label="نام خانوادگی" value={needyDetails.LastName} />
          <DetailRow label="نام پدر" value={needyDetails.NameFather} />
          <DetailRow label="کد ملی" value={needyDetails.NationalID} />
          <DetailRow label="تاریخ تولد" value={needyDetails.BirthDate} />
          <DetailRow label="شماره موبایل" value={needyDetails.Phone} />
          <DetailRow label="جنسیت" value={getGenderLabel(needyDetails.Gender)} />
        </DetailSection>

        {/* Address Information */}
        <DetailSection title="اطلاعات آدرس" icon="🏠">
          <DetailRow label="استان" value={needyDetails.Province} />
          <DetailRow label="شهر" value={needyDetails.City} />
          <DetailRow label="منطقه" value={needyDetails.Region} />
          <DetailRow label="آدرس" value={needyDetails.Street} />
          {needyDetails.Latitude && needyDetails.Longitude && (
            <>
              <DetailRow
                label="عرض جغرافیایی"
                value={typeof needyDetails.Latitude === 'number'
                  ? needyDetails.Latitude.toFixed(6)
                  : parseFloat(String(needyDetails.Latitude)).toFixed(6)}
              />
              <DetailRow
                label="طول جغرافیایی"
                value={typeof needyDetails.Longitude === 'number'
                  ? needyDetails.Longitude.toFixed(6)
                  : parseFloat(String(needyDetails.Longitude)).toFixed(6)}
              />
            </>
          )}
        </DetailSection>

        {/* Spouse Information */}
        <DetailSection title="اطلاعات همسر" icon="👫">
          <DetailRow label="نام همسر" value={needyDetails.HusbandFirstName} />
          <DetailRow label="نام خانوادگی همسر" value={needyDetails.HusbandLastName} />
          <DetailRow label="دلیل غیبت همسر" value={needyDetails.ReasonMissingHusband} />
        </DetailSection>

        {/* Education and Work Information */}
        <DetailSection title="اطلاعات تحصیلی و شغلی" icon="🎓">
          <DetailRow label="سطح تحصیلات" value={getEducationLabel(needyDetails.EducationLevel)} />
          <DetailRow
            label="درآمد ماهانه"
            value={needyDetails.IncomeForm ? `${needyDetails.IncomeForm.toLocaleString('fa-IR')} تومان` : undefined}
          />
          <DetailRow label="سازمان حامی" value={needyDetails.UnderOrganizationName} />
        </DetailSection>

        {needyDetails.children && needyDetails.children.length > 0 && (
          <DetailSection title="اطلاعات فرزندان" icon="👨‍👩‍👧‍👦">
            {needyDetails.children.map((child, index) => (
              <View key={index} style={[styles.childCard, { backgroundColor: withOpacity(primaryColor, 5), borderColor: withOpacity(primaryColor, 20) }]}>
                <ThemedText style={[styles.childTitle, { color: primaryColor }]}>
                  👶 فرزند {index + 1}
                </ThemedText>
                <DetailRow label="نام" value={child.FirstName} />
                <DetailRow label="نام خانوادگی" value={child.LastName} />
                <DetailRow label="سن" value={child.Age?.toString()} />
                <DetailRow label="کد ملی" value={child.NationalID} />
                <DetailRow label="جنسیت" value={getGenderLabel(child.Gender)} />
                <DetailRow label="سطح تحصیلات" value={getEducationLabel(child.EducationLevel)} />
              </View>
            ))}
          </DetailSection>
        )}

        {/* System Information */}
        <DetailSection title="اطلاعات سیستم" icon="⚙️">
          <DetailRow label="شناسه ثبت" value={needyDetails.RegisterID} />
          <DetailRow label="شناسه ثبت فرعی" value={needyDetails.UnderSecondAdminID} />
          <DetailRow label="تاریخ ثبت" value={needyDetails.CreatedDate} />
          <DetailRow label="آخرین به‌روزرسانی" value={needyDetails.UpdatedDate} />
        </DetailSection>

          {/* goods Information */}
          {needyDetails.goods_of_registre && needyDetails.goods_of_registre.length > 0 && (
            <DetailSection title="اطلاعات کمک ها" icon="💰">
              {needyDetails.goods_of_registre.map((good, index) => (

                <View key={index} style={[styles.childCard, { backgroundColor: withOpacity(primaryColor, 5), borderColor: withOpacity(primaryColor, 20) }]}>
                  <ThemedText style={[styles.childTitle, { color: primaryColor }]}>
                    💰 کمک {index + 1}
                  </ThemedText>
                  <DetailRow label="نوع کمک" value={good.TypeGood} />
                  <DetailRow label="مقدار کمک" value={good.NumberGood} />
                   <View style={styles.bottomToggleContainer}>
                     <TouchableOpacity
                       style={[
                         styles.bottomToggleButton,
                         isToggleActive ? styles.bottomToggleActive : styles.bottomToggleInactive,
                       ]}
                       onPress={() => sendSms(good.id)}
                     >
                       <ThemedText style={styles.bottomToggleText}>
                         {isToggleActive ? '✅ تایید شده' : 'تایید نشده'}
                       </ThemedText>
                     </TouchableOpacity>
                   </View>
                     <View>
                        {/* سایر المان‌ها */}

                        {showCodeInput && (
                          <View style={styles.codeInputContainer}>
                            <TextInput
                              placeholder = "کد را وارد کنید"
                              keyboardType="number-pad"
                              value={code}
                              onChangeText={setCode}
                               autoFocus={true}
                              style={styles.codeInput}
                            />
                            <Button title=  "تایید"
                            onPress={() => verifyCode(code, good.id)}
                             />
                          </View>
                        )}
                      </View>
                </View>
              ))}
            </DetailSection>
            )}
      </ScrollView>

      {/* Footer Actions */}
      <View style={[styles.footer, { backgroundColor: surfaceColor }]}>
          <SignOutButton />
      </View>
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

});
