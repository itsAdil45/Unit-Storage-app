import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '@react-navigation/native';
import { lightColors, darkColors } from '../../constants/color';
import { usePost } from '../../hooks/usePost';
import Toast from 'react-native-toast-message';

interface AddExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (expense: {
    name: string;
    expenseType: string;
    amount: string;
    warehouse: string;
    date: string;
  }) => void;
}

interface ExpenseType {
  label: string;
  value: string;
}

interface Warehouse {
  label: string;
  value: string;
  id: number;
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  visible,
  onClose,
  onAdd,
}) => {
  const { dark } = useTheme();
  const colors = dark ? darkColors : lightColors;
  const { post } = usePost();

  const [name, setName] = useState('');
  const [expenseType, setExpenseType] = useState('');
  const [amount, setAmount] = useState('');
  const [warehouse, setWarehouse] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const expenseTypes: ExpenseType[] = [
    { label: 'Rent', value: 'rent' },
    { label: 'Supplies', value: 'supplies' },
    { label: 'Utilities', value: 'utilities' },
    { label: 'Maintenance', value: 'maintenance' },
    { label: 'Salaries', value: 'salaries' },
    { label: 'Insurance', value: 'insurance' },
    { label: 'Marketing', value: 'marketing' },
    { label: 'Other', value: 'other' },
  ];

  const warehouses: Warehouse[] = [
    { label: 'Warehouse 3A', value: 'warehouse_3a', id: 12 },
    { label: 'Warehouse 16B', value: 'warehouse_16b', id: 13 },
    { label: 'Warehouse 2A', value: 'warehouse_2a', id: 14 },
    { label: 'Warehouse 3A', value: 'warehouse_3a_duplicate', id: 15 }, // Note: duplicate name as requested
  ];

  const handleAdd = async () => {
    // Validate required fields
    if (!name.trim() || !expenseType || !amount || !warehouse) {
      Toast.show({
        type: 'error',
        text1: 'Failed',
        text2: `Error', Please fill all fields`,
      });
      return;
    }

    // Validate amount is a positive number
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Failed',
        text2: `Error', Please enter a valid amount`,
      });
      return;
    }

    setSubmitting(true);

    try {
      const selectedWarehouse = warehouses.find((w) => w.value === warehouse);
      const payload = {
        description: name.trim(),
        amount: numericAmount,
        expenseType: expenseType,
        date: date.toISOString().split('T')[0], // Format as YYYY-MM-DD
        warehouseId: selectedWarehouse?.id || 12,
      };

      const response = await post('/expenses', payload); // Adjust endpoint as needed

      if (response && response.status === 'success') {
        Toast.show({
          type: 'success',
          text1: 'Added',
          text2: `Expense added successfully `,
        });
        // Call the onAdd callback
        onAdd({
          name,
          expenseType:
            expenseTypes.find((et) => et.value === expenseType)?.label ||
            expenseType,
          amount,
          warehouse: selectedWarehouse?.label || warehouse,
          date: date.toISOString().split('T')[0],
        });

        // Reset form
        resetForm();
        onClose();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed',
          text2: `${response?.message}`,
        });
      }
    } catch (error) {
      console.error('Error adding expense:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setName('');
    setExpenseType('');
    setAmount('');
    setWarehouse('');
    setDate(new Date());
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.title, { color: colors.text }]}>
            Add Expense
          </Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Name/Description
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter expense description"
              style={[
                styles.input,
                { color: colors.text, borderColor: colors.border },
              ]}
              placeholderTextColor={colors.border}
              editable={!submitting}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Expense Type
            </Text>
            <View
              style={[styles.pickerWrapper, { borderColor: colors.border }]}
            >
              <Picker
                selectedValue={expenseType}
                onValueChange={(itemValue) => setExpenseType(itemValue)}
                style={styles.picker}
                enabled={!submitting}
              >
                <Picker.Item label="Select Expense Type" value="" />
                {expenseTypes.map((type) => (
                  <Picker.Item
                    key={type.value}
                    label={type.label}
                    value={type.value}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Amount</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="Enter amount"
              keyboardType="numeric"
              style={[
                styles.input,
                { color: colors.text, borderColor: colors.border },
              ]}
              placeholderTextColor={colors.border}
              editable={!submitting}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Warehouse
            </Text>
            <View
              style={[styles.pickerWrapper, { borderColor: colors.border }]}
            >
              <Picker
                selectedValue={warehouse}
                onValueChange={(itemValue) => setWarehouse(itemValue)}
                style={styles.picker}
                enabled={!submitting}
              >
                <Picker.Item label="Select Warehouse" value="" />
                {warehouses.map((wh, index) => (
                  <Picker.Item
                    key={`${wh.value}_${index}`}
                    label={wh.label}
                    value={wh.value}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Date</Text>
            <TouchableOpacity
              style={[styles.dateButton, { borderColor: colors.border }]}
              onPress={() => setShowDatePicker(true)}
              disabled={submitting}
            >
              <Text style={[styles.dateText, { color: colors.text }]}>
                {formatDate(date)}
              </Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              testID="dateTimePicker"
              value={date}
              mode="date"
              is24Hour={true}
              display="default"
              onChange={onDateChange}
            />
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.closeButton, submitting && styles.disabledButton]}
              onPress={handleClose}
              disabled={submitting}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.addButton, submitting && styles.disabledButton]}
              onPress={handleAdd}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Add Expense</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AddExpenseModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
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
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: Platform.OS === 'ios' ? 12 : 8,
    fontSize: 14,
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
  dateButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: Platform.OS === 'ios' ? 12 : 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 14,
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
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
