import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Booking } from '../../types/Bookings';
import styles from './Styles/BookingItem';
interface BookingItemProps {
  item: Booking;
  index: number;
  colors: any;
  dark: boolean;
  onEdit: (booking: Booking) => void;
  onPayments: (booking: Booking) => void;
  onAddPayment: (booking: Booking) => void;
  onDeletePress: () => void;
}

const BookingItem: React.FC<BookingItemProps> = ({
  item,
  index,
  colors,
  dark,
  onEdit,
  onPayments,
  onAddPayment,
  onDeletePress,
}) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return '#4CAF50';
      case 'completed':
        return '#2196F3';
      case 'cancelled':
        return '#FF5722';
      default:
        return colors.subtext;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleViewPdf = async () => {
    if (!item.pdfDocumentUrl) {
      Alert.alert('No Document', 'No PDF document available for this booking');
      return;
    }

    try {
      const supported = await Linking.canOpenURL(item.pdfDocumentUrl);
      if (supported) {
        await Linking.openURL(item.pdfDocumentUrl);
      } else {
        Alert.alert('Error', 'Cannot open PDF document');
      }
    } catch (error) {
      console.error('Error opening PDF:', error);
      Alert.alert('Error', 'Failed to open PDF document');
    }
  };

  const formatCurrency = (amount: string | number) => {
    return `$${parseFloat(amount.toString()).toFixed(2)}`;
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: dark ? colors.card : 'white',
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.bookingId, { color: colors.text }]}>
            Booking #{item.id}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) + '20' },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(item.status) },
              ]}
            >
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>
        <Text style={[styles.totalPrice, { color: colors.primary }]}>
          {formatCurrency(item.totalPrice)}
        </Text>
      </View>

      <View style={styles.customerInfo}>
        <View style={styles.customerRow}>
          <MaterialIcons name="person" size={16} color={colors.subtext} />
          <Text style={[styles.customerName, { color: colors.text }]}>
            {item.customer.firstName} {item.customer.lastName}
          </Text>
        </View>
        <View style={styles.customerRow}>
          <MaterialIcons name="email" size={16} color={colors.subtext} />
          <Text style={[styles.customerEmail, { color: colors.subtext }]}>
            {item.customer.email}
          </Text>
        </View>
        <View style={styles.customerRow}>
          <MaterialIcons name="phone" size={16} color={colors.subtext} />
          <Text style={[styles.customerPhone, { color: colors.subtext }]}>
            {item.customer.phone}
          </Text>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: colors.subtext }]}>
              Unit
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {item.storageUnit.unitNumber}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: colors.subtext }]}>
              Space
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {item.spaceOccupied} sq ft
            </Text>
          </View>
        </View>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: colors.subtext }]}>
              Start Date
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {formatDate(item.startDate)}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: colors.subtext }]}>
              End Date
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {formatDate(item.endDate)}
            </Text>
          </View>
        </View>
      </View>

      <View
        style={[styles.paymentsContainer, { borderTopColor: colors.border }]}
      >
        <View style={styles.paymentsHeader}>
          <Text style={[styles.paymentsTitle, { color: colors.text }]}>
            Payments
          </Text>
          <Text style={[styles.paymentsCount, { color: colors.subtext }]}>
            {item.payments.length} payment
            {item.payments.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <View style={styles.paymentsStats}>
          <View style={styles.paymentStat}>
            <Text style={[styles.paymentStatLabel, { color: colors.subtext }]}>
              Pending
            </Text>
            <Text style={[styles.paymentStatValue, { color: '#FF9800' }]}>
              {item.payments.filter((p) => p.status === 'pending').length}
            </Text>
          </View>
          <View style={styles.paymentStat}>
            <Text style={[styles.paymentStatLabel, { color: colors.subtext }]}>
              Paid
            </Text>
            <Text style={[styles.paymentStatValue, { color: '#4CAF50' }]}>
              {item.payments.filter((p) => p.status === 'paid').length}
            </Text>
          </View>

          <View style={styles.paymentStat}>
            <Text style={[styles.paymentStatLabel, { color: colors.subtext }]}>
              Document
            </Text>
            <TouchableOpacity
              style={[
                styles.pdfButton,
                {
                  backgroundColor: item.pdfDocumentUrl
                    ? '#DC143C'
                    : colors.border,
                  opacity: item.pdfDocumentUrl ? 1 : 0.5,
                },
              ]}
              onPress={handleViewPdf}
              disabled={!item.pdfDocumentUrl}
            >
              <MaterialIcons
                name={item.pdfDocumentUrl ? 'picture-as-pdf' : 'picture-as-pdf'}
                size={14}
                color="white"
              />
              <Text style={styles.pdfButtonText}>
                {item.pdfDocumentUrl ? 'PDF' : 'No PDF'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View
        style={[styles.actionsContainer, { borderTopColor: colors.border }]}
      >
        <TouchableOpacity
          onPress={() => onAddPayment(item)}
          style={[styles.actionButton, { backgroundColor: '#4CAF50' + '15' }]}
        >
          <MaterialIcons name="add" size={12} color="#4CAF50" />
          <Text style={[styles.actionText, { color: '#4CAF50' }]}>Add Pay</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onPayments(item)}
          style={[
            styles.actionButton,
            { backgroundColor: colors.primary + '15' },
          ]}
        >
          <MaterialIcons name="payment" size={16} color={colors.primary} />
          <Text style={[styles.actionText, { color: colors.primary }]}>
            Payments
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onEdit(item)}
          style={[
            styles.actionButton,
            { backgroundColor: colors.secondary + '15' },
          ]}
        >
          <MaterialIcons name="edit" size={16} color={colors.secondary} />
          <Text style={[styles.actionText, { color: colors.secondary }]}>
            Edit
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onDeletePress}
          style={[styles.actionButton, { backgroundColor: '#FF5722' + '15' }]}
        >
          <MaterialIcons name="delete" size={16} color="#FF5722" />
          <Text style={[styles.actionText, { color: '#FF5722' }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};



export default BookingItem;
