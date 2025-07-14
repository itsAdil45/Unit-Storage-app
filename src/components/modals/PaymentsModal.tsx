import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Booking, Payment } from '../../types/Bookings';
import {
  formatDate,
  getStatusColor,
  formatCurrency,
} from '../../Utils/Formatters';
import Toast from 'react-native-toast-message';

interface PaymentsModalProps {
  visible: boolean;
  booking: Booking;
  onClose: () => void;
  onEditPayment: (booking: Booking, payment: Payment) => void;
  onDeletePayment: (payment: Payment) => void;
  colors: any;
  dark: boolean;
}

const PaymentsModal: React.FC<PaymentsModalProps> = ({
  visible,
  booking,
  onClose,
  onEditPayment,
  onDeletePayment,
  colors,
  dark,
}) => {
  const handleEditPayment = (payment: Payment) => {
    onEditPayment(booking, payment);
  };

  const handleDeletePayment = (payment: Payment) => {
    onDeletePayment(payment);
  };

  const handleViewInvoice = async (item: Payment) => {
    if (!item.invoiceAttachment) {
      Toast.show({
        type: 'error',
        text1: 'Failed',
        text2: `No invoice document available for this booking'`,
      });
      return;
    }
    try {
      const supported = await Linking.canOpenURL(item.invoiceAttachment);
      if (supported) {
        await Linking.openURL(item.invoiceAttachment);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed',
          text2: `Cannot open invoice document'`,
        });
      }
    } catch (error) {
      console.error('Error opening invoice:', error);
    }
  };

  const handleViewPaymentReceivedAttachment = async (item: Payment) => {
    if (!item.paymentReceivedAttachment) {
      Toast.show({
        type: 'error',
        text1: 'Failed',
        text2: `No invoice document available for this booking`,
      });
      return;
    }

    try {
      const supported = await Linking.canOpenURL(
        item.paymentReceivedAttachment,
      );
      if (supported) {
        await Linking.openURL(item.paymentReceivedAttachment);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed',
          text2: `Cannot open invoice document'`,
        });
      }
    } catch (error) {
      console.error('Error opening invoice:', error);
    }
  };

  const renderPaymentItem = ({
    item,
    index,
  }: {
    item: Payment;
    index: number;
  }) => (
    <View
      style={[
        styles.paymentItem,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={styles.paymentHeader}>
        <View style={styles.paymentHeaderLeft}>
          <Text style={[styles.paymentId, { color: colors.text }]}>
            Payment #{item.id}
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
        <Text style={[styles.paymentAmount, { color: colors.primary }]}>
          {formatCurrency(item.amount)}
        </Text>
      </View>

      <View style={styles.paymentDetails}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: colors.subtext }]}>
              Payment Date
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {formatDate(item.paymentDate)}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: colors.subtext }]}>
              Method
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {item.paymentMethod || 'Not specified'}
            </Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: colors.subtext }]}>
              Period Start
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {formatDate(item.startDate)}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: colors.subtext }]}>
              Period End
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {formatDate(item.endDate)}
            </Text>
          </View>
        </View>

        {item.remarks && (
          <View style={styles.remarksContainer}>
            <Text style={[styles.detailLabel, { color: colors.subtext }]}>
              Remarks
            </Text>
            <Text style={[styles.remarksText, { color: colors.text }]}>
              {item.remarks}
            </Text>
          </View>
        )}
      </View>

      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-around',
          marginVertical: 10,
        }}
      >
        <TouchableOpacity
          style={[
            styles.invoiceAttachmentBtn,
            {
              backgroundColor: item.paymentReceivedAttachment
                ? 'red'
                : colors.border,
              opacity: item.paymentReceivedAttachment ? 1 : 0.5,
            },
          ]}
          onPress={() => handleViewPaymentReceivedAttachment(item)}
          disabled={!item.paymentReceivedAttachment}
        >
          <MaterialIcons
            name={
              item.paymentReceivedAttachment
                ? 'document-scanner'
                : 'document-scanner'
            }
            size={14}
            color="white"
          />
          <Text style={styles.invoiceAttachmentText}>
            {item.paymentReceivedAttachment ? 'Receipt' : 'No Receipt'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.invoiceAttachmentBtn,
            {
              backgroundColor: item.invoiceAttachment ? 'green' : colors.border,
              opacity: item.invoiceAttachment ? 1 : 0.5,
            },
          ]}
          onPress={() => handleViewInvoice(item)}
          disabled={!item.invoiceAttachment}
        >
          <MaterialIcons
            name={
              item.invoiceAttachment ? 'document-scanner' : 'document-scanner'
            }
            size={14}
            color="white"
          />
          <Text style={styles.invoiceAttachmentText}>
            {item.invoiceAttachment ? 'Invoice' : 'No Invoice'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.paymentActions}>
        <TouchableOpacity
          onPress={() => handleEditPayment(item)}
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
          onPress={() => handleDeletePayment(item)}
          style={[styles.actionButton, { backgroundColor: '#FF5722' + '15' }]}
        >
          <MaterialIcons name="delete" size={16} color="#FF5722" />
          <Text style={[styles.actionText, { color: '#FF5722' }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const totalAmount = booking.payments.reduce(
    (sum, payment) => sum + parseFloat(payment.amount),
    0,
  );
  const paidAmount = booking.payments
    .filter((p) => p.status === 'paid')
    .reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
  const pendingAmount = totalAmount - paidAmount;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>
            Payments - Booking #{booking.id}
          </Text>
          <View style={styles.placeholder} />
        </View>

        {/* Summary Card */}
        <View
          style={[
            styles.summaryCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.summaryHeader}>
            <Text style={[styles.summaryTitle, { color: colors.text }]}>
              {booking.customer.firstName} {booking.customer.lastName}
            </Text>
            <Text style={[styles.summarySubtitle, { color: colors.subtext }]}>
              Unit: {booking.storageUnit.unitNumber}
            </Text>
          </View>

          <View style={styles.summaryStats}>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.subtext }]}>
                Total
              </Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {formatCurrency(totalAmount.toString())}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.subtext }]}>
                Paid
              </Text>
              <Text style={[styles.statValue, { color: '#4CAF50' }]}>
                {formatCurrency(paidAmount.toString())}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.subtext }]}>
                Pending
              </Text>
              <Text style={[styles.statValue, { color: '#FF9800' }]}>
                {formatCurrency(pendingAmount.toString())}
              </Text>
            </View>
          </View>
        </View>

        {/* Payments List */}
        <View style={styles.paymentsContainer}>
          <Text style={[styles.paymentsTitle, { color: colors.text }]}>
            Payment History ({booking.payments.length})
          </Text>

          <FlatList
            data={booking.payments}
            renderItem={renderPaymentItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.paymentsList}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 32,
  },
  summaryCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  summaryHeader: {
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  summarySubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  paymentsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  paymentsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  paymentsList: {
    paddingBottom: 20,
  },
  paymentItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentId: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  paymentDetails: {
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
    fontSize: 11,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  remarksContainer: {
    marginTop: 8,
  },
  remarksText: {
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
  },
  paymentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 2,
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },

  invoiceAttachmentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 2,
    width: 70,
    height: 30,
  },
  invoiceAttachmentText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 3,
  },
});

export default PaymentsModal;
