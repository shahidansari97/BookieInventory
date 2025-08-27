import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { insertTransactionSchema, type InsertTransaction, type Transaction, type Profile } from "@shared/schema";
import { mockProfiles } from "@/lib/mock-data";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: InsertTransaction) => void;
  transaction?: Transaction | null;
}

export default function TransactionModal({
  isOpen,
  onClose,
  onSubmit,
  transaction,
}: TransactionModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalAmount, setTotalAmount] = useState("₹0.00");
  const isEditing = !!transaction;

  const form = useForm<InsertTransaction>({
    resolver: zodResolver(insertTransactionSchema),
    defaultValues: {
      type: "taken",
      profileId: "",
      date: "",
      points: "",
      ratePerPoint: "",
      commissionPercentage: "",
      notes: "",
    },
  });

  const watchType = form.watch("type");
  const watchPoints = form.watch("points");
  const watchRate = form.watch("ratePerPoint");
  const watchCommission = form.watch("commissionPercentage");

  // Calculate total amount
  useEffect(() => {
    const points = parseFloat(watchPoints) || 0;
    const rate = parseFloat(watchRate) || 0;
    const commission = parseFloat(watchCommission) || 0;
    
    let total = points * rate;
    if (watchType === "given" && commission > 0) {
      total = total * (1 + commission / 100);
    }
    
    setTotalAmount(`₹${total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`);
  }, [watchPoints, watchRate, watchCommission, watchType]);

  useEffect(() => {
    if (transaction) {
      const profile = mockProfiles.find(p => p.id === transaction.profileId);
      form.reset({
        type: transaction.type as "taken" | "given",
        profileId: transaction.profileId,
        date: transaction.date.toISOString().split('T')[0],
        points: transaction.points.toString(),
        ratePerPoint: transaction.ratePerPoint,
        commissionPercentage: transaction.commissionPercentage || "",
        notes: transaction.notes || "",
      });
    } else {
      form.reset({
        type: "taken",
        profileId: "",
        date: new Date().toISOString().split('T')[0],
        points: "",
        ratePerPoint: "",
        commissionPercentage: "",
        notes: "",
      });
    }
  }, [transaction, form]);

  const filteredProfiles = mockProfiles.filter(profile => {
    if (watchType === "taken") return profile.type === "uplink";
    if (watchType === "given") return profile.type === "downline";
    return true;
  });

  const handleSubmit = async (data: InsertTransaction) => {
    setIsSubmitting(true);
    try {
      onSubmit(data);
      onClose();
    } catch (error) {
      console.error("Error submitting transaction:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" data-testid="transaction-modal">
        <DialogHeader>
          <DialogTitle data-testid="transaction-modal-title">
            {isEditing ? "Edit Transaction" : "Add Transaction"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Transaction Type <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="transaction-type-select">
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="taken">Inventory Taken from Uplink</SelectItem>
                      <SelectItem value="given">Inventory Given to Downline</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="profileId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Profile <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="transaction-profile-select">
                        <SelectValue placeholder="Select Profile" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredProfiles.map((profile) => (
                        <SelectItem key={profile.id} value={profile.id}>
                          {profile.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Date <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      data-testid="transaction-date-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="points"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Points <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      placeholder="10000"
                      {...field}
                      data-testid="transaction-points-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ratePerPoint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Rate per Point <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="1.50"
                      {...field}
                      data-testid="transaction-rate-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchType === "given" && (
              <FormField
                control={form.control}
                name="commissionPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Commission Percentage</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        placeholder="5.00"
                        {...field}
                        data-testid="transaction-commission-input"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Optional notes..."
                      {...field}
                      data-testid="transaction-notes-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Card className="bg-muted" data-testid="transaction-total-card">
              <CardContent className="p-3">
                <div className="text-sm font-medium mb-1">Total Amount</div>
                <div className="text-xl font-bold text-primary" data-testid="transaction-total-amount">
                  {totalAmount}
                </div>
                <div className="text-xs text-muted-foreground">Calculated automatically</div>
              </CardContent>
            </Card>

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                data-testid="transaction-cancel-button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
                data-testid="transaction-submit-button"
              >
                {isSubmitting ? "Saving..." : isEditing ? "Update Transaction" : "Save Transaction"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
