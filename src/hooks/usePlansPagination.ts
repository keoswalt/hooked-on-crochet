
import { useState, useCallback } from 'react';

interface UsePlansPaginationProps {
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export const usePlansPagination = ({ itemsPerPage, onPageChange }: UsePlansPaginationProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    onPageChange(page);
  }, [onPageChange]);

  const resetToFirstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  return {
    currentPage,
    totalPages,
    totalItems,
    setTotalItems,
    handlePageChange,
    resetToFirstPage,
  };
};
