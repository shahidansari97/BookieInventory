import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatCurrency, getCurrencySymbol } from "@/config/currency";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import axios from "@/config/axiosInstance";
import { API } from "@/config/apiEndpoints";
import DataTable from "@/components/tables/data-table";
import { type LedgerEntry, type Profile } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function Ledger() {
  const { toast } = useToast();
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  // Server-side pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  interface LedgerTransactionItem {
    id: string;
    date: string;
    transactionType: string; // UPLINK | DOWNLINE
    amount: number;
    ratePerPoint: number;
    totalAmount?: number;
    profileInfo?: { name?: string };
  }

  interface LedgerIndexResponse {
    totalTakenAmount?: number;
    totalGivenAmount?: number;
    outstandingBalance?: number;
    netPosition?: number;
    status?: string;
    transactionList?: {
      success: boolean;
      message: string;
      currentPage: number;
      totalPages: number;
      totalItems: number;
      data: LedgerTransactionItem[];
    };
  }

  // Fetch ledger list by selected profile
  const { data: ledgerData } = useQuery<LedgerIndexResponse>({
    queryKey: ["ledger-index", selectedProfileId, currentPage, pageSize],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(pageSize),
      });
      if (selectedProfileId) params.append("profileId", String(selectedProfileId));
      const url = `${API.LEDGER_INDEX}?${params.toString()}`;
      const res = await axios.get(url);
      // API returns the object directly or under data; normalize
      return res.data?.data || res.data;
    },
    enabled: !!selectedProfileId,
  });

  const { data: profiles = [] } = useQuery<Profile[]>({
    queryKey: ["uplink-profiles-all"],
    queryFn: async () => {
      const res = await axios.get(API.UPLINK_PROFILES_ALL);
      return res.data.data || res.data || [];
    },
  });

  // Set default selected profile once profiles load
  useEffect(() => {
    if (!selectedProfileId && Array.isArray(profiles) && profiles.length > 0) {
      setSelectedProfileId((profiles as any)[0]?.id ?? null);
    }
  }, [profiles, selectedProfileId]);

  // Normalize profiles and derive selected name (matching dashboard behavior)
  const profilesArray: any[] = Array.isArray(profiles) ? (profiles as any[]) : [];
  const selectedProfileName = (profilesArray.find(p => p && p.id === selectedProfileId)?.name)
    || (profilesArray.length === 0 ? "Loading..." : "No Profile Selected");

  // Removed Calculate Now action per request

  // Current page entries from transactionList
  const entries: any[] = Array.isArray(ledgerData?.transactionList?.data)
    ? (ledgerData!.transactionList!.data as any[])
    : [];
  const uplinksTotal = entries
    .filter(entry => {
      const profile = (profiles as any[]).find((p: any) => p?.id === entry.profileId);
      return profile?.type === "uplink";
    })
    .reduce((sum, entry) => sum + Math.abs(parseFloat(entry.balance)), 0);

  const downlinesTotal = entries
    .filter(entry => {
      const profile = (profiles as any[]).find((p: any) => p?.id === entry.profileId);
      return profile?.type === "downline";
    })
    .reduce((sum, entry) => sum + parseFloat(entry.balance), 0);

  const netProfit = downlinesTotal - uplinksTotal;

  const columns = [
    {
      key: "date",
      title: "Date",
      render: (value: string) => value || "-",
    },
    {
      key: "transactionType",
      title: "Type",
      render: (value: string) => (
        <Badge 
          variant={value === "UPLINK" ? "default" : "secondary"}
          className={value === "UPLINK" ? "bg-primary/10 text-primary" : "bg-green-100 text-green-600"}
        >
          {value === "UPLINK" ? "Taken" : "Given"}
        </Badge>
      ),
    },
    {
      key: "profileInfo",
      title: "Profile",
      render: (_: any, row: any) => row?.profileInfo?.name || "-",
    },
    {
      key: "amount",
      title: "Amount",
      align: "right" as const,
      render: (value: number) => (Number(value) || 0).toLocaleString("en-IN"),
    },
    {
      key: "ratePerPoint",
      title: "Rate",
      align: "right" as const,
      render: (value: number) => `${getCurrencySymbol()}${Number(value || 0)}`,
    },
    {
      key: "totalAmount",
      title: "Total Amount",
      align: "right" as const,
      render: (value: number) => `${getCurrencySymbol()}${(Number(value) || 0).toLocaleString("en-IN")}`,
    },
  ];

  // Pagination handlers
  const handlePageChange = (page: number) => {
    if (page < 1) return;
    setCurrentPage(page);
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setCurrentPage(1);
  };

  return (
    <div className="p-4 md:p-6" data-testid="ledger-page">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold mb-2" data-testid="ledger-title">
            Automated Ledger
          </h2>
          <p className="text-muted-foreground" data-testid="ledger-description">
            Balance calculations and profit/loss reports
          </p>
        </div>

        {/* Selected Profile dropdown (exact dashboard style) */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Selected Profile:</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                {selectedProfileName}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {profilesArray.length > 0 ? (
                profilesArray.map((p: any) => {
                  if (!p || typeof p !== 'object' || !p.id) return null;
                  return (
                    <DropdownMenuItem
                      key={p.id}
                      onClick={() => setSelectedProfileId(p.id)}
                      className={selectedProfileId === p.id ? "bg-blue-50 font-semibold" : ""}
                    >
                      {p.name || 'Unknown Profile'}
                      {selectedProfileId === p.id && (
                        <span className="ml-auto text-blue-600">✓</span>
                      )}
                    </DropdownMenuItem>
                  );
                })
              ) : (
                <DropdownMenuItem disabled>No Uplink Profiles</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Balances from API and summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card data-testid="taken-amount-card">
          <CardHeader>
            <CardTitle className="text-lg">Total Taken Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {formatCurrency((ledgerData?.totalTakenAmount ?? 0) as number)}
            </div>
          </CardContent>
        </Card>
        <Card data-testid="given-amount-card">
          <CardHeader>
            <CardTitle className="text-lg">Total Given Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {formatCurrency((ledgerData?.totalGivenAmount ?? 0) as number)}
            </div>
          </CardContent>
        </Card>
        <Card data-testid="uplink-balances-card">
          <CardHeader>
            <CardTitle className="text-lg">Outstanding Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {formatCurrency((ledgerData?.outstandingBalance ?? 0) as number)}
            </div>
          </CardContent>
        </Card>

        <Card data-testid="net-position-card">
          <CardHeader>
            <CardTitle className="text-lg">Net Position</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className={`text-2xl font-semibold ${((ledgerData?.netPosition ?? 0) as number) < 0 ? "text-destructive" : "text-green-600"}`}>
                {formatCurrency((Math.abs(ledgerData?.netPosition ?? 0)) as number)}
              </div>
              <div className="text-sm text-muted-foreground">
                {ledgerData?.status || "Neutral"}
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
            data={entries}
            columns={columns}
            testId="ledger-table"
          />
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      {ledgerData?.transactionList && (
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center space-x-2">
            <span className="text-sm">Show</span>
            <select
              className="border rounded px-2 py-1 text-sm"
              value={pageSize}
              onChange={(e) => handlePageSizeChange(e.target.value)}
              data-testid="ledger-page-size"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm">entries</span>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              data-testid="ledger-prev-page"
            >
              Previous
            </Button>

            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, ledgerData?.transactionList?.totalPages || 1) }, (_, i) => {
                const pageNum = Math.max(1, Math.min((ledgerData?.transactionList?.totalPages || 1) - 4, currentPage - 2)) + i;
                if (pageNum > (ledgerData?.transactionList?.totalPages || 1)) return null;
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    className="w-8 h-8 p-0"
                    data-testid={`ledger-page-${pageNum}`}
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
              disabled={currentPage >= (ledgerData?.transactionList?.totalPages || 1)}
              data-testid="ledger-next-page"
            >
              Next
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            {`Showing ${((currentPage - 1) * pageSize) + 1} to ${Math.min(currentPage * pageSize, ledgerData?.transactionList?.totalItems || 0)} of ${ledgerData?.transactionList?.totalItems || 0} entries`}
          </div>
        </div>
      )}
    </div>
  );
}
