import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  ScrollView,
  KeyboardAvoidingView
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import { useTheme } from '@react-navigation/native';
import { lightColors, darkColors } from '../../constants/color';

interface AddBookingModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (booking: {
    customer: string;
    storageUnit: string;
    startDate: Date;
    endDate: Date;
    totalPrice: string;
    spaceOccupied: string;
    packingList: DocumentPicker.DocumentPickerAsset | null;
  }) => void;
}

const AddBookingModal: React.FC<AddBookingModalProps> = ({ visible, onClose, onAdd }) => {
  const { dark } = useTheme();
  const colors = dark ? darkColors : lightColors;

  const [customer, setCustomer] = useState('');
  const [storageUnit, setStorageUnit] = useState('');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [totalPrice, setTotalPrice] = useState('');
  const [spaceOccupied, setSpaceOccupied] = useState('');
  const [packingList, setPackingList] = useState<DocumentPicker.DocumentPickerAsset | null>(null);

  const handleAdd = () => {
    onAdd({
      customer,
      storageUnit,
      startDate,
      endDate,
      totalPrice,
      spaceOccupied,
      packingList,
    });
    onClose();
  };

  const pickPackingList = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
    });

    if (result.assets && result.assets.length > 0) {
      setPackingList(result.assets[0]);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={[styles.title, { color: colors.text }]}>Add Booking</Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Customer</Text>
              <View style={styles.pickerWrapper}>
                <Picker selectedValue={customer} onValueChange={setCustomer} style={styles.picker}>
                  <Picker.Item label="Select Customer" value="" />
                  <Picker.Item label="John Doe" value="john" />
                  <Picker.Item label="Jane Smith" value="jane" />
                </Picker>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Storage Unit</Text>
              <View style={styles.pickerWrapper}>
                <Picker selectedValue={storageUnit} onValueChange={setStorageUnit} style={styles.picker}>
                  <Picker.Item label="Select Unit" value="" />
                  <Picker.Item label="Unit A101" value="A101" />
                  <Picker.Item label="Unit B202" value="B202" />
                </Picker>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Start Date</Text>
              <TouchableOpacity onPress={() => setShowStartPicker(true)} style={styles.dateInput}>
                <Text style={{ color: colors.text }}>{startDate.toDateString()}</Text>
              </TouchableOpacity>
              {showStartPicker && (
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display="default"
                  onChange={(_, date) => {
                    setShowStartPicker(false);
                    if (date) setStartDate(date);
                  }}
                />
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>End Date</Text>
              <TouchableOpacity onPress={() => setShowEndPicker(true)} style={styles.dateInput}>
                <Text style={{ color: colors.text }}>{endDate.toDateString()}</Text>
              </TouchableOpacity>
              {showEndPicker && (
                <DateTimePicker
                  value={endDate}
                  mode="date"
                  display="default"
                  onChange={(_, date) => {
                    setShowEndPicker(false);
                    if (date) setEndDate(date);
                  }}
                />
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Total Price</Text>
              <TextInput
                value={totalPrice}
                onChangeText={setTotalPrice}
                placeholder="Enter price"
                keyboardType="numeric"
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                placeholderTextColor={colors.border}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Space Occupied</Text>
              <TextInput
                value={spaceOccupied}
                onChangeText={setSpaceOccupied}
                placeholder="Enter size"
                keyboardType="numeric"
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                placeholderTextColor={colors.border}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Packing List (PDF)</Text>
              <TouchableOpacity onPress={pickPackingList} style={styles.uploadButton}>
                <Text style={{ color: '#fff' }}>
                  {packingList?.name || 'Upload PDF'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
                <Text style={styles.buttonText}>Add Booking</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default AddBookingModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '90%',
    borderRadius: 12,
    padding: 16,
    elevation: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: Platform.OS === 'ios' ? 12 : 8,
    fontSize: 14,
  },
  dateInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    justifyContent: 'center',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  uploadButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  closeButton: {
    backgroundColor: '#999',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 8,
  },
  addButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
