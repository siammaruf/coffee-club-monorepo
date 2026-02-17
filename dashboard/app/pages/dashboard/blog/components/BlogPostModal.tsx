import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { Upload, X, XCircle } from "lucide-react";
import { blogService } from "~/services/httpServices/blogService";
import { toast } from "sonner";
import type { BlogPost } from "~/types/blog";

interface BlogPostFormValues {
  title: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  is_published: boolean;
}

interface BlogPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (post: BlogPost) => void;
  post?: BlogPost | null;
  mode?: "add" | "edit";
}

export default function BlogPostModal({
  isOpen,
  onClose,
  onSave,
  post,
  mode = "add",
}: BlogPostModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<BlogPostFormValues>({
    defaultValues: {
      title: "",
      excerpt: "",
      content: "",
      image: "",
      author: "",
      is_published: false,
    },
  });

  useEffect(() => {
    if (mode === "edit" && post) {
      setValue("title", post.title || "");
      setValue("excerpt", post.excerpt || "");
      setValue("content", post.content || "");
      setValue("image", post.image || "");
      setValue("author", post.author || "");
      setValue("is_published", post.is_published || false);
    } else if (mode === "add") {
      reset();
    }
  }, [post, mode, isOpen, setValue, reset]);

  const onSubmit = async (data: BlogPostFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
        image: data.image || undefined,
        author: data.author,
        is_published: data.is_published,
      };

      let result: any;
      if (mode === "edit" && post?.id) {
        result = await blogService.update(post.id, payload);
        toast("Blog post updated!", {
          description: (
            <span style={{ color: "#000" }}>
              The blog post was updated successfully.
            </span>
          ),
          duration: 3000,
          icon: <Upload className="text-green-600 mr-2" />,
          style: { background: "#dcfce7", color: "#166534", border: "1.5px solid #22c55e" },
        });
      } else {
        result = await blogService.create(payload);
        toast("Blog post created!", {
          description: (
            <span style={{ color: "#000" }}>
              The blog post was created successfully.
            </span>
          ),
          duration: 3000,
          icon: <Upload className="text-green-600 mr-2" />,
          style: { background: "#dcfce7", color: "#166534", border: "1.5px solid #22c55e" },
        });
      }

      const savedPost = result.data || result;
      onSave(savedPost);
      setTimeout(() => {
        onClose();
        reset();
      }, 500);
    } catch (error: any) {
      let apiMessage = "Failed to save blog post.";
      if (error?.response?.data?.message) {
        apiMessage = error.response.data.message;
      } else if (error?.message) {
        apiMessage = error.message;
      }
      toast("Failed to save blog post.", {
        description: (
          <span style={{ color: "#000" }}>
            {apiMessage}
          </span>
        ),
        duration: 3000,
        icon: <XCircle className="text-red-600" style={{ marginTop: 10, marginRight: 10 }} />,
        style: {
          background: "#fee2e2",
          color: "#991b1b",
          alignItems: "flex-start",
          border: "1.5px solid #ef4444",
        },
      });
    }
    setIsSubmitting(false);
  };

  const handleClose = () => {
    onClose();
    reset();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-bold text-gray-900">
            {mode === "edit" ? "Edit Blog Post" : "Add New Blog Post"}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="rounded-full p-2 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-semibold text-gray-700">
                Title *
              </Label>
              <Input
                id="title"
                placeholder="Enter blog post title"
                {...register("title", { required: "Title is required" })}
                className="h-11"
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="author" className="text-sm font-semibold text-gray-700">
                Author *
              </Label>
              <Input
                id="author"
                placeholder="Author name"
                {...register("author", { required: "Author is required" })}
                className="h-11"
              />
              {errors.author && (
                <p className="text-sm text-red-500">{errors.author.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt" className="text-sm font-semibold text-gray-700">
                Excerpt *
              </Label>
              <Textarea
                id="excerpt"
                placeholder="Short description/summary of the post..."
                {...register("excerpt", { required: "Excerpt is required" })}
                className="min-h-[80px] resize-none"
                rows={3}
              />
              {errors.excerpt && (
                <p className="text-sm text-red-500">{errors.excerpt.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="content" className="text-sm font-semibold text-gray-700">
                Content *
              </Label>
              <Textarea
                id="content"
                placeholder="Write the full blog post content..."
                {...register("content", { required: "Content is required" })}
                className="min-h-[160px] resize-y"
                rows={8}
              />
              {errors.content && (
                <p className="text-sm text-red-500">{errors.content.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="image" className="text-sm font-semibold text-gray-700">
                Image URL
              </Label>
              <Input
                id="image"
                placeholder="https://example.com/image.jpg"
                {...register("image")}
                className="h-11"
              />
              {watch("image") && (
                <div className="mt-2">
                  <img
                    src={watch("image")}
                    alt="Preview"
                    className="h-24 w-auto rounded border object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Checkbox
                id="is_published"
                checked={watch("is_published")}
                onChange={(e) => setValue("is_published", (e.target as HTMLInputElement).checked)}
              />
              <Label htmlFor="is_published" className="text-sm font-semibold text-gray-700 cursor-pointer">
                Published
              </Label>
              <span className="text-xs text-gray-500">
                {watch("is_published") ? "This post will be visible on the website" : "This post is a draft"}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="px-6"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="px-6 bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Saving..."
                : mode === "edit"
                  ? "Update Post"
                  : "Create Post"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
