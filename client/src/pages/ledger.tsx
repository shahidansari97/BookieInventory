import { Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/tables/data-table";
import { type LedgerEntry, type Profile } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Ledger() {
  const { toast } = useToast();

  // Fetch ledger entries and profiles from API
  const { data: ledgerEntries = [], isLoading: isLoadingLedger } = useQuery<LedgerEntry[]>({
    queryKey: ["/api/ledger"],
  });

  const { data: profiles = [] } = useQuery<Profile[]>({
    queryKey: ["/api/profiles"],
  });

  // Calculate ledger mutation
  const calculateLedgerMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/ledger/calculate"),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/ledger"] });
      const entriesCount = data.entriesCalculated || 0;
      const period = data.period || "current period";
      toast({
        title: "Success",
        description: `Ledger calculation completed! ${entriesCount} entries calculated for period ${period}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to calculate ledger",
        variant: "destructive",
      });
    },
  });

  const handleCalculateLedger = () => {
    calculateLedgerMutation.mutate();
  };

  // Calculate totals from real data
  const uplinksTotal = ledgerEntries
    .filter(entry => {
      const profile = profiles.find(p => p.id === entry.profileId);
      return profile?.type === "uplink";
    })
    .reduce((sum, entry) => sum + Math.abs(parseFloat(entry.balance)), 0);

  const downlinesTotal = ledgerEntries
    .filter(entry => {
      const profile = profiles.find(p => p.id === entry.profileId);
      return profile?.type === "downline";
    })
    .reduce((sum, entry) => sum + parseFloat(entry.balance), 0);

  const netProfit = downlinesTotal - uplinksTotal;

  const columns = [
    {
      key: "profileId",
      title: "Profile",
      render: (value: string) => {
        const profile = profiles.find(p => p.id === value);
        return profile?.name || "Unknown";
      },
    },
    {
      key: "profileId",
      title: "Type",
      render: (value: string) => {
        const profile = profiles.find(p => p.id === value);
        return (
          <Badge 
            variant={profile?.type === "uplink" ? "default" : "secondary"}
            className={
              profile?.type === "uplink" 
                ? "bg-primary/10 text-primary" 
                : "bg-green-100 text-green-600"
            }
            data-testid={`ledger-type-${profile?.type || "unknown"}`}
          >
            {profile?.type ? profile.type.charAt(0).toUpperCase() + profile.type.slice(1) : "Unknown"}
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
          disabled={calculateLedgerMutation.isPending}
        >
          <Calculator className="w-4 h-4 mr-2" />
          {calculateLedgerMutation.isPending ? "Calculating..." : "Calculate Now"}
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
              {ledgerEntries
                .filter(entry => {
                  const profile = profiles.find(p => p.id === entry.profileId);
                  return profile?.type === "uplink";
                })
                .map(entry => {
                  const profile = profiles.find(p => p.id === entry.profileId);
                  const amount = Math.abs(parseFloat(entry.balance));
                  return (
                    <div key={entry.id} className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{profile?.name}</span>
                      <span className="font-medium text-destructive" data-testid="uplink-balance">
                        ₹{amount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  );
                })}
              {uplinksTotal === 0 && (
                <div className="text-sm text-muted-foreground text-center">
                  No uplink balances
                </div>
              )}
              <div className="text-xs text-muted-foreground">
                Total owed: ₹{uplinksTotal.toLocaleString("en-IN")}
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
              {ledgerEntries
                .filter(entry => {
                  const profile = profiles.find(p => p.id === entry.profileId);
                  return profile?.type === "downline";
                })
                .map(entry => {
                  const profile = profiles.find(p => p.id === entry.profileId);
                  const amount = parseFloat(entry.balance);
                  return (
                    <div key={entry.id} className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{profile?.name}</span>
                      <span className="font-medium text-green-600" data-testid={`downline-balance-${profile?.name?.toLowerCase().replace(" ", "-")}`}>
                        +₹{amount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  );
                })}
              {downlinesTotal === 0 && (
                <div className="text-sm text-muted-foreground text-center">
                  No downline balances
                </div>
              )}
              <div className="text-xs text-muted-foreground">
                Total receivable: ₹{downlinesTotal.toLocaleString("en-IN")}
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
            data={ledgerEntries}
            columns={columns}
            testId="ledger-table"
          />
        </CardContent>
      </Card>
    </div>
  );
}
