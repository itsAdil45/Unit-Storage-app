import React from 'react';
import { View, Text, Dimensions, StyleSheet, Platform } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { useTheme } from '@react-navigation/native';
import { lightColors, darkColors } from '../../constants/color';

const screenWidth = Dimensions.get('window').width;
import { PaymentOverviewData } from '../../types/Types'; // ⬅️ import type

interface Props {
  overview: PaymentOverviewData | null;
}
const PaymentsOverview:React.FC<Props> = ({ overview }) => {
  const { dark } = useTheme();
  const themeColors = dark ? darkColors : lightColors;

  const total = overview?.totalCustomers || 0;

  const chartData = [
    {
      name: 'Overdue',
      population: overview?.overduePayments || 0,
      color: '#2ecc71',
      legendFontColor: themeColors.text,
      legendFontSize: 12,
    },
    {
      name: 'Paid',
      population: overview?.paymentsPaid || 0,
      color: '#f39c12',
      legendFontColor: themeColors.text,
      legendFontSize: 12,
    },
    {
      name: 'Unpaid',
      population: overview?.unpaidPayments || 0,
      color: '#e74c3c',
      legendFontColor: themeColors.text,
      legendFontSize: 12,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: themeColors.card }]}>
      <Text style={[styles.title, { color: themeColors.text }]}>Payment Overview</Text>

      <View style={[styles.chartWrapper, { backgroundColor: themeColors.card }]}>
        <PieChart
          data={chartData}
          width={screenWidth - 64}
          height={220}
          chartConfig={{
            backgroundColor: themeColors.card,
            backgroundGradientFrom: themeColors.card,
            backgroundGradientTo: themeColors.card,
            color: () => themeColors.text,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="16"
          absolute
        />
      </View>

      <View style={styles.centerTextWrapper}>
        <Text style={[styles.centerTextTop, { color: themeColors.text }]}>Total Units</Text>
        <Text style={[styles.centerTextBottom, { color: themeColors.text }]}>{total}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  chartWrapper: {
    alignSelf: 'center',
    borderRadius: 120,
    padding: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  centerTextWrapper: {
    alignItems: 'center',
    marginTop: 16,
  },
  centerTextTop: {
    fontSize: 13,
  },
  centerTextBottom: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default PaymentsOverview;
