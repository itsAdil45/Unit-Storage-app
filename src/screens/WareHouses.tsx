import React from 'react';
import { Text, View, FlatList } from 'react-native';
import WarehouseList from '../components/Lists/WarehouseList';
export default function WareHouses() {
  return (
    <FlatList
      data={[]}
      keyExtractor={() => 'dummy'}
      renderItem={null}
      keyboardShouldPersistTaps="handled"
      removeClippedSubviews={false}
      ListHeaderComponent={() => (
        <View>
          {/* <QuickActions/> */}
          <WarehouseList />
        </View>
      )}
    />
  );
}
