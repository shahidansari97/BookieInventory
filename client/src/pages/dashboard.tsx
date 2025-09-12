import { 
  TrendingDown, 
  TrendingUp, 
  Clock, 
  TrendingUpIcon,
  Eye 
} from "lucide-react";
import StatCard from "@/components/cards/stat-card";
import DataTable from "@/components/tables/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { type Transaction, type Profile } from "@shared/schema";
import { useMemo } from "react";

export default function Dashboard() {
  const [, setLocation] = useLocation();

  // Fetch real data from APIs
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const { data: profiles = [], isLoading: profilesLoading } = useQuery<Profile[]>({
    queryKey: ["/api/profiles"],
  });

  // Calculate real stats from actual data
  const stats = useMemo(() => {
    // Always calculate profile counts even if no transactions
    const uplinksCount = profiles.filter(p => p.type === "uplink").length;
    const downlinesCount = profiles.filter(p => p.type === "downline").length;
    
    // Transaction stats only calculated if transactions exist
    const totalTransactions = transactions.length;
    const totalAmount = transactions.reduce((sum, t) => sum + parseFloat(t.totalAmount), 0);
    
    // Get recent transactions (last 3) 
    const sortedTransactions = [...transactions].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });
    const recentTransactions = sortedTransactions.slice(0, 3);


    return {
      totalTransactions,
      totalAmount,
      uplinksCount,
      downlinesCount,
      recentTransactions
    };
  }, [transactions, profiles]);

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
      key: "totalAmount",
      title: "Amount",
      align: "right" as const,
      render: (value: string) => `₹${parseFloat(value).toLocaleString("en-IN")}`,
    },
  ];

  return (
    <div className="p-4 md:p-6" data-testid="dashboard-page">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2" data-testid="dashboard-title">
          Dashboard
        </h2>
        <p className="text-muted-foreground" data-testid="dashboard-description">
          Overview of your inventory management system
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Transactions"
          value={transactionsLoading ? "..." : stats.totalTransactions.toString()}
          icon={Clock}
          iconColor="text-primary"
          iconBgColor="bg-primary/10"
          valueColor="text-primary"
        />
        <StatCard
          title="Total Amount"
          value={transactionsLoading ? "..." : `₹${stats.totalAmount.toLocaleString("en-IN")}`}
          icon={TrendingUpIcon}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
          valueColor="text-green-600"
        />
        <StatCard
          title="Active Uplinks"
          value={profilesLoading ? "..." : stats.uplinksCount.toString()}
          icon={TrendingUp}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
          valueColor="text-blue-600"
        />
        <StatCard
          title="Active Downlines"
          value={profilesLoading ? "..." : stats.downlinesCount.toString()}
          icon={TrendingDown}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
          valueColor="text-purple-600"
        />
      </div>

      {/* Recent Transactions */}
      <Card data-testid="recent-transactions-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle data-testid="recent-transactions-title">
              Recent Transactions
            </CardTitle>
            <Button
              variant="link"
              onClick={() => setLocation("/transactions")}
              data-testid="view-all-transactions-button"
            >
              <Eye className="w-4 h-4 mr-1" />
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            data={stats.recentTransactions}
            columns={columns}
            itemsPerPage={10}
            testId="recent-transactions-table"
          />
        </CardContent>
      </Card>
    </div>
  );
}
