import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Linking } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Booking } from '../../types/Bookings';

interface BookingItemProps {
  item: Booking;
  index: number;
  colors: any;
  dark: boolean;
  onEdit: (booking: Booking) => void;
  onPayments: (booking: Booking) => void;
  onAddPayment: (booking: Booking) => void; // New prop for add payment
  onDeletePress: () => void;
}

const BookingItem: React.FC<BookingItemProps> = ({
  item,
  index,
  colors,
  dark,
  onEdit,
  onPayments,
  onAddPayment, // New prop
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
    <View style={[styles.container, {  backgroundColor: dark ? colors.card : 'white', borderColor: colors.border }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.bookingId, { color: colors.text }]}>
            Booking #{item.id}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
        </View>
        <Text style={[styles.totalPrice, { color: colors.primary }]}>
          {formatCurrency(item.totalPrice)}
        </Text>
      </View>

      {/* Customer Info */}
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

      {/* Booking Details */}
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: colors.subtext }]}>Unit</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {item.storageUnit.unitNumber}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: colors.subtext }]}>Space</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {item.spaceOccupied} sq ft
            </Text>
          </View>
        </View>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: colors.subtext }]}>Start Date</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {formatDate(item.startDate)}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: colors.subtext }]}>End Date</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {formatDate(item.endDate)}
            </Text>
          </View>
        </View>
      </View>

      {/* Payments Summary */}
      <View style={[styles.paymentsContainer, { borderTopColor: colors.border }]}>
        <View style={styles.paymentsHeader}>
          <Text style={[styles.paymentsTitle, { color: colors.text }]}>Payments</Text>
          <Text style={[styles.paymentsCount, { color: colors.subtext }]}>
            {item.payments.length} payment{item.payments.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <View style={styles.paymentsStats}>
          <View style={styles.paymentStat}>
            <Text style={[styles.paymentStatLabel, { color: colors.subtext }]}>Pending</Text>
            <Text style={[styles.paymentStatValue, { color: '#FF9800' }]}>
              {item.payments.filter(p => p.status === 'pending').length}
            </Text>
          </View>
          <View style={styles.paymentStat}>
            <Text style={[styles.paymentStatLabel, { color: colors.subtext }]}>Paid</Text>
            <Text style={[styles.paymentStatValue, { color: '#4CAF50' }]}>
              {item.payments.filter(p => p.status === 'paid').length}
            </Text>
          </View>
          
          {/* PDF Document Button */}
          <View style={styles.paymentStat}>
            <Text style={[styles.paymentStatLabel, { color: colors.subtext }]}>Document</Text>
            <TouchableOpacity
              style={[
                styles.pdfButton,
                { 
                  backgroundColor: item.pdfDocumentUrl ? '#DC143C' : colors.border,
                  opacity: item.pdfDocumentUrl ? 1 : 0.5
                }
              ]}
              onPress={handleViewPdf}
              disabled={!item.pdfDocumentUrl}
            >
              <MaterialIcons 
                name={item.pdfDocumentUrl ? "picture-as-pdf" : "picture-as-pdf"} 
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

      {/* Action Buttons - Updated to include Add Payment */}
      <View style={[styles.actionsContainer, { borderTopColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => onAddPayment(item)}
          style={[styles.actionButton, { backgroundColor: '#4CAF50' + '15' }]}
        >
          <MaterialIcons name="add" size={16} color="#4CAF50" />
          <Text style={[styles.actionText, { color: '#4CAF50' }]}>Add Pay</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onPayments(item)}
          style={[styles.actionButton, { backgroundColor: colors.primary + '15' }]}
        >
          <MaterialIcons name="payment" size={16} color={colors.primary} />
          <Text style={[styles.actionText, { color: colors.primary }]}>Payments</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => onEdit(item)}
          style={[styles.actionButton, { backgroundColor: colors.secondary + '15' }]}
        >
          <MaterialIcons name="edit" size={16} color={colors.secondary} />
          <Text style={[styles.actionText, { color: colors.secondary }]}>Edit</Text>
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

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bookingId: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  customerInfo: {
    marginBottom: 12,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  customerEmail: {
    fontSize: 12,
    marginLeft: 8,
  },
  customerPhone: {
    fontSize: 12,
    marginLeft: 8,
  },
  detailsContainer: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  paymentsContainer: {
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  paymentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentsTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  paymentsCount: {
    fontSize: 12,
  },
  paymentsStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paymentStat: {
    flex: 1,
    alignItems: 'center',
  },
  paymentStatLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  paymentStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  pdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 2,
  },
  pdfButtonText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 3,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 1,
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
});

export default BookingItem;