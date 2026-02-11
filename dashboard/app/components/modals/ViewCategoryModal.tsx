import { X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import type { Category } from "~/types/category";

interface ViewCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
}

export default function ViewCategoryModal({ isOpen, onClose, category }: ViewCategoryModalProps) {
  if (!isOpen || !category) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-bold text-gray-900">Category Details</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="p-6">
          <Card className="p-4 flex flex-col items-center gap-4">
            {category.image ? (
              <img
                src={category.image}
                alt={category.name}
                className="w-24 h-24 rounded object-cover border"
              />
            ) : (
              <svg
                width={96}
                height={96}
                viewBox="0 0 40 40"
                className="w-24 h-24 rounded border bg-gray-100 text-gray-400"
                aria-label="No image"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="40" height="40" rx="8" fill="#f3f4f6" />
                <path
                  d="M12 28l5.5-7 4.5 6 3.5-5 7 9H12z"
                  fill="#d1d5db"
                />
                <circle cx="15" cy="16" r="3" fill="#d1d5db" />
              </svg>
            )}
            <div className="w-full">
              <div className="mb-2">
                <span className="font-semibold">Name:</span> {category.name}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Bengali Name:</span> {category.name_bn || <span className="text-gray-400">N/A</span>}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Slug:</span> <code className="bg-gray-100 px-2 py-1 rounded text-xs">{category.slug}</code>
              </div>
              <div className="mb-2">
                <span className="font-semibold">Description:</span> {category.description || <span className="text-gray-400">N/A</span>}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Created At:</span> {category.created_at ? new Date(category.created_at).toLocaleString() : <span className="text-gray-400">N/A</span>}
              </div>
              <div>
                <span className="font-semibold">Updated At:</span> {category.updated_at ? new Date(category.updated_at).toLocaleString() : <span className="text-gray-400">N/A</span>}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}