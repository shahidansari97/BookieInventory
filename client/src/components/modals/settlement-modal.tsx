import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Send } from "lucide-react";
import { mockProfiles, mockLedgerEntries } from "@/lib/mock-data";

interface SettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function SettlementModal({
  isOpen,
  onClose,
  onSubmit,
}: SettlementModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);
  
  const form = useForm({
    defaultValues: {
      settlementDate: new Date().toISOString().split('T')[0],
      messageTemplate: `Settlement Report for {period}

Balance: {balance}
Status: {status}

Thank you for your business.
- Bookie System`,
    },
  });

  const profilesWithBalances = mockProfiles.map(profile => {
    const ledgerEntry = mockLedgerEntries.find(entry => entry.profileId === profile.id);
    return {
      ...profile,
      balance: ledgerEntry?.balance || "0.00",
    };
  });

  const handleProfileToggle = (profileId: string) => {
    setSelectedProfiles(prev => 
      prev.includes(profileId)
        ? prev.filter(id => id !== profileId)
        : [...prev, profileId]
    );
  };

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      onSubmit({
        ...data,
        selectedProfiles,
        profileCount: selectedProfiles.length,
      });
      onClose();
    } catch (error) {
      console.error("Error sending settlement:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg" data-testid="settlement-modal">
        <DialogHeader>
          <DialogTitle data-testid="settlement-modal-title">
            Send Settlement
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="settlementDate">Settlement Date</Label>
            <Input
              id="settlementDate"
              type="date"
              {...form.register("settlementDate")}
              data-testid="settlement-date-input"
            />
          </div>

          <div>
            <Label>Profiles to Settle</Label>
            <div className="space-y-2 mt-2">
              {profilesWithBalances.map((profile) => (
                <div key={profile.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={profile.id}
                    checked={selectedProfiles.includes(profile.id)}
                    onCheckedChange={() => handleProfileToggle(profile.id)}
                    data-testid={`settlement-profile-${profile.id}`}
                  />
                  <Label htmlFor={profile.id} className="flex-1 cursor-pointer">
                    {profile.name} (₹{Math.abs(parseFloat(profile.balance)).toLocaleString("en-IN")})
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="messageTemplate">Message Template</Label>
            <Textarea
              id="messageTemplate"
              rows={4}
              {...form.register("messageTemplate")}
              data-testid="settlement-message-input"
            />
          </div>

          <Card className="bg-muted" data-testid="settlement-summary-card">
            <CardContent className="p-3">
              <div className="text-sm font-medium mb-2">Settlement Summary</div>
              <div className="text-sm space-y-1">
                <div data-testid="settlement-profile-count">
                  Profiles: {selectedProfiles.length} selected
                </div>
                <div data-testid="settlement-message-count">
                  Messages: {selectedProfiles.length} to send
                </div>
                <div data-testid="settlement-period">
                  Period: Jan 8-14, 2024
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              data-testid="settlement-cancel-button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || selectedProfiles.length === 0}
              className="flex-1"
              data-testid="settlement-submit-button"
            >
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? "Sending..." : "Send Now"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
