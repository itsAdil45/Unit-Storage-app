import React from 'react';
import { Text, View, FlatList } from 'react-native';
import BookingsList from '../components/Lists/BookingsList';
export default function Bookings() {
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
          <BookingsList />
        </View>
      )}
    />
  );
}
