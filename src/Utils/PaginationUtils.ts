// utils/paginationUtils.ts

import { useMemo } from 'react';

export const createHandleLoadMore = <T>({
  loading,
  loadingMore,
  page,
  itemsPerPage,
  setDisplayData,
  setPage,
  setLoadingMore,
  reportData,
}: {
  loading: boolean;
  loadingMore: boolean;
  page: number;
  itemsPerPage: number;
  setDisplayData: (data: T[] | ((prev: T[]) => T[])) => void;
  setPage: (page: number) => void;
  setLoadingMore: (loading: boolean) => void;
  reportData: T[];
}) => {
  return () => {
    if (loading || loadingMore) return;

    setLoadingMore(true);
    const nextPage = page + 1;
    const startIndex = (nextPage - 1) * itemsPerPage;
    const newData = reportData.slice(startIndex, startIndex + itemsPerPage);

    if (newData.length > 0) {
      setDisplayData((prev) => [...prev, ...newData]);
      setPage(nextPage);
    }

    setLoadingMore(false);
  };
};

export const useTotalPages = (reportData: any[], itemsPerPage: number) => {
  return useMemo(() => {
    return Math.ceil(reportData.length / itemsPerPage);
  }, [reportData, itemsPerPage]);
};
