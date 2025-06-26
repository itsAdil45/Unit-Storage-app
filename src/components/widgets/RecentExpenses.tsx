import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { lightColors, darkColors } from '../../constants/color';

import { ExpenseData } from '../../types/Types';

interface Props {
  expenses: ExpenseData[] | null;
}

const RecentExpenses: React.FC<Props> = ({ expenses }) => {
  const { dark } = useTheme();
  const themeColors = dark ? darkColors : lightColors;

  return (
    <View style={[styles.card, { backgroundColor: themeColors.card }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.header, { color: themeColors.text }]}>
          Recent Expenses
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: themeColors.primary }]}
        >
          <Text style={styles.addButtonText}>+ Add Expense</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.viewAllButton, { borderColor: themeColors.primary }]}
      >
        <Text style={[styles.viewAllText, { color: themeColors.primary }]}>
          View All
        </Text>
      </TouchableOpacity>

      <FlatList
        data={expenses || []}
        keyExtractor={(item) => String(item.id)}
        ItemSeparatorComponent={() => (
          <View
            style={[styles.separator, { backgroundColor: themeColors.border }]}
          />
        )}
        renderItem={({ item }) => (
          <View style={styles.expenseItem}>
            <View
              style={[styles.iconWrapper, { backgroundColor: themeColors.accent }]}
            >
              <MaterialCommunityIcons
                name="office-building"
                size={22}
                color="#fff"
              />
            </View>
            <View style={styles.expenseDetails}>
              <Text style={[styles.expenseTitle, { color: themeColors.text }]}>
                {item.description}
              </Text>
              <Text style={[styles.expenseSub, { color: themeColors.subtext }]}>
                AED {parseFloat(item.amount).toFixed(2)} •{' '}
                {new Date(item.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: '2-digit',
                  year: 'numeric',
                })}
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  header: {
    fontSize: 17,
    fontWeight: '700',
  },
  addButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  viewAllButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
  },
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expenseDetails: {
    marginLeft: 12,
    flex: 1,
  },
  expenseTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  expenseSub: {
    fontSize: 13,
    marginTop: 2,
  },
  separator: {
    height: 1,
    marginVertical: 4,
  },
});

export default RecentExpenses;
