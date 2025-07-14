import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { usePatch } from '../../hooks/usePatch';
import { lightColors, darkColors } from '../../constants/color';
import Toast from 'react-native-toast-message';

interface StorageUnit {
  id: number;
  warehouseId: number;
  unitNumber: string;
  size: number;
  floor: string;
  status: string;
  pricePerDay: number | null;
  createdAt: string;
  updatedAt: string;
  deleted: number;
  userId: number;
}

interface Warehouse {
  id: number;
  name: string;
  address: string;
  createdAt: string;
  updatedAt: string;
  videoFileLink: string;
  deleted: number;
  userId: number;
  storageUnits: StorageUnit[];
  uniqueFloors: string[];
}

interface EditWarehouseModalProps {
  visible: boolean;
  warehouse: Warehouse;
  onClose: () => void;
  onSaveSuccess: (warehouse: Warehouse) => void;
}

const EditWarehouseModal: React.FC<EditWarehouseModalProps> = ({
  visible,
  warehouse,
  onClose,
  onSaveSuccess,
}) => {
  const { dark } = useTheme();
  const colors = dark ? darkColors : lightColors;
  const { patch } = usePatch();

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    videoFileLink: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (warehouse) {
      setFormData({
        name: warehouse.name || '',
        address: warehouse.address || '',
        videoFileLink: warehouse.videoFileLink || '',
      });
    }
  }, [warehouse]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Failed',
        text2: `Warehouse name is required'`,
      });
      return false;
    }
    if (!formData.address.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Failed',
        text2: `Address is required'`,
      });
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        videoFileLink: formData.videoFileLink.trim(),
      };

      const response = await patch(`/warehouses/${warehouse.id}`, payload);

      if (response?.status === 'success') {
        Toast.show({
          type: 'success',
          text1: 'Updated',
          text2: `Warehouse updated successfully `,
        });
        onSaveSuccess({ ...warehouse, ...payload });
        onClose();
      } else {
        Alert.alert('Error', 'Failed to update warehouse');
      }
    } catch (error) {
      console.error('Error updating warehouse:', error);
      Alert.alert('Error', 'Failed to update warehouse');
    }
    setLoading(false);
  };

  if (!warehouse) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
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
            Edit Warehouse
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

        {/* Form */}
        <ScrollView
          style={styles.formContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Warehouse Name *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder="Enter warehouse name"
              placeholderTextColor={colors.subtext}
              maxLength={100}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Address *
            </Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              value={formData.address}
              onChangeText={(value) => handleInputChange('address', value)}
              placeholder="Enter warehouse address"
              placeholderTextColor={colors.subtext}
              multiline
              numberOfLines={3}
              maxLength={500}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Video URL
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              value={formData.videoFileLink}
              onChangeText={(value) =>
                handleInputChange('videoFileLink', value)
              }
              placeholder="https://www.youtube.com/embed/..."
              placeholderTextColor={colors.subtext}
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>

          {/* Warehouse Info */}
          <View
            style={[
              styles.infoSection,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.infoTitle, { color: colors.text }]}>
              Warehouse Information
            </Text>
            <Text style={[styles.infoText, { color: colors.subtext }]}>
              ID: #{warehouse.id}
            </Text>
            <Text style={[styles.infoText, { color: colors.subtext }]}>
              Storage Units: {warehouse.storageUnits?.length || 0}
            </Text>
            <Text style={[styles.infoText, { color: colors.subtext }]}>
              Created: {new Date(warehouse.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
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
  formContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
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
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  infoSection: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
    marginBottom: 40,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 4,
  },
});

export default EditWarehouseModal;
