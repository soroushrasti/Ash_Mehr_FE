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
import { AdminCreate } from '@/types/api';
import { KeyboardAwareContainer } from '@/components/KeyboardAwareContainer';
import { useAuth } from '@/components/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function AdminUserRegister() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { userId } = useAuth();
    const errorColor = useThemeColor({}, 'danger');

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
        PostCode: '',
        CreatedBy: '',
        UserRole: 'Admin',
        Latitude: params.latitude ? String(params.latitude) : '',
        Longitude: params.longitude ? String(params.longitude) : '',
    });

    const [loading, setLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});

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

        // Password validation
        if (!formData.Password || formData.Password.length < 6) {
            errors.push('رمز عبور باید حداقل ۶ کاراکتر باشد');
            fieldErrs.Password = 'رمز عبور باید حداقل ۶ کاراکتر باشد';
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

        // User ID validation
        if (!userId) {
            errors.push('شناسه کاربر ثبت‌کننده یافت نشد. لطفاً دوباره وارد شوید.');
        }

        setValidationErrors(errors);
        setFieldErrors(fieldErrs);
        return errors.length === 0;
    };

    // Clear validation errors when user starts typing
    const handleFieldChange = (field: keyof AdminCreate, value: string) => {
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
            <AppHeader title="ثبت اطلاعات نماینده " showBackButton />

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
                            placeholder="نام خود را وارد کنید"
                            error={fieldErrors.FirstName}
                            required
                        />

                        <InputField
                            label="نام خانوادگی *"
                            value={formData.LastName}
                            onChangeText={(text) => handleFieldChange('LastName', text)}
                            placeholder="نام خانوادگی خود را وارد کنید"
                            error={fieldErrors.LastName}
                            required
                        />

                        <InputField
                            label="شماره موبایل"
                            value={formData.Phone || ''}
                             onChangeText={(text) => {
                                    // فقط اعداد فارسی و انگلیسی را قبول کند
                                    const cleanedText = text.replace(/[^0-9۰-۹]/g, '');
                                    handleFieldChange('Phone', cleanedText);
                                }}
                            placeholder="09123456789"
                            keyboardType="phone-pad"
                            error={fieldErrors.Phone}
                        />

                        <InputField
                            label="کد ملی"
                            value={formData.NationalID || ''}
                             onChangeText={(text) => {
                                // فقط اعداد فارسی و انگلیسی را قبول کند
                                const cleanedText = text.replace(/[^0-9۰-۹]/g, '');
                                handleFieldChange('NationalID', cleanedText);
                            }}
                            placeholder="کد ملی ۱۰ رقمی"
                            keyboardType="numeric"
                            error={fieldErrors.NationalID}
                        />


                        <InputField
                            label="رمز عبور *"
                            value={formData.Password}
                            onChangeText={(text) => handleFieldChange('Password', text)}
                            placeholder="حداقل ۶ کاراکتر"
                            secureTextEntry
                            error={fieldErrors.Password}
                            required
                        />


                        <ThemedText style={styles.sectionTitle}>آدرس</ThemedText>

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
                            label="آدرس"
                            value={formData.Street || ''}
                            onChangeText={(text) => handleFieldChange('Street', text)}
                            placeholder="آدرس کامل"
                            multiline
                        />

                         <InputField
                           label="کد پستی"
                           value={formData.PostCode || ''}
                           onChangeText={(text) => handleFieldChange('PostCode', text)}
                           placeholder="کد پستی"
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
                                    roleTitle: 'نماینده',
                                    roleIcon: '👤👤',
                                    role: 'GroupAdmin',
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
});
