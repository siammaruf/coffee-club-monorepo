import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { Edit, Eye, Plus, Search, Trash2, RotateCcw, AlertTriangle } from "lucide-react";
import { Checkbox } from "~/components/ui/checkbox";
import { BulkActionBar } from "~/components/common/BulkActionBar";
import { useTableSelection } from "~/hooks/useTableSelection";
import { blogService } from "~/services/httpServices/blogService";
import { ConfirmDialog } from "~/components/common/ConfirmDialog";
import BlogPostModal from "./components/BlogPostModal";
import ViewBlogPostModal from "./components/ViewBlogPostModal";
import type { BlogPost } from "~/types/blog";

export default function BlogPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editPost, setEditPost] = useState<BlogPost | null>(null);
  const [viewPost, setViewPost] = useState<BlogPost | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [permanentDeleteId, setPermanentDeleteId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [total, setTotal] = useState(0);

  const { selectedIds, selectedCount, toggleSelect, toggleSelectAll, clearSelection, isSelected, isAllSelected } = useTableSelection();
  const [viewMode, setViewMode] = useState<'active' | 'trash'>('active');
  const [trashCount, setTrashCount] = useState(0);
  const [bulkLoading, setBulkLoading] = useState(false);

  useEffect(() => {
    clearSelection();
  }, [viewMode]);

  useEffect(() => {
    // Fetch trash count on mount
    blogService.getTrash({ page: 1, limit: 1 }).then((res: any) => setTrashCount(res.total || 0)).catch(() => {});
  }, []);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = {
        page: currentPage,
        limit: itemsPerPage,
      };
      if (searchTerm) params.search = searchTerm;
      const res = viewMode === 'active'
        ? await blogService.getAll(params)
        : await blogService.getTrash(params) as any;
      setPosts(res.data || []);
      setTotal(res.total || 0);
    } catch {
      setPosts([]);
      setTotal(0);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, [currentPage, searchTerm, viewMode]);

  const handleAddPost = (postData: BlogPost) => {
    setPosts(prev => [postData, ...prev]);
    setShowAddModal(false);
  };

  const handleEditPost = (postData: BlogPost) => {
    setPosts(prev => prev.map(p => (p.id === postData.id ? postData : p)));
    setEditPost(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await blogService.delete(deleteId);
      setPosts(prev => prev.filter(p => p.id !== deleteId));
      setTotal(prev => prev - 1);
      setTrashCount(prev => prev + 1);
    } catch (error) {
      console.error("Failed to delete blog post:", error);
    }
    setDeleteLoading(false);
    setDeleteId(null);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);
    try {
      await blogService.bulkDelete(Array.from(selectedIds));
      setPosts(prev => prev.filter(item => !selectedIds.has(item.id)));
      setTotal(prev => prev - selectedIds.size);
      setTrashCount(prev => prev + selectedIds.size);
      clearSelection();
    } catch (error) {
      console.error("Bulk delete failed:", error);
    }
    setBulkLoading(false);
  };

  const handleBulkRestore = async () => {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);
    try {
      await blogService.bulkRestore(Array.from(selectedIds));
      setTrashCount(prev => prev - selectedIds.size);
      clearSelection();
      fetchPosts();
    } catch (error) {
      console.error("Bulk restore failed:", error);
      fetchPosts();
    }
    setBulkLoading(false);
  };

  const handleBulkPermanentDelete = async () => {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);
    try {
      const response: any = await blogService.bulkPermanentDelete(Array.from(selectedIds));
      const deletedCount = response?.data?.deleted?.length ?? selectedIds.size;
      setTrashCount(prev => prev - deletedCount);
      clearSelection();
      fetchPosts();
    } catch (error) {
      console.error("Bulk permanent delete failed:", error);
      fetchPosts();
    }
    setBulkLoading(false);
  };

  const handleRestore = async (id: string) => {
    try {
      await blogService.restore(id);
      setPosts(prev => prev.filter(item => item.id !== id));
      setTotal(prev => prev - 1);
      setTrashCount(prev => prev - 1);
    } catch (error) {
      console.error("Restore failed:", error);
    }
  };

  const handlePermanentDelete = (id: string) => {
    setPermanentDeleteId(id);
  };

  const handlePermanentDeleteConfirm = async () => {
    if (!permanentDeleteId) return;
    try {
      await blogService.permanentDelete(permanentDeleteId);
      setPosts(prev => prev.filter(item => item.id !== permanentDeleteId));
      setTotal(prev => prev - 1);
      setTrashCount(prev => prev - 1);
    } catch (error) {
      console.error("Permanent delete failed:", error);
    }
    setPermanentDeleteId(null);
  };

  const totalPages = Math.ceil(total / itemsPerPage);

  if (isLoading) {
    return <BlogLoadingSkeleton />;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Blog Posts</h2>
          <p className="text-muted-foreground">Manage your blog content</p>
        </div>
        {viewMode === 'active' && (
          <Button className="flex items-center gap-2" onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4" />
            Add Post
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => { setViewMode('active'); setCurrentPage(1); }}
              >
                Active
              </Button>
              <Button
                variant={viewMode === 'trash' ? 'default' : 'outline'}
                size="sm"
                onClick={() => { setViewMode('trash'); setCurrentPage(1); }}
                className="flex items-center gap-1"
              >
                <Trash2 className="h-4 w-4" />
                Trash {trashCount > 0 && `(${trashCount})`}
              </Button>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search posts..."
                className="pl-8"
                value={searchTerm}
                onChange={e => {
                  setCurrentPage(1);
                  setSearchTerm(e.target.value);
                }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <BulkActionBar
            selectedCount={selectedCount}
            onDelete={handleBulkDelete}
            onClearSelection={clearSelection}
            isTrashView={viewMode === 'trash'}
            onRestore={handleBulkRestore}
            onPermanentDelete={handleBulkPermanentDelete}
            loading={bulkLoading}
          />
          <div className="rounded-md border">
            <div className="p-4 bg-muted/50">
              <div className="grid grid-cols-7 font-medium text-sm">
                <div className="col-span-1 flex items-center">
                  <Checkbox
                    checked={isAllSelected(posts.map(p => p.id))}
                    onChange={() => toggleSelectAll(posts.map(p => p.id))}
                  />
                </div>
                <div className="col-span-2 text-left">Title</div>
                <div className="text-center">Author</div>
                <div className="text-center">Status</div>
                <div className="text-center">Published Date</div>
                <div className="text-right">Actions</div>
              </div>
            </div>
            <div className="divide-y">
              {posts.length > 0 ? (
                posts.map(post => (
                  <div key={post.id} className="p-4 hover:bg-muted/50">
                    <div className="grid grid-cols-7 text-sm items-center">
                      <div className="col-span-1 flex items-center">
                        <Checkbox
                          checked={isSelected(post.id)}
                          onChange={() => toggleSelect(post.id)}
                        />
                      </div>
                      <div className="col-span-2 text-left">
                        <div className="flex items-center gap-3">
                          {post.image && (
                            <img
                              src={post.image}
                              alt={post.title}
                              className="w-10 h-10 rounded border object-cover flex-shrink-0"
                            />
                          )}
                          <div className="flex flex-col min-w-0">
                            <span className="font-medium truncate">{post.title}</span>
                            <span className="text-xs text-gray-500 mt-0.5 truncate">
                              {post.excerpt}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-center text-gray-600">{post.author}</div>
                      <div className="text-center">
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
                      <div className="text-center text-gray-500 text-xs">
                        {post.published_at
                          ? new Date(post.published_at).toLocaleDateString()
                          : "---"}
                      </div>
                      <div className="flex gap-2 justify-end">
                        {viewMode === 'active' ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 cursor-pointer"
                              title="View"
                              onClick={() => setViewPost(post)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 cursor-pointer"
                              title="Edit"
                              type="button"
                              onClick={() => setEditPost(post)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 cursor-pointer"
                              title="Delete"
                              onClick={() => setDeleteId(post.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 text-green-600 hover:bg-green-50 cursor-pointer"
                              title="Restore"
                              onClick={() => handleRestore(post.id)}
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 cursor-pointer"
                              title="Delete Permanently"
                              onClick={() => handlePermanentDelete(post.id)}
                            >
                              <AlertTriangle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  {viewMode === 'trash' ? (
                    <>
                      <p>Trash is empty.</p>
                      <p className="text-sm mt-1">No deleted blog posts found.</p>
                    </>
                  ) : searchTerm ? (
                    <>
                      <p>No blog posts found matching &quot;{searchTerm}&quot;.</p>
                      <p className="text-sm mt-1">Try adjusting your search terms.</p>
                    </>
                  ) : (
                    <>
                      <p>No blog posts available.</p>
                      <p className="text-sm mt-1">Create your first blog post to get started.</p>
                    </>
                  )}
                </div>
              )}
            </div>
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center gap-2 p-4 border-t">
                <span className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * itemsPerPage + 1}-
                  {Math.min(currentPage * itemsPerPage, total)} of {total}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Prev
                  </Button>
                  <span className="text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <BlogPostModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddPost}
        mode="add"
      />

      {editPost && (
        <BlogPostModal
          isOpen={!!editPost}
          onClose={() => setEditPost(null)}
          onSave={handleEditPost}
          post={editPost}
          mode="edit"
        />
      )}

      {viewPost && (
        <ViewBlogPostModal
          isOpen={!!viewPost}
          onClose={() => setViewPost(null)}
          post={viewPost}
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Blog Post?"
        description="Are you sure you want to delete this blog post? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
        loading={deleteLoading}
      />

      {/* Confirm Permanent Delete Dialog */}
      <ConfirmDialog
        open={!!permanentDeleteId}
        title="Permanently Delete?"
        description="Are you sure you want to permanently delete this item? This action cannot be undone."
        confirmText="Delete Forever"
        cancelText="Cancel"
        onConfirm={handlePermanentDeleteConfirm}
        onCancel={() => setPermanentDeleteId(null)}
      />
    </div>
  );
}

function BlogLoadingSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="h-9 w-48 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-5 w-64 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
      </div>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
            <div className="relative w-64">
              <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="p-4 bg-muted/50">
              <div className="grid grid-cols-7 gap-4">
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                <div className="col-span-2 h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-16" />
                <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-16" />
                <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-20" />
                <div className="h-4 bg-gray-200 rounded animate-pulse ml-auto w-16" />
              </div>
            </div>
            <div className="divide-y">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="p-4">
                  <div className="grid grid-cols-7 items-center gap-4">
                    <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                    <div className="col-span-2 flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded animate-pulse flex-shrink-0" />
                      <div className="flex flex-col flex-1">
                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-2" />
                        <div className="h-3 w-48 bg-gray-200 rounded animate-pulse" />
                      </div>
                    </div>
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mx-auto" />
                    <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse mx-auto" />
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mx-auto" />
                    <div className="flex gap-2 justify-end">
                      <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                      <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                      <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
