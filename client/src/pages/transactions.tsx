import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, X, Edit, Trash2, Calendar, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useError } from "@/hooks/useError";
import axios from "@/config/axiosInstance";
import { API } from "@/config/apiEndpoints";
import TransactionModal from "@/components/modals/transaction-modal";

// Transaction interface based on API response
interface Transaction {
  id: string;
  transactionTypeId: string;
  transactionType: string;
  profileId: string;
  profileName: string;
  profileInfo?: {
    name: string;
  };
  toUserId?: string;
  toUserName?: string;
  amount: number;
  ratePerPoint: number;
  totalAmount: number;
  notes?: string;
  date: string;
  status: boolean;
  paymentStatus: boolean;
  createdAt: string;
  updatedAt: string;
}

// API response interface
interface TransactionListResponse {
  success: boolean;
  message: string;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  data: Transaction[];
}

export default function Transactions() {
  const { handleApi } = useError();
  const queryClient = useQueryClient();

  // State for filters and pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<string>("all");
  const [profileFilter, setProfileFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Debounced search
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page when searching
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch transactions with filters and pagination
  const { data: transactionsData, isLoading, error } = useQuery<TransactionListResponse>({
    queryKey: ['transactions', currentPage, pageSize, debouncedSearchTerm, dateFrom, dateTo, transactionTypeFilter, profileFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
      });

      if (debouncedSearchTerm) {
        params.append('search', debouncedSearchTerm);
      }
      if (dateFrom) {
        params.append('dateFrom', dateFrom);
      }
      if (dateTo) {
        params.append('dateTo', dateTo);
      }
      if (transactionTypeFilter !== 'all') {
        params.append('transactionType', transactionTypeFilter);
      }
      if (profileFilter !== 'all') {
        params.append('profileId', profileFilter);
      }

      const url = `${API.TRANSACTION_INDEX}?${params.toString()}`;
      console.log('🔍 Fetching transactions:', url);
      
      const response = await axios.get(url);
      console.log('📊 Transaction API response:', {
        success: response.data.success,
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        totalItems: response.data.totalItems,
        dataLength: response.data.data?.length || 0
      });
      
      return response.data;
    },
    enabled: true,
  });

  // Fetch transaction types for filter
  const { data: transactionTypes = [] } = useQuery({
    queryKey: ['transaction-types'],
    queryFn: async () => {
      const response = await axios.get(API.TRANSACTION_TYPES);
      return response.data.data || response.data;
    },
  });

  // Fetch profiles for filter
  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles-for-filter'],
    queryFn: async () => {
      const response = await axios.get(API.PROFILE_INDEX);
      return response.data.data || [];
    },
  });

  // Handle filter changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleDateFromChange = (value: string) => {
    setDateFrom(value);
    setCurrentPage(1);
    
    // If Date To is before the new Date From, clear it
    if (dateTo && value && new Date(dateTo) < new Date(value)) {
      setDateTo("");
      console.log("Date To cleared because it was before the new Date From");
    }
  };

  const handleDateToChange = (value: string) => {
    setDateTo(value);
    setCurrentPage(1);
  };

  const handleTransactionTypeFilterChange = (value: string) => {
    setTransactionTypeFilter(value);
    setCurrentPage(1);
  }; 

  const handleProfileFilterChange = (value: string) => {
    setProfileFilter(value);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setDateFrom("");
    setDateTo("");
    setTransactionTypeFilter("all");
    setProfileFilter("all");
    setCurrentPage(1);
  };

  // Handle modal
  const handleOpenModal = (transaction?: Transaction) => {
    setSelectedTransaction(transaction || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTransaction(null);
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
  };

  const handleTransactionSubmit = (data: any) => {
    // Transaction modal handles its own API call
    // This function is called after successful submission
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setCurrentPage(1);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  // Format date with support for ISO, DD-MM-YY, and DD-MM-YYYY
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';

    const tryFormat = (d: Date) => {
      if (isNaN(d.getTime())) return '-';
      return d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
      });
    };

    // Try native parse first (handles ISO like 2025-09-22T06:09:02.318Z)
    const iso = new Date(dateString);
    if (!isNaN(iso.getTime())) return tryFormat(iso);

    // Try DD-MM-YY
    const short = dateString.match(/^(\d{2})-(\d{2})-(\d{2})$/);
    if (short) {
      const dd = Number(short[1]);
      const mm = Number(short[2]);
      const yy = 2000 + Number(short[3]);
      return tryFormat(new Date(yy, mm - 1, dd));
    }

    // Try DD-MM-YYYY
    const long = dateString.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (long) {
      const dd = Number(long[1]);
      const mm = Number(long[2]);
      const yyyy = Number(long[3]);
      return tryFormat(new Date(yyyy, mm - 1, dd));
    }

    return '-';
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: boolean) => {
    return status ? "default" : "secondary";
  };

  // Get payment status badge variant
  const getPaymentStatusBadgeVariant = (status: boolean) => {
    return status ? "default" : "destructive";
  };

  if (error) {
    return (
      <div className="p-4 md:p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-destructive">
              <p>Error loading transactions: {error.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6" data-testid="transactions-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Inventory Transactions</h1>
          <p className="text-muted-foreground">
            Track all inventory movements
          </p>
        </div>
        <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Transaction
        </Button>
      </div>

      {/* Filters - Full Width */}
      <div className="mb-6 w-full">
        <div className="bg-gray-50 rounded-lg border-2 border-gray-200 p-6 w-full">
          <div className="flex flex-col xl:flex-row gap-4 items-end w-full">
            {/* Date From */}
            <div className="flex flex-col gap-2 flex-1 min-w-[160px]">
              <Label className="text-sm font-semibold text-gray-800">Date From</Label>
              <div className="relative">
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => handleDateFromChange(e.target.value)}
                  className="w-full h-10 pr-10 bg-white border-2 border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm"
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4 pointer-events-none" />
              </div>
            </div>

            {/* Date To */}
            <div className="flex flex-col gap-2 flex-1 min-w-[160px]">
              <Label className="text-sm font-semibold text-gray-800">Date To</Label>
              <div className="relative">
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => handleDateToChange(e.target.value)}
                  min={dateFrom || undefined}
                  className="w-full h-10 pr-10 bg-white border-2 border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm"
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4 pointer-events-none" />
              </div>
            </div>

            {/* Type Filter */}
            <div className="flex flex-col gap-2 flex-1 min-w-[160px]">
              <Label className="text-sm font-semibold text-gray-800">Type</Label>
              <Select value={transactionTypeFilter} onValueChange={handleTransactionTypeFilterChange}>
                <SelectTrigger className="w-full h-10 bg-white border-2 border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {transactionTypes.map((type: any) => (
                    <SelectItem key={type.id} value={type.name}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Profile Filter */}
            <div className="flex flex-col gap-2 flex-1 min-w-[160px]">
              <Label className="text-sm font-semibold text-gray-800">Profile</Label>
              <Select value={profileFilter} onValueChange={handleProfileFilterChange}>
                <SelectTrigger className="w-full h-10 bg-white border-2 border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm">
                  <SelectValue placeholder="All Profiles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Profiles</SelectItem>
                  {profiles.map((profile: any) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters Button */}
            <div className="flex items-end flex-shrink-0">
              <Button 
                onClick={handleClearFilters} 
                className="flex items-center gap-2 h-10 bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-md font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Filter className="h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-muted-foreground">Loading transactions...</div>
            </div>
          ) : !transactionsData?.data || transactionsData.data.length === 0 ? (
            <div className="flex items-center justify-center p-12">
              <div className="text-center">
                <p className="text-muted-foreground text-lg mb-6">No transactions found</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Profile</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactionsData.data.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{formatDate(transaction.date)}</TableCell>
                      <TableCell>
                        <span className={`font-medium ${
                          transaction.transactionType === 'UPLINK' ? 'text-blue-600' : 'text-green-600'
                        }`}>
                          {transaction.transactionType === 'UPLINK' ? 'Taken' : 'Given'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {transaction.profileInfo?.name || transaction.profileName || '-'}
                          </div>
                          {typeof (transaction as any)?.profileInfo?.email === 'string' && (
                            <div className="text-xs text-muted-foreground">{(transaction as any).profileInfo.email}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">
                        {transaction.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="font-mono">
                        ₹{transaction.ratePerPoint}
                      </TableCell>
                      <TableCell className="font-mono">
                        -
                      </TableCell>
                      <TableCell className="font-mono font-semibold">
                        {formatCurrency(transaction.totalAmount)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenModal(transaction)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // TODO: Implement delete functionality
                              console.log('Delete transaction:', transaction.id);
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination Controls - Only show when there are results */}
      {transactionsData?.success !== false && !error && (
        <div className="flex items-center justify-between mt-6">
        <div className="flex items-center space-x-2">
          <Label htmlFor="page-size">Show</Label>
          <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
            <SelectTrigger className="w-20" data-testid="transactions-page-size">
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
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            data-testid="transactions-prev-page"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          
          <div className="flex items-center space-x-1">
            {transactionsData && Array.from({ length: Math.min(5, transactionsData.totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(transactionsData.totalPages - 4, currentPage - 2)) + i;
              if (pageNum > transactionsData.totalPages) return null;
              
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                  className="w-8 h-8 p-0"
                  data-testid={`transactions-page-${pageNum}`}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= (transactionsData?.totalPages || 1)}
            data-testid="transactions-next-page"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          {isLoading ? (
            "Loading..."
          ) : (
            `Showing ${((currentPage - 1) * pageSize) + 1} to ${Math.min(currentPage * pageSize, transactionsData?.totalItems || 0)} of ${transactionsData?.totalItems || 0} entries`
          )}
        </div>
      </div>
      )}

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleTransactionSubmit}
      />
    </div>
  );
}