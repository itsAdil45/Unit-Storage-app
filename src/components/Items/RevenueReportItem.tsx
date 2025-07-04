import React from 'react';
import { View, Text } from 'react-native';
import styles from '../Reports/Styles/CustomerReport';
import { RevenueReportData } from '../../types/RevenueReport'; 
import { useTheme } from '@react-navigation/native';
import { lightColors, darkColors } from '../../constants/color';

interface Props {
  item: RevenueReportData;
  formatCurrency: (amount: number | string) => string;
}

const RevenueReportItem: React.FC<Props> = ({
  item,
  formatCurrency,

}) => {
  const { dark } = useTheme();
  const colors = dark ? darkColors : lightColors;
    //   const paymentKey = `${item.email}-${booking.bookingId}-payments`;
    //   const isPaymentExpanded = expandedPayments[paymentKey];

      
  const renderCustomerDetailItem = () => {
    return item.customerDetails.map((customer) => {
return(
    <View  style={[styles.paymentItem, { backgroundColor: colors.background }]}>
      <View style={styles.paymentHeader}>
        <Text style={[styles.paymentId, { color: colors.primary }]}>
        {customer.customerName}
        </Text>
      </View>
      <View style={styles.paymentDetails}>
        <Text style={[styles.paymentDetail, { color: colors.text }]}>
          Amount: {formatCurrency(customer.amount)}
        </Text>
        <Text style={[styles.paymentDetail, { color: colors.subtext }]}>
         Unit # {customer.unitNumber}
        </Text>
      </View>
    </View>
     ) } )

}    

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
            {item.totalRevenue}
          </Text>
          <Text style={[styles.summaryLabel, { color: colors.subtext }]}>
            Total Revenue
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>
            {item.totalExpenses}
          </Text>
          <Text style={[styles.summaryLabel, { color: colors.subtext }]}>
            Total Expenses
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: '#2196F3' }]}>
            {item.netRevenue}
          </Text>
          <Text style={[styles.summaryLabel, { color: colors.subtext }]}>
            Net Revenue
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
          Customer Details ({item.customerDetails.length})
        </Text>
            {renderCustomerDetailItem()}

      </View>
    </View>
  );
};

export default RevenueReportItem;
