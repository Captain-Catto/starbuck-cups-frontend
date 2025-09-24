"use client";

import { useState, useCallback, useMemo } from "react";

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface UsePaginationOptions {
  initialPage?: number;
  initialItemsPerPage?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
}

export interface UsePaginationReturn {
  pagination: PaginationState;
  goToPage: (page: number) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  setItemsPerPage: (itemsPerPage: number) => void;
  setTotalItems: (totalItems: number) => void;
  getPageNumbers: (maxVisible?: number) => number[];
  getStartIndex: () => number;
  getEndIndex: () => number;
}

export function usePagination(options: UsePaginationOptions = {}): UsePaginationReturn {
  const {
    initialPage = 1,
    initialItemsPerPage = 10,
    totalItems = 0,
    onPageChange,
    onItemsPerPageChange,
  } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPageState] = useState(initialItemsPerPage);
  const [totalItemsState, setTotalItemsState] = useState(totalItems);

  const pagination = useMemo((): PaginationState => {
    const totalPages = Math.max(1, Math.ceil(totalItemsState / itemsPerPage));
    const safePage = Math.min(currentPage, totalPages);

    return {
      currentPage: safePage,
      totalPages,
      totalItems: totalItemsState,
      itemsPerPage,
      hasNextPage: safePage < totalPages,
      hasPreviousPage: safePage > 1,
    };
  }, [currentPage, itemsPerPage, totalItemsState]);

  const goToPage = useCallback((page: number) => {
    if (page < 1 || page > pagination.totalPages) return;

    setCurrentPage(page);
    onPageChange?.(page);
  }, [pagination.totalPages, onPageChange]);

  const goToNextPage = useCallback(() => {
    if (pagination.hasNextPage) {
      goToPage(pagination.currentPage + 1);
    }
  }, [pagination.hasNextPage, pagination.currentPage, goToPage]);

  const goToPreviousPage = useCallback(() => {
    if (pagination.hasPreviousPage) {
      goToPage(pagination.currentPage - 1);
    }
  }, [pagination.hasPreviousPage, pagination.currentPage, goToPage]);

  const goToFirstPage = useCallback(() => {
    goToPage(1);
  }, [goToPage]);

  const goToLastPage = useCallback(() => {
    goToPage(pagination.totalPages);
  }, [pagination.totalPages, goToPage]);

  const setItemsPerPage = useCallback((newItemsPerPage: number) => {
    if (newItemsPerPage <= 0) return;

    setItemsPerPageState(newItemsPerPage);
    setCurrentPage(1);
    onItemsPerPageChange?.(newItemsPerPage);
    onPageChange?.(1);
  }, [onItemsPerPageChange, onPageChange]);

  const setTotalItems = useCallback((newTotalItems: number) => {
    setTotalItemsState(Math.max(0, newTotalItems));
  }, []);

  const getPageNumbers = useCallback((maxVisible: number = 5): number[] => {
    const { currentPage, totalPages } = pagination;
    const pages: number[] = [];

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    const halfVisible = Math.floor(maxVisible / 2);
    let startPage = Math.max(1, currentPage - halfVisible);
    const endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }, [pagination]);

  const getStartIndex = useCallback((): number => {
    return (pagination.currentPage - 1) * pagination.itemsPerPage + 1;
  }, [pagination.currentPage, pagination.itemsPerPage]);

  const getEndIndex = useCallback((): number => {
    const endIndex = pagination.currentPage * pagination.itemsPerPage;
    return Math.min(endIndex, pagination.totalItems);
  }, [pagination.currentPage, pagination.itemsPerPage, pagination.totalItems]);

  return {
    pagination,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,
    setItemsPerPage,
    setTotalItems,
    getPageNumbers,
    getStartIndex,
    getEndIndex,
  };
}