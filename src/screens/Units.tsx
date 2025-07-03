import React, { useState, useEffect } from 'react';
import { Text, View, FlatList } from 'react-native';
import UnitList from '../components/Lists/UnitList';
import UnitStatsCards from '../components/UnitStatsCards';
import { useGet } from '../hooks/useGet';

export default function Units() {
  type UnitData = {
    checkingOut: number;
    empty: number;
    occupied: number;
    overdue: number;
    total: number;
  };

  const [unitData, setUnitData] = useState<UnitData | null>(null);

  const { get } = useGet();
  const [loadings, setLoading] = useState(false);

  type StorageUnit = {
    value: number;
    title: string;
    iconColor: string;
  };

  useEffect(() => {
    fetchUnitsData();
  }, []);

  const fetchUnitsData = async () => {
    setLoading(true);
    setUnitData(null);

    try {
      const endpoint = `/dashboard/storageOverview`;
      const res = await get(endpoint);

      if (res?.status === 'success') {
        setUnitData(res.data);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setUnitData(null);
    }

    setLoading(false);
  };

  const units: StorageUnit[] = [
    {
      value: unitData?.total || 0,
      title: 'Total Units',
      iconColor: '#397AF9',
    },
    {
      value: unitData?.empty || 0,
      title: 'Available Units',
      iconColor: '#00B8D9',
    },
    {
      value: unitData?.occupied || 0,
      title: 'Occupied Units',
      iconColor: '#FFAB00',
    },
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
            renderItem={({ item }) => (
              <UnitStatsCards
                label={item.title}
                value={item.value}
                iconColor={item.iconColor}
              />
            )}
            showsHorizontalScrollIndicator={false}
          />

          {!loadings && <UnitList />}
          {loadings && <Text style={{ textAlign: 'center' }}>Loading...</Text>}
        </View>
      )}
    />
  );
}
