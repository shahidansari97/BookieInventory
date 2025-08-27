import { useState } from "react";
import { Send, Eye, RotateCcw, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DataTable from "@/components/tables/data-table";
import SettlementModal from "@/components/modals/settlement-modal";
import MessagePreviewModal from "@/components/modals/message-preview-modal";
import { mockSettlements, mockProfiles } from "@/lib/mock-data";
import { type Settlement } from "@shared/schema";

export default function Settlement() {
  const [isSettlementModalOpen, setIsSettlementModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null);

  const handleSendSettlement = (data: any) => {
    console.log("Settlement sent:", data);
    // In a real app, this would call an API
  };

  const handlePreviewMessage = (settlement: Settlement) => {
    setSelectedSettlement(settlement);
    setIsPreviewModalOpen(true);
  };

  const handleResendMessage = (settlementId: string) => {
    console.log("Resend message:", settlementId);
    // In a real app, this would call an API
  };

  const selectedProfile = selectedSettlement 
    ? mockProfiles.find(p => p.id === selectedSettlement.profileId) || null
    : null;

  const columns = [
    {
      key: "createdAt",
      title: "Date",
      render: (value: Date) => value.toLocaleDateString("en-IN"),
    },
    {
      key: "period",
      title: "Period",
      render: (value: string) => {
        const [start, end] = value.split('_');
        return `${new Date(start).toLocaleDateString("en-IN")} - ${new Date(end).toLocaleDateString("en-IN")}`;
      },
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
      key: "amount",
      title: "Amount",
      align: "right" as const,
      render: (value: string) => `₹${parseFloat(value).toLocaleString("en-IN")}`,
    },
    {
      key: "status",
      title: "Status",
      align: "center" as const,
      render: (value: string) => {
        const statusConfig = {
          sent: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-100", label: "Sent" },
          pending: { icon: Clock, color: "text-yellow-600", bg: "bg-yellow-100", label: "Pending" },
          failed: { icon: RotateCcw, color: "text-red-600", bg: "bg-red-100", label: "Failed" },
        };
        
        const config = statusConfig[value as keyof typeof statusConfig];
        const Icon = config.icon;
        
        return (
          <Badge 
            variant="outline"
            className={`${config.bg} ${config.color}`}
            data-testid={`settlement-status-${value}`}
          >
            <Icon className="w-3 h-3 mr-1" />
            {config.label}
          </Badge>
        );
      },
    },
    {
      key: "actions",
      title: "Actions",
      align: "center" as const,
      render: (_: any, row: Settlement) => (
        <div className="flex justify-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handlePreviewMessage(row)}
            data-testid={`preview-settlement-${row.id}`}
          >
            <Eye className="w-4 h-4 text-primary" />
          </Button>
          {row.status !== "sent" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleResendMessage(row.id)}
              data-testid={`resend-settlement-${row.id}`}
            >
              <RotateCcw className="w-4 h-4 text-primary" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-6" data-testid="settlement-page">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2" data-testid="settlement-title">
            Settlement & WhatsApp
          </h2>
          <p className="text-muted-foreground" data-testid="settlement-description">
            Automated settlement reports via WhatsApp
          </p>
        </div>
        <Button
          onClick={() => setIsSettlementModalOpen(true)}
          className="mt-4 md:mt-0"
          data-testid="send-settlement-button"
        >
          <Send className="w-4 h-4 mr-2" />
          Send Settlement
        </Button>
      </div>

      {/* Settlement Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card data-testid="next-settlement-card">
          <CardHeader>
            <CardTitle className="text-lg">Next Settlement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Scheduled Date:</span>
                <span className="font-medium" data-testid="next-settlement-date">
                  Monday, Jan 22, 2024
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Profiles to Settle:</span>
                <span className="font-medium" data-testid="next-settlement-profiles">
                  3 profiles
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Auto Send:</span>
                <Badge className="bg-green-100 text-green-600" data-testid="auto-send-status">
                  Enabled
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="whatsapp-status-card">
          <CardHeader>
            <CardTitle className="text-lg">WhatsApp Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">API Status:</span>
                <Badge className="bg-green-100 text-green-600" data-testid="whatsapp-api-status">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Connected
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Messages Sent Today:</span>
                <span className="font-medium" data-testid="messages-sent-today">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Failed Deliveries:</span>
                <span className="font-medium text-destructive" data-testid="failed-deliveries">0</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settlement History */}
      <Card data-testid="settlement-history-card">
        <CardHeader>
          <CardTitle>Settlement History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            data={mockSettlements}
            columns={columns}
            testId="settlement-history-table"
          />
        </CardContent>
      </Card>

      {/* Settlement Modal */}
      <SettlementModal
        isOpen={isSettlementModalOpen}
        onClose={() => setIsSettlementModalOpen(false)}
        onSubmit={handleSendSettlement}
      />

      {/* Message Preview Modal */}
      <MessagePreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        settlement={selectedSettlement}
        profile={selectedProfile}
      />
    </div>
  );
}
