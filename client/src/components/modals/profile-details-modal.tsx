import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/config/currency";

interface ProfileDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any | null;
}

export default function ProfileDetailsModal({
  isOpen,
  onClose,
  profile,
}: ProfileDetailsModalProps) {
  if (!profile) return null;

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid Date";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="profile-details-modal">
        <DialogHeader>
          <DialogTitle data-testid="profile-details-title">
            Profile Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{profile.name}</h3>
                  <p className="text-muted-foreground">{profile.email}</p>
                </div>
                <Badge 
                  variant={profile.status ? "default" : "secondary"}
                  className={
                    profile.status 
                      ? "bg-green-100 text-green-600" 
                      : "bg-red-100 text-red-600"
                  }
                >
                  {profile.status ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Profile Type</label>
                  <div className="mt-1">
                    <Badge 
                      variant={profile.transactionType === "UPLINK" ? "default" : "secondary"}
                      className={
                        profile.transactionType === "UPLINK" 
                          ? "bg-primary/10 text-primary" 
                          : "bg-green-100 text-green-600"
                      }
                    >
                      {profile.transactionType}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Contact Number</label>
                  <p className="mt-1 text-sm">{profile.country_code} {profile.phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Financial Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Rate Per Point</label>
                  <p className="mt-1 text-lg font-semibold">{formatCurrency(profile.ratePerPoint || 0)}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Commission</label>
                  <p className="mt-1 text-lg font-semibold">{formatCurrency(profile.commission || 0)}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Wallet Balance</label>
                  <p className="mt-1 text-lg font-semibold text-green-600">{formatCurrency(profile.wallet || 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">System Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Profile ID</label>
                  <p className="mt-1 text-sm font-mono bg-gray-100 p-2 rounded">{profile.id}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created By</label>
                  <p className="mt-1 text-sm font-mono bg-gray-100 p-2 rounded">{profile.createdBy || "System"}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created At</label>
                  <p className="mt-1 text-sm">{formatDate(profile.createdAt)}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                  <p className="mt-1 text-sm">{formatDate(profile.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
