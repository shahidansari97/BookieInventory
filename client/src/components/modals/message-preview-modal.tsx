import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { type Settlement, type Profile } from "@shared/schema";

interface MessagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  settlement: Settlement | null;
  profile: Profile | null;
}

export default function MessagePreviewModal({
  isOpen,
  onClose,
  settlement,
  profile,
}: MessagePreviewModalProps) {
  if (!settlement || !profile) return null;

  const formatDate = (date: Date | null) => {
    if (!date) return "Not sent";
    return date.toLocaleDateString("en-IN") + " " + date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" data-testid="message-preview-modal">
        <DialogHeader>
          <DialogTitle data-testid="message-preview-title">
            WhatsApp Message
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="bg-green-50 border-green-200" data-testid="message-card">
            <CardContent className="p-4">
              <div className="text-sm font-medium mb-2" data-testid="message-recipient">
                Message sent to: {profile.phone}
              </div>
              <div className="text-sm bg-white p-3 rounded-md border" data-testid="message-content">
                {settlement.message.split('\n').map((line, index) => (
                  <div key={index}>
                    {line}
                    {index < settlement.message.split('\n').length - 1 && <br />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="text-sm text-muted-foreground space-y-1" data-testid="message-details">
            <div>Sent: {formatDate(settlement.sentAt)}</div>
            <div className="flex items-center gap-2">
              Status: 
              {settlement.status === "sent" && (
                <span className="text-green-600">✅ Delivered</span>
              )}
              {settlement.status === "pending" && (
                <span className="text-yellow-600">⏳ Pending</span>
              )}
              {settlement.status === "failed" && (
                <span className="text-red-600">❌ Failed</span>
              )}
            </div>
            {settlement.status === "sent" && (
              <div>Read: {formatDate(settlement.sentAt)}</div>
            )}
          </div>

          <Button
            onClick={onClose}
            className="w-full"
            data-testid="message-preview-close-button"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
