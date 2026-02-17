import { X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import type { BlogPost } from "~/types/blog";

interface ViewBlogPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: BlogPost | null;
}

export default function ViewBlogPostModal({ isOpen, onClose, post }: ViewBlogPostModalProps) {
  if (!isOpen || !post) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-bold text-gray-900">Blog Post Details</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="p-6 space-y-4">
          {post.image && (
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-48 object-cover rounded-lg border"
            />
          )}

          <div>
            <h4 className="text-xl font-bold text-gray-900">{post.title}</h4>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-sm text-gray-500">By {post.author}</span>
              <Badge
                className={
                  post.is_published
                    ? "bg-green-100 text-green-700 border-green-200"
                    : "bg-yellow-100 text-yellow-700 border-yellow-200"
                }
              >
                {post.is_published ? "Published" : "Draft"}
              </Badge>
            </div>
          </div>

          <div>
            <span className="font-semibold text-sm text-gray-600">Slug:</span>
            <code className="ml-2 bg-gray-100 px-2 py-1 rounded text-xs">{post.slug}</code>
          </div>

          <div>
            <span className="font-semibold text-sm text-gray-600">Excerpt:</span>
            <p className="text-gray-700 mt-1">{post.excerpt}</p>
          </div>

          <div>
            <span className="font-semibold text-sm text-gray-600">Content:</span>
            <div className="mt-1 text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border text-sm max-h-64 overflow-y-auto">
              {post.content}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 text-sm">
            <div>
              <span className="font-semibold text-gray-600">Published At:</span>{" "}
              {post.published_at
                ? new Date(post.published_at).toLocaleString()
                : <span className="text-gray-400">Not published</span>}
            </div>
            <div>
              <span className="font-semibold text-gray-600">Created At:</span>{" "}
              {new Date(post.created_at).toLocaleString()}
            </div>
            <div>
              <span className="font-semibold text-gray-600">Updated At:</span>{" "}
              {new Date(post.updated_at).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
