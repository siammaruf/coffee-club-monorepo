import { useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router";

export function usePaginationUrl(defaultPage = 1) {
  const location = useLocation();
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState<number>(() => {
    const params = new URLSearchParams(window.location.search);
    const p = params.get("page");
    return p && !isNaN(Number(p)) ? Number(p) : defaultPage;
  });

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      const params = new URLSearchParams(location.search);
      if (page === 1) {
        params.delete("page");
      } else {
        params.set("page", page.toString());
      }
      const search = params.toString();
      navigate(`${location.pathname}${search ? `?${search}` : ""}`, {
        replace: true,
      });
    },
    [location.search, location.pathname, navigate]
  );

  const resetPage = useCallback(() => {
    handlePageChange(1);
  }, [handlePageChange]);

  return { currentPage, handlePageChange, resetPage };
}
