import React from 'react';
import { Text , View, FlatList} from 'react-native';
import ExpenseList from '../components/Lists/ExpenseList';
export default function Expenses() {
  return (
      <FlatList
        data={[]} 
        keyExtractor={() => 'dummy'}
        renderItem={null}
              keyboardShouldPersistTaps="handled"
              removeClippedSubviews={false}
              ListHeaderComponent={() => (
          <View>
              <ExpenseList/>
          </View>
          )}
    />
  );
}
