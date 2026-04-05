import React from "react";
import { Pagination } from "react-bootstrap";

/**
 * Reusable pagination bar.
 * Shows: First | Prev | [pages] | Next | Last  + item counter.
 *
 * Props:
 *  page        - current page (1-based)
 *  totalPages  - total number of pages
 *  totalItems  - total number of items (for counter)
 *  pageSize    - items per page (for counter)
 *  onPageChange(n) - called when user clicks a page
 */
const PaginationBar = ({ page, totalPages, totalItems, pageSize, onPageChange }) => {
  if (totalItems === 0) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  // Build the page number range to display (max 5 numbers around current page)
  const range = [];
  const delta = 2;
  for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) {
    range.push(i);
  }

  return (
    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-3 px-1">
      <small className="text-muted">
        Showing <strong>{start}–{end}</strong> of <strong>{totalItems}</strong> results
      </small>
      <Pagination className="mb-0" size="sm">
        <Pagination.First onClick={() => onPageChange(1)} disabled={page === 1} />
        <Pagination.Prev onClick={() => onPageChange(page - 1)} disabled={page === 1} />

        {range[0] > 1 && <Pagination.Ellipsis disabled />}

        {range.map((n) => (
          <Pagination.Item key={n} active={n === page} onClick={() => onPageChange(n)}>
            {n}
          </Pagination.Item>
        ))}

        {range[range.length - 1] < totalPages && <Pagination.Ellipsis disabled />}

        <Pagination.Next onClick={() => onPageChange(page + 1)} disabled={page === totalPages} />
        <Pagination.Last onClick={() => onPageChange(totalPages)} disabled={page === totalPages} />
      </Pagination>
    </div>
  );
};

export default PaginationBar;
