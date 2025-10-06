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
import { RTLPicker } from '@/components/RTLPicker';
import { AdminPersonLocation, NeedyCreateWithChildren } from '@/types/api';
import { useAuth } from '@/components/AuthContext';
import { withOpacity } from '@/utils/colorUtils';


interface ExtendedNeedyEditForm {
  goods_of_registre: Array<{
    GoodID?: number;
    TypeGood: string;
    NumberGood: number;
    GivenToWhome: number;
    GivenBy: number;
    UpdatedDate?: string;
  }>;
}

export default function EditNeedyPage() {
  const { registerId } = useLocalSearchParams();
  const router = useRouter();
  const { userId } = useAuth();
  const errorColor = useThemeColor({}, 'danger');

  const [goodsCount, setGoodsCount] = useState(0);

  const [formData, setFormData] = useState<ExtendedNeedyEditForm>({
    goods_of_registre: [{
      TypeGood: '',
      NumberGood: 0,
      GivenToWhome: parseInt(registerId as string),
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
         Alert.alert('خطا', 'خطا در بارگذاری اطلاعات');
       }
     }
   };

   loadData();
 }, [registerId]);

  const loadGoodsData = async (id: string) => {
    try {
      const response = await apiService.getGoodsDetails(id);
      console.log('API Response:', response);

      if (response.success && response.data) {
        const data = response.data;
        console.log('Goods data:', data);

        setFormData(prev => ({
          ...prev,
          goods_of_registre: data.goods || data || []
        }));

        setGoodsCount(data.goods?.length || data?.length || 0);
      } else {
        console.log('No goods found, initializing empty form');
        setFormData({
          goods_of_registre: [{
            TypeGood: '',
            NumberGood: 0,
            GivenToWhome: parseInt(id),
            GivenBy: userId || 0
          }]
        });
      }
    } catch (error) {
      console.error('Error loading goods data:', error);
      Alert.alert('خطا', 'خطا در دریافت اطلاعات کالاها');
    } finally {
      setLoading(false);
    }
  };


    const handleAddNewGood = () => {
      const currentGoods = formData.goods_of_registre || [];

      const newGood = {
        TypeGood: '',
        NumberGood: '',
        GivenToWhome: registerId,
        GivenBy: userId,
      };

      const newGoods = [...currentGoods, newGood];
      setFormData({...formData, goods_of_registre: newGoods});
    };

const goodPayload = {
                  ...parsedFormData,
                  GivenBy: Number(userId),
                  GivenToWhome: registerId,
              };

const handleEditGoods = async () => {
    const response = await apiService.editGood(registerId, goodPayload);
    if (response.success)
    {
        alert("ویرایش با موفقیت انجام شد!");
        }
    }

const handleSaveGoods = async () => {
  try {
    const newGoods = formData.goods_of_registre.filter(good =>
      !good.GoodID && good.TypeGood && good.NumberGood
    );

    if (newGoods.length === 0) {
      alert('هیچ کمک جدید معتبری برای ذخیره وجود ندارد');
      return;
    }

    const savePromises = newGoods.map((good, index) => {
      const goodData = {
        ...good,
        GivenToWhome: registerId,
      };
      console.log(`در حال ذخیره کمک جدید شماره ${index + 1} از ${newGoods.length}`);
      return apiService.createGoodNeedy(goodData);
    });

    await Promise.all(savePromises);
    alert(`${newGoods.length} کمک جدید با موفقیت ذخیره شد`);

  } catch (error) {
    console.error('خطا در ذخیره کمک ها:', error);
    alert('خطا در ذخیره کمک ها: ' + error.message);
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
            goods_of_registre: prev.goods_of_registre.map((good, i) =>
                i === index ? { ...good, [field]: value } : good
            )
        }));
    };

  const handleAddGood = async (index) => {
       await apiService.createGoodNeedyPerson(formData.goods_of_registre[index].GoodID);
      };
  const handlEditGoods = async(index)=> {
      await apiService.editGood(registerId);
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
                  <View key={index} style={[styles.childCard, { backgroundColor: withOpacity(primaryColor, 5), borderColor: withOpacity(primaryColor, 20) }]}>

                    {/* هدر کارت کمک  */}
                    <View style={styles.childHeader}>
                      <ThemedText style={[styles.childTitle, { color: primaryColor, textAlign: 'right' }]}>
                        👶 کمک {index + 1}
                      </ThemedText>
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
                     value={good.NumberGood || ''}
                     onChangeText={(text) => handleGoodFieldChange(index, 'NumberGood', text)}
                     placeholder= "  مقدار کمک"
                     textAlign = "right"
                    />
                  </View>
                ))}
              </View>
            )}

        <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: '#28a745' }]}
              onPress={handleEditGoods}
            >
              <ThemedText style={styles.saveButtonText}> ویرایش کمک ها </ThemedText>
            </TouchableOpacity>

<View style={styles.childrenButtonsContainer}>
  {/* دکمه افزودن فرزند جدید */}
  <TouchableOpacity
    style={[styles.addButton, { backgroundColor: primaryColor }]}
    onPress={handleAddNewGood}
  >
    <ThemedText style={styles.addButtonText}>+ افزودن کمک جدید</ThemedText>
  </TouchableOpacity>


  {/* دکمه ذخیره فرزندان در دیتابیس */}
  {formData.goods_of_registre && formData.goods_of_registre.length > 0 && (
    <TouchableOpacity
      style={[styles.saveButton, { backgroundColor: '#28a745' }]}
      onPress={handleSaveGoods}
    >
      <ThemedText style={styles.saveButtonText}>💾 ذخیره کمک ها </ThemedText>
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
