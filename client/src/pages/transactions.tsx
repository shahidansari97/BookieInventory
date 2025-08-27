import { useState } from "react";
import { Plus, Filter, Edit, Trash2, TrendingDown, TrendingUp } from "lucide-react";
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
import { mockTransactions, mockProfiles } from "@/lib/mock-data";
import { type Transaction, type InsertTransaction } from "@shared/schema";

export default function Transactions() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [profileFilter, setProfileFilter] = useState("all");

  const filteredTransactions = mockTransactions.filter(transaction => {
    const transactionDate = transaction.date.toISOString().split('T')[0];
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

  const handleSubmitTransaction = (data: InsertTransaction) => {
    console.log("Transaction submitted:", data);
    // In a real app, this would call an API
  };

  const handleDeleteTransaction = (transactionId: string) => {
    console.log("Delete transaction:", transactionId);
    // In a real app, this would call an API
  };

  const columns = [
    {
      key: "date",
      title: "Date",
      render: (value: Date) => value.toLocaleDateString("en-IN"),
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
        const profile = mockProfiles.find(p => p.id === value);
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
                  {mockProfiles.map((profile) => (
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
