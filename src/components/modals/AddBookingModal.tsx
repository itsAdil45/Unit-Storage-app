import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import { useTheme } from '@react-navigation/native';
import { lightColors, darkColors } from '../../constants/color';
import { useGet } from '../../hooks/useGet';
import { usePostFormData } from '../../hooks/usePostFormData';
import Toast from 'react-native-toast-message';

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  deleted: number;
}

interface StorageUnit {
  id: number;
  unitNumber: string;
  size: number;
  warehouseName: string;
}

interface AddBookingModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (booking: any) => void;
}

const AddBookingModal: React.FC<AddBookingModalProps> = ({
  visible,
  onClose,
  onAdd,
}) => {
  const { dark } = useTheme();
  const colors = dark ? darkColors : lightColors;
  const { get } = useGet();
  const { postFormData } = usePostFormData();

  const [customer, setCustomer] = useState('');
  const [storageUnit, setStorageUnit] = useState('');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [totalPrice, setTotalPrice] = useState('');
  const [spaceOccupied, setSpaceOccupied] = useState('');
  const [packingList, setPackingList] =
    useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [customerSearch, setCustomerSearch] = useState('');
  const [storageUnitSearch, setStorageUnitSearch] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [storageUnits, setStorageUnits] = useState<StorageUnit[]>([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showStorageUnitDropdown, setShowStorageUnitDropdown] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [selectedStorageUnit, setSelectedStorageUnit] =
    useState<StorageUnit | null>(null);

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (customerSearch.length > 0) {
        const response = await get('/customers', { search: customerSearch });
        if (response?.status === 'success')
          setCustomers(response.data.customers);
      } else {
        setCustomers([]);
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [customerSearch]);
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (storageUnitSearch.length > 0) {
        const response = await get('/storage-units', {
          search: storageUnitSearch,
        });
        if (response?.status === 'success')
          setStorageUnits(response.data.units);
      } else {
        setStorageUnits([]);
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [storageUnitSearch]);

  const formatDateForAPI = (date: Date): string => {
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
  };

  const handleAdd = async () => {
    if (!selectedCustomer || !selectedStorageUnit) {
      Toast.show({
        type: 'error',
        text1: 'Failed',
        text2: `Error', Please select both customer and storage unit`,
      });
      return;
    }

    if (!totalPrice || !spaceOccupied) {
      Toast.show({
        type: 'error',
        text1: 'Failed',
        text2: `Error', 'Please fill in all required fieldse`,
      });
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();

      // Add form fields
      formData.append('customerId', selectedCustomer.id.toString());
      formData.append('storageUnitId', selectedStorageUnit.id.toString());
      formData.append('startDate', formatDateForAPI(startDate));
      formData.append('endDate', formatDateForAPI(endDate));
      formData.append('status', 'active');
      formData.append('totalPrice', totalPrice);
      formData.append('spaceOccupied', spaceOccupied);

      // Add PDF file if selected
      if (packingList) {
        formData.append('pdfDocument', {
          uri: packingList.uri,
          type: packingList.mimeType || 'application/pdf',
          name: packingList.name || 'packing-list.pdf',
        } as any);
      }

      const response = await postFormData('/bookings', formData);

      if (response?.status === 'success') {
        // Call the onAdd callback with the created booking data
        onAdd(response.data);

        Toast.show({
          type: 'success',
          text1: 'Added',
          text2: `Booking added successfully!`,
        });
        onClose();
        resetForm();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed',
          text2: `${response?.message}`,
        });
      }
    } catch (error) {
      console.error('Error creating booking:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setCustomer('');
    setStorageUnit('');
    setCustomerSearch('');
    setStorageUnitSearch('');
    setSelectedCustomer(null);
    setSelectedStorageUnit(null);
    setStartDate(new Date());
    setEndDate(new Date());
    setTotalPrice('');
    setSpaceOccupied('');
    setPackingList(null);
    setShowCustomerDropdown(false);
    setShowStorageUnitDropdown(false);
  };

  const pickPackingList = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
    });

    if (result.assets && result.assets.length > 0) {
      setPackingList(result.assets[0]);
    }
  };

  const selectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomer(customer.id.toString());
    setCustomerSearch(
      `${customer.firstName} ${customer.lastName} (${customer.email})`,
    );
    setShowCustomerDropdown(false);
  };

  const selectStorageUnit = (unit: StorageUnit) => {
    setSelectedStorageUnit(unit);
    setStorageUnit(unit.id.toString());
    setStorageUnitSearch(`${unit.unitNumber} (${unit.size} sq ft)`);
    setShowStorageUnitDropdown(false);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <View
            style={[styles.modalContainer, { backgroundColor: colors.card }]}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.title, { color: colors.text }]}>
                Add Booking
              </Text>

              {/* Customer Search */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Customer *
                </Text>
                <TextInput
                  value={customerSearch}
                  onChangeText={(text) => {
                    setCustomerSearch(text);
                    setShowCustomerDropdown(true);
                    if (text === '') {
                      setSelectedCustomer(null);
                      setCustomer('');
                    }
                  }}
                  onFocus={() => setShowCustomerDropdown(true)}
                  placeholder="Search customers..."
                  style={[
                    styles.input,
                    { color: colors.text, borderColor: colors.border },
                  ]}
                  placeholderTextColor={colors.border}
                />
                {showCustomerDropdown && customers.length > 0 && (
                  <View
                    style={[
                      styles.dropdown,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <ScrollView style={styles.dropdownList} nestedScrollEnabled>
                      {customers
                        .filter((item) => item.deleted === 0) // ✅ Only include non-deleted customers
                        .map((item) => (
                          <TouchableOpacity
                            key={item.id}
                            style={[
                              styles.dropdownItem,
                              { borderBottomColor: colors.border },
                            ]}
                            onPress={() => selectCustomer(item)}
                          >
                            <Text
                              style={[
                                styles.dropdownItemText,
                                { color: colors.text },
                              ]}
                            >
                              {item.firstName} {item.lastName}
                            </Text>
                            <Text
                              style={[
                                styles.dropdownItemSubtext,
                                { color: colors.border },
                              ]}
                            >
                              {item.email}
                            </Text>
                          </TouchableOpacity>
                        ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              {/* Storage Unit Search */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Storage Unit *
                </Text>
                <TextInput
                  value={storageUnitSearch}
                  onChangeText={(text) => {
                    setStorageUnitSearch(text);
                    setShowStorageUnitDropdown(true);
                    if (text === '') {
                      setSelectedStorageUnit(null);
                      setStorageUnit('');
                    }
                  }}
                  onFocus={() => setShowStorageUnitDropdown(true)}
                  placeholder="Search storage units..."
                  style={[
                    styles.input,
                    { color: colors.text, borderColor: colors.border },
                  ]}
                  placeholderTextColor={colors.border}
                />
                {showStorageUnitDropdown && storageUnits.length > 0 && (
                  <View
                    style={[
                      styles.dropdown,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <ScrollView style={styles.dropdownList} nestedScrollEnabled>
                      {storageUnits.map((item) => (
                        <TouchableOpacity
                          key={item.id}
                          style={[
                            styles.dropdownItem,
                            { borderBottomColor: colors.border },
                          ]}
                          onPress={() => selectStorageUnit(item)}
                        >
                          <Text
                            style={[
                              styles.dropdownItemText,
                              { color: colors.text },
                            ]}
                          >
                            {item.unitNumber} ({item.size} sq ft)
                          </Text>
                          <Text
                            style={[
                              styles.dropdownItemSubtext,
                              { color: colors.border },
                            ]}
                          >
                            {item.warehouseName}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              {/* Dates */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Start Date
                </Text>
                <TouchableOpacity
                  onPress={() => setShowStartPicker(true)}
                  style={[styles.dateInput, { borderColor: colors.border }]}
                >
                  <Text style={{ color: colors.text }}>
                    {startDate.toDateString()}
                  </Text>
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
                <Text style={[styles.label, { color: colors.text }]}>
                  End Date
                </Text>
                <TouchableOpacity
                  onPress={() => setShowEndPicker(true)}
                  style={[styles.dateInput, { borderColor: colors.border }]}
                >
                  <Text style={{ color: colors.text }}>
                    {endDate.toDateString()}
                  </Text>
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

              {/* Price */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Total Price *
                </Text>
                <TextInput
                  value={totalPrice}
                  onChangeText={setTotalPrice}
                  placeholder="Enter price"
                  keyboardType="numeric"
                  style={[
                    styles.input,
                    { color: colors.text, borderColor: colors.border },
                  ]}
                  placeholderTextColor={colors.border}
                />
              </View>

              {/* Space */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Space Occupied *
                </Text>
                <TextInput
                  value={spaceOccupied}
                  onChangeText={setSpaceOccupied}
                  placeholder="Enter size"
                  keyboardType="numeric"
                  style={[
                    styles.input,
                    { color: colors.text, borderColor: colors.border },
                  ]}
                  placeholderTextColor={colors.border}
                />
              </View>

              {/* Packing List */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Packing List (PDF)
                </Text>
                <TouchableOpacity
                  onPress={pickPackingList}
                  style={styles.uploadButton}
                >
                  <Text style={{ color: '#fff' }}>
                    {packingList?.name || 'Upload PDF'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Buttons */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onClose}
                  disabled={isLoading}
                >
                  <Text style={styles.buttonText}>Close</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.addButton,
                    {
                      opacity:
                        !selectedCustomer ||
                        !selectedStorageUnit ||
                        !totalPrice ||
                        !spaceOccupied ||
                        isLoading
                          ? 0.5
                          : 1,
                    },
                  ]}
                  onPress={handleAdd}
                  disabled={
                    !selectedCustomer ||
                    !selectedStorageUnit ||
                    !totalPrice ||
                    !spaceOccupied ||
                    isLoading
                  }
                >
                  <Text style={styles.buttonText}>
                    {isLoading ? 'Creating...' : 'Add Booking'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
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
  keyboardAvoidingView: {
    width: '90%',
    maxHeight: '90%',
  },
  modalContainer: {
    width: '100%',
    maxHeight: '100%',
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
    position: 'relative',
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
  dropdown: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: 8,
    maxHeight: 150,
    zIndex: 1000,
    elevation: 5,
  },
  dropdownList: {
    maxHeight: 150,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
  },
  dropdownItemText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dropdownItemSubtext: {
    fontSize: 12,
    marginTop: 2,
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
