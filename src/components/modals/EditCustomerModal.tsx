import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  TextInput,
  Modal,
  Animated,
  Dimensions,
  ScrollView,
  Alert,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { usePatch } from '../../hooks/usePatch';
import { lightColors, darkColors } from '../../constants/color';
const { height: screenHeight } = Dimensions.get('window');

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  inquiry: string;
  address: string;
  createdAt: string;
  deleted: 0 | 1;
}

interface EditCustomerModalProps {
  visible: boolean;
  customer: Customer | null;
  onClose: () => void;
  onSaveSuccess: (updated: Customer) => void;
}

const EditCustomerModal: React.FC<EditCustomerModalProps> = ({
  visible,
  customer,
  onClose,
  onSaveSuccess,
}) => {
  const { dark } = useTheme();
  const colors = dark ? darkColors : lightColors;
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const { patch, loading } = usePatch();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    inquiry: '',
    deleted: 0 as 0 | 1,
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
        inquiry: customer.inquiry,
        deleted: customer.deleted,
      });
    }
  }, [customer]);

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: screenHeight,
      duration: 250,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  const handleSave = async () => {
    if (!customer) return;

    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.email.trim()
    ) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const response = await patch(`/customers/${customer.id}`, formData);

    if (response?.status === 'success') {
      const updatedCustomer = { ...customer, ...formData };
      onSaveSuccess(updatedCustomer);
      // Don't call handleClose() here, just call onClose() directly
      onClose();
    } else {
      Alert.alert('Error', 'Failed to update customer');
    }
  };

  const updateField = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!customer) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
    >
      <StatusBar
        backgroundColor="rgba(0,0,0,0.6)"
        barStyle={dark ? 'light-content' : 'dark-content'}
      />
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modal,
            {
              backgroundColor: colors.card,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Edit Customer
            </Text>
            <TouchableOpacity
              style={[
                styles.closeButton,
                { backgroundColor: colors.background },
              ]}
              onPress={handleClose}
            >
              <Text style={[styles.closeButtonText, { color: colors.text }]}>
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                First Name *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                value={formData.firstName}
                onChangeText={(text) => updateField('firstName', text)}
                placeholder="Enter first name"
                placeholderTextColor={colors.subtext}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                Last Name *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                value={formData.lastName}
                onChangeText={(text) => updateField('lastName', text)}
                placeholder="Enter last name"
                placeholderTextColor={colors.subtext}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                Email *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                value={formData.email}
                onChangeText={(text) => updateField('email', text)}
                placeholder="Enter email address"
                placeholderTextColor={colors.subtext}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Phone</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                value={formData.phone}
                onChangeText={(text) => updateField('phone', text)}
                placeholder="Enter phone number"
                placeholderTextColor={colors.subtext}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                Address
              </Text>
              <TextInput
                style={[
                  styles.textArea,
                  {
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                value={formData.address}
                onChangeText={(text) => updateField('address', text)}
                placeholder="Enter address"
                placeholderTextColor={colors.subtext}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>
                Inquiry
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                value={formData.inquiry}
                onChangeText={(text) => updateField('inquiry', text)}
                placeholder="Enter inquiry details"
                placeholderTextColor={colors.subtext}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Status</Text>
              <View
                style={[
                  styles.pickerContainer,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Picker
                  selectedValue={formData.deleted}
                  onValueChange={(value) => updateField('deleted', value)}
                  style={[styles.picker, { color: colors.text }]}
                  dropdownIconColor={colors.text}
                >
                  <Picker.Item label="Active" value={0} />
                  <Picker.Item label="Inactive" value={1} />
                </Picker>
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[
                styles.actionBtn,
                styles.cancelBtn,
                { borderColor: colors.border },
              ]}
              onPress={handleClose}
              disabled={loading}
            >
              <Text style={[styles.actionBtnText, { color: colors.subtext }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionBtn,
                styles.saveBtn,
                { backgroundColor: colors.primary },
              ]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={[styles.actionBtnText, { color: '#fff' }]}>
                  Save Changes
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modal: {
    maxHeight: '90%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContent: {
    paddingHorizontal: 20,
    maxHeight: '70%',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
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
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
  },
  picker: {
    height: 50,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  cancelBtn: {
    borderWidth: 1,
  },
  saveBtn: {
    // backgroundColor applied dynamically
  },
  actionBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditCustomerModal;
