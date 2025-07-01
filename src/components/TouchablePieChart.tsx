import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';
import * as d3Shape from 'd3-shape';

type PieDatum = {
  label: string;
  value: number;
  color: string;
};

const pieData: PieDatum[] = [
  { label: 'Vacant', value: 25.6, color: '#f44336' },
  { label: 'Occupied', value: 17.2, color: '#4caf50' },
  { label: 'Reserved', value: 8.2, color: '#ffb300' },
  { label: 'Blocked', value: 9.0, color: '#3f51b5' },
];

const radius = 100;

const TouchablePieChart: React.FC = () => {
  const [selected, setSelected] = useState<null | PieDatum>(null);

  const pieSlices = d3Shape.pie<PieDatum>().value((d) => d.value)(pieData);

  const arcGen = d3Shape
    .arc<d3Shape.PieArcDatum<PieDatum>>()
    .outerRadius(radius)
    .innerRadius(0);

  return (
    <View style={{ alignItems: 'center', marginTop: 40 }}>
      <Svg width={radius * 2} height={radius * 2}>
        <G x={radius} y={radius}>
          {pieSlices.map((slice, index) => {
            const path = arcGen(slice);
            return (
              <Path
                key={index}
                d={path!}
                fill={slice.data.color}
                onPressIn={() => setSelected(slice.data)}
              />
            );
          })}
        </G>
      </Svg>

      <Modal visible={!!selected} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{selected?.label}</Text>
            <Text style={styles.modalText}>Value: {selected?.value}%</Text>
            <Text style={styles.closeText} onPress={() => setSelected(null)}>
              Close
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#00000099',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    width: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 16,
  },
  closeText: {
    color: '#2196F3',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default TouchablePieChart;
