import { useState, useMemo, useEffect } from "react";

/**
 * Reusable pagination hook.
 * @param {Array} items - Full list of items to paginate.
 * @param {number} pageSize - Number of items per page.
 * @returns {{ page, setPage, totalPages, paginated, totalItems }}
 */
export function usePagination(items, pageSize = 8) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  // Reset to page 1 when items list changes (e.g. after filter)
  useEffect(() => {
    setPage(1);
  }, [items.length]);

  const safePage = Math.min(page, totalPages);

  const paginated = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, safePage, pageSize]);

  return {
    page: safePage,
    setPage,
    totalPages,
    paginated,
    totalItems: items.length,
  };
}
