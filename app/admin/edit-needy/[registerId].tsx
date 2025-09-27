import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { InputField } from '@/components/InputField';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Spacing, BorderRadius } from '@/constants/Design';
import { apiService } from '@/services/apiService';
import AppHeader from '@/components/AppHeader';
import KeyboardAwareContainer from '@/components/KeyboardAwareContainer';
import { RTLPicker } from '@/components/RTLPicker';
import { AdminPersonLocation, NeedyCreateWithChildren } from '@/types/api';
import { useAuth } from '@/components/AuthContext';
import { withOpacity } from '@/utils/colorUtils';


interface ExtendedNeedyEditForm extends NeedyCreateWithChildren {
  BirthDate?: string;
  UnderWhichAdmin?: number;
}

export default function EditNeedyPage() {
  const { registerId } = useLocalSearchParams();
  const router = useRouter();
  const { userId } = useAuth();
  const errorColor = useThemeColor({}, 'danger');

  const [childrenCount, setChildrenCount] = useState(0);

  const [formData, setFormData] = useState<ExtendedNeedyEditForm>({
    FirstName: '',
    LastName: '',
    Phone: '',
    Email: '',
    City: '',
    Province: '',
    Street: '',
    NameFather: '',
    NationalID: '',
    CreatedBy: Number(userId) || 0,
    BirthDate: '',
    UnderWhichAdmin: undefined,
    Age: undefined,
    Region: '',
    Gender: '',
    HusbandFirstName: '',
    HusbandLastName: '',
    ReasonMissingHusband: '',
    UnderOrganizationName: '',
    EducationLevel: '',
    IncomeForm: '',
    Latitude: '',
    Longitude: '',
    children_of_registre: [],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  const [adminOptions, setAdminOptions] = useState<AdminPersonLocation[]>([]);

  const primaryColor = useThemeColor({}, 'primary');
  const successColor = useThemeColor({}, 'success');
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  useEffect(() => {
    if (registerId) {
      Promise.all([
        loadNeedyData(registerId as string),
        loadAdmins()
      ]);
    }
  }, [registerId]);

  const loadNeedyData = async (id: string) => {
    try {
      const response = await apiService.getNeedyDetails(id);
      if (response.success && response.data) {
        const data = response.data;
        setFormData({
          FirstName: data.FirstName || '',
          LastName: data.LastName || '',
          Phone: data.Phone || '',
          Email: data.Email || '',
          City: data.City || '',
          Province: data.Province || '',
          Street: data.Street || '',
          NameFather: data.NameFather || '',
          NationalID: data.NationalID || '',
          CreatedBy: Number(userId) || 0,
          BirthDate: data.birthDate || '',
          UnderWhichAdmin: data.UnderWhichAdmin || undefined,
          Age: data.Age || undefined,
          Region: data.Region || '',
          Gender: data.Gender || '',
          HusbandFirstName: data.HusbandFirstName || '',
          HusbandLastName: data.HusbandLastName || '',
          ReasonMissingHusband: data.ReasonMissingHusband || '',
          UnderOrganizationName: data.UnderOrganizationName || '',
          EducationLevel: data.EducationLevel || '',
          IncomeForm: data.income?.toString() || '',
          Latitude: data.Latitude?.toString() || '',
          Longitude: data.Longitude?.toString() || '',
          children_of_registre: data.children,
        });
      } else {
        Alert.alert('خطا', 'دریافت اطلاعات مددجو با خطا مواجه شد');
        router.back();
      }
    } catch (error) {
      console.error('Error loading needy data:', error);
      Alert.alert('خطا', 'خطا در دریافت اطلاعات');
      router.back();
    } finally {
      setLoading(false);
    }
  };

    const handleAddNewChild = () => {
      const currentChildren = formData.children_of_registre || [];

      const newChild = {
          RegisterID: '',
        FirstName: '',
        LastName: '',
        Age: '',
        NationalID: '',
        EducationLevel:'',
        Gender:'',
      };

      const newChildren = [...currentChildren, newChild];
      setFormData({...formData, children_of_registre: newChildren});
    };

const handleSaveChildren = async () => {
  try {
    const newChildren = formData.children_of_registre.filter(child =>
      !child.ChildrenOfRegisterID && child.FirstName && child.LastName
    );

    if (newChildren.length === 0) {
      alert('هیچ فرزند جدید معتبری برای ذخیره وجود ندارد');
      return;
    }

    const savePromises = newChildren.map((child, index) => {
      const childData = {
        ...child,
        RegisterID: registerId,
        Age: child.Age ? parseInt(child.Age) : null
      };
      console.log(`در حال ذخیره فرزند جدید شماره ${index + 1} از ${newChildren.length}`);
      return apiService.createChildNeedyPerson(childData);
    });

    await Promise.all(savePromises);
    alert(`${newChildren.length} فرزند جدید با موفقیت ذخیره شد`);

  } catch (error) {
    console.error('خطا در ذخیره فرزندان:', error);
    alert('خطا در ذخیره فرزندان: ' + error.message);
  }
};

    const handleChildrenCountChange = (count: number) => {
        const numCount = Math.max(0, Math.min(count, 10)); // Limit to 0-10 children
        setChildrenCount(numCount);

        setFormData(prev => {
            const newChildren = Array(numCount).fill(null).map((_, index) => {
                // Keep existing data if available
                const existingChild = prev.children_of_registre[index];
                return existingChild || {
                    FirstName: '',
                    LastName: '',
                    NationalID: '',
                    Gender: '',
                    Age: '',
                    EducationLevel: ''
                };
            });

            return {
                ...prev,
                children_of_registre: newChildren
            };
        });
    };

    const handleChildFieldChange = (index: number, field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            children_of_registre: prev.children_of_registre.map((child, i) =>
                i === index ? { ...child, [field]: value } : child
            )
        }));
    };


  const handleDeleteChild = async (index) => {
    try {
      // حذف از دیتابیس (اگر فرزند قبلاً ذخیره شده)
      if (formData.children_of_registre[index].ChildrenOfRegisterID) {
        await apiService.deleteChildNeedy(formData.children_of_registre[index].ChildrenOfRegisterID);
      }

      // حذف از state
      const updatedChildren = formData.children_of_registre.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        children_of_registre: updatedChildren
      });

    } catch (error) {
                      console.error('Error deleting needy:', error);
                      if (Platform.OS === 'web') {
                          // eslint-disable-next-line no-alert
                          window.alert('خطا در حذف مددجو');
                      } else {
                          Alert.alert('خطا', 'خطا در حذف مددجو');
                      }
                  }
  };

  const handleAddChild = async (index) => {
       await apiService.createChildNeedyPerson(formData.children_of_registre[index].ChildrenOfRegisterID);
      };


  const loadAdmins = async () => {
    try {
      const response = await apiService.getAdminGeoPoints();
      if (response.success && response.data) {
        setAdminOptions(response.data);
      }
    } catch (error) {
      console.error('Failed to load admins:', error);
    }
  };

  const validateForm = () => {
    const errors: string[] = [];
    const fieldErrs: {[key: string]: string} = {};

    // Required field validation
    if (!formData.FirstName.trim()) {
      errors.push('نام الزامی است');
      fieldErrs.FirstName = 'نام الزامی است';
    }

    if (!formData.LastName.trim()) {
      errors.push('نام خانوادگی الزامی است');
      fieldErrs.LastName = 'نام خانوادگی الزامی است';
    }

    // Email validation (if provided)
    if (formData.Email && formData.Email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.Email)) {
        errors.push('فرمت ایمیل صحیح نیست');
        fieldErrs.Email = 'فرمت ایمیل صحیح نیست';
      }
    }

    // Phone validation (if provided)
    if (formData.Phone && formData.Phone.trim()) {
      const phoneRegex = /^09\d{9}$/;
      if (!phoneRegex.test(formData.Phone)) {
        errors.push('شماره موبایل باید با ۰۹ شروع شده و ۱۱ رقم باشد');
        fieldErrs.Phone = 'شماره موبایل باید با ۰۹ شروع شده و ۱۱ رقم باشد';
      }
    }

    // National ID validation (if provided)
    if (formData.NationalID && formData.NationalID.trim()) {
      if (formData.NationalID.length !== 10) {
        errors.push('کد ملی باید ۱۰ رقم باشد');
        fieldErrs.NationalID = 'کد ملی باید ۱۰ رقم باشد';
      }
    }

    // Age validation (if provided)
    if (formData.Age && (formData.Age < 1 || formData.Age > 120)) {
      errors.push('سن باید بین ۱ تا ۱۲۰ سال باشد');
      fieldErrs.Age = 'سن باید بین ۱ تا ۱۲۰ سال باشد';
    }

    setValidationErrors(errors);
    setFieldErrors(fieldErrs);
    return errors.length === 0;
  };

  const handleFieldChange = (field: keyof ExtendedNeedyEditForm, value: string | number | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear field-specific error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Clear general validation errors when user starts making changes
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };


  if (loading) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <AppHeader title="ویرایش مددجو" subtitle="در حال بارگذاری..." />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
          <ThemedText style={{ marginTop: Spacing.lg, color: textColor }}>
            در حال بارگذاری اطلاعات...
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <AppHeader title="ویرایش مددجو" showBackButton />

      <KeyboardAwareContainer>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            {/* Validation Error Bar */}
            {validationErrors.length > 0 && (
              <View style={[styles.errorContainer, { backgroundColor: errorColor + '20', borderColor: errorColor }]}>
                <ThemedText style={[styles.errorTitle, { color: errorColor }]}>
                  خطاهای اعتبارسنجی:
                </ThemedText>
                {validationErrors.map((error, index) => (
                  <ThemedText key={index} style={[styles.errorText, { color: errorColor }]}>
                    • {error}
                  </ThemedText>
                ))}
              </View>
            )}

            <ThemedText style={styles.sectionTitle}>اطلاعات شخصی</ThemedText>

            <InputField
              label="نام *"
              value={formData.FirstName}
              onChangeText={(text) => handleFieldChange('FirstName', text)}
              placeholder="نام را وارد کنید"
              error={fieldErrors.FirstName}
              required
            />

            <InputField
              label="نام خانوادگی *"
              value={formData.LastName}
              onChangeText={(text) => handleFieldChange('LastName', text)}
              placeholder="نام خانوادگی را وارد کنید"
              error={fieldErrors.LastName}
              required
            />

            <InputField
              label="نام پدر"
              value={formData.NameFather || ''}
              onChangeText={(text) => handleFieldChange('NameFather', text)}
              placeholder="نام پدر را وارد کنید"
            />

            <InputField
              label="شماره موبایل"
              value={formData.Phone || ''}
              onChangeText={(text) => handleFieldChange('Phone', text)}
              placeholder="09123456789"
              keyboardType="phone-pad"
              error={fieldErrors.Phone}
            />

            <InputField
              label="کد ملی"
              value={formData.NationalID || ''}
              onChangeText={(text) => handleFieldChange('NationalID', text)}
              placeholder="کد ملی ۱۰ رقمی"
              keyboardType="numeric"
              error={fieldErrors.NationalID}
              maxLength={10}
            />

            <InputField
              label="ایمیل"
              value={formData.Email || ''}
              onChangeText={(text) => handleFieldChange('Email', text)}
              placeholder="example@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              error={fieldErrors.Email}
            />

            <InputField
              label="تاریخ تولد"
              value={formData.BirthDate || ''}
              onChangeText={(text) => handleFieldChange('BirthDate', text)}
              placeholder="۱۴۰۰/۰۱/۰۱"
            />

            <ThemedText style={styles.fieldLabel}>جنسیت</ThemedText>
            <RTLPicker
              items={[
                { label: "انتخاب کنید", value: "" },
                { label: "مرد", value: "Male" },
                { label: "زن", value: "Female" }
              ]}
              selectedValue={formData.Gender || ''}
              onValueChange={(value) => handleFieldChange('Gender', value)}
              placeholder="انتخاب کنید"
              style={styles.pickerContainer}
            />

            <ThemedText style={styles.sectionTitle}>اطلاعات آدرس</ThemedText>

            <InputField
              label="استان"
              value={formData.Province || ''}
              onChangeText={(text) => handleFieldChange('Province', text)}
              placeholder="نام استان"
            />

            <InputField
              label="شهر"
              value={formData.City || ''}
              onChangeText={(text) => handleFieldChange('City', text)}
              placeholder="نام شهر"
            />

            <InputField
              label="منطقه"
              value={formData.Region || ''}
              onChangeText={(text) => handleFieldChange('Region', text)}
              placeholder="منطقه یا ناحیه"
            />

            <InputField
              label="آدرس"
              value={formData.Street || ''}
              onChangeText={(text) => handleFieldChange('Street', text)}
              placeholder="آدرس کامل"
              multiline
            />

            <ThemedText style={styles.sectionTitle}>اطلاعات همسر</ThemedText>

            <InputField
              label="نام همسر"
              value={formData.HusbandFirstName || ''}
              onChangeText={(text) => handleFieldChange('HusbandFirstName', text)}
              placeholder="نام همسر"
            />

            <InputField
              label="نام خانوادگی همسر"
              value={formData.HusbandLastName || ''}
              onChangeText={(text) => handleFieldChange('HusbandLastName', text)}
              placeholder="نام خانوادگی همسر"
            />

            <InputField
              label="دلیل غیبت همسر"
              value={formData.ReasonMissingHusband || ''}
              onChangeText={(text) => handleFieldChange('ReasonMissingHusband', text)}
              placeholder="در صورت غیبت همسر، دلیل را شرح دهید"
              multiline
            />

            {formData.children_of_registre && formData.children_of_registre.length > 0 && (

              <View>
                <ThemedText style={[styles.sectionTitle, {textAlign: 'right'}]}>
                  اطلاعات فرزندان

                </ThemedText>

                {formData.children_of_registre.map((child, index) => (
                  <View key={index} style={[styles.childCard, { backgroundColor: withOpacity(primaryColor, 5), borderColor: withOpacity(primaryColor, 20) }]}>

                    {/* هدر کارت فرزند با دکمه حذف */}
                    <View style={styles.childHeader}>

                      {/* دکمه حذف */}
                      <TouchableOpacity
                        onPress={() => handleDeleteChild(index)}
                        style={styles.deleteButton}
                      >
                        <ThemedText style={styles.deleteText}>🗑️ حذف فرزند</ThemedText>
                      </TouchableOpacity>
                      <ThemedText style={[styles.childTitle, { color: primaryColor, textAlign: 'right' }]}>
                        👶 فرزند {index + 1}
                      </ThemedText>

                    </View>

                    <InputField
                      label= "نام فرزند *"
                      value={child.FirstName || ''}
                      onChangeText={(text) => handleChildFieldChange(index, 'FirstName', text)}
                      placeholder = "نام"
                      textAlign = "right"
                    />

                    <InputField
                     label= "نام خانوادگی *"
                     value={child.LastName || ''}
                     onChangeText={(text) => handleChildFieldChange(index, 'LastName', text)}
                     placeholder= "  نام خانوادگی"
                     textAlign = "right"
                    />

                    <InputField
                       label= "سن فرزند"
                       value={child.Age || ''}
                       onChangeText={(text) => handleChildFieldChange(index, 'Age', text)}
                       placeholder= "سن فرزند"
                       keyboardType="numeric"

                    />

                    <InputField
                       label= "کد ملی فرزند"
                       value={child.NationalID || ''}
                       onChangeText={(text) => handleChildFieldChange(index, 'NationalID', text)}
                       placeholder= "کد ملی ۱۰ رقمی"
                       keyboardType="numeric"
                       maxLength={10}
                    />
                     <ThemedText style={styles.fieldLabel}>جنسیت</ThemedText>
                          <RTLPicker
                          items={[
                         { label: "انتخاب کنید", value: "" },
                         { label: "پسر", value: "Male" },
                         { label: "دختر", value: "Female" }
                         ]}
                       selectedValue={child.Gender}
                       onValueChange={(value) => handleChildFieldChange(index, 'Gender', value)}
                       placeholder="انتخاب جنسیت"
                       style={styles.pickerContainer}
                     />

                     <ThemedText style={styles.fieldLabel}>سطح تحصیلات</ThemedText>
                          <RTLPicker
                         items={[
                          { label: "انتخاب کنید", value: "" },
                          { label: "مهدکودک", value: "Kindergarten" },
                          { label: "ابتدایی", value: "Primary" },
                          { label: "راهنمایی", value: "Secondary" },
                          { label: "دبیرستان", value: "High School" },
                          { label: "دیپلم", value: "Diploma" },
                          { label: "فوق‌دیپلم", value: "Associate Degree" },
                          { label: "لیسانس", value: "Bachelor" },
                          { label: "فوق‌لیسانس", value: "Master" },
                          { label: "دکتری", value: "PhD" }
                          ]}
                      selectedValue={child.EducationLevel}
                      onValueChange={(value) => handleChildFieldChange(index, 'EducationLevel', value)}
                       placeholder="انتخاب سطح تحصیلات"
                       style={styles.pickerContainer}
                    />
                  </View>
                ))}
              </View>
            )}



<View style={styles.childrenButtonsContainer}>
  {/* دکمه افزودن فرزند جدید */}
  <TouchableOpacity
    style={[styles.addButton, { backgroundColor: primaryColor }]}
    onPress={handleAddNewChild}
  >
    <ThemedText style={styles.addButtonText}>+ افزودن فرزند جدید</ThemedText>
  </TouchableOpacity>

  {/* دکمه ذخیره فرزندان در دیتابیس */}
  {formData.children_of_registre && formData.children_of_registre.length > 0 && (
    <TouchableOpacity
      style={[styles.saveButton, { backgroundColor: '#28a745' }]}
      onPress={handleSaveChildren}
    >
      <ThemedText style={styles.saveButtonText}>💾 ذخیره فرزندان </ThemedText>
    </TouchableOpacity>
  )}
</View>

            <ThemedText style={styles.sectionTitle}>اطلاعات تحصیلی و شغلی</ThemedText>
            <ThemedText style={styles.fieldLabel}>سطح تحصیلات</ThemedText>
            <RTLPicker
              items={[
                { label: "انتخاب کنید", value: "" },
                { label: "بی‌سواد", value: "None" },
                { label: "ابتدایی", value: "Primary" },
                { label: "راهنمایی", value: "Secondary" },
                { label: "دبیرستان", value: "High School" },
                { label: "دیپلم", value: "Diploma" },
                { label: "فوق‌دیپلم", value: "Associate Degree" },
                { label: "لیسانس", value: "Bachelor" },
                { label: "فوق‌لیسانس", value: "Master" },
                { label: "دکتری", value: "PhD" }
              ]}
              selectedValue={formData.EducationLevel || ''}
              onValueChange={(value) => handleFieldChange('EducationLevel', value)}
              placeholder="انتخاب کنید"
              style={styles.pickerContainer}
            />

            <InputField
              label="درآمد خانواده"
              value={formData.IncomeForm || ''}
              onChangeText={(text) => handleFieldChange('IncomeForm', text)}
              placeholder="توضیح درآمد خانواده"
              multiline
            />

            <InputField
              label="نام سازمان حامی"
              value={formData.UnderOrganizationName || ''}
              onChangeText={(text) => handleFieldChange('UnderOrganizationName', text)}
              placeholder="نام سازمان یا نهاد حامی (در صورت وجود)"
            />

            <ThemedText style={styles.fieldLabel}>تحت نظارت نماینده</ThemedText>
            <RTLPicker
              items={[
                { label: "انتخاب نماینده", value: 0 },
                ...adminOptions.map(admin => ({
                  label: `${admin.name} ${admin.info ? admin.info : ''}` || `نماینده ${admin.id}`,
                  value: admin.id
                }))
              ]}
              selectedValue={formData.UnderWhichAdmin || 0}
              onValueChange={(value) => handleFieldChange('UnderWhichAdmin', value || undefined)}
              placeholder="انتخاب نماینده"
              style={styles.pickerContainer}
            />

            {/* Location Section */}
            <ThemedText style={styles.sectionTitle}>موقعیت جغرافیایی</ThemedText>

            <InputField
              label="عرض جغرافیایی"
              value={formData.Latitude || ''}
              onChangeText={(text) => handleFieldChange('Latitude', text)}
              placeholder="35.6892"
              keyboardType="numeric"
            />

            <InputField
              label="طول جغرافیایی"
              value={formData.Longitude || ''}
              onChangeText={(text) => handleFieldChange('Longitude', text)}
              placeholder="51.3890"
              keyboardType="numeric"
            />

            {formData.Latitude && formData.Longitude && (
              <View style={styles.locationInfo}>
                <ThemedText style={styles.locationLabel}>موقعیت :</ThemedText>
                <ThemedText style={styles.locationText}>
                  عرض جغرافیایی: {formData.Latitude}
                </ThemedText>
                <ThemedText style={styles.locationText}>
                  طول جغرافیایی: {formData.Longitude}
                </ThemedText>
              </View>
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="انتخاب موقعیت در نقشه"
            onPress={() => {
              router.push({
                pathname: '/admin/register/map',
                params: {
                  formData: JSON.stringify(formData),
                  roleTitle: 'مددجو',
                  roleIcon: '👤',
                  role: 'needy',
                  city: formData.City || '',
                  province: formData.Province || '',
                    savedlocation: formData.Latitude && formData.Longitude
                    ? JSON.stringify({
                        latitude: parseFloat(formData.Latitude),
                        longitude: parseFloat(formData.Longitude)
                      })
                    : '',
                  editMode: 'true',
                  registerId: registerId as string
                }
              });
            }}
            variant="outline"
            style={styles.actionButton}
          />

          <Button
            title="انصراف"
            onPress={() => router.back()}
            variant="outline"
            style={styles.actionButton}
          />
        </View>
      </KeyboardAwareContainer>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: Spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    textAlign: 'right',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  fieldLabel: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
    fontWeight: 'bold',
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    backgroundColor: 'white',
  },
  locationInfo: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: BorderRadius.md,
  },
  locationLabel: {
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
  },
  locationText: {
    fontSize: 14,
    opacity: 0.8,
  },
  footer: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  actionButton: {
    marginBottom: Spacing.sm,
  },
  errorContainer: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  errorTitle: {
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
  },
  errorText: {
    fontSize: 14,
    marginBottom: Spacing.xs,
  },
   childHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    deleteButton: {
      padding: 8,
      backgroundColor: '#ff4444',
      borderRadius: 5,
    },
    deleteText: {
      color: 'white',
      fontSize: 12,
    },
   addChildSection: {
       marginTop: 20,
       alignItems: 'center'
     },
   addButtonText: {
       color: '#FFFFFF',
       fontSize: 16,
       fontWeight: 'bold'
     },
 childrenButtonsContainer: {
     marginTop: 20,
     gap: 15,
     alignItems: 'center'
   },
   addButton: {
     paddingVertical: 12,
     paddingHorizontal: 24,
     borderRadius: 8,
     alignItems: 'center',
     minWidth: 200
   },
   saveButton: {
     paddingVertical: 12,
     paddingHorizontal: 24,
     borderRadius: 8,
     alignItems: 'center',
     minWidth: 200
   },
   addButtonText: {
     color: '#FFFFFF',
     fontSize: 16,
     fontWeight: 'bold'
   },
   saveButtonText: {
     color: '#FFFFFF',
     fontSize: 16,
     fontWeight: 'bold'
   },
});
