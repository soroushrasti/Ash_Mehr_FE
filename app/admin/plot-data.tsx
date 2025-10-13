import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { apiService } from '@/services/apiService';

const RegisterCharts = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRegisterStats();
  }, []);

  const fetchRegisterStats = async () => {
    try {
      setLoading(true);
      const response = await apiService.getRegisterStats();

      if (!response?.data?.adminStats || !response?.data?.provinceStats || !response?.data?.educationLevelStats || !response?.data?.numberGoodStats || !response?.data?.typeGoodStats || !response?.data?.childrenNumberStats) {
        throw new Error('داده‌ها به درستی دریافت نشدند');
      }

      // پاکسازی و فرمت داده‌ها
      const formattedAdminData = formatChartData(response.data.adminStats, 'admin');
      const formattedProvinceData = formatChartData(response.data.provinceStats, 'province');
      const formattedEducationLevelData = formatChartData(response.data.educationLevelStats, 'educationLevel');
      const formattedNumberGoodData = formatChartData(response.data.numberGoodStats, 'numberGood');
      const formattedTypeGoodData = formatChartData(response.data.typeGoodStats, 'typeGood');
      const formattedChildrenNumberData = formatChartData(response.data.childrenNumberStats, 'childrenNumber');

      setChartData({
        adminStats: formattedAdminData,
        provinceStats: formattedProvinceData,
        educationLevel : formattedEducationLevelData,
        numberGood : formattedNumberGoodData,
        typeGood : formattedTypeGoodData,
        childrenNumber : formattedChildrenNumberData
      });
      setError(null);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('خطا در دریافت داده‌ها');
    } finally {
      setLoading(false);
    }
  };

  // تابع برای فرمت کردن و پاکسازی داده‌ها
  const formatChartData = (data, type) => {
    if (!data || typeof data !== 'object') {
      return {
        labels: [],
        datasets: [{ data: [] }]
      };
    }

    // استخراج labels و data از شیء
    const labels = data.labels || [];
    const datasets = data.datasets || [];

       const educationMapping = {
           'Kindergarten': 'مهدکودک',
            'Primary': 'ابتدایی',
            'Secondary': 'راهنمایی',
            'High School': 'دبیرستان',
            'Diploma': 'دیپلم',
            'Associate Degree': 'فوق‌دیپلم',
            'Bachelor': 'لیسانس',
            'Master': 'فوق‌لیسانس',
            'PhD': 'دکتری'
        };

        // تبدیل برچسب‌ها به فارسی اگر نوع نمودار مربوط به تحصیلات باشد
        const persianLabels = labels.map(label => {
            if (type && type.includes('education')) {
                return educationMapping[label] || label;
            }
            return label;
        });

    // پاکسازی داده‌ها - تبدیل NaN به 0
    const cleanedDatasets = datasets.map(dataset => ({
      ...dataset,
      data: (dataset.data || []).map(value =>
        isNaN(Number(value)) || value === null || value === undefined ? 0 : Number(value)
      )
    }));

  return {
      labels: persianLabels.filter(label => label !== null && label !== undefined && label !== ''),
      datasets: cleanedDatasets
  };
  };

const calculateChartWidth = (labels) => {
  const baseWidth = 350;
  const minBarSpacing = 60; // حداقل فاصله برای هر میله
  return Math.max(baseWidth, labels.length * minBarSpacing);
};

const processChartData = (chartData) => {
  if (!chartData || !chartData.labels || !chartData.datasets) return null;

  // پیدا کردن ایندکس‌های معتبر
  const validIndices = chartData.labels
    .map((label, index) => ({
      label,
      index,
      isValid: label !== null &&
               label !== undefined &&
               label.toString().trim() !== ''
    }))
    .filter(item => item.isValid)
    .map(item => item.index);

  // اگر هیچ ایندکس معتبری وجود ندارد
  if (validIndices.length === 0) return null;

  // ساخت داده‌های جدید با فیلتر کردن
  const processedData = {
    labels: validIndices.map(index => chartData.labels[index]),
    datasets: chartData.datasets.map(dataset => ({
      ...dataset,
      data: validIndices.map(index => dataset.data[index])
    }))
  };

  return processedData;
};

  // تابع برای بررسی اعتبار داده‌های نمودار
  const isValidChartData = (chartData) => {
      if (!chartData || !chartData.labels || !chartData.datasets) return false;

      // بررسی وجود حداقل یک label غیر خالی
      const hasValidLabel = chartData.labels.some(label =>
        label !== null &&
        label !== undefined &&
        label.toString().trim() !== ''
      );

      if (!hasValidLabel) return false;

      // بررسی وجود حداقل یک dataset با داده‌های معتبر
      return chartData.datasets.some(dataset =>
        dataset &&
        dataset.data &&
        Array.isArray(dataset.data) &&
        dataset.data.some(value => typeof value === 'number' && !isNaN(value))
      );
  };

const processNumberGoodStats = (data) => {
  if (!data || !data.labels || !data.datasets) return null;

  // محدود کردن طول برچسب‌ها و فرمت کردن اعداد بزرگ
  const processedLabels = data.labels.map(label => {
    if (label === null || label === undefined) return 'نامشخص';
    if (typeof label === 'number' && label > 1000000) {
      return `${(label / 1000000).toFixed(1)}M`; // تبدیل به میلیون
    }
    if (typeof label === 'number' && label > 1000) {
      return `${(label / 1000).toFixed(1)}K`; // تبدیل به هزار
    }
    return String(label).substring(0, 10); // محدود کردن طول رشته
  });

  return {
    labels: processedLabels,
    datasets: data.datasets
  };
};


  if (loading) {
    return <Text style={{ textAlign: 'center', padding: 20 }}>در حال بارگذاری...</Text>;
  }

  if (error) {
    return <Text style={{ textAlign: 'center', padding: 20, color: 'red' }}>{error}</Text>;
  }

  if (!chartData) {
    return <Text style={{ textAlign: 'center', padding: 20 }}>داده‌ای برای نمایش وجود ندارد</Text>;
  }

  return (
           <ScrollView contentContainerStyle={{ padding: 16, alignItems: 'center' }}>
             {/* نمودار ادمین */}
             <View style={{ marginBottom: 20 }}>
               <Text style={{ textAlign: 'center', fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
                 نمودار تعداد مددجوها به ازای هر نماینده
               </Text>
                {isValidChartData(chartData.adminStats) ? (
                   <BarChart
                            data={chartData.adminStats}
                            width={calculateChartWidth(chartData.adminStats.labels)}
                            height={220}
                            chartConfig={{
                              backgroundColor: '#ffffff',
                              backgroundGradientFrom: '#ffffff',
                              backgroundGradientTo: '#ffffff',
                              decimalPlaces: 0,
                              color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                              barPercentage: 0.3, // عرض میله کمتر برای فشرده‌تر شدن
                              propsForLabels: {
                                fontSize: 10,
                              },
                              // تنظیمات برای نمایش اعداد محور Y
                              propsForVerticalLabels: {
                                fontSize: 10,
                              },
                              propsForHorizontalLabels: {
                                fontSize: 10,
                              },
                            }}
                            verticalLabelRotation={-45}
                            fromZero={true}
                            style={{
                              marginVertical: 8,
                              borderRadius: 16,
                            }}
                            // اضافه کردن این تنظیمات برای نمایش اعداد
                            showValuesOnTopOfBars={true}
                            withInnerLines={true}
                            withVerticalLabels={true}
                            withHorizontalLabels={true}
                          />
                   ) : (
                     <Text style={{ textAlign: 'center' }}>داده‌ای برای نمودار نماینده وجود ندارد</Text>
                   )}
             </View>

                 {/* نمودار استان */}
                          <View style={{ marginBottom: 20 }}>
                            <Text style={{ textAlign: 'center', fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
                              نمودار تعداد مددجوها به ازای هر استان
                            </Text>
                      {isValidChartData(chartData.provinceStats) ? (
                 <BarChart
                   data={chartData.provinceStats}
                   width={calculateChartWidth(chartData.provinceStats.labels)}
                   height={220}
                   chartConfig={{
                     backgroundColor: '#ffffff',
                     backgroundGradientFrom: '#ffffff',
                     backgroundGradientTo: '#ffffff',
                     decimalPlaces: 0,
                     color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                     labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                     barPercentage: 0.3, // عرض میله کمتر برای فشرده‌تر شدن
                     propsForLabels: {
                       fontSize: 10,
                     },
                     // تنظیمات برای نمایش اعداد محور Y
                     propsForVerticalLabels: {
                       fontSize: 10,
                     },
                     propsForHorizontalLabels: {
                       fontSize: 10,
                     },
                   }}
                   verticalLabelRotation={-45}
                   fromZero={true}
                   style={{
                     marginVertical: 8,
                     borderRadius: 16,
                   }}
                   // اضافه کردن این تنظیمات برای نمایش اعداد
                   showValuesOnTopOfBars={true}
                   withInnerLines={true}
                   withVerticalLabels={true}
                   withHorizontalLabels={true}
                 />

                      ) : (
                        <Text style={{ textAlign: 'center' }}>داده‌ای برای نمودار استان وجود ندارد</Text>
                      )}
                  </View>

                       <View style={{ marginBottom: 20 }}>
                         <Text style={{ textAlign: 'center', fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
                           نمودار تعداد مددجوها به ازای هر سطح تحصیلی
                         </Text>
                         {isValidChartData(chartData.educationLevel) ? (
                           <BarChart
                            data={chartData.educationLevel}
                            width={calculateChartWidth(chartData.educationLevel.labels)}
                            height={220}
                            chartConfig={{
                              backgroundColor: '#ffffff',
                              backgroundGradientFrom: '#ffffff',
                              backgroundGradientTo: '#ffffff',
                              decimalPlaces: 0,
                              color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                              barPercentage: 0.3, // عرض میله کمتر برای فشرده‌تر شدن
                              propsForLabels: {
                                fontSize: 10,
                              },
                              // تنظیمات برای نمایش اعداد محور Y
                              propsForVerticalLabels: {
                                fontSize: 10,
                              },
                              propsForHorizontalLabels: {
                                fontSize: 10,
                              },
                            }}
                            verticalLabelRotation={-45}
                            fromZero={true}
                            style={{
                              marginVertical: 8,
                              borderRadius: 16,
                            }}
                            // اضافه کردن این تنظیمات برای نمایش اعداد
                            showValuesOnTopOfBars={true}
                            withInnerLines={true}
                            withVerticalLabels={true}
                            withHorizontalLabels={true}
                          />

                      ) : (
                        <Text style={{ textAlign: 'center' }}>داده‌ای برای نمودار استان وجود ندارد</Text>
                      )}
                       </View>

             {/* نمودار تعداد فرزندان */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{ textAlign: 'center', fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
                نمودار تعداد مددجوها به ازای تعداد فرزندان
              </Text>
        {isValidChartData(chartData.childrenNumber) ? (
          <BarChart
                  data={chartData.childrenNumber}
                  width={calculateChartWidth(chartData.childrenNumber.labels)}
                  height={220}
                  chartConfig={{
                    backgroundColor: '#ffffff',
                    backgroundGradientFrom: '#ffffff',
                    backgroundGradientTo: '#ffffff',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    barPercentage: 0.3, // عرض میله کمتر برای فشرده‌تر شدن
                    propsForLabels: {
                      fontSize: 10,
                    },
                    // تنظیمات برای نمایش اعداد محور Y
                    propsForVerticalLabels: {
                      fontSize: 10,
                    },
                    propsForHorizontalLabels: {
                      fontSize: 10,
                    },
                  }}
                  verticalLabelRotation={-45}
                  fromZero={true}
                  style={{
                    marginVertical: 8,
                    borderRadius: 16,
                  }}
                  // اضافه کردن این تنظیمات برای نمایش اعداد
                  showValuesOnTopOfBars={true}
                  withInnerLines={true}
                  withVerticalLabels={true}
                  withHorizontalLabels={true}
                />
                    ) : (
                      <Text style={{ textAlign: 'center' }}>داده‌ای برای نمودار تعداد فرزندان وجود ندارد</Text>
                    )}
            </View>

   {/* نمودار نوع کمک */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ textAlign: 'center', fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
                  نمودار تعداد مددجوها به ازای نوع کمک
                </Text>
                 {isValidChartData(chartData.typeGood) ? (
                        <BarChart
                          data={chartData.typeGood}
                          width={calculateChartWidth(chartData.typeGood.labels)}
                          height={220}
                          chartConfig={{
                            backgroundColor: '#ffffff',
                            backgroundGradientFrom: '#ffffff',
                            backgroundGradientTo: '#ffffff',
                            decimalPlaces: 0,
                            color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            barPercentage: 0.3, // عرض میله کمتر برای فشرده‌تر شدن
                            propsForLabels: {
                              fontSize: 10,
                            },
                            // تنظیمات برای نمایش اعداد محور Y
                            propsForVerticalLabels: {
                              fontSize: 10,
                            },
                            propsForHorizontalLabels: {
                              fontSize: 10,
                            },
                          }}
                          verticalLabelRotation={-45}
                          fromZero={true}
                          style={{
                            marginVertical: 8,
                            borderRadius: 16,
                          }}
                          // اضافه کردن این تنظیمات برای نمایش اعداد
                          showValuesOnTopOfBars={true}
                          withInnerLines={true}
                          withVerticalLabels={true}
                          withHorizontalLabels={true}
                        />
                         ) : (
                           <Text style={{ textAlign: 'center' }}>داده‌ای برای نمودار نوع کمک وجود ندارد</Text>
                         )}
              </View>


   {/* نمودار مقدار کمک */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ textAlign: 'center', fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
              نمودار تعداد مددجوها به ازای مقدار کمک
            </Text>
       {isValidChartData(chartData.numberGood) ? (
                   <BarChart
                       data={chartData.numberGood}
                       width={calculateChartWidth(chartData.numberGood.labels)}
                       height={220}
                       chartConfig={{
                         backgroundColor: '#ffffff',
                         backgroundGradientFrom: '#ffffff',
                         backgroundGradientTo: '#ffffff',
                         decimalPlaces: 0,
                         color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                         labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                         barPercentage: 0.3, // عرض میله کمتر برای فشرده‌تر شدن
                         propsForLabels: {
                           fontSize: 10,
                         },
                         // تنظیمات برای نمایش اعداد محور Y
                         propsForVerticalLabels: {
                           fontSize: 10,
                         },
                         propsForHorizontalLabels: {
                           fontSize: 10,
                         },
                       }}
                       verticalLabelRotation={-45}
                       fromZero={true}
                       style={{
                         marginVertical: 8,
                         borderRadius: 16,
                       }}
                       // اضافه کردن این تنظیمات برای نمایش اعداد
                       showValuesOnTopOfBars={true}
                       withInnerLines={true}
                       withVerticalLabels={true}
                       withHorizontalLabels={true}
                     />
       ) : (
         <Text style={{ textAlign: 'center' }}>داده‌ای برای نمودار مقدار کمک وجود ندارد</Text>
       )}
          </View>
    </ScrollView>
  );
};

export default RegisterCharts;
