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
import { mockProfiles } from "@/lib/mock-data";

export default function Reports() {
  const [reportType, setReportType] = useState("profit-loss");
  const [startDate, setStartDate] = useState("2024-01-01");
  const [endDate, setEndDate] = useState("2024-01-15");

  const handleGenerateReport = () => {
    console.log("Generate report:", { reportType, startDate, endDate });
    // In a real app, this would call an API
  };

  const handleExportPDF = () => {
    console.log("Export PDF");
    // In a real app, this would trigger PDF download
  };

  const handleExportCSV = () => {
    console.log("Export CSV");
    // In a real app, this would trigger CSV download
  };

  // Sample report data
  const reportData = [
    {
      id: "1",
      profileName: "Agent Kumar",
      type: "Downline",
      volume: "75,000 pts",
      revenue: "₹1,23,750",
      commission: "₹6,188",
      netPL: "+₹11,250",
      isProfit: true,
    },
    {
      id: "2",
      profileName: "Agent Sharma",
      type: "Downline",
      volume: "45,000 pts",
      revenue: "₹76,500",
      commission: "₹6,120",
      netPL: "+₹9,000",
      isProfit: true,
    },
    {
      id: "3",
      profileName: "Super Exchange",
      type: "Uplink",
      volume: "250,000 pts",
      revenue: "-",
      commission: "-",
      netPL: "-₹3,75,000",
      isProfit: false,
    },
  ];

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
                January 1-15, 2024
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary" data-testid="total-revenue">
                  ₹3,75,000
                </div>
                <div className="text-sm text-muted-foreground">Total Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-destructive" data-testid="total-costs">
                  ₹2,25,000
                </div>
                <div className="text-sm text-muted-foreground">Total Costs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600" data-testid="gross-profit">
                  ₹1,50,000
                </div>
                <div className="text-sm text-muted-foreground">Gross Profit</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600" data-testid="profit-margin">
                  40%
                </div>
                <div className="text-sm text-muted-foreground">Profit Margin</div>
              </div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="p-0">
            <DataTable
              data={reportData}
              columns={columns}
              testId="report-breakdown-table"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
