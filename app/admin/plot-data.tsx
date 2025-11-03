import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { apiService } from '@/services/apiService';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import AppHeader from '@/components/AppHeader';
import { Spacing, BorderRadius } from '@/constants/Design';

interface ChartDataset {
  labels: string[];
  datasets: {
    data: number[];
  }[];
}

interface ChartDataState {
  adminStats: ChartDataset;
  provinceStats: ChartDataset;
  educationLevelStats: ChartDataset;
  typeGoodStats: ChartDataset;
  childrenNumberStats: ChartDataset;
}

const RegisterCharts = () => {
  const [chartData, setChartData] = useState<ChartDataState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRegisterStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getRegisterStats();

      if (!response?.data?.adminStats || !response?.data?.provinceStats || !response?.data?.educationLevelStats || !response?.data?.typeGoodStats || !response?.data?.childrenNumberStats) {
        setError('داده‌ها به درستی دریافت نشدند');
        return;
      }

      // پاکسازی و فرمت داده‌ها
      const formattedAdminData = formatChartData(response.data.adminStats, 'admin');
      const formattedProvinceData = formatChartData(response.data.provinceStats, 'province');
      const formattedEducationLevelData = formatChartData(response.data.educationLevelStats, 'educationLevel');
      const formattedTypeGoodData = formatChartData(response.data.typeGoodStats, 'typeGood');
      const formattedChildrenNumberData = formatChartData(response.data.childrenNumberStats, 'childrenNumber');

      setChartData({
        adminStats: formattedAdminData,
        provinceStats: formattedProvinceData,
        educationLevelStats : formattedEducationLevelData,
        typeGoodStats : formattedTypeGoodData,
        childrenNumberStats : formattedChildrenNumberData
      });
      setError(null);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('خطا در دریافت داده‌ها');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRegisterStats();
  }, [fetchRegisterStats]);

  // تابع برای فرمت کردن و پاکسازی داده‌ها
  const formatChartData = (data: any, type?: string): ChartDataset => {
    if (!data || typeof data !== 'object') {
      return {
        labels: [],
        datasets: [{ data: [] }]
      };
    }

    // استخراج labels و data از شیء
    const labels = data.labels || [];
    const datasets = data.datasets || [];

    const educationMapping: Record<string, string> = {
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
    const persianLabels = labels.map((label: any) => {
      if (type && type.includes('education')) {
        return educationMapping[label] || label;
      }
      return label;
    });

    // پاکسازی داده‌ها - تبدیل NaN به 0
    const cleanedDatasets = datasets.map((dataset: any) => ({
      ...dataset,
      data: (dataset.data || []).map((value: any) =>
        isNaN(Number(value)) || value === null || value === undefined ? 0 : Number(value)
      )
    }));

    return {
      labels: persianLabels.filter((label: any) => label !== null && label !== undefined && label !== ''),
      datasets: cleanedDatasets
    };
  };

const calculateChartWidth = (labels: string[]) => {
  const baseWidth = 350;
  const minBarSpacing = 70;
  return Math.max(baseWidth, labels.length * minBarSpacing);
};

  // تابع برای بررسی اعتبار داده‌های نمودار
  const isValidChartData = (chartData: any): boolean => {
      if (!chartData || !chartData.labels || !chartData.datasets) return false;

      const hasValidLabel = chartData.labels.some((label: any) =>
        label !== null &&
        label !== undefined &&
        label.toString().trim() !== ''
      );

      if (!hasValidLabel) return false;

      return chartData.datasets.some((dataset: any) =>
        dataset &&
        dataset.data &&
        Array.isArray(dataset.data) &&
        dataset.data.some((value: any) => typeof value === 'number' && !isNaN(value))
      );
  };


  // تعریف رنگ‌های مختلف برای هر نمودار
  const chartColors = [
    { primary: 'rgba(76, 175, 80, 1)', gradient: ['#4CAF50', '#81C784'], light: 'rgba(76, 175, 80, 0.1)' },
    { primary: 'rgba(33, 150, 243, 1)', gradient: ['#2196F3', '#64B5F6'], light: 'rgba(33, 150, 243, 0.1)' },
    { primary: 'rgba(255, 152, 0, 1)', gradient: ['#FF9800', '#FFB74D'], light: 'rgba(255, 152, 0, 0.1)' },
    { primary: 'rgba(156, 39, 176, 1)', gradient: ['#9C27B0', '#BA68C8'], light: 'rgba(156, 39, 176, 0.1)' },
    { primary: 'rgba(244, 67, 54, 1)', gradient: ['#F44336', '#E57373'], light: 'rgba(244, 67, 54, 0.1)' },
    { primary: 'rgba(0, 150, 136, 1)', gradient: ['#009688', '#4DB6AC'], light: 'rgba(0, 150, 136, 0.1)' },
  ];

  const createChartConfig = (colorSet: any) => ({
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#f5f5f5',
    decimalPlaces: 0,
    color: (opacity = 1) => colorSet.primary.replace('1)', `${opacity})`),
    labelColor: (opacity = 1) => `rgba(50, 50, 50, ${opacity})`,
    barPercentage: 0.6,
    propsForLabels: {
      fontSize: 11,
      fontWeight: '600',
    },
    propsForVerticalLabels: {
      fontSize: 11,
      fontWeight: '500',
    },
    propsForHorizontalLabels: {
      fontSize: 11,
      fontWeight: '500',
    },
    propsForBackgroundLines: {
      strokeDasharray: '', // solid lines
      stroke: '#e0e0e0',
      strokeWidth: 1,
    },
  });

  const ChartCard = ({ title, children, colorSet, icon }: { title: string; children: React.ReactNode; colorSet: any; icon: string }) => (
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartIcon}>{icon}</Text>
          <ThemedText style={styles.chartTitle}>{title}</ThemedText>
        </View>
        <View style={styles.chartContent}>
          {children}
        </View>
      </View>
    );

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.getRegisterStats();

      if (!response.success) {
        throw new Error('خطا در دریافت اطلاعات از سرور');
      }

    const convertToPersian = (label: string) => {
        const translations: Record<string, string> = {
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
        return translations[label] || label;
      };
    const persianData = {
          ...response.data,
          educationLevelStats: {
            ...response.data.educationLevelStats,
            labels: response.data.educationLevelStats.labels.map((label: any) => convertToPersian(label))
          }
        };

      setChartData(persianData);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطا در دریافت اطلاعات';
      setError(errorMessage);
      Alert.alert('خطا', 'دریافت اطلاعات با مشکل مواجه شد');
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <AppHeader title="گزارش‌ها و نمودارها" subtitle="در حال بارگذاری..." />
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <ThemedText style={styles.loadingText}>در حال بارگذاری...</ThemedText>
        </View>
      </ThemedView>
    );
  }


  if (error) {
    return (
      <ThemedView style={styles.container}>
        <AppHeader title="گزارش‌ها و نمودارها" subtitle="خطا" />
        <View style={styles.centerContent}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
            <TouchableOpacity
              onPress={fetchData}
              style={{
                backgroundColor: '#007AFF',
                padding: 12,
                borderRadius: 8,
              }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>
            تلاش مجدد
          </Text>
        </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  if (!chartData) {
    return (
      <ThemedView style={styles.container}>
        <AppHeader title="گزارش‌ها و نمودارها" subtitle="داده‌ای موجود نیست" />
        <View style={styles.centerContent}>
          <Text style={styles.emptyIcon}>📊</Text>
          <ThemedText style={styles.emptyText}>داده‌ای برای نمایش وجود ندارد</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <AppHeader title="گزارش‌ها و نمودارها" subtitle="آمار و نمودارها" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchRegisterStats} colors={['#4CAF50']} />
        }
      >

        {/* نمودار نمایندگان */}
        {isValidChartData(chartData.adminStats) && (
          <ChartCard title="تعداد مددجوها به ازای هر نماینده" colorSet={chartColors[0]} icon="👥">
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
             <View style={{flexDirection: 'row', alignItems: 'center'}}>
               <Text style={{transform: [{rotate: '-90deg'}], marginRight: 10}}>تعداد مددجو</Text>
             <View>
               <BarChart
                 data={chartData.adminStats}
                 width={calculateChartWidth(chartData.adminStats.labels)}
                 height={200}
                 yAxisLabel=""
                 yAxisSuffix=""
                 chartConfig={{
                   ...createChartConfig(chartColors[0]),
                 }}
                 verticalLabelRotation={0}
                 fromZero={true}
                 style={styles.chart}
                 showValuesOnTopOfBars={true}
                 withInnerLines={true}
                 withVerticalLabels={false}
                 withHorizontalLabels={true}
               />

               {/* لیبل‌های دستی زیر هر ستون */}
               <View style={styles.customLabels}>
                 {chartData.adminStats.labels.map((label, index) => (
                   <View key={index} style={styles.labelContainer}>
                     <Text style={styles.chartText} numberOfLines={1}>
                       {label}
                     </Text>
                   </View>
                 ))}
               </View>

               <Text style={styles.chartTitleBottom}>نماینده</Text>
             </View>

             </View>
            </ScrollView>
          </ChartCard>
        )}

        {/* نمودار استان‌ها */}
        {isValidChartData(chartData.provinceStats) && (
          <ChartCard title="تعداد مددجوها به ازای هر استان" colorSet={chartColors[1]} icon="📍">
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={{transform: [{rotate: '-90deg'}], marginRight: 10}}>تعداد مددجو</Text>
                <View>
                  <BarChart
                    data={chartData.provinceStats}
                    width={calculateChartWidth(chartData.provinceStats.labels)}
                    height={240}
                    yAxisLabel=""
                    yAxisSuffix=""
                    chartConfig={createChartConfig(chartColors[1])}
                    verticalLabelRotation={-45}
                    fromZero={true}
                    style={styles.chart}
                    showValuesOnTopOfBars={true}
                    withInnerLines={true}
                    withVerticalLabels={false}
                    withHorizontalLabels={true}
                  />

               {/* لیبل‌های دستی زیر هر ستون */}
               <View style={styles.customLabels}>
                 {chartData.provinceStats.labels.map((label, index) => (
                   <View key={index} style={styles.labelContainer}>
                     <Text style={styles.chartText} numberOfLines={1}>
                       {label}
                     </Text>
                   </View>
                 ))}
               </View>

               <Text style={styles.chartTitleBottom}>استان</Text>
             </View>
              </View>
            </ScrollView>
          </ChartCard>
        )}

        {/* نمودار سطح تحصیلات */}
        {isValidChartData(chartData.educationLevelStats) && (
          <ChartCard title="تعداد مددجوها به ازای هر سطح تحصیلی" colorSet={chartColors[2]} icon="🎓">
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={{transform: [{rotate: '-90deg'}], marginRight: 10}}>تعداد مددجو</Text>
            <View>
              <BarChart
                data={{
                              ...chartData.educationLevelStats,

                            }}
                width={calculateChartWidth(chartData.educationLevelStats.labels)}
                height={240}
                yAxisLabel=""
                yAxisSuffix=""
                chartConfig={createChartConfig(chartColors[2])}
                verticalLabelRotation={-45}
                horizontalLabelRotation={-45}
                fromZero={true}
                style={styles.chart}
                showValuesOnTopOfBars={true}
                withInnerLines={true}
                withVerticalLabels={false}
                withHorizontalLabels={true}
              />

               {/* لیبل‌های دستی زیر هر ستون */}
               <View style={styles.customLabels}>
                 {chartData.educationLevelStats.labels.map((label, index) => (
                   <View key={index} style={styles.labelContainer}>
                     <Text style={styles.chartText} numberOfLines={1}>
                       {label}
                     </Text>
                   </View>
                 ))}
               </View>

               <Text style={styles.chartTitleBottom}>سطح تحصیلی</Text>
             </View>
          </View>
            </ScrollView>
          </ChartCard>
        )}

        {/* نمودار تعداد فرزندان */}
        {isValidChartData(chartData.childrenNumberStats) && (
          <ChartCard title="تعداد مددجوها به ازای تعداد فرزندان" colorSet={chartColors[3]} icon="👶">
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={{transform: [{rotate: '-90deg'}], marginRight: 10}}>تعداد مددجو</Text>
                <View>
                  <BarChart
                    data={chartData.childrenNumberStats}
                    width={calculateChartWidth(chartData.childrenNumberStats.labels)}
                    height={240}
                    yAxisLabel=""
                    yAxisSuffix=""
                    chartConfig={createChartConfig(chartColors[3])}
                    verticalLabelRotation={-45}
                    fromZero={true}
                    style={styles.chart}
                    showValuesOnTopOfBars={true}
                    withInnerLines={true}
                    withVerticalLabels={false}
                    withHorizontalLabels={true}
                  />

               {/* لیبل‌های دستی زیر هر ستون */}
               <View style={styles.customLabels}>
                 {chartData.childrenNumberStats.labels.map((label, index) => (
                   <View key={index} style={styles.labelContainer}>
                     <Text style={styles.chartText} numberOfLines={1}>
                       {label}
                     </Text>
                   </View>
                 ))}
               </View>

               <Text style={styles.chartTitleBottom}>تعداد فرزند</Text>
             </View>
              </View>
            </ScrollView>
          </ChartCard>
        )}

        {/* نمودار نوع کمک */}
        {isValidChartData(chartData.typeGoodStats) && (
          <ChartCard title="تعداد مددجوها به ازای نوع کمک" colorSet={chartColors[4]} icon="🎁">
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Text style={{transform: [{rotate: '-90deg'}], marginRight: 10}}>تعداد مددجو</Text>
                  <View>
                    <BarChart
                      data={chartData.typeGoodStats}
                      width={calculateChartWidth(chartData.typeGoodStats.labels)}
                      height={240}
                      yAxisLabel=""
                      yAxisSuffix=""
                      chartConfig={createChartConfig(chartColors[4])}
                      verticalLabelRotation={-45}
                      fromZero={true}
                      style={styles.chart}
                      showValuesOnTopOfBars={true}
                      withInnerLines={true}
                      withVerticalLabels={false}
                      withHorizontalLabels={true}
                    />

               {/* لیبل‌های دستی زیر هر ستون */}
               <View style={styles.customLabels}>
                 {chartData.typeGoodStats.labels.map((label, index) => (
                   <View key={index} style={styles.labelContainer}>
                     <Text style={styles.chartText} numberOfLines={1}>
                       {label}
                     </Text>
                   </View>
                 ))}
               </View>

               <Text style={styles.chartTitleBottom}>نوع کمک</Text>
             </View>
                </View>
            </ScrollView>
          </ChartCard>
        )}
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl * 2,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: 16,
    opacity: 0.7,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  chartCard: {
    marginBottom: Spacing.xl,
    borderRadius: BorderRadius.lg,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  chartIcon: {
    fontSize: 24,
    marginRight: Spacing.sm,
  },
  chartTitle: {
    fontFamily: 'Vazir',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right',
  },
  chartContent: {
    padding: Spacing.md,
    backgroundColor: '#fafafa',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  customLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginTop: 5,
  },
  labelContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartText: {
    fontFamily: 'Vazir',
    fontSize: 10,
    textAlign: 'center',
    writingDirection: 'rtl',
    maxWidth: 60,
  },
  chartTitleBottom: {
    fontFamily: 'Vazir',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    fontWeight: 'bold',
  },
});

export default RegisterCharts;
