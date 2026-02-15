import { useState, useCallback, useMemo } from "react";

export function useTableSelection() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback((allIds: string[]) => {
    setSelectedIds((prev) => {
      if (prev.size === allIds.length && allIds.every((id) => prev.has(id))) {
        return new Set();
      }
      return new Set(allIds);
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds]
  );

  const isAllSelected = useCallback(
    (allIds: string[]) =>
      allIds.length > 0 &&
      allIds.every((id) => selectedIds.has(id)),
    [selectedIds]
  );

  const selectedCount = useMemo(() => selectedIds.size, [selectedIds]);

  return {
    selectedIds,
    selectedCount,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    isSelected,
    isAllSelected,
  };
}
