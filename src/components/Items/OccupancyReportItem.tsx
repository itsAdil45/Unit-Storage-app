import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../Reports/Styles/CustomerReport';
import {
  OccupancyReportData,
  Payment,
  Booking,
  OccupiedUnit,
  AvailableUnit,
} from '../../types/OccupancyReport';
import { useTheme } from '@react-navigation/native';
import { lightColors, darkColors } from '../../constants/color';

interface Props {
  item: OccupancyReportData;
  formatCurrency: (amount: number | string) => string;
  formatDate: (date: string) => string;
  getStatusColor: (status: string) => string;
  getPaymentMethodDisplay: (method: string | null) => string;
  expandedUnits: { [key: string]: boolean };
  expandedBookings: { [key: string]: boolean };
  expandedPayments: { [key: string]: boolean };
  toggleUnitExpansion: (unitId: number) => void;
  toggleBookingExpansion: (unitId: number, bookingId: number) => void;
  togglePaymentExpansion: (unitId: number, bookingId: number) => void;
}

const OccupancyReportItem: React.FC<Props> = ({
  item,
  formatCurrency,
  formatDate,
  getStatusColor,
  getPaymentMethodDisplay,
  expandedUnits,
  expandedBookings,
  expandedPayments,
  toggleUnitExpansion,
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

  const renderBookingDetails = (unitId: number, bookings: Booking[]) => {
    return bookings.map((booking) => {
      const bookingKey = `${unitId}-${booking.bookingId}`;
      const paymentKey = `${unitId}-${booking.bookingId}-payments`;
      const isBookingExpanded = expandedBookings[bookingKey];
      const isPaymentExpanded = expandedPayments[paymentKey];

      return (
        <View
          key={booking.bookingId}
          style={[styles.bookingItem, { backgroundColor: colors.background }]}
        >
          <TouchableOpacity
            style={styles.bookingHeader}
            onPress={() => toggleBookingExpansion(unitId, booking.bookingId)}
          >
            <View style={styles.bookingTitleRow}>
              <Text style={[styles.bookingId, { color: colors.primary }]}>
                Booking #{booking.bookingId}
              </Text>
              <Text style={[styles.unitNumber, { color: colors.text }]}>
                {booking.customerName}
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
                <Text style={[styles.bookingDetail, { color: colors.subtext }]}>
                  Contact: {booking.customerEmail} • {booking.customerPhone}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.paymentsHeader}
                onPress={() =>
                  togglePaymentExpansion(unitId, booking.bookingId)
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

  const renderUnitDetails = (
    unit: OccupiedUnit | AvailableUnit,
    isOccupied: boolean,
  ) => {
    const unitKey = `${unit.unitId}`;
    const isUnitExpanded = expandedUnits[unitKey];

    return (
      <View
        key={unit.unitId}
        style={[styles.bookingItem, { backgroundColor: colors.background }]}
      >
        <TouchableOpacity
          style={styles.bookingHeader}
          onPress={() => toggleUnitExpansion(unit.unitId)}
        >
          <View style={styles.bookingTitleRow}>
            <Text style={[styles.bookingId, { color: colors.primary }]}>
              Unit {unit.unitNumber}
            </Text>
            <Text style={[styles.unitNumber, { color: colors.text }]}>
              {unit.warehouseName}
            </Text>
            <MaterialIcons
              name={isUnitExpanded ? 'expand-less' : 'expand-more'}
              size={24}
              color={colors.subtext}
            />
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(unit.status) },
            ]}
          >
            <Text style={styles.statusText}>{unit.status.toUpperCase()}</Text>
          </View>
        </TouchableOpacity>

        {isUnitExpanded && (
          <View style={styles.expandedBookingContent}>
            <View style={styles.bookingInfo}>
              <Text style={[styles.bookingDetail, { color: colors.subtext }]}>
                Floor: {unit.floor} • Size: {unit.size} m²
              </Text>
              <Text style={[styles.bookingDetail, { color: colors.subtext }]}>
                Warehouse: {unit.warehouseName}
              </Text>
            </View>

            {unit.bookings.length > 0 && (
              <View style={styles.bookingsList}>
                <Text style={[styles.bookingsTitle, { color: colors.text }]}>
                  Bookings ({unit.bookings.length})
                </Text>
                {renderBookingDetails(unit.unitId, unit.bookings)}
              </View>
            )}
          </View>
        )}
      </View>
    );
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
          Occupancy Report - {formatDate(item.date)}
        </Text>
        <Text style={[styles.customerInfo, { color: colors.subtext }]}>
          Total Units: {item.totalUnits} • Occupancy Rate:{' '}
          {item.occupancyRate.toFixed(2)}%
        </Text>
      </View>

      <View style={styles.summaryGrid}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: colors.primary }]}>
            {item.totalUnits}
          </Text>
          <Text style={[styles.summaryLabel, { color: colors.subtext }]}>
            Total Units
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>
            {item.occupiedUnits}
          </Text>
          <Text style={[styles.summaryLabel, { color: colors.subtext }]}>
            Occupied
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: '#FF9800' }]}>
            {item.availableUnits}
          </Text>
          <Text style={[styles.summaryLabel, { color: colors.subtext }]}>
            Available
          </Text>
        </View>
      </View>

      <View style={styles.paymentSummary}>
        <View style={styles.paymentItem}>
          <Text style={[styles.paymentLabel, { color: colors.subtext }]}>
            Occupancy Rate
          </Text>
          <Text style={[styles.paymentValue, { color: colors.text }]}>
            {item.occupancyRate.toFixed(2)}%
          </Text>
        </View>
      </View>

      {item.occupiedUnits > 0 && (
        <View style={styles.bookingsList}>
          <Text style={[styles.bookingsTitle, { color: colors.text }]}>
            Occupied Units ({item.occupiedUnitDetails.length})
          </Text>
          {item.occupiedUnitDetails.map((unit) =>
            renderUnitDetails(unit, true),
          )}
        </View>
      )}

      {item.availableUnits > 0 && (
        <View style={styles.bookingsList}>
          <Text style={[styles.bookingsTitle, { color: colors.text }]}>
            Available Units ({item.availableUnitDetails.length})
          </Text>
          {item.availableUnitDetails.map((unit) =>
            renderUnitDetails(unit, false),
          )}
        </View>
      )}
    </View>
  );
};

export default OccupancyReportItem;
