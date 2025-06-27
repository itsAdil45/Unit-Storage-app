import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  loading: boolean;
  colors: {
    primary: string;
    border: string;
    subtext: string;
    text: string;
  };
  onPreviousPage: () => void;
  onNextPage: () => void;
  containerStyle?: object;
  buttonStyle?: object;
  textStyle?: object;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  loading,
  colors,
  onPreviousPage,
  onNextPage,
  containerStyle,
  buttonStyle,
  textStyle,
}) => {
  // Don't render if there's only one page or no pages
  if (totalPages <= 1) return null;

  const canGoPrevious = currentPage > 1 && !loading;
  const canGoNext = currentPage < totalPages && !loading;

  return (
    <View style={[styles.navigationContainer, containerStyle]}>
      <TouchableOpacity
        style={[
          styles.navButton,
          {
            backgroundColor: canGoPrevious ? colors.primary : colors.border,
            borderColor: colors.border,
          },
          buttonStyle,
        ]}
        onPress={onPreviousPage}
        disabled={!canGoPrevious}
        activeOpacity={0.7}
      >
        <MaterialIcons 
          name="chevron-left" 
          size={20} 
          color={canGoPrevious ? '#fff' : colors.subtext} 
        />
        <Text 
          style={[
            styles.navButtonText, 
            { color: canGoPrevious ? '#fff' : colors.subtext },
            textStyle,
          ]}
        >
          Previous
        </Text>
      </TouchableOpacity>

      <View style={styles.pageInfo}>
        <Text style={[styles.pageText, { color: colors.text }, textStyle]}>
          Page {currentPage} of {totalPages}
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.navButton,
          {
            backgroundColor: canGoNext ? colors.primary : colors.border,
            borderColor: colors.border,
          },
          buttonStyle,
        ]}
        onPress={onNextPage}
        disabled={!canGoNext}
        activeOpacity={0.7}
      >
        <Text 
          style={[
            styles.navButtonText, 
            { color: canGoNext ? '#fff' : colors.subtext },
            textStyle,
          ]}
        >
          Next
        </Text>
        <MaterialIcons 
          name="chevron-right" 
          size={20} 
          color={canGoNext ? '#fff' : colors.subtext} 
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'transparent',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 100,
    justifyContent: 'center',
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginHorizontal: 4,
  },
  pageInfo: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  pageText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default Pagination;