import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

  const EmptyList = (styles:any, colors:any, reportTitle:string) => {
   return <View style={styles.emptyContainer}>
      <MaterialIcons name="assessment" size={64} color={colors.subtext} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No {reportTitle} reports available
      </Text>
      <Text style={[styles.emptySubtitle, { color: colors.subtext }]}>
        {reportTitle} reports will appear here once data is available
      </Text>
    </View>
  };

  export default EmptyList