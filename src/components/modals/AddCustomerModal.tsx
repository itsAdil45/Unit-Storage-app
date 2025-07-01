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
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { lightColors, darkColors } from '../../constants/color';
import { usePost } from '../../hooks/usePost'; // Adjust path as needed
import Toast from 'react-native-toast-message';

interface AddCustomerModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    inquiry: string;
  }) => void;
}

const AddCustomerModal: React.FC<AddCustomerModalProps> = ({
  visible,
  onClose,
  onAdd,
}) => {
  const { dark } = useTheme();
  const colors = dark ? darkColors : lightColors;
  const { post } = usePost();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [inquiry, setInquiry] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    // Basic phone validation - adjust regex based on your requirements
    const phoneRegex = /^\d{10,15}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
  };

  const handleAdd = async () => {
    // Validate required fields
    if (!firstName.trim()) {
      Alert.alert('Error', 'Please enter first name');
      return;
    }

    if (!lastName.trim()) {
      Alert.alert('Error', 'Please enter last name');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Error', 'Please enter email');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (!phone.trim()) {
      Alert.alert('Error', 'Please enter phone number');
      return;
    }

    if (!validatePhone(phone)) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        address: address.trim(),
        inquiry: inquiry.trim(),
      };

      const response = await post('/customers', payload);

      if (response && response.status === 'success') {
      Toast.show({
        type: 'success',
        text1: 'Added',
        text2: `Customer added successfully`,
      });
        onAdd(payload);

        // Reset form
        resetForm();
        onClose();
      } else {
        // Alert.alert('Error', response?.message || 'Failed to add customer');
      Toast.show({
        type: 'error',
        text1: 'Failed',
        text2: `Failed to add customer`,
      });
      }
    } catch (error) {
            Toast.show({
        type: 'error',
        text1: 'Failed',
        text2: `Failed to add customer`,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setInquiry('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const inputFields = [
    {
      label: 'First Name',
      value: firstName,
      setter: setFirstName,
      required: true,
      placeholder: 'Enter first name',
    },
    {
      label: 'Last Name',
      value: lastName,
      setter: setLastName,
      required: true,
      placeholder: 'Enter last name',
    },
    {
      label: 'Email',
      value: email,
      setter: setEmail,
      keyboardType: 'email-address',
      required: true,
      placeholder: 'Enter email address',
    },
    {
      label: 'Phone',
      value: phone,
      setter: setPhone,
      keyboardType: 'phone-pad',
      required: true,
      placeholder: 'Enter phone number',
    },
    {
      label: 'Address',
      value: address,
      setter: setAddress,
      placeholder: 'Enter address (optional)',
    },
    {
      label: 'Inquiry',
      value: inquiry,
      setter: setInquiry,
      placeholder: 'Enter inquiry details (optional)',
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={[styles.title, { color: colors.text }]}>
              Add Customer
            </Text>

            {inputFields.map(
              ({
                label,
                value,
                setter,
                keyboardType,
                required,
                placeholder,
              }) => (
                <View key={label} style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>
                    {label}
                    {required && <Text style={styles.required}> *</Text>}
                  </Text>
                  <TextInput
                    value={value}
                    onChangeText={setter}
                    placeholder={placeholder}
                    keyboardType={keyboardType as any}
                    style={[
                      styles.input,
                      { color: colors.text, borderColor: colors.border },
                    ]}
                    placeholderTextColor={colors.border}
                    editable={!submitting}
                    autoCapitalize={
                      keyboardType === 'email-address' ? 'none' : 'words'
                    }
                    autoCorrect={false}
                  />
                </View>
              ),
            )}

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[
                  styles.closeButton,
                  submitting && styles.disabledButton,
                ]}
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
                  <Text style={styles.buttonText}>Add Customer</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default AddCustomerModal;

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
  required: {
    color: '#ff4444',
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: Platform.OS === 'ios' ? 12 : 8,
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
    backgroundColor: '#28a745',
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
