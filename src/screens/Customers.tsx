import React from 'react';
import { View, FlatList } from 'react-native';
import CustomersList from '../components/Lists/CustomersList';
export default function Customers() {
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
          <CustomersList />
        </View>
      )}
    />
  );
}
