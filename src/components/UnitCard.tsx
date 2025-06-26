// components/UnitCard.tsx
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme  } from '@react-navigation/native';
import {lightColors,darkColors} from "../constants/color"
import { Props } from '../types/Types';


const UnitCard = ({ label, value, percent, iconColor = '#007aff' }: Props) => {
      const { dark } = useTheme();
      const backgroundColor = dark ? darkColors.card : lightColors.card;
      const textColor = dark ? darkColors.text : lightColors.text;

  
  return (
    <View style={[styles.card, { backgroundColor }]}>
      <View>
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
        <View style={styles.row}>
          {percent && (
            <View style={styles.percentContainer}>
              <MaterialIcons name="trending-up" size={16} color="green" />
              <Text style={styles.percentText}>{percent}</Text>
            </View>
          )}
          <Text style={[styles.value, { color: textColor }]}>{value}</Text>
        </View>
      </View>

      <MaterialIcons name="bar-chart" size={32} color={iconColor} />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginVertical: 10,
    marginHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  label: {
    fontSize: 14,
    color: '#444',
    marginBottom: 6,
  },
  row: {
    flexDirection: 'column',
  },
  percentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  percentText: {
    color: 'green',
    marginLeft: 4,
    fontSize: 13,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
});

export default UnitCard;
