import React from 'react';
import { View, Text } from 'react-native';
import styles from '../Reports/Styles/CustomerReport';
import { ExpenseReportData } from '../../types/ExpenseReport';
import { useTheme } from '@react-navigation/native';
import { lightColors, darkColors } from '../../constants/color';

interface Props {
  item: ExpenseReportData;
}

const ExpenseReportItem: React.FC<Props> = ({
  item,
}) => {
  const { dark } = useTheme();
  const colors = dark ? darkColors : lightColors;
    //   const paymentKey = `${item.email}-${booking.bookingId}-payments`;
    //   const isPaymentExpanded = expandedPayments[paymentKey];

      
  

  return (
    <View style={[styles.customerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.customerHeader}>
        <Text style={[styles.customerName, { color: colors.text }]}>
          {item.warehouseName} {item.warehouseId}
        </Text>
        <Text style={[styles.customerInfo, { color: colors.subtext }]}>
          {item.date} 
        </Text>
      </View>

      <View style={styles.summaryGrid}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: colors.primary }]}>
            {item.total}
          </Text>
          <Text style={[styles.summaryLabel, { color: colors.subtext }]}>
            Amount
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>
            {item.description}
          </Text>
          <Text style={[styles.summaryLabel, { color: colors.subtext }]}>
            Description
          </Text>
        </View>

      </View>

      {/* <View style={styles.paymentSummary}>
        <View style={styles.paymentItem}>
          <Text style={[styles.paymentLabel, { color: colors.subtext }]}>
            Total Payment
          </Text>
          <Text style={[styles.paymentValue, { color: colors.text }]}>
            {formatCurrency(item.totalPayment)}
          </Text>
        </View>
        <View style={styles.paymentItem}>
          <Text style={[styles.paymentLabel, { color: colors.subtext }]}>
            Paid
          </Text>
          <Text style={[styles.paymentValue, { color: '#4CAF50' }]}>
            {formatCurrency(item.paidPayment)}
          </Text>
        </View>
        <View style={styles.paymentItem}>
          <Text style={[styles.paymentLabel, { color: colors.subtext }]}>
            Pending
          </Text>
          <Text style={[styles.paymentValue, { color: '#FF9800' }]}>
            {formatCurrency(item.pendingPayments)}
          </Text>
        </View>
      </View> */}

      <View style={styles.bookingsList}>
        <Text style={[styles.bookingsTitle, { color: colors.text }]}>
          Expense Details ({item.expenseType})
        </Text>

      </View>
    </View>
  );
};

export default ExpenseReportItem;
