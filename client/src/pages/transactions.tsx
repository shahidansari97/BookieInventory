import { useState } from "react";
import { Plus, Filter, Edit, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/tables/data-table";
import TransactionModal from "@/components/modals/transaction-modal";
import { type Transaction, type InsertTransaction, type Profile } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Transactions() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [profileFilter, setProfileFilter] = useState("all");
  const { toast } = useToast();

  // Fetch transactions from API
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  // Fetch profiles from API
  const { data: profiles = [], isLoading: profilesLoading } = useQuery<Profile[]>({
    queryKey: ["/api/profiles"],
  });

  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date).toISOString().split('T')[0];
    const matchesDateFrom = !dateFrom || transactionDate >= dateFrom;
    const matchesDateTo = !dateTo || transactionDate <= dateTo;
    const matchesType = typeFilter === "all" || transaction.type === typeFilter;
    const matchesProfile = profileFilter === "all" || transaction.profileId === profileFilter;
    
    return matchesDateFrom && matchesDateTo && matchesType && matchesProfile;
  });

  const handleAddTransaction = () => {
    setSelectedTransaction(null);
    setIsModalOpen(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  // Create transaction mutation
  const createTransactionMutation = useMutation({
    mutationFn: (data: InsertTransaction) => apiRequest("POST", "/api/transactions", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({
        title: "Success",
        description: "Transaction created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create transaction",
        variant: "destructive",
      });
    },
  });

  // Update transaction mutation
  const updateTransactionMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertTransaction> }) => 
      apiRequest("PUT", `/api/transactions/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({
        title: "Success",
        description: "Transaction updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update transaction",
        variant: "destructive",
      });
    },
  });

  // Delete transaction mutation
  const deleteTransactionMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/transactions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({
        title: "Success",
        description: "Transaction deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete transaction",
        variant: "destructive",
      });
    },
  });

  const handleSubmitTransaction = (data: InsertTransaction) => {
    if (selectedTransaction) {
      updateTransactionMutation.mutate({ id: selectedTransaction.id, data });
    } else {
      createTransactionMutation.mutate(data);
    }
  };

  const handleDeleteTransaction = (transactionId: string) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      deleteTransactionMutation.mutate(transactionId);
    }
  };

  const columns = [
    {
      key: "date",
      title: "Date",
      render: (value: Date | string) => {
        const date = value instanceof Date ? value : new Date(value);
        return date.toLocaleDateString("en-IN");
      },
    },
    {
      key: "type",
      title: "Type",
      render: (value: string) => (
        <Badge 
          variant={value === "taken" ? "default" : "secondary"}
          className={
            value === "taken" 
              ? "bg-primary/10 text-primary" 
              : "bg-green-100 text-green-600"
          }
          data-testid={`transaction-type-${value}`}
        >
          {value === "taken" ? (
            <>
              <TrendingDown className="w-3 h-3 mr-1" />
              Taken
            </>
          ) : (
            <>
              <TrendingUp className="w-3 h-3 mr-1" />
              Given
            </>
          )}
        </Badge>
      ),
    },
    {
      key: "profileId",
      title: "Profile",
      render: (value: string) => {
        const profile = profiles.find(p => p.id === value);
        return profile?.name || "Unknown";
      },
    },
    {
      key: "points",
      title: "Points",
      align: "right" as const,
      render: (value: number) => value.toLocaleString("en-IN"),
    },
    {
      key: "ratePerPoint",
      title: "Rate",
      align: "right" as const,
      render: (value: string) => `₹${parseFloat(value).toFixed(2)}`,
    },
    {
      key: "commissionPercentage",
      title: "Commission",
      align: "right" as const,
      render: (value: string | null) => value ? `${parseFloat(value)}%` : "-",
    },
    {
      key: "totalAmount",
      title: "Total Amount",
      align: "right" as const,
      render: (value: string) => `₹${parseFloat(value).toLocaleString("en-IN")}`,
    },
    {
      key: "actions",
      title: "Actions",
      align: "center" as const,
      render: (_: any, row: Transaction) => (
        <div className="flex justify-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEditTransaction(row)}
            data-testid={`edit-transaction-${row.id}`}
          >
            <Edit className="w-4 h-4 text-primary" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDeleteTransaction(row.id)}
            data-testid={`delete-transaction-${row.id}`}
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-6" data-testid="transactions-page">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2" data-testid="transactions-title">
            Inventory Transactions
          </h2>
          <p className="text-muted-foreground" data-testid="transactions-description">
            Track all inventory movements
          </p>
        </div>
        <Button
          onClick={handleAddTransaction}
          className="mt-4 md:mt-0"
          data-testid="add-transaction-button"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      {/* Transaction Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="date-from">Date From</Label>
              <Input
                id="date-from"
                type="date"
                className="mt-2"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                data-testid="transactions-date-from-input"
              />
            </div>
            <div>
              <Label htmlFor="date-to">Date To</Label>
              <Input
                id="date-to"
                type="date"
                className="mt-2"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                data-testid="transactions-date-to-input"
              />
            </div>
            <div>
              <Label htmlFor="type-filter">Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="mt-2" data-testid="transactions-type-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="taken">Inventory Taken</SelectItem>
                  <SelectItem value="given">Inventory Given</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="profile-filter">Profile</Label>
              <Select value={profileFilter} onValueChange={setProfileFilter}>
                <SelectTrigger className="mt-2" data-testid="transactions-profile-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Profiles</SelectItem>
                  {profiles.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="secondary"
                className="w-full mt-2"
                onClick={() => {
                  setDateFrom("");
                  setDateTo("");
                  setTypeFilter("all");
                  setProfileFilter("all");
                }}
                data-testid="transactions-apply-filters-button"
              >
                <Filter className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <DataTable
        data={filteredTransactions}
        columns={columns}
        loading={transactionsLoading}
        testId="transactions-table"
      />

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitTransaction}
        transaction={selectedTransaction}
      />
    </div>
  );
}
