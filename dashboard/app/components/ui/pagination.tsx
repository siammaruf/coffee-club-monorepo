import { Button } from "~/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  showItemCount?: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  showItemCount = true,
}: PaginationProps) {
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage + 1;
  const indexOfLastItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handleFirstPage = () => {
    onPageChange(1);
  };

  const handleLastPage = () => {
    onPageChange(totalPages);
  };

  const getPageNumbers = () => {
    const pageNumbers = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
      return pageNumbers;
    }

    pageNumbers.push(1);

    let startPage = Math.max(2, currentPage - 2);
    let endPage = Math.min(totalPages - 1, currentPage + 2);

    // Ensure at least 5 middle pages when near edges
    if (endPage - startPage < 4) {
      if (startPage === 2) {
        endPage = Math.min(totalPages - 1, startPage + 4);
      } else {
        startPage = Math.max(2, endPage - 4);
      }
    }

    if (startPage > 2) {
      pageNumbers.push('...');
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    if (endPage < totalPages - 1) {
      pageNumbers.push('...');
    }

    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-3">
      {showItemCount && (
        <div className="text-xs text-muted-foreground">
          Showing {indexOfFirstItem} to {indexOfLastItem} of {totalItems} items
        </div>
      )}
      <div className="flex items-center space-x-0.5 ml-auto">
        {/* First page button */}
        {totalPages > 7 && (
          <Button
            variant="outline"
            size="sm"
            className="w-7 h-7 p-0 cursor-pointer text-xs"
            onClick={handleFirstPage}
            disabled={currentPage === 1}
            title="First Page"
          >
            <ChevronsLeft className="h-3.5 w-3.5" />
          </Button>
        )}

        {/* Previous page button */}
        <Button
          variant="outline"
          size="sm"
          className="w-7 h-7 p-0 cursor-pointer text-xs"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          title="Previous Page"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>

        {/* Numbered pagination */}
        <div className="flex items-center space-x-0.5">
          {getPageNumbers().map((page, index) => (
            typeof page === 'number' ? (
              <Button
                key={index}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                className="w-7 h-7 p-0 cursor-pointer text-xs"
                onClick={() => onPageChange(page)}
              >
                {page}
              </Button>
            ) : (
              <span key={index} className="px-0.5 text-xs text-muted-foreground">...</span>
            )
          ))}
        </div>

        {/* Next page button */}
        <Button
          variant="outline"
          size="sm"
          className="w-7 h-7 p-0 cursor-pointer text-xs"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          title="Next Page"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>

        {/* Last page button */}
        {totalPages > 7 && (
          <Button
            variant="outline"
            size="sm"
            className="w-7 h-7 p-0 cursor-pointer text-xs"
            onClick={handleLastPage}
            disabled={currentPage === totalPages}
            title="Last Page"
          >
            <ChevronsRight className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
