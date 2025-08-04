import React from 'react';
import { View, Text, TouchableOpacity, Alert, Linking } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import {User} from '../../types/Users';
import styles from './Styles/BookingItem';
import {
  formatDate,
} from '../../Utils/Formatters';
interface UserItemProps {
  item: User;
  index: number;
  colors: any;
  dark: boolean;
  onEdit: (booking: User) => void;
  onDeletePress: () => void;
}

const UserItem: React.FC<UserItemProps> = ({
  item,
  index,
  colors,
  dark,
  onEdit,
  onDeletePress,
}) => {
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: dark ? colors.card : 'white',
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.bookingId, { color: colors.text }]}>
            User #{item.id}
          </Text>
        </View>
<View
  style={[
    styles.statusBadge,
    { 
      backgroundColor: item.deleted === 1 
        ? (dark ? '#FF5722' : '#ffcdd2') 
        : (dark ? '#4CAF50' : '#c8e6c9'),
    },
  ]}
>
  <Text 
    style={[
      styles.statusText,
      { 
        color: item.deleted === 1
          ? (dark ? '#ffffff' : '#d32f2f') 
          : (dark ? '#ffffff' : '#2e7d32'), 
      }
    ]}
  >
    {item.deleted === 1 ? 'Inactive' : 'Active'}
  </Text>
</View>
      </View>

      <View style={styles.customerInfo}>
        <View style={styles.customerRow}>
          <MaterialIcons name="person" size={16} color={colors.subtext} />
          <Text style={[styles.customerName, { color: colors.text }]}>
            {item.firstName} {item.lastName}
          </Text>
        </View>
        <View style={styles.customerRow}>
          <MaterialIcons name="email" size={16} color={colors.subtext} />
          <Text style={[styles.customerEmail, { color: colors.subtext }]}>
            {item.email}
          </Text>
        </View>
        <View style={styles.customerRow}>
          <MaterialIcons name="phone" size={16} color={colors.subtext} />
          <Text style={[styles.customerPhone, { color: colors.subtext }]}>
            {item.role}
          </Text>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: colors.subtext }]}>
              Created At:
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {formatDate(item.createdAt)}
            </Text>
          </View>

        </View>

      </View>



      <View
        style={[styles.actionsContainer, { borderTopColor: colors.border }]}
      >
        <TouchableOpacity
          onPress={() => onEdit(item)}
          style={[
            styles.actionButton,
            { backgroundColor: colors.secondary + '15' },
          ]}
        >
          <MaterialIcons name="edit" size={16} color={colors.subtext} />
          <Text style={[styles.actionText, { color: colors.subtext }]}>
            Edit
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onDeletePress}
          style={[styles.actionButton, { backgroundColor: '#FF5722' + '15' }]}
        >
          <MaterialIcons name="delete" size={16} color="#FF5722" />
          <Text style={[styles.actionText, { color: '#FF5722' }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default UserItem;
