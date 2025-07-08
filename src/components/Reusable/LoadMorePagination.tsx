import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface LoadMorePaginationProps {
  currentPage: number;
  totalPages: number;
  loading: boolean;
  loadingMore?: boolean;
  colors: {
    primary: string;
    border: string;
    subtext: string;
    text: string;
  };
  onLoadMore: () => void;
  containerStyle?: object;
  buttonStyle?: object;
  textStyle?: object;
  showItemCount?: boolean;
  totalItems?: number;
  currentItemCount?: number;
}

const LoadMorePagination: React.FC<LoadMorePaginationProps> = ({
  currentPage,
  totalPages,
  loading,
  loadingMore = false,
  colors,
  onLoadMore,
  containerStyle,
  buttonStyle,
  textStyle,
  showItemCount = false,
  totalItems = 0,
  currentItemCount = 0,
}) => {
  // Don't render if there's only one page or no pages
  if (totalPages <= 1) return null;

  const canLoadMore = currentPage < totalPages && !loading && !loadingMore;
  const hasMoreItems = currentPage < totalPages;

  if (!hasMoreItems) return null;

  return (
    <View style={[styles.container, containerStyle]}>
      {showItemCount && (
        <View style={styles.itemCountContainer}>
          {/* <Text style={[styles.itemCountText, { color: colors.subtext }, textStyle]}>
            Showing {currentItemCount} of {totalItems} items
          </Text> */}
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.loadMoreButton,
          {
            backgroundColor: canLoadMore ? colors.primary : colors.border,
            borderColor: colors.border,
          },
          buttonStyle,
        ]}
        onPress={onLoadMore}
        disabled={!canLoadMore}
        activeOpacity={0.7}
      >
        {loadingMore ? (
          <>
            <ActivityIndicator size="small" color="#fff" style={styles.loadingIcon} />
            <Text
              style={[
                styles.loadMoreButtonText,
                { color: '#fff' },
                textStyle,
              ]}
            >
              Loading...
            </Text>
          </>
        ) : (
          <>
            <Text
              style={[
                styles.loadMoreButtonText,
                { color: canLoadMore ? '#fff' : colors.subtext },
                textStyle,
              ]}
            >
              Load More
            </Text>
            <MaterialIcons
              name="expand-more"
              size={20}
              color={canLoadMore ? '#fff' : colors.subtext}
              style={styles.icon}
            />
          </>
        )}
      </TouchableOpacity>

      <View style={styles.pageInfo}>
        <Text style={[styles.pageText, { color: colors.subtext }, textStyle]}>
          Page {currentPage} of {totalPages}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'transparent',
  },
  itemCountContainer: {
    marginBottom: 12,
    alignItems: 'center',
  },
  itemCountText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loadMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 140,
    justifyContent: 'center',
  },
  loadMoreButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loadingIcon: {
    marginRight: 8,
  },
  icon: {
    marginLeft: 8,
  },
  pageInfo: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginTop: 8,
  },
  pageText: {
    fontSize: 12,
    fontWeight: '400',
  },
});

export default LoadMorePagination;