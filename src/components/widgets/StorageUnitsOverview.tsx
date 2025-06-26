import React from 'react';
import { View, Text, Dimensions, StyleSheet, Platform } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { useTheme } from '@react-navigation/native';
import { lightColors, darkColors } from '../../constants/color';

const screenWidth = Dimensions.get('window').width;
import { StorageOverviewData } from '../../types/Types'; // ⬅️ import type

interface Props {
  overview: StorageOverviewData | null;
}
const StorageUnitsOverview :React.FC<Props> = ({ overview }) => {
  
  const { dark } = useTheme();
  const themeColors = dark ? darkColors : lightColors;

  const chartData = [
    {
      name: 'Vacant',
      population: overview?.empty,
      color: '#f44336',
      legendFontColor: themeColors.text,
      legendFontSize: 14,
    },
    {
      name: 'Occupied',
      population: overview?.occupied,
      color: '#4caf50',
      legendFontColor: themeColors.text,
      legendFontSize: 14,
    },
    {
      name: 'Overdue',
      population: overview?.overdue,
      color: '#ffb300',
      legendFontColor: themeColors.text,
      legendFontSize: 14,
    },
    {
      name: 'Checking Out',
      population: overview?.checkingOut,
      color: '#3f51b5',
      legendFontColor: themeColors.text,
      legendFontSize: 14,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: themeColors.card }]}>
      <Text style={[styles.title, { color: themeColors.text }]}>Storage Overview</Text>

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

      <View style={styles.legendContainer}>
        {chartData.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: item.color }]} />
            <Text style={[styles.legendLabel, { color: themeColors.text }]}>{item.name}</Text>
          </View>
        ))}
      </View>
      <Text style={{textAlign:"center", fontWeight:"800", fontSize:20}}>Total: {overview?.total}</Text>
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
    borderRadius: 110,
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
  legendContainer: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendLabel: {
    fontSize: 12,
  },
});

export default StorageUnitsOverview;
