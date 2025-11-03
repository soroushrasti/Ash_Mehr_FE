import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Alert, ScrollView, TouchableOpacity } from 'react-native';
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
    UpdatedDate?: string;
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
    const primaryColor = useThemeColor({}, 'primary');
    const successColor = useThemeColor({}, 'success');
    const warningColor = useThemeColor({}, 'warning');

    const [childrenCount, setChildrenCount] = useState(0);
    const [goodsCount, setGoodsCount] = useState(0);

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
        UnderSecondAdminID: undefined,
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
        is_disconnected: false,
        children_of_registre: [],
        goods_of_registre: []
    });

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

const handleGoodsCountChange = (count: number) => {
        const numCount = Math.max(0, Math.min(count, 10)); // Limit to 0-10 children
        setGoodsCount(numCount);

        setFormData(prev => {
            const newGoods = Array(numCount).fill(null).map((_, index) => {
                // Keep existing data if available
                const existingGoods = prev.goods_of_registre[index];
                return existingGoods || {
                    TypeGood: '',
                    NumberGood: '',
                    GivenBy: formData.UnderWhichAdmin,
                };
            });

            return {
                ...prev,
                goods_of_registre: newGoods
            };
        });
    };

    const handleGoodFieldChange = (index: number, field: string, value: string) => {
          let finalValue = value;

            // اگر فیلد عددی است و کاربر عدد فارسی وارد کرده
            if (field === 'NumberGood') {
                // تبدیل اعداد فارسی به انگلیسی
                finalValue = value
                    .replace(/۰/g, '0')
                    .replace(/۱/g, '1')
                    .replace(/۲/g, '2')
                    .replace(/۳/g, '3')
                    .replace(/۴/g, '4')
                    .replace(/۵/g, '5')
                    .replace(/۶/g, '6')
                    .replace(/۷/g, '7')
                    .replace(/۸/g, '8')
                    .replace(/۹/g, '9');
            }
         setFormData(prev => {
               const updatedGoods = [...prev.goods_of_registre];
               updatedGoods[index] = {
                   ...updatedGoods[index],
                   [field]: finalValue
               };
               return {
                   ...prev,
                   goods_of_registre: updatedGoods
               };
           });

    };

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


        if (!formData.Phone.trim()) {
            errors.push('شماره موبایل الزامی است');
            fieldErrs.LastName = 'شماره موبایل الزامی است';
        }

        if (!formData.Region.trim()) {
            errors.push('منطقه الزامی است');
            fieldErrs.LastName = 'منطقه الزامی است';
        }

        if (!formData.City.trim()) {
            errors.push('شهر الزامی است');
            fieldErrs.LastName = 'شهر الزامی است';
        }

        if (!formData.Gender.trim()) {
            errors.push('جنسیت الزامی است');
            fieldErrs.LastName = 'جنسیت الزامی است';
        }

        if (!formData.Province.trim()) {
            errors.push('استان الزامی است');
            fieldErrs.LastName = 'استان الزامی است';
        }

         if (!formData.UnderWhichAdmin.trim()) {
                errors.push('نماینده الزامی است');
                fieldErrs.LastName = 'نماینده الزامی است';
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

        // numbergood validation (if provided)
        if (formData.NumberGood) {
            // بررسی اینکه آیا مقدار فقط عدد است (هم فارسی هم انگلیسی)
            const ageRegex = /^[u06F0-u06F90-9]+$/; // اعداد فارسی و انگلیسی

            if (!ageRegex.test(formData.NumberGood)) {
                errors.push('مقدار کمک باید یک عدد معتبر باشد');
                fieldErrs.NumberGood = 'مقدار کمک باید یک عدد معتبر باشد';
            } else {
                // تبدیل اعداد فارسی به انگلیسی برای محاسبه
                const persianToEnglish = (str) => {
                    return str.replace(/[u06F0-u06F9]/g, (char) => {
                        return String.fromCharCode(char.charCodeAt(0) - 0x6F0 + 0x30);
                    });
                };
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
    const handleFieldChange = (field: keyof ExtendedNeedyForm, value: string | number | undefined | Child[]) => {
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
                            label="شماره موبایل*"
                            value={formData.Phone || ''}
                             onChangeText={(text) => {
                                    // فقط اعداد فارسی و انگلیسی را قبول کند
                                    const cleanedText = text.replace(/[^0-9۰-۹]/g, '');
                                    handleFieldChange('Phone', cleanedText);
                                }}
                            placeholder="09xxxxxxxxx"
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
                            label="تاریخ تولد"
                            value={formData.BirthDate || ''}
                            onChangeText={(text) => handleFieldChange('BirthDate', text)}
                            placeholder="۱۴۰۰/۰۱/۰۱"
                        />

                        <ThemedText style={styles.fieldLabel}>جنسیت*</ThemedText>
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
                            label="استان*"
                            value={formData.Province || ''}
                            onChangeText={(text) => handleFieldChange('Province', text)}
                            placeholder="نام استان"
                        />

                        <InputField
                            label="شهر*"
                            value={formData.City || ''}
                            onChangeText={(text) => handleFieldChange('City', text)}
                            placeholder="نام شهر"
                        />

                        <InputField
                            label="منطقه*"
                            value={formData.Region || ''}
                            onChangeText={(text) => handleFieldChange('Region', text)}
                            placeholder="منطقه یا ناحیه"
                        />

                        <InputField
                            label="آدرس*"
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
                        <ThemedText style={styles.sectionTitle}>اطلاعات فرزندان</ThemedText>

                        {/* Enhanced Children Count Section */}
                        <View style={styles.childrenCountSection}>
                            <ThemedText style={[styles.fieldLabel, styles.rtlText]}>تعداد فرزندان</ThemedText>

                            <View style={styles.counterContainer}>
                                <TouchableOpacity
                                    style={[
                                        styles.counterButton,
                                        {
                                            backgroundColor: childrenCount > 0 ? '#DC3545' : '#E0E0E0',
                                            borderWidth: 1,
                                            borderColor: childrenCount > 0 ? '#C82333' : '#CCCCCC'
                                        }
                                    ]}
                                    onPress={() => handleChildrenCountChange(childrenCount - 1)}
                                    disabled={childrenCount <= 0}
                                >
                                    <ThemedText style={[
                                        styles.counterButtonText,
                                        { color: childrenCount > 0 ? '#FFFFFF' : '#999999' }
                                    ]}>−</ThemedText>
                                </TouchableOpacity>

                                <View style={styles.countDisplay}>
                                    <ThemedText style={styles.countNumber}>{childrenCount}</ThemedText>
                                    <ThemedText style={[styles.countLabel, styles.rtlText]}>فرزند</ThemedText>
                                </View>

                                <TouchableOpacity
                                    style={[
                                        styles.counterButton,
                                        {
                                            backgroundColor: childrenCount < 10 ? '#28A745' : '#E0E0E0',
                                            borderWidth: 1,
                                            borderColor: childrenCount < 10 ? '#1E7E34' : '#CCCCCC'
                                        }
                                    ]}
                                    onPress={() => handleChildrenCountChange(childrenCount + 1)}
                                    disabled={childrenCount >= 10}
                                >
                                    <ThemedText style={[
                                        styles.counterButtonText,
                                        { color: childrenCount < 10 ? '#FFFFFF' : '#999999' }
                                    ]}>+</ThemedText>
                                </TouchableOpacity>
                            </View>

                            {childrenCount > 0 && (
                                <View style={styles.childrenCountInfo}>
                                    <ThemedText style={[styles.infoText, styles.rtlText, { color: primaryColor }]}>
                                        📝 لطفاً اطلاعات {childrenCount} فرزند را وارد کنید
                                    </ThemedText>
                                </View>
                            )}

                            {childrenCount >= 8 && (
                                <View style={styles.warningContainer}>
                                    <ThemedText style={[styles.warningText, styles.rtlText, { color: warningColor }]}>
                                        ⚠️ تعداد فرزندان بالا می‌باشد. در صورت نیاز با مدیر تماس بگیرید.
                                    </ThemedText>
                                </View>
                            )}
                        </View>

                        {/* Children Information Forms */}
                        {formData.children_of_registre.map((child, index) => (
                            <View key={index} style={styles.childContainer}>
                                <View style={styles.childHeader}>
                                    <ThemedText style={[styles.childTitle, styles.rtlText]}>
                                        👶 فرزند {index + 1}
                                    </ThemedText>
                                    <View style={styles.childNumber}>
                                        <ThemedText style={styles.childNumberText}>{index + 1}</ThemedText>
                                    </View>
                                </View>

                                <InputField
                                    label="نام *"
                                    value={child.FirstName}
                                    onChangeText={(text) => handleChildFieldChange(index, 'FirstName', text)}
                                    placeholder="نام فرزند"
                                    required
                                />

                                <InputField
                                    label="نام خانوادگی *"
                                    value={child.LastName}
                                    onChangeText={(text) => handleChildFieldChange(index, 'LastName', text)}
                                    placeholder="نام خانوادگی فرزند"
                                    required
                                />

                                <InputField
                                    label="کد ملی"
                                    value={child.NationalID}
                                    onChangeText={(text) => {
                                            // فقط اعداد فارسی و انگلیسی را قبول کند
                                            const cleanedText = text.replace(/[^0-9۰-۹]/g, '');
                                            handleChildFieldChange(index, 'NationalID', cleanedText);
                                        }}
                                    placeholder="کد ملی ۱۰ رقمی"
                                    keyboardType="numeric"
                                    maxLength={10}
                                />

                                <InputField
                                    label="سن"
                                    value={child.Age}
                                    onChangeText={(text) => {
                                            // فقط اعداد فارسی و انگلیسی را قبول کند
                                            const cleanedText = text.replace(/[^0-9۰-۹]/g, '');
                                            handleChildFieldChange(index, 'Age', cleanedText);
                                        }}
                                    placeholder="سن فرزند"
                                    keyboardType="numeric"
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

                        <ThemedText style={styles.sectionTitle}>اطلاعات تحصیلی و شغلی</ThemedText>

                        <ThemedText style={styles.childTitle}>سطح تحصیلات</ThemedText>
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

                        <ThemedText style={styles.fieldLabel}>تحت نظارت نماینده *</ThemedText>
                        <RTLPicker
                            items={[
                                { label: "انتخاب نماینده", value: 0 },
                                ...adminOptions.map(admin => ({
                                    label: `${admin.name} ${admin.info ? admin.info : ''}` || `نماینده ${admin.id}`,
                                    value: admin.id
                                }))
                            ]}
                            selectedValue={formData.UnderWhichAdmin || 0}
                            onValueChange={(value) => {
                                    if (value === 0) {
                                        Alert.alert('اخطار', 'لطفا یک نماینده انتخاب کنید');
                                        return;
                                    }
                                    handleFieldChange('UnderWhichAdmin', value);
                                }}
                            placeholder="انتخاب نماینده"
                            style={styles.pickerContainer}
                            required
                        />

                <ThemedText style={styles.fieldLabel}>تحت نظارت نماینده فرعی</ThemedText>
                        <RTLPicker
                            items={[
                                { label: "انتخاب نماینده", value: 0 },
                                ...adminOptions.map(admin => ({
                                    label: `${admin.name} ${admin.info ? admin.info : ''}` || `نماینده ${admin.id}`,
                                    value: admin.id
                                }))
                            ]}
                            selectedValue={formData.UnderSecondAdminID || 0}
                            onValueChange={(value) => handleFieldChange('UnderSecondAdminID', value || undefined)}
                            placeholder="انتخاب نماینده"
                            style={styles.pickerContainer}
                     />

            <ThemedText style={styles.sectionTitle}>اطلاعات کمک ها</ThemedText>

               {/* Enhanced Children Count Section */}
               <View style={styles.childrenCountSection}>
                   <ThemedText style={[styles.fieldLabel, styles.rtlText]}>تعداد کمک ها</ThemedText>

                   <View style={styles.counterContainer}>
                       <TouchableOpacity
                           style={[
                               styles.counterButton,
                               {
                                   backgroundColor: childrenCount > 0 ? '#DC3545' : '#E0E0E0',
                                   borderWidth: 1,
                                   borderColor: childrenCount > 0 ? '#C82333' : '#CCCCCC'
                               }
                           ]}
                           onPress={() => handleGoodsCountChange(goodsCount - 1)}
                           disabled={goodsCount <= 0}
                       >
                           <ThemedText style={[
                               styles.counterButtonText,
                               { color: goodsCount > 0 ? '#FFFFFF' : '#999999' }
                           ]}>−</ThemedText>
                       </TouchableOpacity>

                       <View style={styles.countDisplay}>
                           <ThemedText style={styles.countNumber}>{goodsCount}</ThemedText>
                           <ThemedText style={[styles.countLabel, styles.rtlText]}>کمک</ThemedText>
                       </View>

                       <TouchableOpacity
                           style={[
                               styles.counterButton,
                               {
                                   backgroundColor: childrenCount < 10 ? '#28A745' : '#E0E0E0',
                                   borderWidth: 1,
                                   borderColor: childrenCount < 10 ? '#1E7E34' : '#CCCCCC'
                               }
                           ]}
                           onPress={() => handleGoodsCountChange(goodsCount + 1)}
                           disabled={goodsCount >= 10}
                       >
                           <ThemedText style={[
                               styles.counterButtonText,
                               { color: goodsCount < 10 ? '#FFFFFF' : '#999999' }
                           ]}>+</ThemedText>
                       </TouchableOpacity>
                   </View>

                   {goodsCount > 0 && (
                       <View style={styles.childrenCountInfo}>
                           <ThemedText style={[styles.infoText, styles.rtlText, { color: primaryColor }]}>
                               📝 لطفاً اطلاعات {goodsCount} کمک را وارد کنید
                           </ThemedText>
                       </View>
                   )}

               </View>
              {/* goods Information Forms */}
                    {formData.goods_of_registre.map((good, index) => (
                        <View key={index} style={styles.childContainer}>
                            <View style={styles.childHeader}>
                                <ThemedText style={[styles.childTitle, styles.rtlText]}>
                                    👶 کمک {index + 1}
                                </ThemedText>
                                <View style={styles.childNumber}>
                                    <ThemedText style={styles.childNumberText}>{index + 1}</ThemedText>
                                </View>
                            </View>

                            <InputField
                                label="نوع کمک"
                                value={good.TypeGood}
                                onChangeText={(text) => handleGoodFieldChange(index, 'TypeGood', text)}
                                placeholder="نوع کمک"
                                required
                            />
                             <InputField
                                 label="مقدار کمک"
                                 value={good.NumberGood}
                                 onChangeText={(text) => {
                                     const cleanedText = text.replace(/[^0-9۰-۹]/g, '');
                                     handleGoodFieldChange(index, 'NumberGood', cleanedText);
                                 }}
                                 placeholder="مقدار کمک"
                                 keyboardType = "numeric"
                                 required
                             />
                                    </View>
                            ))}

                      <ThemedText style={styles.fieldLabel}>قطع واریزی</ThemedText>
                      <RTLPicker
                          items={[
                              { label: 'بله', value: true },
                              { label: 'خیر', value: false }
                          ]}
                          selectedValue={formData.is_disconnected}
                          onValueChange={(value) => handleFieldChange('is_disconnected', value)}
                          placeholder= 'خیر'
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
                        if (!formData.FirstName || formData.FirstName.trim() === '') {
                            alert('فیلد نام اجباری است');
                            return;
                        }
                         if (!formData.LastName || formData.LastName.trim() === '') {
                                alert('فیلد نام خانوادگی اجباری است');
                                return;
                            }
                        if (!formData.Phone || formData.Phone.trim() === '') {
                                alert('فیلد تلفن اجباری است');
                                return;
                            }
                        if (!formData.Gender || formData.Gender.trim() === '') {
                                alert('فیلد جنسیت اجباری است');
                                return;
                            }
                        if (!formData.Province || formData.Province.trim() === '') {
                                alert('فیلد استان اجباری است');
                                return;
                            }
                        if (!formData.City || formData.City.trim() === '') {
                                alert('فیلد شهر اجباری است');
                                return;
                            }
                        if (!formData.Region || formData.Region.trim() === '') {
                                alert('فیلد منطقه اجباری است');
                                return;
                            }
                        if (!formData.Street || formData.Street.trim() === '') {
                                alert('فیلد آدرس اجباری است');
                                return;
                            }
                        if (!formData.UnderWhichAdmin || String(formData.UnderWhichAdmin).trim() === '') {
                                alert('فیلد تحت نظارت نماینده اجباری است');
                                return;
                            }

                            if (formData.children_of_registre && formData.children_of_registre.length > 0) {
                               for (let i = 0; i < formData.children_of_registre.length; i++) {
                                   const child = formData.children_of_registre[i];
                                   const childNumber = i + 1;

                                   if (!child.FirstName || child.FirstName.trim() === '') {
                                       alert(`فیلد نام فرزند ${childNumber} اجباری است`);
                                       return;
                                   }

                                   if (!child.LastName || child.LastName.trim() === '') {
                                       alert(`فیلد نام خانوادگی فرزند ${childNumber} اجباری است`);
                                       return;
                                   }
                               }
                           }

                        if (formData.goods_of_registre && formData.goods_of_registre.length > 0) {
                               for (let i = 0; i < formData.goods_of_registre.length; i++) {
                                   const good = formData.goods_of_registre[i];
                                   const goodNumber = i + 1;

                                   if (!good.TypeGood || good.TypeGood.trim() === '') {
                                       alert(`فیلد نوع کمک ${goodNumber} اجباری است`);
                                       return;
                                   }

                                   if (!good.NumberGood || good.NumberGood.trim() === '') {
                                       alert(`فیلد مقدار کمک ${goodNumber} اجباری است`);
                                       return;
                                   }
                               }
                           }

                    // Phone validation (if provided)
                            if (formData.Phone && formData.Phone.trim()) {
                                const phoneRegex = /^09\d{9}$/;
                                if (!phoneRegex.test(formData.Phone)) {
                                    alert('شماره موبایل باید با ۰۹ شروع شده و ۱۱ رقم باشد');
                                    return;
                                }
                            }

                            // National ID validation (if provided)
                            if (formData.NationalID && formData.NationalID.trim()) {
                                if (formData.NationalID.length !== 10) {
                                    alert('کد ملی باید ۱۰ رقم باشد');
                                    return;
                                }
                            }

                            // Age validation (if provided)
                            if (formData.Age && (formData.Age < 1 || formData.Age > 120)) {
                                alert('سن باید بین ۱ تا ۱۲۰ سال باشد');
                                return;
                            }

                            router.push({
                                pathname: '/admin/register/map',
                                params: {
                                    formData: JSON.stringify(formData),
                                    roleTitle: 'مددجو',
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
    childrenCountSection: {
        marginBottom: Spacing.lg,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        backgroundColor: '#F9F9F9',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    counterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: Spacing.sm,
    },
    counterButton: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    counterButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    countDisplay: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: Spacing.md,
    },
    countNumber: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2E7D32',
    },
    countLabel: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    childrenCountInfo: {
        marginTop: Spacing.sm,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(76, 175, 80, 0.3)',
    },
    infoText: {
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
    },
    warningContainer: {
        marginTop: Spacing.sm,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        backgroundColor: 'rgba(255, 193, 7, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 193, 7, 0.3)',
    },
    warningText: {
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    childContainer: {
        marginBottom: Spacing.lg,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    childHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: Spacing.md,
        paddingBottom: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    childTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2E7D32',
    },
    childNumber: {
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2E7D32',
    },
    childNumberText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
    rtlText: {
        textAlign: 'right',
    },
});
