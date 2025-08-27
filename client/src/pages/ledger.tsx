import { Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/tables/data-table";
import { mockLedgerEntries, mockProfiles } from "@/lib/mock-data";
import { type LedgerEntry } from "@shared/schema";

export default function Ledger() {
  const handleCalculateLedger = () => {
    console.log("Calculate ledger");
    // In a real app, this would trigger ledger calculation
    alert("Ledger calculation completed successfully!");
  };

  const uplinksTotal = mockLedgerEntries
    .filter(entry => {
      const profile = mockProfiles.find(p => p.id === entry.profileId);
      return profile?.type === "uplink";
    })
    .reduce((sum, entry) => sum + Math.abs(parseFloat(entry.balance)), 0);

  const downlinesTotal = mockLedgerEntries
    .filter(entry => {
      const profile = mockProfiles.find(p => p.id === entry.profileId);
      return profile?.type === "downline";
    })
    .reduce((sum, entry) => sum + parseFloat(entry.balance), 0);

  const netProfit = downlinesTotal - uplinksTotal;

  const columns = [
    {
      key: "profileId",
      title: "Profile",
      render: (value: string) => {
        const profile = mockProfiles.find(p => p.id === value);
        return profile?.name || "Unknown";
      },
    },
    {
      key: "profileId",
      title: "Type",
      render: (value: string) => {
        const profile = mockProfiles.find(p => p.id === value);
        return (
          <Badge 
            variant={profile?.type === "uplink" ? "default" : "secondary"}
            className={
              profile?.type === "uplink" 
                ? "bg-primary/10 text-primary" 
                : "bg-green-100 text-green-600"
            }
            data-testid={`ledger-type-${profile?.type}`}
          >
            {profile?.type?.charAt(0).toUpperCase() + profile?.type?.slice(1)}
          </Badge>
        );
      },
    },
    {
      key: "totalPoints",
      title: "Total Points",
      align: "right" as const,
      render: (value: number) => value.toLocaleString("en-IN"),
    },
    {
      key: "averageRate",
      title: "Average Rate",
      align: "right" as const,
      render: (value: string) => `₹${parseFloat(value).toFixed(2)}`,
    },
    {
      key: "commission",
      title: "Commission",
      align: "right" as const,
      render: (value: string | null) => value ? `₹${parseFloat(value).toLocaleString("en-IN")}` : "-",
    },
    {
      key: "balance",
      title: "Balance",
      align: "right" as const,
      render: (value: string, row: LedgerEntry) => {
        const profile = mockProfiles.find(p => p.id === row.profileId);
        const amount = parseFloat(value);
        const isNegative = amount < 0;
        const displayAmount = Math.abs(amount);
        
        return (
          <span 
            className={`font-medium ${isNegative ? "text-destructive" : "text-green-600"}`}
            data-testid={`ledger-balance-${row.id}`}
          >
            ₹{displayAmount.toLocaleString("en-IN")} ({isNegative ? "Owe" : "Receive"})
          </span>
        );
      },
    },
    {
      key: "status",
      title: "Status",
      align: "center" as const,
      render: (value: string) => (
        <Badge 
          variant="outline"
          className="bg-yellow-100 text-yellow-600"
          data-testid={`ledger-status-${value}`}
        >
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-6" data-testid="ledger-page">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2" data-testid="ledger-title">
            Automated Ledger
          </h2>
          <p className="text-muted-foreground" data-testid="ledger-description">
            Balance calculations and profit/loss reports
          </p>
        </div>
        <Button
          onClick={handleCalculateLedger}
          className="mt-4 md:mt-0"
          data-testid="calculate-ledger-button"
        >
          <Calculator className="w-4 h-4 mr-2" />
          Calculate Now
        </Button>
      </div>

      {/* Calculation Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card data-testid="uplink-balances-card">
          <CardHeader>
            <CardTitle className="text-lg">Uplink Balances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Super Exchange</span>
                <span className="font-medium text-destructive" data-testid="uplink-balance">
                  ₹2,25,000
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                Last calculated: 2024-01-15 09:00 AM
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="downline-balances-card">
          <CardHeader>
            <CardTitle className="text-lg">Downline Balances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Agent Kumar</span>
                <span className="font-medium text-green-600" data-testid="downline-balance-kumar">
                  +₹43,125
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Agent Sharma</span>
                <span className="font-medium text-green-600" data-testid="downline-balance-sharma">
                  +₹27,540
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="net-position-card">
          <CardHeader>
            <CardTitle className="text-lg">Net Position</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Profit</span>
                <span className="font-medium text-2xl text-green-600" data-testid="net-profit">
                  ₹{netProfit.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                Week: Jan 8-14, 2024
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Ledger Table */}
      <Card data-testid="ledger-table-card">
        <CardHeader>
          <CardTitle>Detailed Ledger Report</CardTitle>
          <p className="text-sm text-muted-foreground">Week ending January 14, 2024</p>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            data={mockLedgerEntries}
            columns={columns}
            testId="ledger-table"
          />
        </CardContent>
      </Card>
    </div>
  );
}
