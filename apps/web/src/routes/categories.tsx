import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Calendar, Edit, Loader2, Plus, Save, Tag, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/categories")({
  component: CategoriesRoute,
});

interface EditingCategory {
  id: number;
  name: string;
}

function CategoriesRoute() {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState<EditingCategory | null>(null);

  const categories = useQuery(orpc.category.getAll.queryOptions());

  const createMutation = useMutation(
    orpc.category.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.category.getAll.queryKey() });
        setIsCreating(false);
        setCategoryName("");
        toast.success("Category created successfully");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const updateMutation = useMutation(
    orpc.category.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.category.getAll.queryKey() });
        setEditingCategory(null);
        toast.success("Category updated successfully");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const deleteMutation = useMutation(
    orpc.category.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.category.getAll.queryKey() });
        queryClient.invalidateQueries({ queryKey: orpc.transaction.getAll.queryKey() });
        queryClient.invalidateQueries({ queryKey: orpc.transaction.getExpenseSummary.queryKey() });
        toast.success("Category deleted successfully");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (categoryName.trim()) {
      createMutation.mutate({ name: categoryName });
    }
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory({
      id: category.id,
      name: category.name,
    });
  };

  const handleSaveEdit = () => {
    if (!editingCategory || !editingCategory.name.trim()) return;

    updateMutation.mutate({
      id: editingCategory.id,
      name: editingCategory.name.trim(),
    });
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
  };

  const handleDeleteCategory = (id: number, name: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the category "${name}"?\n\n` +
      "This action cannot be undone. Any transactions using this category may be affected."
    );

    if (confirmed) {
      deleteMutation.mutate({ id });
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="container mx-auto max-w-6xl space-y-8 py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-3xl">Categories</h1>
        <Button onClick={() => setIsCreating(!isCreating)} className="shadow-sm">
          <Plus className="mr-2 h-4 w-4" />
          New Category
        </Button>
      </div>

      {/* Create Category Form */}
      {isCreating && (
        <Card className="shadow-sm">
          <CardHeader className="pb-6">
            <CardTitle>Create New Category</CardTitle>
            <CardDescription>Add a new expense category to the system</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateCategory} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="categoryName">Category Name</Label>
                <Input
                  id="categoryName"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="e.g., Office Supplies"
                  disabled={createMutation.isPending}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={createMutation.isPending || !categoryName.trim()}>
                  {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Category
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false);
                    setCategoryName("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Categories List */}
      <Card className="shadow-sm">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            All Categories
          </CardTitle>
          <CardDescription>
            Expense categories available in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {categories.isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : categories.data?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Tag className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="mb-2 text-center font-medium">No categories found</p>
              <p className="text-center text-muted-foreground text-sm">
                Create your first category to get started!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {categories.data?.map((category) => (
                <div
                  key={category.id}
                  className="group hover:-translate-y-0.5 relative overflow-hidden rounded-lg border bg-card p-6 transition-all duration-200 hover:shadow-md hover:shadow-primary/5"
                >
                  {editingCategory?.id === category.id ? (
                    // Edit mode
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <Tag className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <Input
                            value={editingCategory.name}
                            onChange={(e) => setEditingCategory({
                              ...editingCategory,
                              name: e.target.value
                            })}
                            className="font-semibold"
                            placeholder="Category name"
                          />
                        </div>
                      </div>
                      <div className="mt-1 flex items-center gap-1 text-muted-foreground text-sm">
                        <Calendar className="h-3 w-3" />
                        <span>Created {formatDate(category.createdAt)}</span>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={handleSaveEdit}
                          disabled={updateMutation.isPending || !editingCategory.name.trim()}
                        >
                          {updateMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelEdit}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
                            <Tag className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground transition-colors group-hover:text-primary">
                              {category.name}
                            </h3>
                            <div className="mt-1 flex items-center gap-1 text-muted-foreground text-sm">
                              <Calendar className="h-3 w-3" />
                              <span>Created {formatDate(category.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditCategory(category)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteCategory(category.id, category.name)}
                            disabled={deleteMutation.isPending}
                            className="text-destructive hover:text-destructive"
                          >
                            {deleteMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Subtle gradient overlay for enhanced visual depth */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

                      {/* Animated border effect */}
                      <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-primary to-primary/50 transition-all duration-300 group-hover:w-full" />
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
