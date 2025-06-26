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
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { lightColors, darkColors } from '../../constants/color';

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

const AddCustomerModal: React.FC<AddCustomerModalProps> = ({ visible, onClose, onAdd }) => {
  const { dark } = useTheme();
  const colors = dark ? darkColors : lightColors;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [inquiry, setInquiry] = useState('');

  const handleAdd = () => {
    onAdd({ firstName, lastName, email, phone, address, inquiry });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={[styles.title, { color: colors.text }]}>Add Customer</Text>

            {[
              { label: 'First Name', value: firstName, setter: setFirstName },
              { label: 'Last Name', value: lastName, setter: setLastName },
              { label: 'Email', value: email, setter: setEmail, keyboardType: 'email-address' },
              { label: 'Phone', value: phone, setter: setPhone, keyboardType: 'phone-pad' },
              { label: 'Address', value: address, setter: setAddress },
              { label: 'Inquiry', value: inquiry, setter: setInquiry },
            ].map(({ label, value, setter, keyboardType }) => (
              <View key={label} style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
                <TextInput
                  value={value}
                  onChangeText={setter}
                  placeholder={`Enter ${label.toLowerCase()}`}
                  keyboardType={keyboardType as any}
                  style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                  placeholderTextColor={colors.border}
                />
              </View>
            ))}

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
                <Text style={styles.buttonText}>Add Customer</Text>
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
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
