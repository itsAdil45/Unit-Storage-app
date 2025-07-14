import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../Reports/Styles/CustomerReport';
import { CustomerReportData, Payment } from '../../types/CustomerReport';
import { useTheme } from '@react-navigation/native';
import { lightColors, darkColors } from '../../constants/color';

interface Props {
  item: CustomerReportData;
  formatCurrency: (amount: number | string) => string;
  formatDate: (date: string) => string;
  getStatusColor: (status: string) => string;
  getPaymentMethodDisplay: (method: string | null) => string;
  expandedBookings: { [key: string]: boolean };
  expandedPayments: { [key: string]: boolean };
  toggleBookingExpansion: (customerEmail: string, bookingId: number) => void;
  togglePaymentExpansion: (customerEmail: string, bookingId: number) => void;
}

const CustomerReportItem: React.FC<Props> = ({
  item,
  formatCurrency,
  formatDate,
  getStatusColor,
  getPaymentMethodDisplay,
  expandedBookings,
  expandedPayments,
  toggleBookingExpansion,
  togglePaymentExpansion,
}) => {
  const { dark } = useTheme();
  const colors = dark ? darkColors : lightColors;

  const renderPaymentItem = (payment: Payment) => (
    <View
      key={payment.paymentId}
      style={[styles.paymentItem, { backgroundColor: colors.background }]}
    >
      <View style={styles.paymentHeader}>
        <Text style={[styles.paymentId, { color: colors.primary }]}>
          Payment #{payment.paymentId}
        </Text>
        <View
          style={[
            styles.paymentStatusBadge,
            { backgroundColor: getStatusColor(payment.status) },
          ]}
        >
          <Text style={styles.paymentStatusText}>
            {payment.status.toUpperCase()}
          </Text>
        </View>
      </View>
      <View style={styles.paymentDetails}>
        <Text style={[styles.paymentDetail, { color: colors.text }]}>
          Amount: {formatCurrency(payment.amount)}
        </Text>
        <Text style={[styles.paymentDetail, { color: colors.subtext }]}>
          Date: {formatDate(payment.date)}
        </Text>
        <Text style={[styles.paymentDetail, { color: colors.subtext }]}>
          Method: {getPaymentMethodDisplay(payment.method)}
        </Text>
        <Text style={[styles.paymentDetail, { color: colors.subtext }]}>
          Period: {formatDate(payment.startDate)} -{' '}
          {formatDate(payment.endDate)}
        </Text>
      </View>
    </View>
  );

  const renderBookingDetails = () => {
    return item.bookingDetails.map((booking) => {
      const bookingKey = `${item.email}-${booking.bookingId}`;
      const paymentKey = `${item.email}-${booking.bookingId}-payments`;
      const isBookingExpanded = expandedBookings[bookingKey];
      const isPaymentExpanded = expandedPayments[paymentKey];

      return (
        <View
          key={booking.bookingId}
          style={[styles.bookingItem, { backgroundColor: colors.background }]}
        >
          <TouchableOpacity
            style={styles.bookingHeader}
            onPress={() =>
              toggleBookingExpansion(item.email, booking.bookingId)
            }
          >
            <View style={styles.bookingTitleRow}>
              <Text style={[styles.bookingId, { color: colors.primary }]}>
                Booking #{booking.bookingId}
              </Text>
              <Text style={[styles.unitNumber, { color: colors.text }]}>
                Unit {booking.unitNumber}
              </Text>
              <MaterialIcons
                name={isBookingExpanded ? 'expand-less' : 'expand-more'}
                size={24}
                color={colors.subtext}
              />
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(booking.bookingStatus) },
              ]}
            >
              <Text style={styles.statusText}>
                {booking.bookingStatus.toUpperCase()}
              </Text>
            </View>
          </TouchableOpacity>

          {isBookingExpanded && (
            <View style={styles.expandedBookingContent}>
              <View style={styles.bookingInfo}>
                <Text style={[styles.bookingDetail, { color: colors.subtext }]}>
                  {formatDate(booking.startDate)} -{' '}
                  {formatDate(booking.endDate)}
                </Text>
                <Text style={[styles.bookingDetail, { color: colors.subtext }]}>
                  Space: {booking.spaceOccupied} m² • Price:{' '}
                  {formatCurrency(booking.price)}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.paymentsHeader}
                onPress={() =>
                  togglePaymentExpansion(item.email, booking.bookingId)
                }
              >
                <View style={styles.paymentsHeaderContent}>
                  <Text style={[styles.paymentsTitle, { color: colors.text }]}>
                    Payments ({booking.payments.length})
                  </Text>
                  <View style={styles.paymentsSummary}>
                    <Text
                      style={[styles.paymentsSummaryText, { color: '#4CAF50' }]}
                    >
                      {
                        booking.payments.filter((p) => p.status === 'paid')
                          .length
                      }{' '}
                      paid
                    </Text>
                    <Text
                      style={[styles.paymentsSummaryText, { color: '#FF9800' }]}
                    >
                      {
                        booking.payments.filter((p) => p.status === 'pending')
                          .length
                      }{' '}
                      pending
                    </Text>
                  </View>
                </View>
                <MaterialIcons
                  name={isPaymentExpanded ? 'expand-less' : 'expand-more'}
                  size={20}
                  color={colors.subtext}
                />
              </TouchableOpacity>

              {isPaymentExpanded && (
                <View style={styles.paymentsContainer}>
                  {booking.payments.map(renderPaymentItem)}
                </View>
              )}
            </View>
          )}
        </View>
      );
    });
  };

  return (
    <View
      style={[
        styles.customerCard,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={styles.customerHeader}>
        <Text style={[styles.customerName, { color: colors.text }]}>
          {item.firstName} {item.lastName}
        </Text>
        <Text style={[styles.customerInfo, { color: colors.subtext }]}>
          {item.email} • {item.phone}
        </Text>
        <Text style={[styles.inquiryId, { color: colors.primary }]}>
          Inquiry: {item.inquiry}
        </Text>
      </View>

      <View style={styles.summaryGrid}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: colors.primary }]}>
            {item.totalBookings}
          </Text>
          <Text style={[styles.summaryLabel, { color: colors.subtext }]}>
            Total Bookings
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>
            {item.activeBookings}
          </Text>
          <Text style={[styles.summaryLabel, { color: colors.subtext }]}>
            Active
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: '#2196F3' }]}>
            {item.completedBookings}
          </Text>
          <Text style={[styles.summaryLabel, { color: colors.subtext }]}>
            Completed
          </Text>
        </View>
      </View>

      <View style={styles.paymentSummary}>
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
      </View>

      <View style={styles.bookingsList}>
        <Text style={[styles.bookingsTitle, { color: colors.text }]}>
          Booking Details ({item.bookingDetails.length})
        </Text>
        {renderBookingDetails()}
      </View>
    </View>
  );
};

export default CustomerReportItem;
