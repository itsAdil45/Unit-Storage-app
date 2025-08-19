import { useState, useEffect, useCallback } from 'react';
import { useGet } from './useGet';
import { useDelete } from './useDelete';
import { useAnimatedDelete } from '../components/Reusable/AnimatedDeleteWrapper';

interface ListDataParams<T> {
  endpoint: string;
  searchDebounced?: string;
  filter?: string;
  filterKey?: string;
  refresh?: number;
  searchParam?: string;
  initialLoad?: boolean;
  limit?: number;
  dataKey?: string; 
  resetOnFocus?: boolean; 
}

export function useListData<T extends { id: number }>({
  endpoint,
  searchDebounced = '',
  filter,
  filterKey = 'filterStatus',
  refresh = 0,
  searchParam = 'search',
  initialLoad: initialLoadProp = true,
  limit = 10,
  dataKey, 
  resetOnFocus = false,
}: ListDataParams<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoad, setInitialLoad] = useState(initialLoadProp);

  const { get } = useGet();
  const { del: deleteRequest } = useDelete();
  
  const { removingId, handleDelete: handleAnimatedDelete } = useAnimatedDelete<T>(
    deleteRequest,
    endpoint
  );

  const fetchItems = async (pg: number, isLoadMore: boolean = false, isRefresh: boolean = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
      if (pg === 1) {
        setItems([]);
      }
    }

    try {
      const queryParams = new URLSearchParams({
        page: pg.toString(),
        limit: limit.toString(),
      });

      if (searchDebounced && searchDebounced.trim()) {
        queryParams.append(searchParam, searchDebounced.trim());
      }

      if (filter && filter !== 'All') {
        queryParams.append(filterKey, filter);
      }

      const apiEndpoint = `${endpoint}?${queryParams.toString()}`;
      const res = await get(apiEndpoint);

      if (res?.status === 'success') {
        const responseDataKey = dataKey || endpoint.slice(1);
        const responseData = res.data?.[responseDataKey] || [];

        if (isLoadMore) {
          setItems((prev) => [...prev, ...responseData]);
        } else {
          setItems(responseData);
        }

        setTotalPages(parseInt(res.data?.pagination?.totalPages) || 1);
        setTotalItems(parseInt(res.data?.pagination?.total) || 0);
      }
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      if (!isLoadMore) {
        setItems([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    }

    if (isLoadMore) {
      setLoadingMore(false);
    } else if (isRefresh) {
      setRefreshing(false);
    } else {
      setLoading(false);
      if (initialLoad) {
        setInitialLoad(false);
      }
    }
  };

  const resetAndFetch = useCallback(() => {
    setPage(1);
    setItems([]);
    fetchItems(1, false);
  }, [searchDebounced, filter]);

  useEffect(() => {
    if (!initialLoad) {
      setPage(1);
      setItems([]);
      fetchItems(1, false);
    }
  }, [searchDebounced, filter, refresh]);

  useEffect(() => {
    if (page === 1) {
      fetchItems(1, false);
    }
  }, []);

  const handleLoadMore = () => {
    if (page < totalPages && !loading && !loadingMore && !refreshing) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchItems(nextPage, true);
    }
  };

  const onRefresh = useCallback(() => {
    setPage(1);
    fetchItems(1, false, true);
  }, [searchDebounced, filter]);

  const handleDelete = (id: number) => {
    handleAnimatedDelete(id, setItems);
    setTotalItems((prev) => prev - 1);
  };

  const addItem = (newItem: T) => {
    setItems((prev) => [newItem, ...prev]);
    setTotalItems((prev) => prev + 1);
  };

  const updateItem = (updatedItem: T) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === updatedItem.id ? { ...item, ...updatedItem } : item
      )
    );
  };

  return {
    items,
    setItems,
    page,
    totalPages,
    totalItems,
    loading,
    loadingMore,
    refreshing,
    initialLoad,
    removingId,
    handleLoadMore,
    onRefresh,
    handleDelete,
    addItem,
    updateItem,
    resetAndFetch, 
  };
}