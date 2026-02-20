import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Trash2, RotateCcw, X, AlertTriangle } from "lucide-react";
import { ConfirmDialog } from "~/components/common/ConfirmDialog";

interface BulkActionBarProps {
  selectedCount: number;
  onDelete: () => void;
  onClearSelection: () => void;
  isTrashView?: boolean;
  onRestore?: () => void;
  onPermanentDelete?: () => void;
  loading?: boolean;
}

export function BulkActionBar({
  selectedCount,
  onDelete,
  onClearSelection,
  isTrashView = false,
  onRestore,
  onPermanentDelete,
  loading = false,
}: BulkActionBarProps) {
  const [confirmAction, setConfirmAction] = useState<'delete' | 'permanentDelete' | null>(null);

  if (selectedCount === 0) return null;

  const handleConfirm = () => {
    if (confirmAction === 'delete') {
      onDelete();
    } else if (confirmAction === 'permanentDelete') {
      onPermanentDelete?.();
    }
    setConfirmAction(null);
  };

  return (
    <>
      <div className="flex items-center gap-3 px-4 py-2 mb-3 bg-muted/60 border rounded-md">
        <span className="text-sm font-medium">
          {selectedCount} selected
        </span>
        <div className="flex items-center gap-2 ml-auto">
          {isTrashView ? (
            <>
              {onRestore && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRestore}
                  disabled={loading}
                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Restore
                </Button>
              )}
              {onPermanentDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmAction('permanentDelete')}
                  disabled={loading}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Delete Permanently
                </Button>
              )}
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmAction('delete')}
              disabled={loading}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete Selected
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmAction === 'delete'}
        title={`Delete ${selectedCount} item${selectedCount > 1 ? 's' : ''}?`}
        description={`Are you sure you want to delete ${selectedCount} selected item${selectedCount > 1 ? 's' : ''}? They will be moved to trash.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
        loading={loading}
      />

      <ConfirmDialog
        open={confirmAction === 'permanentDelete'}
        title={`Permanently delete ${selectedCount} item${selectedCount > 1 ? 's' : ''}?`}
        description={`Are you sure you want to permanently delete ${selectedCount} selected item${selectedCount > 1 ? 's' : ''}? This action cannot be undone.`}
        confirmText="Delete Forever"
        cancelText="Cancel"
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
        loading={loading}
      />
    </>
  );
}
