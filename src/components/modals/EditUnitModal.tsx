import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { UnitData } from '../../types/Types';
import { lightColors, darkColors } from '../../constants/color';
import { usePatch } from '../../hooks/usePatch';

interface Props {
  visible: boolean;
  unit: UnitData;
  onClose: () => void;
  onSaveSuccess: (updatedUnit: UnitData) => void; // <-- Pass updated unit
}

const EditUnitModal: React.FC<Props> = ({ visible, unit, onClose, onSaveSuccess }) => {
  const { dark } = useTheme();
  const theme = dark ? darkColors : lightColors;

  const [unitNumber, setUnitNumber] = useState(unit.unitNumber);
  const [size, setSize] = useState(String(unit.size));
  const [floor, setFloor] = useState(unit.floor);
  const [status, setStatus] = useState<'available' | 'maintenance'>(unit.status);

  const { patch, loading } = usePatch();

  const handleSave = async () => {
    const payload = {
      id: unit.id,
      unitNumber,
      size: Number(size),
      floor,
      status,
      warehouseId: unit.warehouseId,
    };

    const res = await patch(`/storage-units/${unit.id}`, payload);

    if (res?.status === 'success') {
      onClose();           // Close modal
  onSaveSuccess(res.data); // ✅ Pass updated unit back to parent
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: theme.card }]}>
          <Text style={[styles.title, { color: theme.text }]}>Edit Unit</Text>

          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
            value={unitNumber}
            onChangeText={setUnitNumber}
            placeholder="Unit Number"
            placeholderTextColor={theme.subtext}
          />
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
            value={size}
            onChangeText={setSize}
            keyboardType="numeric"
            placeholder="Size (sqft)"
            placeholderTextColor={theme.subtext}
          />
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
            value={floor}
            onChangeText={setFloor}
            placeholder="Floor"
            placeholderTextColor={theme.subtext}
          />

          <TouchableOpacity onPress={() => setStatus(status === 'available' ? 'maintenance' : 'available')}>
            <Text style={[styles.dropdown, { color: theme.primary }]}>
              Status: {status === 'available' ? 'Available' : 'Maintenance'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: theme.primary }]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.closeText, { color: theme.primary }]}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modal: {
    margin: 20,
    padding: 20,
    borderRadius: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    padding: 8,
    marginVertical: 6,
    borderRadius: 8,
  },
  dropdown: {
    marginTop: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  saveButton: {
    marginTop: 16,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  closeText: {
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '600',
  },
});

export default EditUnitModal;
