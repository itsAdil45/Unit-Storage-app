import React from 'react';
import { Text, View, FlatList } from 'react-native';
import CustomerReport from '../components/Reports/CustomerReport';
export default function About() {
  return (
    <FlatList
      data={[]}
      keyExtractor={() => 'dummy'}
      renderItem={null}
      keyboardShouldPersistTaps="handled"
      removeClippedSubviews={false}
      ListHeaderComponent={() => (
        <View>
          <CustomerReport/>
        </View>
      )}
    />
  );
}
