import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { usePatch } from '../../hooks/usePatch';
import { lightColors, darkColors } from '../../constants/color';
import Toast from 'react-native-toast-message';

interface Expense {
  id: number;
  expenseType: string;
  amount: string;
  date: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  deleted: 0 | 1;
  userId: number;
  warehouseId: number;
  warehouse: {
    name: string;
  };
  user: {
    email: string;
  };
}

interface EditExpenseModalProps {
  visible: boolean;
  expense: Expense;
  onClose: () => void;
  onSaveSuccess: (updatedExpense: Expense) => void;
}

const EXPENSE_TYPES = [
  { label: 'Rent', value: 'rent' },
  { label: 'Supplies', value: 'supplies' },
  { label: 'Utilities', value: 'utilities' },
  { label: 'Maintenance', value: 'maintenance' },
  { label: 'Salaries', value: 'salaries' },
  { label: 'Insurance', value: 'insurance' },
  { label: 'Marketing', value: 'marketing' },
  { label: 'Other', value: 'other' },
];

const EditExpenseModal: React.FC<EditExpenseModalProps> = ({
  visible,
  expense,
  onClose,
  onSaveSuccess,
}) => {
  const { dark } = useTheme();
  const colors = dark ? darkColors : lightColors;
  const { patch, loading } = usePatch();

  // Form state
  const [description, setDescription] = useState(expense.description);
  const [amount, setAmount] = useState(expense.amount);
  const [selectedDate, setSelectedDate] = useState(new Date(expense.date));
  const [expenseType, setExpenseType] = useState(expense.expenseType);

  // UI state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Reset form when expense changes
  useEffect(() => {
    if (expense) {
      setDescription(expense.description);
      setAmount(expense.amount);
      setSelectedDate(new Date(expense.date));
      setExpenseType(expense.expenseType);
      setErrors({});
    }
  }, [expense]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      newErrors.amount = 'Amount must be a valid positive number';
    }

    if (!expenseType) {
      newErrors.expenseType = 'Expense type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const updatedData = {
        description: description.trim(),
        amount: parseFloat(amount),
        date: selectedDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
        expenseType,
      };

      const response = await patch(`/expenses/${expense.id}`, updatedData);

      if (response?.status === 'success') {
        // Create updated expense object for local state update
        const updatedExpense: Expense = {
          ...expense,
          ...updatedData,
          amount: updatedData.amount.toString(),
          updatedAt: new Date().toISOString(),
        };

        onSaveSuccess(updatedExpense);
      Toast.show({
        type: 'success',
        text1: 'Updated',
        text2: `Expense updated successfully `,
      });
      } else {
        Alert.alert('Error', 'Failed to update expense');
      }
    } catch (error) {
      console.error('Error updating expense:', error);
      Alert.alert('Error', 'Failed to update expense');
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setSelectedDate(selectedDate);
    }
  };

  const formatDisplayDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleAmountChange = (text: string) => {
    // Allow only numbers and decimal point
    const numericText = text.replace(/[^0-9.]/g, '');

    // Ensure only one decimal point
    const parts = numericText.split('.');
    if (parts.length > 2) {
      return;
    }

    // Limit decimal places to 2
    if (parts[1] && parts[1].length > 2) {
      return;
    }

    setAmount(numericText);
  };

  const renderDropdownItem = (item: { label: string; value: string }) => (
    <TouchableOpacity
      key={item.value}
      style={[
        styles.dropdownItem,
        {
          backgroundColor:
            expenseType === item.value ? colors.primary + '20' : colors.card,
          borderBottomColor: colors.border,
        },
      ]}
      onPress={() => {
        setExpenseType(item.value);
        setShowTypeDropdown(false);
      }}
    >
      <Text
        style={[
          styles.dropdownItemText,
          {
            color: expenseType === item.value ? colors.primary : colors.text,
            fontWeight: expenseType === item.value ? '600' : 'normal',
          },
        ]}
      >
        {item.label}
      </Text>
      {expenseType === item.value && (
        <MaterialIcons name="check" size={20} color={colors.primary} />
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View
          style={[
            styles.header,
            { backgroundColor: colors.card, borderBottomColor: colors.border },
          ]}
        >
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Edit Expense
          </Text>
          <TouchableOpacity
            onPress={handleSave}
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Description Field */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              Description *
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.card,
                  borderColor: errors.description
                    ? colors.notification
                    : colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="Enter expense description"
              placeholderTextColor={colors.subtext}
              multiline
              numberOfLines={2}
            />
            {errors.description && (
              <Text style={[styles.errorText, { color: colors.notification }]}>
                {errors.description}
              </Text>
            )}
          </View>

          {/* Amount Field */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              Amount *
            </Text>
            <View style={styles.amountContainer}>
              <Text style={[styles.currencySymbol, { color: colors.text }]}>
                $
              </Text>
              <TextInput
                value={amount}
                onChangeText={handleAmountChange}
                style={[
                  styles.amountInput,
                  {
                    backgroundColor: colors.card,
                    borderColor: errors.amount
                      ? colors.notification
                      : colors.border,
                    color: colors.text,
                  },
                ]}
                placeholder="0"
                placeholderTextColor={colors.subtext}
                keyboardType="decimal-pad"
              />
            </View>
            {errors.amount && (
              <Text style={[styles.errorText, { color: colors.notification }]}>
                {errors.amount}
              </Text>
            )}
          </View>

          {/* Date Field */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              Date *
            </Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={[
                styles.dateButton,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <MaterialIcons
                name="date-range"
                size={20}
                color={colors.subtext}
              />
              <Text style={[styles.dateButtonText, { color: colors.text }]}>
                {formatDisplayDate(selectedDate)}
              </Text>
              <MaterialIcons
                name="chevron-right"
                size={20}
                color={colors.subtext}
              />
            </TouchableOpacity>
          </View>

          {/* Expense Type Field */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              Expense Type *
            </Text>
            <TouchableOpacity
              onPress={() => setShowTypeDropdown(!showTypeDropdown)}
              style={[
                styles.dropdownButton,
                {
                  backgroundColor: colors.card,
                  borderColor: errors.expenseType
                    ? colors.notification
                    : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.dropdownButtonText,
                  { color: expenseType ? colors.text : colors.subtext },
                ]}
              >
                {expenseType
                  ? EXPENSE_TYPES.find((type) => type.value === expenseType)
                      ?.label
                  : 'Select expense type'}
              </Text>
              <MaterialIcons
                name={
                  showTypeDropdown ? 'keyboard-arrow-up' : 'keyboard-arrow-down'
                }
                size={24}
                color={colors.subtext}
              />
            </TouchableOpacity>

            {showTypeDropdown && (
              <View
                style={[
                  styles.dropdown,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                {EXPENSE_TYPES.map(renderDropdownItem)}
              </View>
            )}

            {errors.expenseType && (
              <Text style={[styles.errorText, { color: colors.notification }]}>
                {errors.expenseType}
              </Text>
            )}
          </View>

          {/* Expense Info */}
          {/* <View style={[styles.infoContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.infoTitle, { color: colors.text }]}>Expense Information</Text>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.subtext }]}>ID:</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{expense.id}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.subtext }]}>Warehouse:</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{expense.warehouse.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.subtext }]}>Created:</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {new Date(expense.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View> */}
        </ScrollView>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
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
    paddingVertical: 12,
    fontSize: 16,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    textAlign: 'right',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dateButtonText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dropdownButtonText: {
    fontSize: 16,
  },
  dropdown: {
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 4,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  dropdownItemText: {
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  infoContainer: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default EditExpenseModal;
