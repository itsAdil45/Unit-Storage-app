import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Booking, Payment } from '../../types/Bookings';
import { usePostFormData } from '../../hooks/usePostFormData';
import { usePatchFormData } from '../../hooks/usePatchFormData';
import * as DocumentPicker from 'expo-document-picker';
import Toast from 'react-native-toast-message';

interface AddEditPaymentModalProps {
  visible: boolean;
  booking: Booking;
  payment?: Payment; 
  onClose: () => void;
  onSuccess: (payment: Payment) => void;
  colors: any;
  dark: boolean;
}

const AddEditPaymentModal: React.FC<AddEditPaymentModalProps> = ({
  visible,
  booking,
  payment,
  onClose,
  onSuccess,
  colors,
  dark,
}) => {
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: '',
    status: 'pending',
    remarks: '',
  });
  const [paymentDate, setPaymentDate] = useState(new Date());
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showPaymentDatePicker, setShowPaymentDatePicker] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [paymentReceivedAttachment, setPaymentReceivedAttachment] =
    useState<any>(null);
  const [invoiceAttachment, setInvoiceAttachment] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const { postFormData } = usePostFormData();
  const { patchFormData } = usePatchFormData();

  const isEditMode = !!payment;

  useEffect(() => {
    if (visible) {
      if (isEditMode && payment) {
        setFormData({
          amount: payment.amount,
          paymentMethod: payment.paymentMethod || '',
          status: payment.status,
          remarks: payment.remarks || '',
        });
        setPaymentDate(new Date(payment.paymentDate));
        setStartDate(new Date(payment.startDate));
        setEndDate(new Date(payment.endDate));
      } else {
        const today = new Date();
        setFormData({
          amount: '',
          paymentMethod: 'cash',
          status: 'pending',
          remarks: '',
        });
        setPaymentDate(today);
        setStartDate(today);
        setEndDate(today);
      }
      setPaymentReceivedAttachment(null);
      setInvoiceAttachment(null);
    }
  }, [visible, payment, isEditMode]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const onPaymentDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || paymentDate;
    setShowPaymentDatePicker(Platform.OS === 'ios');
    setPaymentDate(currentDate);
  };

  const onStartDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || startDate;
    setShowStartDatePicker(Platform.OS === 'ios');
    setStartDate(currentDate);
  };

  const onEndDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || endDate;
    setShowEndDatePicker(Platform.OS === 'ios');
    setEndDate(currentDate);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const pickDocument = async (type: 'paymentReceived' | 'invoice') => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        if (type === 'paymentReceived') {
          setPaymentReceivedAttachment(file);
        } else {
          setInvoiceAttachment(file);
        }
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed',
        text2: `Error', Failed to pick document`,
      });
    }
  };

  const removeAttachment = (type: 'paymentReceived' | 'invoice') => {
    if (type === 'paymentReceived') {
      setPaymentReceivedAttachment(null);
    } else {
      setInvoiceAttachment(null);
    }
  };

  const validateForm = () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Failed',
        text2: `Error', Please enter a valid amount`,
      });
      return false;
    }
    if (startDate >= endDate) {
      Toast.show({
        type: 'error',
        text1: 'Failed',
        text2: `Error', Start date must be before end date`,
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const form = new FormData();

      if (isEditMode) {
        form.append('amount', formData.amount);
        form.append('paymentDate', paymentDate.toISOString().split('T')[0]);
        form.append('paymentMethod', formData.paymentMethod);
        form.append('startDate', startDate.toISOString().split('T')[0]);
        form.append('endDate', endDate.toISOString().split('T')[0]);
        form.append('status', formData.status);
        form.append('remarks', formData.remarks);
      } else {
        form.append('bookingId', booking.id.toString());
        form.append('amount', formData.amount);
        form.append('paymentDate', paymentDate.toISOString().split('T')[0]);
        form.append('paymentMethod', formData.paymentMethod);
        form.append('startDate', startDate.toISOString().split('T')[0]);
        form.append('endDate', endDate.toISOString().split('T')[0]);
        form.append('status', formData.status);
        form.append('remarks', formData.remarks);
      }

      if (paymentReceivedAttachment) {
        form.append('paymentReceivedAttachment', {
          uri: paymentReceivedAttachment.uri,
          type:
            paymentReceivedAttachment.mimeType || 'application/octet-stream',
          name: paymentReceivedAttachment.name || 'payment_receipt',
        } as any);
      }

      if (invoiceAttachment) {
        form.append('invoiceAttachment', {
          uri: invoiceAttachment.uri,
          type: invoiceAttachment.mimeType || 'application/octet-stream',
          name: invoiceAttachment.name || 'invoice',
        } as any);
      }

      let response;
      if (isEditMode) {
        response = await patchFormData(`/payments/${payment!.id}`, form);
      } else {
        response = await postFormData('/payments', form);
      }

      if (response?.status === 'success') {
        const updatedPayment: Payment = {
          ...(isEditMode ? payment! : {}),
          ...(response.data || response.payment || {}),
          id: isEditMode ? payment!.id : (response.data?.id || response.payment?.id),
          amount: formData.amount,
          paymentDate: paymentDate.toISOString().split('T')[0],
          paymentMethod: formData.paymentMethod,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          status: formData.status,
          remarks: formData.remarks,
          paymentReceivedAttachment: 
            response.data?.paymentReceivedAttachment || 
            response.payment?.paymentReceivedAttachment || 
            (isEditMode ? payment!.paymentReceivedAttachment : null),
          invoiceAttachment: 
            response.data?.invoiceAttachment || 
            response.payment?.invoiceAttachment || 
            (isEditMode ? payment!.invoiceAttachment : null),
        };

        onSuccess(updatedPayment);
        
        onClose();
        
        Toast.show({
          type: 'success',
          text1: isEditMode ? 'Updated' : 'Added',
          text2: `Payment ${isEditMode ? 'updated' : 'added'} successfully`,
        });
      } else {
        onClose();
        Toast.show({
          type: 'error',
          text1: 'Failed',
          text2: `${response?.message || 'Failed to save payment'}`,
        });
      }
    } catch (error) {
      console.error('Error saving payment:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed',
        text2: `Failed to save payment`,
      });
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = ['pending', 'paid', 'overdue', 'cancelled'];
  const paymentMethodOptions = [
    'cash',
    'card',
    'bank_transfer',
    'check',
    'online',
  ];

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
            {isEditMode ? 'Edit Payment' : 'Add Payment Record'}
          </Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Booking Info */}
          <View
            style={[
              styles.bookingInfo,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.bookingTitle, { color: colors.text }]}>
              Booking #{booking.id}
            </Text>
            <Text style={[styles.bookingSubtitle, { color: colors.subtext }]}>
              {booking.customer.firstName} {booking.customer.lastName} - Unit{' '}
              {booking.storageUnit.unitNumber}
            </Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* Amount */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                Amount *
              </Text>
              <TextInput
                value={formData.amount}
                onChangeText={(value) => handleInputChange('amount', value)}
                placeholder="Enter amount"
                placeholderTextColor={colors.subtext}
                style={[
                  styles.textInput,
                  { color: colors.text, borderColor: colors.border },
                ]}
                keyboardType="numeric"
              />
            </View>

            {/* Payment Date */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                Payment Date *
              </Text>
              <TouchableOpacity
                style={[styles.dateButton, { borderColor: colors.border }]}
                onPress={() => setShowPaymentDatePicker(true)}
                disabled={loading}
              >
                <Text style={[styles.dateText, { color: colors.text }]}>
                  {formatDate(paymentDate)}
                </Text>
              </TouchableOpacity>
            </View>

            {showPaymentDatePicker && (
              <DateTimePicker
                testID="paymentDateTimePicker"
                value={paymentDate}
                mode="date"
                is24Hour={true}
                display="default"
                onChange={onPaymentDateChange}
              />
            )}

            {/* Payment Method */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                Payment Method
              </Text>
              <View style={styles.radioContainer}>
                {paymentMethodOptions.map((method) => (
                  <TouchableOpacity
                    key={method}
                    onPress={() => handleInputChange('paymentMethod', method)}
                    style={styles.radioOption}
                  >
                    <MaterialIcons
                      name={
                        formData.paymentMethod === method
                          ? 'radio-button-checked'
                          : 'radio-button-unchecked'
                      }
                      size={20}
                      color={
                        formData.paymentMethod === method
                          ? colors.primary
                          : colors.subtext
                      }
                    />
                    <Text style={[styles.radioText, { color: colors.text }]}>
                      {method.charAt(0).toUpperCase() +
                        method.slice(1).replace('_', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Start Date */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                Period Start Date *
              </Text>
              <TouchableOpacity
                style={[styles.dateButton, { borderColor: colors.border }]}
                onPress={() => setShowStartDatePicker(true)}
                disabled={loading}
              >
                <Text style={[styles.dateText, { color: colors.text }]}>
                  {formatDate(startDate)}
                </Text>
              </TouchableOpacity>
            </View>

            {showStartDatePicker && (
              <DateTimePicker
                testID="startDateTimePicker"
                value={startDate}
                mode="date"
                is24Hour={true}
                display="default"
                onChange={onStartDateChange}
              />
            )}

            {/* End Date */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                Period End Date *
              </Text>
              <TouchableOpacity
                style={[styles.dateButton, { borderColor: colors.border }]}
                onPress={() => setShowEndDatePicker(true)}
                disabled={loading}
              >
                <Text style={[styles.dateText, { color: colors.text }]}>
                  {formatDate(endDate)}
                </Text>
              </TouchableOpacity>
            </View>

            {showEndDatePicker && (
              <DateTimePicker
                testID="endDateTimePicker"
                value={endDate}
                mode="date"
                is24Hour={true}
                display="default"
                onChange={onEndDateChange}
              />
            )}

            {/* Status */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                Status
              </Text>
              <View style={styles.radioContainer}>
                {statusOptions.map((status) => (
                  <TouchableOpacity
                    key={status}
                    onPress={() => handleInputChange('status', status)}
                    style={styles.radioOption}
                  >
                    <MaterialIcons
                      name={
                        formData.status === status
                          ? 'radio-button-checked'
                          : 'radio-button-unchecked'
                      }
                      size={20}
                      color={
                        formData.status === status
                          ? colors.primary
                          : colors.subtext
                      }
                    />
                    <Text style={[styles.radioText, { color: colors.text }]}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Remarks */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                Remarks
              </Text>
              <TextInput
                value={formData.remarks}
                onChangeText={(value) => handleInputChange('remarks', value)}
                placeholder="Add any remarks..."
                placeholderTextColor={colors.subtext}
                style={[
                  styles.textArea,
                  { color: colors.text, borderColor: colors.border },
                ]}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Attachments */}
            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                Payment Receipt
              </Text>
              {paymentReceivedAttachment ? (
                <View
                  style={[
                    styles.attachmentContainer,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <MaterialIcons
                    name="attachment"
                    size={20}
                    color={colors.primary}
                  />
                  <Text
                    style={[styles.attachmentName, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {paymentReceivedAttachment.name}
                  </Text>
                  <TouchableOpacity
                    onPress={() => removeAttachment('paymentReceived')}
                  >
                    <MaterialIcons name="close" size={20} color="#FF5722" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => pickDocument('paymentReceived')}
                  style={[
                    styles.attachmentButton,
                    { borderColor: colors.border },
                  ]}
                >
                  <MaterialIcons
                    name="attach-file"
                    size={20}
                    color={colors.primary}
                  />
                  <Text
                    style={[
                      styles.attachmentButtonText,
                      { color: colors.primary },
                    ]}
                  >
                    Attach Payment Receipt
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                Invoice
              </Text>
              {invoiceAttachment ? (
                <View
                  style={[
                    styles.attachmentContainer,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <MaterialIcons
                    name="attachment"
                    size={20}
                    color={colors.primary}
                  />
                  <Text
                    style={[styles.attachmentName, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {invoiceAttachment.name}
                  </Text>
                  <TouchableOpacity onPress={() => removeAttachment('invoice')}>
                    <MaterialIcons name="close" size={20} color="#FF5722" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => pickDocument('invoice')}
                  style={[
                    styles.attachmentButton,
                    { borderColor: colors.border },
                  ]}
                >
                  <MaterialIcons
                    name="attach-file"
                    size={20}
                    color={colors.primary}
                  />
                  <Text
                    style={[
                      styles.attachmentButtonText,
                      { color: colors.primary },
                    ]}
                  >
                    Attach Invoice
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            style={[styles.submitButton, { backgroundColor: colors.primary }]}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <MaterialIcons name="save" size={20} color="#fff" />
                <Text style={styles.submitButtonText}>
                  {isEditMode ? 'Update Payment' : 'Add Payment'}
                </Text>
              </>
            )}
          </TouchableOpacity>
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  bookingInfo: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 16,
  },
  bookingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bookingSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  formContainer: {
    paddingBottom: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  dateButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: Platform.OS === 'ios' ? 12 : 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 16,
  },
  radioContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  radioText: {
    fontSize: 14,
    marginLeft: 8,
  },
  attachmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  attachmentButtonText: {
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '500',
  },
  attachmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  attachmentName: {
    flex: 1,
    fontSize: 14,
    marginLeft: 8,
  },
  footer: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default AddEditPaymentModal;