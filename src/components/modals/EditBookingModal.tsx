import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { usePatchFormData } from '../../hooks/usePatchFormData';
import { Booking } from '../../types/Bookings';
import * as DocumentPicker from 'expo-document-picker';
import Toast from 'react-native-toast-message';

interface EditBookingModalProps {
  visible: boolean;
  booking: Booking;
  onClose: () => void;
  onSaveSuccess: (updatedBooking: Booking) => void;
  colors: any;
  dark: boolean;
}

const EditBookingModal: React.FC<EditBookingModalProps> = ({
  visible,
  booking,
  onClose,
  onSaveSuccess,
  colors,
  dark,
}) => {
  const [status, setStatus] = useState(booking.status);
  const [startDate, setStartDate] = useState(new Date(booking.startDate));
  const [endDate, setEndDate] = useState(new Date(booking.endDate));
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [totalPrice, setTotalPrice] = useState(booking.totalPrice);
  const [spaceOccupied, setSpaceOccupied] = useState(booking.spaceOccupied);
  const [pdfDocument, setPdfDocument] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const { patchFormData } = usePatchFormData();

  useEffect(() => {
    if (visible) {
      // Reset form when modal opens
      setStatus(booking.status);
      setStartDate(new Date(booking.startDate));
      setEndDate(new Date(booking.endDate));
      setTotalPrice(booking.totalPrice);
      setSpaceOccupied(booking.spaceOccupied);
      setPdfDocument(null);
    }
  }, [visible, booking]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        setPdfDocument(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleSave = async () => {
    if (!status || !totalPrice || !spaceOccupied) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Validate start date is before end date
    if (startDate >= endDate) {
      Alert.alert('Error', 'Start date must be before end date');
      return;
    }

    // Validate totalPrice and spaceOccupied are numbers
    if (isNaN(parseFloat(totalPrice)) || isNaN(parseFloat(spaceOccupied))) {
      Alert.alert(
        'Error',
        'Total price and space occupied must be valid numbers',
      );
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('status', status);
      formData.append('startDate', startDate.toISOString().split('T')[0]);
      formData.append('endDate', endDate.toISOString().split('T')[0]);
      formData.append('totalPrice', totalPrice);
      formData.append('spaceOccupied', spaceOccupied);

      if (pdfDocument) {
        formData.append('pdfDocument', {
          uri: pdfDocument.uri,
          type: pdfDocument.mimeType || 'application/pdf',
          name: pdfDocument.name || 'document.pdf',
        } as any);
      }

      const response = await patchFormData(`/bookings/${booking.id}`, formData);

      if (response?.status === 'success') {
        const updatedBooking = {
          ...booking,
          status,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          totalPrice,
          spaceOccupied,
          pdfDocumentUrl:
            response.data?.pdfDocumentUrl || booking.pdfDocumentUrl,
        };
        onSaveSuccess(updatedBooking);
        Toast.show({
          type: 'success',
          text1: 'Updated',
          text2: `Booking updated successfully `,
        });
      } else {
        Alert.alert('Error', response?.message || 'Failed to update booking');
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      Alert.alert('Error', 'Failed to update booking');
    }

    setLoading(false);
  };

  const statusOptions = ['active', 'completed', 'cancelled'];

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
            Edit Booking
          </Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={loading}
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Status */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Status *</Text>
            <View style={styles.statusContainer}>
              {statusOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  onPress={() => setStatus(option)}
                  style={[
                    styles.statusOption,
                    {
                      backgroundColor:
                        status === option ? colors.primary : colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: status === option ? '#fff' : colors.text },
                    ]}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Start Date */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Start Date *
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
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              End Date *
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

          {/* Total Price */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Total Price *
            </Text>
            <TextInput
              value={totalPrice}
              onChangeText={setTotalPrice}
              placeholder="800.00"
              placeholderTextColor={colors.subtext}
              keyboardType="decimal-pad"
              style={[
                styles.input,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
            />
            <Text style={[styles.helperText, { color: colors.subtext }]}>
              Enter amount in decimal format (e.g., 800.00)
            </Text>
          </View>

          {/* Space Occupied */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Space Occupied *
            </Text>
            <TextInput
              value={spaceOccupied}
              onChangeText={setSpaceOccupied}
              placeholder="25.00"
              placeholderTextColor={colors.subtext}
              keyboardType="decimal-pad"
              style={[
                styles.input,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
            />
            <Text style={[styles.helperText, { color: colors.subtext }]}>
              Enter space in decimal format (e.g., 25.00)
            </Text>
          </View>

          {/* PDF Document */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              PDF Document
            </Text>
            <TouchableOpacity
              onPress={pickDocument}
              style={[
                styles.documentPicker,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <MaterialIcons
                name="attach-file"
                size={20}
                color={colors.subtext}
              />
              <Text style={[styles.documentText, { color: colors.text }]}>
                {pdfDocument ? pdfDocument.name : 'Select PDF Document'}
              </Text>
            </TouchableOpacity>
            {pdfDocument && (
              <TouchableOpacity
                onPress={() => setPdfDocument(null)}
                style={styles.removeDocument}
              >
                <MaterialIcons name="close" size={16} color={colors.error} />
                <Text style={[styles.removeText, { color: colors.error }]}>
                  Remove
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
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
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 60,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
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
  documentPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  documentText: {
    marginLeft: 8,
    fontSize: 16,
    flex: 1,
  },
  removeDocument: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  removeText: {
    marginLeft: 4,
    fontSize: 12,
  },
});

export default EditBookingModal;