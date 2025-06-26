import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '@react-navigation/native';
import { lightColors, darkColors } from '../../constants/color';

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

const AddUnitModal: React.FC<AddUnitModalProps> = ({
  visible,
  onClose,
  onAdd,
}) => {
  const { dark } = useTheme();
  const colors = dark ? darkColors : lightColors;

  const [warehouse, setWarehouse] = React.useState('');
  const [unitNumber, setUnitNumber] = React.useState('');
  const [size, setSize] = React.useState('');
  const [floor, setFloor] = React.useState('');

  const handleAdd = () => {
    onAdd({ warehouse, unitNumber, size, floor });
    onClose(); // Optionally reset fields if needed
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
          <Text style={[styles.title, { color: colors.text }]}>Add Unit</Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Warehouse</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={warehouse}
                onValueChange={(itemValue) => setWarehouse(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Select Warehouse" value="" />
                <Picker.Item label="Warehouse A" value="A" />
                <Picker.Item label="Warehouse B" value="B" />
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Unit Number</Text>
            <TextInput
              value={unitNumber}
              onChangeText={setUnitNumber}
              placeholder="e.g. 101"
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              placeholderTextColor={colors.border}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Size (sq ft)</Text>
            <TextInput
              value={size}
              onChangeText={setSize}
              placeholder="e.g. 200"
              keyboardType="numeric"
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              placeholderTextColor={colors.border}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Floor</Text>
            <TextInput
              value={floor}
              onChangeText={setFloor}
              placeholder="e.g. 1"
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              placeholderTextColor={colors.border}
            />
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
              <Text style={styles.buttonText}>Add Unit</Text>
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
