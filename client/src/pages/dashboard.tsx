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
import { mockTransactions, mockProfiles } from "@/lib/mock-data";
import { useLocation } from "wouter";

export default function Dashboard() {
  const [, setLocation] = useLocation();

  const recentTransactions = mockTransactions.slice(0, 3);

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
          title="Total Inventory Purchased"
          value="₹12,45,000"
          icon={TrendingDown}
          iconColor="text-primary"
          iconBgColor="bg-primary/10"
          valueColor="text-primary"
        />
        <StatCard
          title="Total Inventory Distributed"
          value="₹10,85,000"
          icon={TrendingUp}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
          valueColor="text-green-600"
        />
        <StatCard
          title="Outstanding Balance"
          value="₹1,60,000"
          icon={Clock}
          iconColor="text-yellow-600"
          iconBgColor="bg-yellow-100"
          valueColor="text-yellow-600"
        />
        <StatCard
          title="Net Profit"
          value="₹85,500"
          icon={TrendingUpIcon}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
          valueColor="text-green-600"
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
            data={recentTransactions}
            columns={columns}
            itemsPerPage={10}
            testId="recent-transactions-table"
          />
        </CardContent>
      </Card>
    </div>
  );
}
