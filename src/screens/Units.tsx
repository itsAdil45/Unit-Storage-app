import React from 'react';
import { Text , View, FlatList} from 'react-native';
import UnitList from '../components/UnitList';
import UnitCard from '../components/UnitCard';
export default function Units() {
  type StorageUnit = {
  value: number;
  title: string;
  iconColor: string;
};

const units: StorageUnit[] = [
  {  value: 43,  title: 'Total Units', iconColor: '#397AF9' },
  {  value: 80, title: 'Available Units', iconColor: '#00B8D9' },
  {  value: 100, title: 'Occupied Units', iconColor: '#FFAB00' }
];
  return (
      <FlatList
        data={[]} 
        keyExtractor={() => 'dummy'}
        renderItem={null}
        ListHeaderComponent={() => (
          <View>
                  <FlatList
                    data={units}
                    horizontal
                    keyExtractor={(item) => item.title}
                    renderItem={({ item }) =>  <UnitCard label={item.title} value={item.value} iconColor={item.iconColor} />}
                    showsHorizontalScrollIndicator={false}
                  />
              <UnitList/>
          </View>
          )}
    />
  );
}
