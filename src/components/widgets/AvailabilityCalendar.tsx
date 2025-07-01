import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { useTheme } from '@react-navigation/native';
import { lightColors, darkColors } from '../../constants/color';
import UnitListModal from '../modals/UnitListModal';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const AvailabilityCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);

  const { dark } = useTheme();
  const themeColors = dark ? darkColors : lightColors;
  const dayColor = dark ? darkColors.icon : themeColors.primary;

  const daysInMonth = currentDate.daysInMonth();
  const startDay = currentDate.startOf('month').day();
  const monthDays = Array.from({ length: startDay + daysInMonth }, (_, i) =>
    i < startDay ? null : i - startDay + 1,
  );

  const prevMonth = () => setCurrentDate(currentDate.subtract(1, 'month'));
  const nextMonth = () => setCurrentDate(currentDate.add(1, 'month'));

  const handleDatePress = (day: number) => {
    const fullDate = currentDate.date(day).format('YYYY-MM-DD');
    setSelectedDate(fullDate);
    setModalVisible(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.card }]}>
      <Text style={[styles.title, { color: themeColors.text }]}>
        Availability Calendar
      </Text>

      <View style={styles.header}>
        <TouchableOpacity onPress={prevMonth}>
          <AntDesign name="left" size={18} color={themeColors.icon} />
        </TouchableOpacity>

        <Text style={[styles.monthText, { color: themeColors.text }]}>
          {currentDate.format('MMMM YYYY')}
        </Text>

        <TouchableOpacity onPress={nextMonth}>
          <AntDesign name="right" size={18} color={themeColors.icon} />
        </TouchableOpacity>
      </View>

      {/* Days of week */}
      <View style={styles.weekRow}>
        {daysOfWeek.map((d, idx) => (
          <Text key={idx} style={[styles.weekDay, { color: themeColors.text }]}>
            {d}
          </Text>
        ))}
      </View>

      {/* Calendar grid */}
      <FlatList
        data={monthDays}
        keyExtractor={(_, index) => index.toString()}
        numColumns={7}
        renderItem={({ item }) => (
          <View style={styles.dayCell}>
            {item ? (
              <TouchableOpacity
                style={[styles.dayBox, { backgroundColor: dayColor }]}
                onPress={() => handleDatePress(item)}
              >
                <Text style={styles.dayText}>{item}</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.emptyBox} />
            )}
          </View>
        )}
      />

      <Text style={[styles.note, { color: dark ? '#aaa' : '#555' }]}>
        Tap on a date to view unit availability
      </Text>
      {selectedDate && (
        <UnitListModal
          visible={isModalVisible}
          selectedDate={selectedDate}
          onClose={() => setModalVisible(false)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    elevation: 2,
  },
  title: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  monthText: {
    fontSize: 16,
    fontWeight: '500',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekDay: {
    width: '14.2%',
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: 8,
  },
  dayCell: {
    width: '14.2%',
    alignItems: 'center',
    marginVertical: 4,
  },
  dayBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyBox: {
    width: 36,
    height: 36,
  },
  dayText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  note: {
    marginTop: 12,
    fontSize: 12,
    textAlign: 'center',
  },
});

export default AvailabilityCalendar;
