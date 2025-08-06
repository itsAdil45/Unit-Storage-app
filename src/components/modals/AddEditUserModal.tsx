import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import Toast from 'react-native-toast-message';
import { User } from '../../types/Users';
import { usePost } from '../../hooks/usePost';
import { usePatch } from '../../hooks/usePatch';

interface AddEditUserModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  editingUser?: User | null;
  colors: any;
  dark: boolean;
}

interface UserFormData {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: string;
}

const ROLES = [
  { label: 'User', value: 'user' },
  { label: 'Admin', value: 'admin' },
  { label: 'Team Lead', value: 'team_lead' },
  { label: 'Agent', value: 'agent' },
  { label: 'Client', value: 'client' },
];

const AddEditUserModal: React.FC<AddEditUserModalProps> = ({
  visible,
  onClose,
  onSuccess,
  editingUser,
  colors,
  dark,
}) => {
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    role: 'user',
  });
  const [loading, setLoading] = useState(false);
  const [showRolePicker, setShowRolePicker] = useState(false);

  const { post } = usePost();
  const { patch } = usePatch();

  const isEditing = !!editingUser;

  // Initialize form data when modal opens or editing user changes
  useEffect(() => {
    if (visible) {
      if (editingUser) {
        setFormData({
          email: editingUser.email || '',
          firstName: editingUser.firstName || '',
          lastName: editingUser.lastName || '',
          password: '', // Don't populate password for editing
          role: editingUser.role || 'user',
        });
      } else {
        // Reset form for adding new user
        setFormData({
          email: '',
          firstName: '',
          lastName: '',
          password: '',
          role: 'user',
        });
      }
    }
  }, [visible, editingUser]);

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Email is required',
      });
      return false;
    }

    if (!formData.firstName.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'First name is required',
      });
      return false;
    }

    if (!formData.lastName.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Last name is required',
      });
      return false;
    }

    if (!isEditing && !formData.password.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Password is required',
      });
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Please enter a valid email address',
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      let response;
      const submitData: any = {
        email: formData.email.trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        role: formData.role,
      };

      if (isEditing) {
        // Don't include password in edit request if it's empty
        if (formData.password.trim()) {
          submitData.password = formData.password;
        }
        
        response = await patch(`/users/${editingUser.id}`, submitData);
      } else {
        // Include password for new user creation
        submitData.password = formData.password;
        response = await post('/users', submitData);
      }

      if (response?.status === 'success') {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: isEditing 
            ? 'User updated successfully' 
            : 'User created successfully',
        });

        onSuccess(response.data);
        handleClose();
      } else {
                {
          onClose();
        }
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response?.message || 'Something went wrong',
        });
      }
    } catch (error: any) {
      console.error('Error submitting user:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.message || 'Failed to save user',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      role: 'user',
    });
    setShowRolePicker(false);
    onClose();
  };

  const selectedRole = ROLES.find(role => role.value === formData.role);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {isEditing ? 'Edit User' : 'Add New User'}
          </Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Email Field */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              Email *
            </Text>
            <TextInput
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              placeholder="Enter email address"
              placeholderTextColor={colors.subtext}
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* First Name Field */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              First Name *
            </Text>
            <TextInput
              value={formData.firstName}
              onChangeText={(value) => handleInputChange('firstName', value)}
              placeholder="Enter first name"
              placeholderTextColor={colors.subtext}
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              autoCapitalize="words"
            />
          </View>

          {/* Last Name Field */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              Last Name *
            </Text>
            <TextInput
              value={formData.lastName}
              onChangeText={(value) => handleInputChange('lastName', value)}
              placeholder="Enter last name"
              placeholderTextColor={colors.subtext}
              style={[
                styles.textInput,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              autoCapitalize="words"
            />
          </View>

          {/* Password Field - Only show for new users */}
          {!isEditing && (
            <View style={styles.fieldContainer}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                Password *
              </Text>
              <TextInput
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                placeholder="Enter password"
                placeholderTextColor={colors.subtext}
                style={[
                  styles.textInput,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          )}


          {/* Role Field */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>
              Role *
            </Text>
            <TouchableOpacity
              onPress={() => setShowRolePicker(!showRolePicker)}
              style={[
                styles.dropdownButton,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.dropdownText, { color: colors.text }]}>
                {selectedRole?.label || 'Select Role'}
              </Text>
              <MaterialIcons 
                name={showRolePicker ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                size={24} 
                color={colors.subtext} 
              />
            </TouchableOpacity>

            {showRolePicker && (
              <View style={[styles.optionsContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {ROLES.map((role, index) => (
                  <TouchableOpacity
                    key={role.value}
                    style={[
                      styles.optionItem,
                      { borderBottomColor: colors.border },
                      index === ROLES.length - 1 && { borderBottomWidth: 0 }, // Remove border from last item
                      formData.role === role.value && { backgroundColor: colors.primary + '20' }
                    ]}
                    onPress={() => {
                      handleInputChange('role', role.value);
                      setShowRolePicker(false);
                    }}
                  >
                    <Text style={[
                      styles.optionText, 
                      { color: colors.text },
                      formData.role === role.value && { color: colors.primary, fontWeight: '600' }
                    ]}>
                      {role.label}
                    </Text>
                    {formData.role === role.value && (
                      <MaterialIcons name="check" size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <TouchableOpacity
            onPress={handleClose}
            style={[styles.cancelButton, { borderColor: colors.border }]}
            disabled={loading}
          >
            <Text style={[styles.cancelButtonText, { color: colors.text }]}>
              Cancel
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSubmit}
            style={[styles.submitButton, { backgroundColor: colors.primary }]}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isEditing ? 'Update User' : 'Create User'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = {
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500' as const,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  dropdownButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dropdownText: {
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 8,
    overflow: 'hidden' as const,
  },
  optionsContainer: {
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 250,
    backgroundColor: 'white',
    elevation: 5, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000,
  },
  optionItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    minHeight: 48,
  },
  optionText: {
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row' as const,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500' as const,
  },
  submitButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },
};

export default AddEditUserModal;