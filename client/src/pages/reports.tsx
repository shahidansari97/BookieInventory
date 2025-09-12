import { useState } from "react";
import { BarChart3, Download, FileText } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DataTable from "@/components/tables/data-table";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function Reports() {
  const [reportType, setReportType] = useState("profit-loss");
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [shouldGenerate, setShouldGenerate] = useState(true);
  const { toast } = useToast();

  // Fetch report data
  const { data: reportResult, isLoading, refetch } = useQuery({
    queryKey: ["/api/reports", { startDate, endDate, reportType }],
    queryFn: () => {
      const params = new URLSearchParams({ 
        startDate, 
        endDate, 
        reportType 
      });
      return fetch(`/api/reports?${params}`).then(res => res.json());
    },
    enabled: shouldGenerate,
  });

  const handleGenerateReport = () => {
    setShouldGenerate(true);
    refetch();
    toast({
      title: "Generating Report",
      description: "Report is being generated with current filters",
    });
  };

  const handleExportPDF = () => {
    toast({
      title: "Feature Coming Soon",
      description: "PDF export functionality will be implemented",
    });
  };

  const handleExportCSV = () => {
    if (!reportResult?.data) {
      toast({
        title: "No Data",
        description: "Please generate a report first",
        variant: "destructive",
      });
      return;
    }

    // Simple CSV export
    const headers = ["Profile", "Type", "Volume", "Revenue", "Commission", "Net P&L"];
    const csvContent = [
      headers.join(","),
      ...reportResult.data.map((row: any) => [
        row.profileName,
        row.type,
        row.volume,
        row.revenue,
        row.commission,
        row.netPL
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-${reportType}-${startDate}-${endDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "CSV Downloaded",
      description: "Report has been exported to CSV",
    });
  };

  const reportData = reportResult?.data || [];
  const summary = reportResult?.summary || {
    totalRevenue: 0,
    totalCosts: 0,
    grossProfit: 0,
    profitMargin: 0
  };

  const columns = [
    {
      key: "profileName",
      title: "Profile",
      render: (value: string) => (
        <div className="font-medium" data-testid={`report-profile-${value}`}>
          {value}
        </div>
      ),
    },
    {
      key: "type",
      title: "Type",
    },
    {
      key: "volume",
      title: "Volume",
      align: "right" as const,
    },
    {
      key: "revenue",
      title: "Revenue",
      align: "right" as const,
    },
    {
      key: "commission",
      title: "Commission",
      align: "right" as const,
    },
    {
      key: "netPL",
      title: "Net P&L",
      align: "right" as const,
      render: (value: string, row: any) => (
        <span 
          className={`font-medium ${row.isProfit ? "text-green-600" : "text-destructive"}`}
          data-testid={`report-pnl-${row.id}`}
        >
          {value}
        </span>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-6" data-testid="reports-page">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2" data-testid="reports-title">
          Custom Reports
        </h2>
        <p className="text-muted-foreground" data-testid="reports-description">
          Generate detailed reports for any date range
        </p>
      </div>

      {/* Report Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Generate Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="report-type">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="mt-2" data-testid="report-type-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="profit-loss">Profit/Loss Report</SelectItem>
                  <SelectItem value="balance-summary">Balance Summary</SelectItem>
                  <SelectItem value="transaction-report">Transaction Report</SelectItem>
                  <SelectItem value="commission-analysis">Commission Analysis</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                className="mt-2"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                data-testid="report-start-date-input"
              />
            </div>
            <div>
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                className="mt-2"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                data-testid="report-end-date-input"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleGenerateReport}
                className="w-full mt-2"
                data-testid="generate-report-button"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Generate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sample Report */}
      <Card data-testid="report-results-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Profit/Loss Report</CardTitle>
              <p className="text-sm text-muted-foreground" data-testid="report-period">
                {reportResult?.period ? 
                  `${new Date(reportResult.period.start).toLocaleDateString("en-IN")} - ${new Date(reportResult.period.end).toLocaleDateString("en-IN")}` :
                  "Select date range and generate report"
                }
              </p>
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                data-testid="export-pdf-button"
              >
                <Download className="w-4 h-4 mr-1" />
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                data-testid="export-csv-button"
              >
                <FileText className="w-4 h-4 mr-1" />
                CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Report Summary */}
          <div className="p-6 border-b border-border">
            {isLoading ? (
              <div className="text-center text-muted-foreground">Loading report data...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary" data-testid="total-revenue">
                    ₹{summary.totalRevenue.toLocaleString("en-IN")}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Revenue</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-destructive" data-testid="total-costs">
                    ₹{summary.totalCosts.toLocaleString("en-IN")}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Costs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600" data-testid="gross-profit">
                    ₹{summary.grossProfit.toLocaleString("en-IN")}
                  </div>
                  <div className="text-sm text-muted-foreground">Gross Profit</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600" data-testid="profit-margin">
                    {summary.profitMargin.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Profit Margin</div>
                </div>
              </div>
            )}
          </div>

          {/* Detailed Breakdown */}
          <div className="p-0">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">Loading report breakdown...</div>
            ) : reportData.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No transactions found for the selected period
              </div>
            ) : (
              <DataTable
                data={reportData}
                columns={columns}
                testId="report-breakdown-table"
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
