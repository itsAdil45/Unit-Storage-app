import React from 'react';
import { View, FlatList} from 'react-native';
import UserList from '../components/UserList';
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
              <UserList/>
          </View>
          )}
    />
  );
}
