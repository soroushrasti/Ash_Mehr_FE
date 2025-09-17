import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { InputField } from '@/components/InputField';
import { Button } from '@/components/Button';
import AppHeader from '@/components/AppHeader';
import { Spacing, BorderRadius } from '@/constants/Design';
import { apiService } from '@/services/apiService';
import {AdminPersonLocation, NeedyCreateWithChildren} from '@/types/api';
import { KeyboardAwareContainer } from '@/components/KeyboardAwareContainer';
import { useAuth } from '@/components/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { RTLPicker } from '@/components/RTLPicker';

interface ExtendedNeedyForm extends NeedyCreateWithChildren {
    BirthDate?: string;
    UnderWhichAdmin?: number;
}

interface AdminOption {
    AdminID: number;
    FirstName: string;
    LastName: string;
}

export default function AdminUserRegister() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { userId } = useAuth();
    const errorColor = useThemeColor({}, 'danger');

    const [formData, setFormData] = useState<ExtendedNeedyForm>({
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
        Latitude: params.latitude ? String(params.latitude) : '',
        Longitude: params.longitude ? String(params.longitude) : '',
        children_of_registre: null,
    });

    const [loading, setLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
    const [adminOptions, setAdminOptions] = useState<AdminPersonLocation[]>([]);

    // Load admin options for dropdown
    useEffect(() => {
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
        loadAdmins();
    }, []);

    // Validation function
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

        // User ID validation
        if (!userId) {
            errors.push('شناسه کاربر ثبت‌کننده یافت نشد. لطفاً دوباره وارد شوید.');
        }

        setValidationErrors(errors);
        setFieldErrors(fieldErrs);
        return errors.length === 0;
    };

    // Clear validation errors when user starts typing
    const handleFieldChange = (field: keyof ExtendedNeedyForm, value: string | number | undefined) => {
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


    return (
        <ThemedView style={styles.container}>
            <AppHeader title="ثبت اطلاعات مددجو" showBackButton />

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

                        {params.latitude && params.longitude && (
                            <View style={styles.locationInfo}>
                                <ThemedText style={styles.locationLabel}>موقعیت انتخاب شده:</ThemedText>
                                <ThemedText style={styles.locationText}>
                                    عرض جغرافیایی: {params.latitude}
                                </ThemedText>
                                <ThemedText style={styles.locationText}>
                                    طول جغرافیایی: {params.longitude}
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
                                    roleTitle: 'ممددجو',
                                    roleIcon: '👤',
                                    role: 'needy',
                                    city: formData.City || '',
                                    province: formData.Province || '',
                                    location: formData.Latitude && formData.Longitude
                                        ? JSON.stringify({
                                            latitude: parseFloat(formData.Latitude),
                                            longitude: parseFloat(formData.Longitude)
                                        })
                                        : '',
                                }
                            });
                        }}
                        variant="outline"
                        style={styles.mapButton}
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
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: Spacing.lg,
        marginBottom: Spacing.md,
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
    submitButton: {
        marginBottom: Spacing.sm,
    },
    mapButton: {
        textAlign: 'right',
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
    picker: {
        height: 50,
        width: '100%',
    },
});
