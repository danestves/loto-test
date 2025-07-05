import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Edit, Filter, Loader2, MoreHorizontal, Plus, Save, Trash2, TrendingUp, X, XIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/transactions")({
  component: TransactionsRoute,
});

interface EditingTransaction {
  id: number;
  cardLastFour: string;
  amount: number;
  categoryId: number;
  transactionDate: string;
  status: "pending" | "approved" | "rejected";
}

function TransactionsRoute() {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<EditingTransaction | null>(null);
  const [filters, setFilters] = useState({
    categoryId: undefined as number | undefined,
    status: undefined as "pending" | "approved" | "rejected" | undefined,
    dateFrom: undefined as string | undefined,
    dateTo: undefined as string | undefined,
  });

  const cleanFilters = useMemo(() => {
    const cleaned: {
      categoryId?: number;
      status?: "pending" | "approved" | "rejected";
      dateFrom?: Date;
      dateTo?: Date;
    } = {};

    if (filters.categoryId !== undefined) {
      cleaned.categoryId = filters.categoryId;
    }
    if (filters.status !== undefined) {
      cleaned.status = filters.status;
    }
    if (filters.dateFrom && filters.dateFrom.trim() !== "") {
      cleaned.dateFrom = new Date(filters.dateFrom);
    }
    if (filters.dateTo && filters.dateTo.trim() !== "") {
      cleaned.dateTo = new Date(filters.dateTo);
    }

    return cleaned;
  }, [filters]);

  const categories = useQuery(orpc.category.getAll.queryOptions());
  const transactions = useQuery(
    orpc.transaction.getAll.queryOptions({
        input: cleanFilters,
    })
  );
  const expenseSummary = useQuery(orpc.transaction.getExpenseSummary.queryOptions());

  const createMutation = useMutation(
    orpc.transaction.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.transaction.getAll.queryKey() });
        setIsCreating(false);
        toast.success("Transaction created successfully");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const updateMutation = useMutation(
    orpc.transaction.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.transaction.getAll.queryKey() });
        setEditingTransaction(null);
        toast.success("Transaction updated successfully");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const deleteMutation = useMutation(
    orpc.transaction.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.transaction.getAll.queryKey() });
        queryClient.invalidateQueries({ queryKey: orpc.transaction.getExpenseSummary.queryKey() });
        toast.success("Transaction deleted successfully");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const updateStatusMutation = useMutation(
    orpc.transaction.updateStatus.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.transaction.getAll.queryKey() });
        toast.success("Status updated successfully");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const handleCreateTransaction = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      cardLastFour: formData.get("cardLastFour") as string,
      amount: Number(formData.get("amount")),
      categoryId: Number(formData.get("categoryId")),
      transactionDate: new Date(formData.get("transactionDate") as string),
    });
  };

  const handleEditTransaction = (transaction: any) => {
    setEditingTransaction({
      id: transaction.id,
      cardLastFour: transaction.cardLastFour,
      amount: transaction.amount,
      categoryId: transaction.categoryId,
      transactionDate: new Date(transaction.transactionDate).toISOString().split("T")[0],
      status: transaction.status,
    });
  };

  const handleSaveEdit = () => {
    if (!editingTransaction) return;

    updateMutation.mutate({
      id: editingTransaction.id,
      cardLastFour: editingTransaction.cardLastFour,
      amount: editingTransaction.amount,
      categoryId: editingTransaction.categoryId,
      transactionDate: new Date(editingTransaction.transactionDate),
      status: editingTransaction.status,
    });
  };

  const handleCancelEdit = () => {
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = (id: number, amount: number, categoryName: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this transaction?\n\n" +
      `Amount: ${formatCurrency(amount)}\n` +
      `Category: ${categoryName}\n\n` +
      "This action cannot be undone."
    );

    if (confirmed) {
      deleteMutation.mutate({ id });
    }
  };

  const handleUpdateStatus = (id: number, status: "pending" | "approved" | "rejected") => {
    updateStatusMutation.mutate({ id, status });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "success";
      case "rejected":
        return "error";
      case "pending":
        return "warning";
      default:
        return "default";
    }
  };

  const clearFilters = () => {
    setFilters({
      categoryId: undefined,
      status: undefined,
      dateFrom: undefined,
      dateTo: undefined,
    });
  };

  const hasActiveFilters = filters.categoryId !== undefined ||
    filters.status !== undefined ||
    (filters.dateFrom && filters.dateFrom.trim() !== "") ||
    (filters.dateTo && filters.dateTo.trim() !== "");

  return (
    <div className="container mx-auto space-y-8 py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-3xl">Transactions</h1>
        <Button onClick={() => setIsCreating(!isCreating)} className="shadow-sm">
          <Plus className="mr-2 h-4 w-4" />
          New Transaction
        </Button>
      </div>

      {/* Create Transaction Form */}
      {isCreating && (
        <Card className="shadow-sm">
          <CardHeader className="pb-6">
            <CardTitle>Create New Transaction</CardTitle>
            <CardDescription>Record a new corporate card transaction</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateTransaction} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="cardLastFour">Card Last 4 Digits</Label>
                  <Input
                    id="cardLastFour"
                    name="cardLastFour"
                    placeholder="1234"
                    maxLength={4}
                    pattern="\d{4}"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="100.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoryId">Category</Label>
                  <Select name="categoryId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.data?.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transactionDate">Transaction Date</Label>
                  <Input
                    id="transactionDate"
                    name="transactionDate"
                    type="date"
                    defaultValue={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Transaction
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="shadow-sm">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="ml-auto"
              >
                Clear Filters
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={filters.categoryId?.toString() || "all"}
                onValueChange={(value: string) =>
                  setFilters({ ...filters, categoryId: value === "all" ? undefined : Number(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.data?.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={filters.status || "all"}
                onValueChange={(value: string) =>
                  setFilters({ ...filters, status: value === "all" ? undefined : value as "pending" | "approved" | "rejected" })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date From</Label>
              <Input
                type="date"
                value={filters.dateFrom || ""}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Date To</Label>
              <Input
                type="date"
                value={filters.dateTo || ""}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expense Summary */}
      <Card className="shadow-sm">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Expense Summary by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          {expenseSummary.isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {expenseSummary.data?.map((summary) => (
                <div
                  key={summary.categoryId}
                  className="flex items-center justify-between rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-primary" />
                    <div>
                      <span className="font-medium">{summary.categoryName}</span>
                      <span className="ml-2 text-muted-foreground text-sm">
                        ({summary.transactionCount} transactions)
                      </span>
                    </div>
                  </div>
                  <span className="font-bold text-lg">{formatCurrency(summary.totalAmount)}</span>
                </div>
              ))}
              {expenseSummary.data && expenseSummary.data.length > 0 && (
                <div className="mt-6 flex items-center justify-between border-t pt-6">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-xl">
                    {formatCurrency(
                      expenseSummary.data.reduce((sum, s) => sum + s.totalAmount, 0)
                    )}
                  </span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card className="shadow-sm">
        <CardHeader className="pb-6">
          <CardTitle>Transactions</CardTitle>
          <CardDescription>
            {hasActiveFilters
              ? "Filtered corporate card transactions"
              : "All corporate card transactions"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : transactions.data?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-center text-muted-foreground">
                {hasActiveFilters ? "No transactions match your filters" : "No transactions found"}
              </p>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-border border-b">
                    <th className="px-6 py-4 text-left font-medium text-muted-foreground">Date</th>
                    <th className="px-6 py-4 text-left font-medium text-muted-foreground">Card</th>
                    <th className="px-6 py-4 text-left font-medium text-muted-foreground">Category</th>
                    <th className="px-6 py-4 text-right font-medium text-muted-foreground">Amount</th>
                    <th className="px-6 py-4 text-center font-medium text-muted-foreground">Status</th>
                    <th className="px-6 py-4 text-center font-medium text-muted-foreground">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.data?.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="group border-border border-b transition-colors hover:bg-accent/50"
                    >
                      {editingTransaction?.id === transaction.id ? (
                        // Edit mode
                        <>
                          <td className="px-6 py-5">
                            <Input
                              type="date"
                              value={editingTransaction.transactionDate}
                              onChange={(e) => setEditingTransaction({
                                ...editingTransaction,
                                transactionDate: e.target.value
                              })}
                            />
                          </td>
                          <td className="px-6 py-5">
                            <Input
                              value={editingTransaction.cardLastFour}
                              onChange={(e) => setEditingTransaction({
                                ...editingTransaction,
                                cardLastFour: e.target.value
                              })}
                              maxLength={4}
                              pattern="\d{4}"
                            />
                          </td>
                          <td className="px-6 py-5">
                            <Select
                              value={editingTransaction.categoryId.toString()}
                              onValueChange={(value) => setEditingTransaction({
                                ...editingTransaction,
                                categoryId: Number(value)
                              })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.data?.map((category) => (
                                  <SelectItem key={category.id} value={category.id.toString()}>
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="px-6 py-5">
                            <Input
                              type="number"
                              step="0.01"
                              min="0.01"
                              value={editingTransaction.amount}
                              onChange={(e) => setEditingTransaction({
                                ...editingTransaction,
                                amount: Number(e.target.value)
                              })}
                            />
                          </td>
                          <td className="px-6 py-5 text-center">
                            <Select
                              value={editingTransaction.status}
                              onValueChange={(value) => setEditingTransaction({
                                ...editingTransaction,
                                status: value as "pending" | "approved" | "rejected"
                              })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <div className="flex justify-center gap-2">
                              <Button
                                size="sm"
                                onClick={handleSaveEdit}
                                disabled={updateMutation.isPending}
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
                          </td>
                        </>
                      ) : (
                        // View mode
                        <>
                          <td className="px-6 py-5 font-medium">
                            {formatDate(transaction.transactionDate)}
                          </td>
                          <td className="px-6 py-5 font-mono text-muted-foreground text-sm">
                            •••• {transaction.cardLastFour}
                          </td>
                          <td className="px-6 py-5">
                            <span className="rounded-md bg-muted px-2 py-1 text-sm">
                              {transaction.categoryName}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right font-semibold">
                            {formatCurrency(transaction.amount)}
                          </td>
                          <td className="px-6 py-5 text-center">
                            <Badge variant={getStatusBadgeVariant(transaction.status)}>
                              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                            </Badge>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditTransaction(transaction)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                {transaction.status === "pending" && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => handleUpdateStatus(transaction.id, "approved")}
                                      disabled={updateStatusMutation.isPending}
                                    >
                                      <Check className="mr-2 h-4 w-4" />
                                      Approve
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      variant="destructive"
                                      onClick={() => handleUpdateStatus(transaction.id, "rejected")}
                                      disabled={updateStatusMutation.isPending}
                                    >
                                      <XIcon className="mr-2 h-4 w-4" />
                                      Reject
                                    </DropdownMenuItem>
                                  </>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  variant="destructive"
                                  onClick={() => handleDeleteTransaction(
                                    transaction.id,
                                    transaction.amount,
                                    transaction.categoryName
                                  )}
                                  disabled={deleteMutation.isPending}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
