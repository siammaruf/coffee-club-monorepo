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

    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);

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
    <div className="flex items-center justify-between mt-4">
      {showItemCount && (
        <div className="text-sm text-muted-foreground">
          Showing {indexOfFirstItem} to {indexOfLastItem} of {totalItems} items
        </div>
      )}
      <div className="flex items-center space-x-1 ml-auto">
        {/* First page button */}
        {totalPages > 7 && (
          <Button
            variant="outline"
            size="sm"
            className="w-8 h-8 p-0 cursor-pointer"
            onClick={handleFirstPage}
            disabled={currentPage === 1}
            title="First Page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
        )}
        
        {/* Previous page button */}
        <Button
          variant="outline"
          size="sm"
          className="w-8 h-8 p-0 cursor-pointer"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          title="Previous Page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        {/* Numbered pagination */}
        <div className="flex items-center space-x-1">
          {getPageNumbers().map((page, index) => (
            typeof page === 'number' ? (
              <Button
                key={index}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                className="w-8 h-8 p-0 cursor-pointer"
                onClick={() => onPageChange(page)}
              >
                {page}
              </Button>
            ) : (
              <span key={index} className="px-1 text-muted-foreground">...</span>
            )
          ))}
        </div>
        
        {/* Next page button */}
        <Button
          variant="outline"
          size="sm"
          className="w-8 h-8 p-0 cursor-pointer"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          title="Next Page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        {/* Last page button */}
        {totalPages > 7 && (
          <Button
            variant="outline"
            size="sm"
            className="w-8 h-8 p-0 cursor-pointer"
            onClick={handleLastPage}
            disabled={currentPage === totalPages}
            title="Last Page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}