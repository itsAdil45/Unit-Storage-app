import React, { useEffect } from 'react';
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
import { useTheme } from '@react-navigation/native';
import { lightColors, darkColors } from '../../constants/color';
import { useGet } from '../../hooks/useGet'; // Adjust path as needed
import { usePost } from '../../hooks/usePost'; // Adjust path as needed
import Toast from 'react-native-toast-message';

interface AddUnitModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (unit: {
    warehouse: string;
    unitNumber: string;
    size: string;
    floor: string;
  }) => void;
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
}

const AddUnitModal: React.FC<AddUnitModalProps> = ({
  visible,
  onClose,
  onAdd,
}) => {
  const { dark } = useTheme();
  const colors = dark ? darkColors : lightColors;
  const { get, loading: getLoading } = useGet();
  const { post } = usePost();

  const [warehouse, setWarehouse] = React.useState('');
  const [unitNumber, setUnitNumber] = React.useState('');
  const [size, setSize] = React.useState('');
  const [floor, setFloor] = React.useState('');
  const [warehouses, setWarehouses] = React.useState<Warehouse[]>([]);
  const [submitting, setSubmitting] = React.useState(false);

  // Fetch warehouses when modal opens
  useEffect(() => {
    if (visible) {
      fetchWarehouses();
    }
  }, [visible]);

  const fetchWarehouses = async () => {
    try {
      const response = await get('/warehouses');
      if (
        response &&
        response.status === 'success' &&
        response.data?.warehouses
      ) {
        setWarehouses(response.data.warehouses);
      } else {
        Alert.alert('Error', 'Failed to fetch warehouses');
      }
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      Alert.alert('Error', 'Failed to fetch warehouses');
    }
  };

  const handleAdd = async () => {
    if (!warehouse || !unitNumber || !size || !floor) {
      Toast.show({
        type: 'error',
        text1: 'Failed',
        text2: `Error', Please fill all fields`,
      });
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        warehouseId: parseInt(warehouse),
        unitNumber: unitNumber.trim(),
        size: parseInt(size),
        floor: floor.trim(),
        status: 'available',
      };

      const response = await post('/storage-units', payload);

      if (response && response.status === 'success') {
        Toast.show({
          type: 'success',
          text1: 'Added',
          text2: `Unit added successfully `,
        });
        onAdd({
          warehouse:
            warehouses.find((w) => w.id.toString() === warehouse)?.name ||
            warehouse,
          unitNumber,
          size,
          floor,
        });

        // Reset form
        setWarehouse('');
        setUnitNumber('');
        setSize('');
        setFloor('');

        onClose();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed',
          text2: `${response?.message}`,
        });
      }
    } catch (error) {
      console.error('Error adding unit:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setWarehouse('');
    setUnitNumber('');
    setSize('');
    setFloor('');
    onClose();
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
          <Text style={[styles.title, { color: colors.text }]}>Add Unit</Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Warehouse
            </Text>
            <View
              style={[styles.pickerWrapper, { borderColor: colors.border }]}
            >
              {getLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={colors.text} />
                  <Text style={[styles.loadingText, { color: colors.text }]}>
                    Loading warehouses...
                  </Text>
                </View>
              ) : (
                <Picker
                  selectedValue={warehouse}
                  onValueChange={(itemValue) => setWarehouse(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Warehouse" value="" />
                  {warehouses.map((wh) => (
                    <Picker.Item
                      key={wh.id}
                      label={wh.name}
                      value={wh.id.toString()}
                    />
                  ))}
                </Picker>
              )}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>
              Unit Number
            </Text>
            <TextInput
              value={unitNumber}
              onChangeText={setUnitNumber}
              placeholder="e.g. 101"
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
              Size (sq ft)
            </Text>
            <TextInput
              value={size}
              onChangeText={setSize}
              placeholder="e.g. 200"
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
            <Text style={[styles.label, { color: colors.text }]}>Floor</Text>
            <TextInput
              value={floor}
              onChangeText={setFloor}
              placeholder="e.g. Ground"
              style={[
                styles.input,
                { color: colors.text, borderColor: colors.border },
              ]}
              placeholderTextColor={colors.border}
              editable={!submitting}
            />
          </View>

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
                <Text style={styles.buttonText}>Add Unit</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default AddUnitModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
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
  pickerWrapper: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  loadingText: {
    marginLeft: 8,
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
