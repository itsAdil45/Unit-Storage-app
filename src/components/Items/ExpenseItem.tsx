import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import {ExpenseItemProps} from '../../types/Expenses';


const ExpenseItem: React.FC<ExpenseItemProps> = ({ 
  item: expense, 
  index, 
  colors, 
  dark, 
  onEdit, 
  onDeletePress 
}) => {
  const getExpenseTypeColor = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'rent': return '#2196F3';
      case 'supplies': return '#4CAF50';
      default: return '#FF9800';
    }
  };

  const getExpenseIcon = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'rent': return 'home';
      case 'supplies': return 'inventory';
      default: return 'receipt';
    }
  };

  const formatAmount = (amount: string): string => {
    return `$${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <TouchableOpacity
      style={[styles.expenseCard, { backgroundColor: dark ? colors.card : 'white', borderWidth: 0}]}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: getExpenseTypeColor(expense.expenseType) }]}>
            <MaterialIcons 
              name={getExpenseIcon(expense.expenseType) as any} 
              size={24} 
              color="white" 
            />
          </View>
          <View
            style={[
              styles.typeIndicator,
              { backgroundColor: getExpenseTypeColor(expense.expenseType), borderColor: colors.card },
            ]}
          />
        </View>

        <View style={styles.expenseInfo}>
          <Text style={[styles.expenseDescription, { color: colors.text }]} numberOfLines={1}>
            {expense.description}
          </Text>
          <Text style={[styles.expenseAmount, { color: getExpenseTypeColor(expense.expenseType) }]} numberOfLines={1}>
            {formatAmount(expense.amount)}
          </Text>
          <Text style={[styles.expenseDetails, { color: colors.subtext }]}>
            Category: {expense.expenseType.charAt(0).toUpperCase() + expense.expenseType.slice(1)}
          </Text>
          <Text style={[styles.expenseDetails, { color: colors.subtext }]}>
            Date: {formatDate(expense.date)}
          </Text>
          <Text style={[styles.expenseDetails, { color: colors.subtext }]}>
            Warehouse: {expense.warehouse.name}
          </Text>
          <Text style={[styles.expenseDetails, { color: colors.subtext }]}>
            Created: {formatDate(expense.createdAt)}
          </Text>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: dark ? colors.border : '#f8f9fa' }]}
            onPress={() => onEdit(expense)}
          >
            <MaterialIcons name="edit" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: dark ? colors.border : '#f8f9fa' }]}
            onPress={onDeletePress}
          >
            <MaterialIcons name="delete" size={20} color={colors.notification} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={[styles.typeBadge, { backgroundColor: getExpenseTypeColor(expense.expenseType) + '20' }]}>
          <Text style={[styles.typeText, { color: getExpenseTypeColor(expense.expenseType) }]}>
            {expense.expenseType.toUpperCase()}
          </Text>
        </View>
        <Text style={[styles.expenseId, { color: colors.subtext }]}>ID: {expense.id}</Text>
      </View>
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({

  expenseCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  expenseInfo: {
    flex: 1,
    marginRight: 8,
  },
  expenseDescription: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  expenseDetails: {
    fontSize: 11,
    marginBottom: 1,
  },
  cardActions: {
    flexDirection: 'column',
    gap: 8,
    justifyContent: 'flex-start',
  },
  actionButton: {
    padding: 6,
    borderRadius: 8,
    marginBottom: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  expenseId: {
    fontSize: 11,
    fontWeight: '500',
  },
 
});

export default ExpenseItem;