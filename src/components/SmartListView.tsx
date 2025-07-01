import React from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeOutUp,
  SlideInRight,
  SlideOutLeft,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons'; // Changed this line

interface FilterChip {
  label: string;
  value: string;
  color?: string;
}

interface SortOption {
  label: string;
  value: string;
  icon: string;
}

interface SmartListViewProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  filters: FilterChip[];
  selectedFilter: string;
  onFilterChange: (val: string) => void;
  sortOptions: SortOption[];
  selectedSort: string;
  onSortChange: (val: string) => void;
  searchValue: string;
  onSearchChange: (text: string) => void;
  onClearSearch: () => void;
  placeholder?: string;
  emptyIcon?: React.ReactNode;
  emptyTitle?: string;
  emptySubtitle?: string;
  scrollEnabled?: boolean; // Added this prop
}

function SmartListView<T>({
  data,
  renderItem,
  filters,
  selectedFilter,
  onFilterChange,
  sortOptions,
  selectedSort,
  onSortChange,
  searchValue,
  onSearchChange,
  onClearSearch,
  placeholder = 'Search...',
  emptyIcon,
  emptyTitle = 'No items found',
  emptySubtitle = 'Try adjusting your search or filters',
}: SmartListViewProps<T>) {
  const searchScale = useSharedValue(1);
  const filterOpacity = useSharedValue(1);

  const onSearchFocus = () => {
    searchScale.value = withSpring(1.02);
    filterOpacity.value = withTiming(0.7);
  };

  const onSearchBlur = () => {
    searchScale.value = withSpring(1);
    filterOpacity.value = withTiming(1);
  };

  const searchAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: searchScale.value }],
  }));

  const filterAnimatedStyle = useAnimatedStyle(() => ({
    opacity: filterOpacity.value,
  }));

  const renderFilterChip = (chip: FilterChip) => (
    <TouchableOpacity
      key={chip.value}
      onPress={() => onFilterChange(chip.value)}
      style={[
        {
          flexDirection: 'row',
          paddingVertical: 6,
          paddingHorizontal: 12,
          borderRadius: 20,
          backgroundColor: selectedFilter === chip.value ? '#E3F2FD' : '#eee',
          alignItems: 'center',
          marginRight: 8,
        },
      ]}
    >
      <Text style={{ color: '#333', fontWeight: '600' }}>{chip.label}</Text>
      {chip.color && selectedFilter === chip.value && (
        <View
          style={{
            marginLeft: 6,
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: chip.color,
          }}
        />
      )}
    </TouchableOpacity>
  );

  const renderSortChip = (opt: SortOption) => (
    <TouchableOpacity
      key={opt.value}
      onPress={() => onSortChange(opt.value)}
      style={{
        flexDirection: 'row',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: selectedSort === opt.value ? '#E3F2FD' : '#eee',
        alignItems: 'center',
        marginRight: 8,
      }}
    >
      <MaterialIcons name={opt.icon as any} size={16} color="#2196F3" />
      <Text style={{ marginLeft: 4, color: '#333', fontWeight: '600' }}>
        {opt.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {/* Search Bar */}
      <Animated.View
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#f0f0f0',
            borderRadius: 8,
            paddingHorizontal: 12,
            marginBottom: 12,
          },
          searchAnimatedStyle,
        ]}
      >
        <MaterialIcons name="search" size={20} color="#666" />
        <TextInput
          value={searchValue}
          onChangeText={onSearchChange}
          onFocus={onSearchFocus}
          onBlur={onSearchBlur}
          placeholder={placeholder}
          style={{ flex: 1, marginLeft: 8 }}
        />
        {searchValue.length > 0 && (
          <TouchableOpacity onPress={onClearSearch}>
            <MaterialIcons name="clear" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* Filter Chips */}
      <Animated.View style={[{ marginBottom: 8 }, filterAnimatedStyle]}>
        <Text style={{ marginBottom: 4, fontWeight: 'bold' }}>Filter:</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {filters.map(renderFilterChip)}
        </View>
      </Animated.View>

      {/* Sort Chips */}
      <Animated.View style={[{ marginBottom: 8 }, filterAnimatedStyle]}>
        <Text style={{ marginBottom: 4, fontWeight: 'bold' }}>Sort By:</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {sortOptions.map(renderSortChip)}
        </View>
      </Animated.View>

      {/* List */}
      <FlatList
        data={data}
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInDown.delay(index * 100).springify()}
            exiting={FadeOutUp.springify()}
          >
            {renderItem(item, index)}
          </Animated.View>
        )}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <Animated.View
            entering={FadeInDown.springify()}
            style={{ alignItems: 'center', marginTop: 60 }}
          >
            {emptyIcon || (
              <MaterialIcons name="people-outline" size={64} color="#ccc" />
            )}
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#666' }}>
              {emptyTitle}
            </Text>
            <Text style={{ fontSize: 14, color: '#999' }}>{emptySubtitle}</Text>
          </Animated.View>
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

export default SmartListView;
