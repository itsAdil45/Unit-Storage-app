import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Linking,
  StyleSheet,
  Dimensions
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@react-navigation/native';
import { lightColors, darkColors } from "../constants/color";
import { MaterialIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import SmartListView from './SmartListView';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type FilterType = 'All' | 'New' | 'Old';
type SortType = 'New' | 'Old';

interface Warehouse {
  id: number;
  name: string;
  address: string;
  createdAt: Date;
  videoUrl: string;
  floors: number[];
}

const WarehouseList: React.FC = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([
    {
      id: 1,
      name: 'Warehouse Alpha',
      address: '123 Main Street, Karachi',
      createdAt: new Date(),
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      floors: [1, 2, 3],
    },
    {
      id: 2,
      name: 'Warehouse Beta',
      address: '456 Industrial Road, Lahore',
      createdAt: new Date('2024-12-10'),
      videoUrl: 'https://www.youtube.com/watch?v=DLzxrzFCyOs',
      floors: [1, 2],
    },
        {
      id: 3,
      name: 'Warehouse Beta',
      address: '456 Industrial Road, Lahore',
      createdAt: new Date('2024-12-10'),
      videoUrl: 'https://www.youtube.com/watch?v=DLzxrzFCyOs',
      floors: [1, 2],
    },
  ]);
  const { dark } = useTheme();
  
  // Theme-based colors
  const colors = dark ? darkColors : lightColors;
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('All');
  const [sort, setSort] = useState<SortType>('New');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [expandedWarehouses, setExpandedWarehouses] = useState<Set<number>>(new Set());

  // Create dynamic styles based on theme
  const dynamicStyles = useMemo(() => StyleSheet.create({
    container: { 
      flex: 1, 
      backgroundColor: colors.background 
    },
    header: {
      padding: 16,
      backgroundColor: colors.card,
      borderBottomColor: colors.border,
      borderBottomWidth: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: { 
      fontSize: 24, 
      fontWeight: 'bold', 
      color: colors.text 
    },
    addBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
    },
    addBtnText: { 
      color: '#fff', 
      marginLeft: 4, 
      fontWeight: '600' 
    },
    card: {
      backgroundColor: colors.card,
      marginHorizontal: 16,
      marginVertical: 8,
      borderRadius: 12,
      padding: 16,
      borderColor: colors.border,
      borderWidth: 1,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    name: { 
      fontSize: 16, 
      fontWeight: 'bold', 
      color: colors.text 
    },
    address: { 
      fontSize: 13, 
      color: colors.subtext 
    },
    date: { 
      fontSize: 12, 
      color: colors.subtext 
    },
    videoLink: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 10,
    },
    linkText: {
      color: colors.primary,
      marginLeft: 6,
      fontWeight: '600',
    },
    actions: {
      flexDirection: 'row',
      gap: 10,
    },
    iconBtn: {
      padding: 4,
      borderRadius: 6,
    },
    expandToggle: {
      marginTop: 10,
      color: colors.primary,
      fontWeight: '500',
    },
    floorList: {
      marginTop: 8,
      backgroundColor: dark ? colors.background : '#f1f3f5',
      borderRadius: 8,
      padding: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    floorItem: {
      fontSize: 13,
      marginVertical: 2,
      color: colors.text,
    },
    noFloors: {
      fontSize: 12,
      color: colors.subtext,
      fontStyle: 'italic',
    },
    modalOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT,
      zIndex: 9999,
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContent: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 20,
      width: '90%',
      maxWidth: 400,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
    },
    closeButton: {
      padding: 4,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
      fontSize: 16,
      backgroundColor: colors.card,
      color: colors.text,
    },
    multilineInput: {
      minHeight: 80,
      textAlignVertical: 'top',
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 20,
      gap: 12,
    },
    cancelBtn: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    cancelText: {
      color: colors.subtext,
      fontWeight: '600',
    },
    saveBtn: {
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
    },
    saveText: {
      color: '#fff',
      fontWeight: '600',
    },
  }), [colors, dark]);

  const toggleExpand = (id: number) => {
    const next = new Set(expandedWarehouses);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedWarehouses(next);
  };

  const addWarehouse = () => {
    if (!newName || !newAddress || !newVideoUrl) {
      Alert.alert('Missing Information', 'Please fill in all fields');
      return;
    }

    const newWarehouse: Warehouse = {
      id: Date.now(),
      name: newName,
      address: newAddress,
      videoUrl: newVideoUrl,
      createdAt: new Date(),
      floors: [],
    };
    setWarehouses((prev) => [newWarehouse, ...prev]);
    setNewName('');
    setNewAddress('');
    setNewVideoUrl('');
    setShowAddModal(false);
  };

  const handleDelete = (id: number) => {
    Alert.alert('Delete Warehouse', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => setWarehouses((prev) => prev.filter((w) => w.id !== id)),
      },
    ]);
  };

  const handleEdit = (id: number) => {
    Alert.alert('Edit', 'Feature not implemented yet.');
  };

  const filters = [
    { label: 'All', value: 'All' },
    { label: 'New', value: 'New' },
    { label: 'Old', value: 'Old' },
  ];

  const sortOptions = [
    { label: 'Newest First', value: 'New', icon: 'keyboard-arrow-up' },
    { label: 'Oldest First', value: 'Old', icon: 'keyboard-arrow-up' },
  ];

  const filteredWarehouses = useMemo(() => {
    return warehouses
      .filter((item) => {
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
        const daysOld = (Date.now() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        const matchesFilter =
          filter === 'All' ||
          (filter === 'New' && daysOld <= 7) ||
          (filter === 'Old' && daysOld > 7);
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) =>
        sort === 'New'
          ? b.createdAt.getTime() - a.createdAt.getTime()
          : a.createdAt.getTime() - b.createdAt.getTime()
      );
  }, [warehouses, search, filter, sort]);

  const renderWarehouseCard = ({ item }: { item: Warehouse }) => {
    const isExpanded = expandedWarehouses.has(item.id);
    return (
      <View style={dynamicStyles.card}>
        <View style={dynamicStyles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={dynamicStyles.name}>{item.name}</Text>
            <Text style={dynamicStyles.address}>{item.address}</Text>
            <Text style={dynamicStyles.date}>Created: {format(item.createdAt, 'dd MMM yyyy')}</Text>
          </View>
          <View style={dynamicStyles.actions}>
            <TouchableOpacity onPress={() => handleEdit(item.id)} style={dynamicStyles.iconBtn}>
              <MaterialIcons name="edit" size={20} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item.id)} style={dynamicStyles.iconBtn}>
              <MaterialIcons name="delete" size={20} color={colors.notification} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={dynamicStyles.videoLink}
          onPress={() => Linking.openURL(item.videoUrl)}
        >
          <MaterialIcons name="play-circle-outline" size={20} color={colors.primary} />
          <Text style={dynamicStyles.linkText}>View Video</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => toggleExpand(item.id)}>
          <Text style={dynamicStyles.expandToggle}>
            {isExpanded ? 'Hide Floors ▲' : 'Show Floors ▼'}
          </Text>
        </TouchableOpacity>

        {isExpanded && (
          <View style={dynamicStyles.floorList}>
            {item.floors.length === 0 ? (
              <Text style={dynamicStyles.noFloors}>No floors listed</Text>
            ) : (
              item.floors.map((f, i) => (
                <Text key={i} style={dynamicStyles.floorItem}>
                  Floor {f}
                </Text>
              ))
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={dynamicStyles.container}>
      <StatusBar style={dark ? "light" : "dark"} />
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.title}>Warehouses</Text>
        <TouchableOpacity style={dynamicStyles.addBtn} onPress={() => setShowAddModal(true)}>
          <MaterialIcons name="add" size={20} color="#fff" />
          <Text style={dynamicStyles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      <SmartListView
        data={filteredWarehouses.map((w) => ({ item: w }))}
        renderItem={renderWarehouseCard}
        filters={filters}
        selectedFilter={filter}
        onFilterChange={(val) => setFilter(val as FilterType)}
        searchValue={search}
        onSearchChange={setSearch}
        onClearSearch={() => setSearch('')}
        sortOptions={sortOptions}
        selectedSort={sort}
        onSortChange={(val) => setSort(val as SortType)}
        placeholder="Search warehouses..."
        emptyTitle="No warehouses found"
        emptySubtitle="Try adjusting your search or filters"
        emptyIcon={<MaterialIcons name="warehouse" size={64} color={colors.subtext} />}
      />

      {/* Fixed Modal with absolute positioning */}
      {showAddModal && (
        <View style={dynamicStyles.modalOverlay}>
          <TouchableOpacity 
            style={dynamicStyles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowAddModal(false)}
          >
            <View style={dynamicStyles.modalContent}>
              <View style={dynamicStyles.modalHeader}>
                <Text style={dynamicStyles.modalTitle}>Add Warehouse</Text>
                <TouchableOpacity 
                  onPress={() => setShowAddModal(false)}
                  style={dynamicStyles.closeButton}
                >
                  <MaterialIcons name="close" size={24} color={colors.subtext} />
                </TouchableOpacity>
              </View>
              
              <TextInput
                placeholder="Warehouse Name"
                style={dynamicStyles.input}
                value={newName}
                onChangeText={setNewName}
                placeholderTextColor={colors.subtext}
              />
              <TextInput
                placeholder="Address"
                style={[dynamicStyles.input, dynamicStyles.multilineInput]}
                value={newAddress}
                onChangeText={setNewAddress}
                multiline
                numberOfLines={3}
                placeholderTextColor={colors.subtext}
              />
              <TextInput
                placeholder="YouTube Video URL"
                style={dynamicStyles.input}
                value={newVideoUrl}
                onChangeText={setNewVideoUrl}
                placeholderTextColor={colors.subtext}
                keyboardType="url"
                autoCapitalize="none"
              />
              
              <View style={dynamicStyles.modalButtons}>
                <TouchableOpacity 
                  onPress={() => setShowAddModal(false)} 
                  style={dynamicStyles.cancelBtn}
                >
                  <Text style={dynamicStyles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={addWarehouse} style={dynamicStyles.saveBtn}>
                  <Text style={dynamicStyles.saveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default WarehouseList;