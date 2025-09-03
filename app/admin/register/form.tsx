import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/Button';
import { InputField } from '@/components/InputField';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Spacing, BorderRadius } from '@/constants/Design';
import { withOpacity } from '@/utils/colorUtils';
import AppHeader from '@/components/AppHeader';

// Types
interface FieldOption { label: string; value: string; }
interface FieldDef {
  key: string;
  label: string;
  placeholder?: string;
  required: boolean;
  type?: 'phone' | 'number' | 'email' | 'select';
  secure?: boolean;
  multiline?: boolean;
  options?: FieldOption[];
}

type FormState = Record<string, string>;

// Field definitions with Farsi labels and validation
const baseFields: FieldDef[] = [
  { key: 'firstName', label: 'نام', placeholder: 'نام خود را وارد کنید', required: false },
  { key: 'lastName', label: 'نام خانوادگی', placeholder: 'نام خانوادگی خود را وارد کنید', required: false },
  { key: 'phone', label: 'شماره تلفن', placeholder: '09xxxxxxxxx', required: false, type: 'phone' },
  { key: 'nationalId', label: 'کد ملی', placeholder: 'کد ملی ۱۰ رقمی', required: false, type: 'number' },
  { key: 'email', label: 'ایمیل', placeholder: 'example@email.com', required: false, type: 'email' },
  { key: 'province', label: 'استان', placeholder: 'استان محل سکونت', required: false },
  { key: 'city', label: 'شهر', placeholder: 'شهر محل سکونت', required: false },
  { key: 'street', label: 'آدرس', placeholder: 'آدرس کامل', required: false, multiline: true },
];

const needyFamilyFields: FieldDef[] = [
  { key: 'age', label: 'سن', placeholder: 'سن به سال', required: false, type: 'number' },
  { key: 'region', label: 'منطقه', placeholder: 'منطقه شهری', required: false },
  { key: 'gender', label: 'جنسیت', placeholder: 'انتخاب کنید', required: false, type: 'select', options: [
    { label: 'مرد', value: 'Male' },
    { label: 'زن', value: 'Female' }
  ]},
  { key: 'housebandFirstName', label: 'نام همسر', placeholder: 'نام همسر', required: false },
  { key: 'housebandLastName', label: 'نام خانوادگی همسر', placeholder: 'نام خانوادگی همسر', required: false },
  { key: 'reasonMissingHouseband', label: 'دلیل غیبت همسر', placeholder: 'در صورت عدم حضور همسر', required: false },
  { key: 'underOrganizationName', label: 'نام سازمان حامی', placeholder: 'نام سازمان یا موسسه حامی', required: false },
  { key: 'educationLevel', label: 'سطح تحصیلات', placeholder: 'انتخاب کنید', required: false, type: 'select', options: [
    { label: 'بی‌سواد', value: 'None' },
    { label: 'ابتدایی', value: 'Primary' },
    { label: 'راهنمایی', value: 'Secondary' },
    { label: 'دبیرستان', value: 'High School' },
    { label: 'دیپلم', value: 'Diploma' },
    { label: 'فوق‌دیپلم', value: 'Associate Degree' },
    { label: 'لیسانس', value: 'Bachelor' },
    { label: 'فوق‌لیسانس', value: 'Master' },
    { label: 'دکتری', value: 'PhD' },
  ]},
  { key: 'incomeAmount', label: 'میزان درآمد ماهانه', placeholder: 'درآمد به تومان', required: false, type: 'number' },
];

function validateField(field: FieldDef, value: string): string {
  // if (field.required && (!value || value.trim() === '')) return `${field.label} الزامی است`;
  // if (field.type === 'email' && value && !/^\S+@\S+\.\S+$/.test(value)) return 'فرمت ایمیل نادرست است';
  // if (field.type === 'phone' && value && !/^09\d{9}$/.test(value)) return 'شماره تلفن باید با ۰۹ شروع شود و ۱۱ رقم باشد';
  // if (field.type === 'number' && value && isNaN(Number(value))) return `${field.label} باید عدد باشد`;
  // if (field.key === 'password' && value && value.length < 6) return 'رمز عبور باید حداقل ۶ کاراکتر باشد';
  // if (field.key === 'nationalId' && value && (!/^\d{10}$/.test(value) || !isValidNationalId(value))) return 'کد ملی نادرست است';
  return '';
}

function isValidNationalId(nationalId: string): boolean {
  if (nationalId.length !== 10) return false;
  const check = parseInt(nationalId[9]);
  const sum = nationalId
    .split('')
    .slice(0, 9)
    .reduce((acc: number, digit: string, index: number) => acc + parseInt(digit) * (10 - index), 0);
  const remainder = sum % 11;
  return (remainder < 2 && check === remainder) || (remainder >= 2 && check === 11 - remainder);
}

export default function AdminRegisterForm() {
  const router = useRouter();
  const { role } = useLocalSearchParams();
  const roleParam = Array.isArray(role) ? role[0] : role;
  const [form, setForm] = useState<FormState>({});
  const [errors, setErrors] = useState<FormState>({});
  const [loading, setLoading] = useState(false);

  const primaryColor = useThemeColor({}, 'primary');
  const successColor = useThemeColor({}, 'success');
  const textColor = useThemeColor({}, 'textPrimary');
  const errorColor = useThemeColor({}, 'error');

  // Determine which fields to show based on role
  let fields: FieldDef[] = baseFields;
  let roleTitle = '';
  let roleIcon = '';

  switch (roleParam) {
    case 'Admin':
      roleTitle = 'مدیر کل';
      roleIcon = '👨‍💼';
      break;
    case 'GroupAdmin':
      roleTitle = 'مدیر گروه';
      roleIcon = '👥';
      break;
    case 'NeedyFamily':
    case 'Child':
    case 'Elderly':
    case 'Volunteer':
      fields = [...baseFields, ...needyFamilyFields];
      roleTitle = roleParam === 'NeedyFamily' ? 'خانواده نیازمند' :
                 roleParam === 'Child' ? 'کودک نیازمند' :
                 roleParam === 'Elderly' ? 'سالمند نیازمند' : 'داوطلب';
      roleIcon = roleParam === 'NeedyFamily' ? '🏠' :
                roleParam === 'Child' ? '👶' :
                roleParam === 'Elderly' ? '👴' : '🤝';
      break;
    default:
      roleTitle = 'کاربر جدید';
      roleIcon = '👤';
  }

  // Group fields explicitly (avoid index slices)
  const personalKeys = ['firstName','lastName','phone','nationalId','email'];
  const addressKeys = ['province','city','street'];
  const personalFields = fields.filter(f => personalKeys.includes(f.key));
  const addressFields = fields.filter(f => addressKeys.includes(f.key));
  const additionalFields = fields.filter(f => !personalKeys.includes(f.key) && !addressKeys.includes(f.key));

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
    if (errors[key]) {
      const field = fields.find(f => f.key === key)!;
      setErrors({ ...errors, [key]: validateField(field, value) });
    }
  };

  const handleNext = () => {
    let valid = true;
    const newErrors: FormState = {};

    for (const field of fields) {
      const err = validateField(field, form[field.key] || '');
      if (err) valid = false;
      newErrors[field.key] = err;
    }

    setErrors(newErrors);
    if (!valid) return;

    setLoading(true);

    setTimeout(() => {
      router.push({
        pathname: '/admin/register/map',
        params: {
          formData: JSON.stringify(form),
          role: roleParam as string,
          roleTitle,
          roleIcon
        },
      });
      setLoading(false);
    }, 500);
  };

  const ProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={[styles.progressStep, { backgroundColor: successColor }]}>
        <ThemedText style={styles.progressText}>✓</ThemedText>
      </View>
      <View style={[styles.progressLine, { backgroundColor: primaryColor }]} />
      <View style={[styles.progressStep, { backgroundColor: primaryColor }]}>
        <ThemedText style={styles.progressText}>۲</ThemedText>
      </View>
      <View style={[styles.progressLine, { backgroundColor: '#E0E0E0' }]} />
      <View style={[styles.progressStep, { backgroundColor: '#E0E0E0' }]}>
        <ThemedText style={[styles.progressText, { color: '#757575' }]}>۳</ThemedText>
      </View>
    </View>
  );

  const renderSelectField = (field: FieldDef) => {
    if (Platform.OS === 'web') {
      return (
        <View key={field.key} style={styles.selectContainer}>
          <ThemedText type="caption" weight="medium" style={styles.selectLabel}>
            {field.label}
          </ThemedText>
          <select
            style={{
              borderWidth: 1,
              borderColor: '#E0E0E0',
              borderRadius: BorderRadius.lg,
              padding: Spacing.md,
              backgroundColor: 'white',
              fontSize: 16,
              fontFamily: 'Arial',
              writingDirection: 'rtl',
              color: textColor as any,
            }}
            value={form[field.key] || ''}
            onChange={(e: any) => handleChange(field.key, e.target.value)}
          >
            <option value="">انتخاب کنید</option>
            {field.options?.map((opt: FieldOption) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {errors[field.key] && (
            <ThemedText type="caption" style={[styles.errorText, { color: errorColor }]}>
              {errors[field.key]}
            </ThemedText>
          )}
        </View>
      );
    } else {
      return (
        <InputField
          key={field.key}
          label={field.label}
          placeholder={field.placeholder || 'انتخاب کنید'}
          value={form[field.key] || ''}
          onChangeText={(value) => handleChange(field.key, value)}
          error={errors[field.key]}
        />
      );
    }
  };

  return (
    <ThemedView type="container" style={{ flex: 1 }}>
      <AppHeader title={`ثبت‌نام ${roleTitle}`} subtitle="اطلاعات پایه" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: Spacing.xl }}>
        <ProgressBar />

        {/* Header with Role badge */}
        <View style={styles.header}>
          <View style={[styles.roleIconContainer, { backgroundColor: withOpacity(primaryColor, 20) }]}>
            <ThemedText style={styles.roleIcon}>{roleIcon}</ThemedText>
          </View>
          <ThemedText type="heading2" weight="bold" style={styles.title}>
            ثبت‌نام {roleTitle}
          </ThemedText>
          <ThemedText type="subtitle" style={styles.subtitle}>
            لطفاً اطلاعات مورد نیاز را با دقت تکمیل کنید
          </ThemedText>
        </View>

        <ThemedView type="card" style={styles.formCard}>
          <ThemedText type="heading3" style={[styles.formTitle, { color: primaryColor }]}>
            ثبت‌نام {roleTitle}
          </ThemedText>

          {personalFields.map(field =>
            field.type === 'select'
              ? renderSelectField(field)
              : (
                <InputField
                  key={field.key}
                  label={field.label}
                  placeholder={field.placeholder}
                  value={form[field.key] || ''}
                  onChangeText={(value) => handleChange(field.key, value)}
                  secureTextEntry={field.secure}
                  keyboardType={
                    field.type === 'phone' ? 'phone-pad'
                      : field.type === 'email' ? 'email-address'
                      : field.type === 'number' ? 'numeric'
                      : 'default'
                  }
                  multiline={field.multiline}
                  error={errors[field.key]}
                />
              )
          )}
        </ThemedView>

        <ThemedView type="card" style={styles.formCard}>
          <ThemedText type="heading3" style={styles.formTitle}>
            اطلاعات آدرس
          </ThemedText>

          {addressFields.map(field => (
            <InputField
              key={field.key}
              label={field.label}
              placeholder={field.placeholder}
              value={form[field.key] || ''}
              onChangeText={(value) => handleChange(field.key, value)}
              multiline={field.multiline}
              error={errors[field.key]}
            />
          ))}
        </ThemedView>

        {additionalFields.length > 0 && (
          <ThemedView type="card" style={styles.formCard}>
            <ThemedText type="heading3" style={styles.formTitle}>
              اطلاعات تکمیلی
            </ThemedText>

            {additionalFields.map(field =>
              field.type === 'select'
                ? renderSelectField(field)
                : (
                  <InputField
                    key={field.key}
                    label={field.label}
                    placeholder={field.placeholder}
                    value={form[field.key] || ''}
                    onChangeText={(value) => handleChange(field.key, value)}
                    keyboardType={field.type === 'number' ? 'numeric' : 'default'}
                    multiline={field.multiline}
                    error={errors[field.key]}
                  />
                )
            )}
          </ThemedView>
        )}

        <View style={styles.buttonContainer}>
          <Button
            title="مرحله بعد: انتخاب موقعیت"
            onPress={handleNext}
            loading={loading}
            fullWidth
            icon={<ThemedText>📍</ThemedText>}
          />
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing['3xl'],
    paddingHorizontal: Spacing.xl,
  },
  progressStep: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressLine: {
    flex: 1,
    height: 2,
    marginHorizontal: Spacing.sm,
  },
  progressText: {
    color: 'white',
    fontWeight: 'bold',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing['3xl'],
  },
  roleIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  roleIcon: {
    fontSize: 36,
  },
  title: {
    marginBottom: Spacing.sm,
  },
  subtitle: {
    opacity: 0.7,
    textAlign: 'center',
  },
  formCard: {
    marginBottom: Spacing.xl,
  },
  formTitle: {
    marginBottom: Spacing.lg,
  },
  selectContainer: {
    marginBottom: Spacing.md,
  },
  selectLabel: {
    marginBottom: Spacing.sm,
  },
  webSelect: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    backgroundColor: 'white',
    fontSize: 16,
    fontFamily: 'Arial',
    direction: 'rtl',
  },
  errorText: {
    marginTop: Spacing.xs,
  },
  buttonContainer: {
    marginTop: Spacing.xl,
  },
});
