///////////////edit-good////////////////////
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
import { AdminPersonLocation } from '@/types/api';
import { useAuth } from '@/components/AuthContext';
import { withOpacity } from '@/utils/colorUtils';
import { showAlert } from '@/utils/alert';


interface ExtendedNeedyEditForm {
  goods_of_registre: Array<{
    GoodID?: number;
    TypeGood: string;
    NumberGood: number; // ensure always number
    GivenToWhome: number; // register id (int)
    GivenBy: number; // admin id (int)
    UpdatedDate?: string;
  }>;
}

export default function EditNeedyPage() {
  const { registerId } = useLocalSearchParams();
  const router = useRouter();
  const { userId } = useAuth();
  // compute numeric register id early
  const numericRegisterId = React.useMemo(() => {
    const raw = Array.isArray(registerId) ? registerId[0] : registerId;
    const n = parseInt((raw as string) || '0', 10);
    return isNaN(n) ? 0 : n;
  }, [registerId]);

  const errorColor = useThemeColor({}, 'danger');

  const [goodsCount, setGoodsCount] = useState(0);

  const [formData, setFormData] = useState<ExtendedNeedyEditForm>({
    goods_of_registre: [{
      TypeGood: '',
      NumberGood: 0,
      GivenToWhome: numericRegisterId,
      GivenBy: userId || 0
    }]
  });
   const formDataString = JSON.stringify(formData);

   const parsedFormData = formDataString ? JSON.parse(formDataString) : {};

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
   const loadData = async () => {
     if (registerId) {
       try {
         await Promise.all([
           loadGoodsData(registerId),
           loadAdmins()
         ]);
       } catch (error) {
         console.error('Error loading data:', error);
         showAlert('خطا', 'خطا در بارگذاری اطلاعات');
       }
     }
   };

   loadData();
 }, [registerId]);

  const loadGoodsData = async (id: string) => {
    try {
      const response = await apiService.getGoodsDetails(id);
      if (response.success && response.data) {
        const data = response.data;
        const list = Array.isArray(data.goods) ? data.goods : Array.isArray(data) ? data : [];
        setFormData(prev => ({
          ...prev,
          goods_of_registre: list.map((g: any) => ({
            GoodID: g.GoodID || g.GoodId || g.good_id,
            TypeGood: g.TypeGood || g.type || '',
            NumberGood: Number(g.NumberGood ?? g.number ?? 0),
            GivenToWhome: g.GivenToWhome || numericRegisterId,
            GivenBy: g.GivenBy || (userId || 0),
            UpdatedDate: g.UpdatedDate || g.updated_at
          }))
        }));
        setGoodsCount(list.length);
      } else {
        setFormData({
          goods_of_registre: [{
            TypeGood: '',
            NumberGood: 0,
            GivenToWhome: numericRegisterId,
            GivenBy: userId || 0
          }]
        });
        setGoodsCount(1);
      }
    } catch (error) {
      console.error('Error loading goods data:', error);
      showAlert('خطا', 'خطا در دریافت اطلاعات کمک ها');
    } finally {
      setLoading(false);
    }
  };


    const handleAddNewGood = () => {
      setFormData(prev => ({
        ...prev,
        goods_of_registre: [
          ...prev.goods_of_registre,
          {
            TypeGood: '',
            NumberGood: 0,
            GivenToWhome: numericRegisterId,
            GivenBy: userId || 0
          }
        ]
      }));
      setGoodsCount(c => c + 1);
    };

const removeGoodAt = (index: number) => {
  setFormData(prev => ({
    ...prev,
    goods_of_registre: prev.goods_of_registre.filter((_, i) => i !== index)
  }));
  setGoodsCount(c => Math.max(0, c - 1));
};

const validateGoods = (): boolean => {
  const errs: string[] = [];
  formData.goods_of_registre.forEach((g, idx) => {
    if (!g.TypeGood.trim()) errs.push(`نوع کمک ردیف ${idx + 1} خالی است`);
    if (g.NumberGood === undefined || g.NumberGood === null || isNaN(g.NumberGood) || g.NumberGood <= 0) {
      errs.push(`مقدار کمک ردیف ${idx + 1} باید عدد مثبت باشد`);
    }
  });
  setValidationErrors(errs);
  return errs.length === 0;
};

const handleSaveAllGoods = async () => {
  if (!numericRegisterId) {
    showAlert('خطا', 'شناسه ثبت شونده معتبر نیست');
    return;
  }
  if (!validateGoods()) {
    showAlert('خطا', 'ابتدا خطاهای اعتبارسنجی را برطرف کنید');
    return;
  }
  try {
    setSaving(true);
    const payload = formData.goods_of_registre.map(g => ({
      GoodID: g.GoodID, // backend will upsert if exists
      TypeGood: g.TypeGood.trim(),
      NumberGood: Number(g.NumberGood),
      GivenBy: userId || g.GivenBy || 0,
      // GivenToWhome inferred from path param
    }));
    const response = await apiService.editGood(String(numericRegisterId), payload);
    if (response.success) {
      showAlert('موفق', 'کمک ها با موفقیت ذخیره شدند');
      // refresh to get new GoodID values for newly created goods
      await loadGoodsData(String(numericRegisterId));
        router.push(`/admin/needy-management`);
    } else {
      showAlert('خطا', response.error || 'ذخیره با شکست مواجه شد');
    }
  } catch (e: any) {
    console.error('Save goods error', e);
    showAlert('خطا', e.message || 'خطای ناشناخته در ذخیره');
  } finally {
    setSaving(false);
  }
};

    const handleGoodsCountChange = (count: number) => {
        const numCount = Math.max(0, Math.min(count, 10)); // Limit to 0-10 children
        setGoodsCount(numCount);

        setFormData(prev => {
            const newGoods = Array(numCount).fill(null).map((_, index) => {
                // Keep existing data if available
                const existingGood = prev.goods_of_registre[index];
                return existingGood || {
                    TypeGood: '',
                    NumberGood: '',
                    GivenToWhome: '',
                };
            });

            return {
                ...prev,
                goods_of_registre: newGoods
            };
        });
    };

    const handleGoodFieldChange = (index: number, field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            goods_of_registre: prev.goods_of_registre.map((good, i) => {
                if (i !== index) return good;
                if (field === 'NumberGood') {
                   const normalizeNumber = (str) => {
                      return str.replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
                    };

                    const normalizedValue = normalizeNumber(value);
                    const num = parseInt(normalizedValue, 10);
                    return { ...good, NumberGood: isNaN(num) ? 0 : num };
                }
                return { ...good, [field]: value } as any;
            })
        }));
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
        <AppHeader title="ویرایش کمک ها" subtitle="در حال بارگذاری..." />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
          <ThemedText style={{ marginTop: Spacing.lg, color: textColor }}>
            در حال بارگذاری اطلاعات...
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (!numericRegisterId) {
    return (
      <ThemedView style={styles.container}>
        <AppHeader title="ویرایش کمک ها" showBackButton />
        <View style={styles.loadingContainer}>
          <ThemedText>شناسه نامعتبر است</ThemedText>
        </View>
      </ThemedView>
    );
  }


  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <AppHeader title="ویرایش کمک ها" showBackButton />

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

            {formData.goods_of_registre && formData.goods_of_registre.length > 0 && (

              <View>
                <ThemedText style={[styles.sectionTitle, {textAlign: 'right'}]}>
                  اطلاعات کمک ها

                </ThemedText>

                {formData.goods_of_registre.map((good, index) => (
                  <View key={good.GoodID ?? index} style={[styles.childCard, { backgroundColor: withOpacity(primaryColor, 5), borderColor: withOpacity(primaryColor, 20) }]}>
                    <View style={styles.childHeader}>
                      <ThemedText style={[styles.childTitle, { color: primaryColor, textAlign: 'right' }]}>🛍️ کمک {index + 1}</ThemedText>
                      <View style={{ flexDirection: 'row-reverse', gap: 8 }}>
                        {!!good.GoodID && (
                          <ThemedText style={{ fontSize: 12, color: textColor, opacity: 0.6 }}></ThemedText>
                        )}
                        <TouchableOpacity onPress={() => removeGoodAt(index)} style={styles.deleteButton}>
                          <ThemedText style={styles.deleteText}>حذف</ThemedText>
                        </TouchableOpacity>
                      </View>
                    </View>

                    <InputField
                      label= "نوع کمک *"
                      value={good.TypeGood || ''}
                      onChangeText={(text) => handleGoodFieldChange(index, 'TypeGood', text)}
                      placeholder = "نوع کمک"
                      textAlign = "right"
                    />

                    <InputField
                     label= "مقدار کمک *"
                     value={good.NumberGood === undefined || good.NumberGood === null ? '' : String(good.NumberGood)}
                     onChangeText={(text) => handleGoodFieldChange(index, 'NumberGood', text)}
                     placeholder= "  مقدار کمک"
                     keyboardType="numeric"
                     textAlign = "right"
                    />
                  </View>
                ))}
              </View>
            )}



<View style={styles.childrenButtonsContainer}>
  <TouchableOpacity
    style={[styles.addButton, { backgroundColor: primaryColor, opacity: saving ? 0.5 : 1 }]}
    disabled={saving}
    onPress={handleAddNewGood}
  >
    <ThemedText style={styles.addButtonText}>+ افزودن ردیف جدید</ThemedText>
  </TouchableOpacity>

  {formData.goods_of_registre.length > 0 && (
    <TouchableOpacity
      style={[styles.saveButton, { backgroundColor: '#28a745', opacity: saving ? 0.6 : 1 }]}
      disabled={saving}
      onPress={handleSaveAllGoods}
    >
      <ThemedText style={styles.saveButtonText}>{saving ? 'در حال ذخیره...' : '💾 ذخیره همه'}</ThemedText>
    </TouchableOpacity>
  )}
</View>

          </View>
        </ScrollView>

        <View style={styles.footer}>

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
      paddingHorizontal: 10,
      paddingVertical: 4,
      backgroundColor: '#d9534f',
      borderRadius: 6,
      alignSelf: 'flex-start'
    },
    deleteText: {
      color: 'white',
      fontSize: 12,
      fontWeight: '600'
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
