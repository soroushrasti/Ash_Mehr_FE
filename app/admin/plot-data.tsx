import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { apiService } from '@/services/apiService';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import AppHeader from '@/components/AppHeader';
import { LinearGradient } from 'expo-linear-gradient';
import { Spacing, BorderRadius } from '@/constants/Design';
import * as Font from 'expo-font';

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

      if (!response?.data?.adminStats || !response?.data?.provinceStats || !response?.data?.educationLevelStats || !response?.data?.typeGoodStats || !response?.data?.childrenNumberStats) {
        throw new Error('داده‌ها به درستی دریافت نشدند');
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
        educationLevel : formattedEducationLevelData,
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
  const minBarSpacing = 70;
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

      const hasValidLabel = chartData.labels.some(label =>
        label !== null &&
        label !== undefined &&
        label.toString().trim() !== ''
      );

      if (!hasValidLabel) return false;

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


  // تعریف رنگ‌های مختلف برای هر نمودار
  const chartColors = [
    { primary: 'rgba(76, 175, 80, 1)', gradient: ['#4CAF50', '#81C784'], light: 'rgba(76, 175, 80, 0.1)' },
    { primary: 'rgba(33, 150, 243, 1)', gradient: ['#2196F3', '#64B5F6'], light: 'rgba(33, 150, 243, 0.1)' },
    { primary: 'rgba(255, 152, 0, 1)', gradient: ['#FF9800', '#FFB74D'], light: 'rgba(255, 152, 0, 0.1)' },
    { primary: 'rgba(156, 39, 176, 1)', gradient: ['#9C27B0', '#BA68C8'], light: 'rgba(156, 39, 176, 0.1)' },
    { primary: 'rgba(244, 67, 54, 1)', gradient: ['#F44336', '#E57373'], light: 'rgba(244, 67, 54, 0.1)' },
    { primary: 'rgba(0, 150, 136, 1)', gradient: ['#009688', '#4DB6AC'], light: 'rgba(0, 150, 136, 0.1)' },
  ];

  const createChartConfig = (colorSet) => ({
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

  const ChartCard = ({ title, children, colorSet, icon }) => (
      <View style={[styles.chartCard, { backgroundColor: colorSet.light }]}>
        <View style={[styles.chartHeader, { backgroundColor: colorSet.medium }]}>
          <Text style={styles.chartIcon}>{icon}</Text>
          <ThemedText style={styles.chartTitle}>{title}</ThemedText>
        </View>
        <View style={[styles.chartContent, { backgroundColor: colorSet.light }]}>
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

      setChartData(response.data);

    } catch (err) {
      setError(err.message);
      Alert.alert('خطا', 'دریافت اطلاعات با مشکل مواجه شد');
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <AppHeader title="گزارش‌ها و نمودارها" showBackButton />
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
        <AppHeader title="گزارش‌ها و نمودارها" showBackButton />
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
        <AppHeader title="گزارش‌ها و نمودارها" showBackButton />
        <View style={styles.centerContent}>
          <Text style={styles.emptyIcon}>📊</Text>
          <ThemedText style={styles.emptyText}>داده‌ای برای نمایش وجود ندارد</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <AppHeader title="گزارش‌ها و نمودارها" showBackButton />
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
                   height={240}
                   chartConfig={createChartConfig(chartColors[0])}
                   verticalLabelRotation={-45}
                   fromZero={true}
                   style={styles.chart}
                   showValuesOnTopOfBars={true}
                   withInnerLines={true}
                   withVerticalLabels={true}
                   withHorizontalLabels={true}
                 />
                 <Text style={{textAlign: 'center', marginTop: 10}}>نماینده</Text>
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
                    chartConfig={createChartConfig(chartColors[1])}
                    verticalLabelRotation={-45}
                    fromZero={true}
                    style={styles.chart}
                    showValuesOnTopOfBars={true}
                    withInnerLines={true}
                    withVerticalLabels={true}
                    withHorizontalLabels={true}
                  />
                  <Text style={{textAlign: 'center', marginTop: 10}}>استان</Text>
                </View>
              </View>
            </ScrollView>
          </ChartCard>
        )}

        {/* نمودار سطح تحصیلات */}
        {isValidChartData(chartData.educationLevel) && (
          <ChartCard title="تعداد مددجوها به ازای هر سطح تحصیلی" colorSet={chartColors[2]} icon="🎓">
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={{transform: [{rotate: '-90deg'}], marginRight: 10}}>تعداد مددجو</Text>
            <View>
              <BarChart
                data={chartData.educationLevel}
                width={calculateChartWidth(chartData.educationLevel.labels)}
                height={240}
                chartConfig={createChartConfig(chartColors[2])}
                verticalLabelRotation={-45}
                horizontalLabelRotation={-45}
                fromZero={true}
                style={styles.chart}
                showValuesOnTopOfBars={true}
                withInnerLines={true}
                withVerticalLabels={true}
                withHorizontalLabels={true}
              />
              <Text style={{textAlign: 'center', marginTop: 10}}>سطح تحصیلی</Text>
            </View>
          </View>
            </ScrollView>
          </ChartCard>
        )}

        {/* نمودار تعداد فرزندان */}
        {isValidChartData(chartData.childrenNumber) && (
          <ChartCard title="تعداد مددجوها به ازای تعداد فرزندان" colorSet={chartColors[3]} icon="👶">
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={{transform: [{rotate: '-90deg'}], marginRight: 10}}>تعداد مددجو</Text>
                <View>
                  <BarChart
                    data={chartData.childrenNumber}
                    width={calculateChartWidth(chartData.childrenNumber.labels)}
                    height={240}
                    chartConfig={createChartConfig(chartColors[3])}
                    verticalLabelRotation={-45}
                    fromZero={true}
                    style={styles.chart}
                    showValuesOnTopOfBars={true}
                    withInnerLines={true}
                    withVerticalLabels={true}
                    withHorizontalLabels={true}
                  />
                  <Text style={{textAlign: 'center', marginTop: 10}}>تعداد فرزند</Text>
                </View>
              </View>
            </ScrollView>
          </ChartCard>
        )}

        {/* نمودار نوع کمک */}
        {isValidChartData(chartData.typeGood) && (
          <ChartCard title="تعداد مددجوها به ازای نوع کمک" colorSet={chartColors[4]} icon="🎁">
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Text style={{transform: [{rotate: '-90deg'}], marginRight: 10}}>تعداد مددجو</Text>
                  <View>
                    <BarChart
                      data={chartData.typeGood}
                      width={calculateChartWidth(chartData.typeGood.labels)}
                      height={240}
                      chartConfig={createChartConfig(chartColors[4])}
                      verticalLabelRotation={-45}
                      fromZero={true}
                      style={styles.chart}
                      showValuesOnTopOfBars={true}
                      withInnerLines={true}
                      withVerticalLabels={true}
                      withHorizontalLabels={true}
                    />
                    <Text style={{textAlign: 'center', marginTop: 10}}>نوع کمک</Text>
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
    marginVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
});

export default RegisterCharts;
