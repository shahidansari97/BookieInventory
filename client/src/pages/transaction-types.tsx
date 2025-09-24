import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "@/config/axiosInstance";
import { API } from "@/config/apiEndpoints";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import TransactionTypeModal from "@/components/modals/transaction-type-modal";
import { useState, useEffect } from "react";
import DataTable from "@/components/tables/data-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useError } from "@/hooks/useError";

export default function TransactionTypesPage() {
  const queryClient = useQueryClient();
  const { success, handleApi } = useError();
  const [isOpen, setIsOpen] = useState(false);
  const [editingType, setEditingType] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 400);
    return () => clearTimeout(t);
  }, [searchTerm]);
  const { data, isLoading, error } = useQuery({
    queryKey: ["transaction-types-page", currentPage, pageSize, debouncedSearch, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", String(currentPage));
      params.set("limit", String(pageSize));
      
      // Use 'serach' (with typo) as per API
      if (debouncedSearch) {
        params.set("serach", debouncedSearch);
      } else {
        params.set("serach", ""); // Always include serach parameter
      }
      
      // Convert status filter to boolean string
      if (statusFilter !== "all") {
        params.set("status", statusFilter === "true" ? "true" : "false");
      } else {
        params.set("status", ""); // Always include status parameter
      }
      
      console.log('Fetching transaction types with params:', params.toString());
      const res = await axios.get(`${API.TRANSACTION_TYPE_INDEX}?${params.toString()}`);
      console.log('Transaction types API response:', res.data);
      
      // Handle different response structures
      if (res.data?.success === false) {
        return { data: [], currentPage: 1, totalPages: 1, totalItems: 0 };
      }
      
      // If data is directly an array
      if (Array.isArray(res.data)) {
        return { data: res.data, currentPage: 1, totalPages: 1, totalItems: res.data.length };
      }
      
      // If data has nested structure
      return res.data || { data: [], currentPage: 1, totalPages: 1, totalItems: 0 };
    },
  });

  // Normalize API response shapes
  const responseObj: any = data || {};
  const types = Array.isArray(responseObj?.data) ? responseObj.data : Array.isArray(responseObj) ? responseObj : [];
  const totalItems = Number(
    responseObj?.totalItems ??
    (Array.isArray(types) ? types.length : 0)
  );
  const totalPages = Number(
    responseObj?.totalPages ??
    (pageSize > 0 ? Math.max(1, Math.ceil(totalItems / pageSize)) : 1)
  );
  const serverCurrentPage = Number(responseObj?.currentPage ?? currentPage);

  // Debug logging
  console.log('Pagination debug:', {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    typesLength: types.length,
    responseObj
  });

  return (
    <div className="p-4 md:p-6" data-testid="transaction-types-page">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Transaction Types</h2>
          <p className="text-muted-foreground">Create, view, and update transaction types</p>
        </div>
        <Button onClick={() => { setEditingType(null); setIsOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Transaction Type
        </Button>
      </div>

      {/* Filters - match users list style exactly */}
      <div className="mb-6 w-full">
        <div className="bg-gray-50 rounded-lg border-2 border-gray-200 p-6 w-full">
          <div className="flex flex-col xl:flex-row gap-4 items-end w-full">
            {/* Search */}
            <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
              <Label className="text-sm font-semibold text-gray-800">Search</Label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search by name or title..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full h-10 pr-10 bg-white border-2 border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex flex-col gap-2 flex-1 min-w-[160px]">
              <Label className="text-sm font-semibold text-gray-800">Status</Label>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-full h-10 bg-white border-2 border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Types</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center text-muted-foreground py-8">Loading transaction types...</div>
          ) : error ? (
            <div className="text-center text-destructive py-8">Error loading transaction types</div>
          ) : types.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">No transaction types found</div>
          ) : (
            <DataTable
              data={types}
              testId="transaction-types-table"
              itemsPerPage={pageSize}
              columns={[
                { key: "name", title: "Name", render: (v: string) => <div className="font-medium">{v}</div> },
                { key: "title", title: "Title" },
                {
                  key: "status",
                  title: "Status",
                  render: (value: boolean) => (
                    <span className={`px-2 py-1 rounded text-xs font-medium ${value ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {value ? 'Active' : 'Inactive'}
                    </span>
                  ),
                },
                {
                  key: "actions",
                  title: "Actions",
                  align: "right",
                  render: (_: any, row: any) => (
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" title="Edit" onClick={() => { setEditingType(row); setIsOpen(true); }}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Delete" onClick={() => setDeleteTarget(row)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ),
                },
              ]}
            />
          )}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-2">
              <Label htmlFor="page-size">Show</Label>
              <Select value={pageSize.toString()} onValueChange={(v) => { setPageSize(Number(v)); setCurrentPage(1); }}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <Label htmlFor="page-size">entries</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              {
                Array.from({ length: Math.max(1, totalPages) }).slice(
                  Math.max(0, currentPage - 3),
                  Math.max(0, currentPage - 3) + Math.min(5, Math.max(1, totalPages))
                ).map((_, idx) => {
                  const start = Math.max(1, currentPage - 2);
                  const pageNum = Math.min(Math.max(1, totalPages), start + idx);
                  return (
                    <Button
                      key={`page-${pageNum}`}
                      variant={pageNum === currentPage ? "default" : "outline"}
                      size="sm"
                      className={pageNum === currentPage ? "bg-sky-500 text-white" : ""}
                      onClick={() => setCurrentPage(pageNum)}
                      data-testid={`tt-page-${pageNum}`}
                    >
                      {pageNum}
                    </Button>
                  );
                })
              }
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              {`Showing ${types.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to ${Math.min(currentPage * pageSize, totalItems)} of ${totalItems} entries`}
              {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
            </div>
          </div>
        </CardContent>
      </Card>

      <TransactionTypeModal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setEditingType(null);
        }}
        type={editingType}
        onSubmit={() => {
          queryClient.invalidateQueries({ queryKey: ["transaction-types-page"] });
        }}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete transaction type?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete
              {` "${deleteTarget?.title || deleteTarget?.name || ''}"`}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTarget(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!deleteTarget?.id) return;
                try {
                  const res = await axios.post(API.TRANSACTION_TYPE_DELETE, { id: deleteTarget.id });
                  if (res.data?.success === false) {
                    handleApi({ response: { status: 422, data: { message: res.data.message || 'Delete failed' } } });
                  } else {
                    success('Transaction type deleted successfully!');
                    await queryClient.invalidateQueries({ queryKey: ['transaction-types-page'] });
                  }
                } catch (err: any) {
                  handleApi(err);
                } finally {
                  setDeleteTarget(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:opacity-90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}


