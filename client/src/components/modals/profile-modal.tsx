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
import { insertProfileSchema, type InsertProfile, type Profile } from "@shared/schema";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: InsertProfile) => void;
  profile?: Profile | null;
}

export default function ProfileModal({
  isOpen,
  onClose,
  onSubmit,
  profile,
}: ProfileModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!profile;

  const form = useForm<InsertProfile>({
    resolver: zodResolver(insertProfileSchema),
    defaultValues: {
      type: "uplink",
      name: "",
      phone: "",
      email: "",
      ratePerPoint: "",
      commissionPercentage: "",
      notes: "",
    },
  });

  const watchType = form.watch("type");

  useEffect(() => {
    if (profile) {
      form.reset({
        type: profile.type as "uplink" | "downline",
        name: profile.name,
        phone: profile.phone,
        email: profile.email || "",
        ratePerPoint: profile.ratePerPoint,
        commissionPercentage: profile.commissionPercentage || "",
        notes: profile.notes || "",
      });
    } else {
      form.reset({
        type: "uplink",
        name: "",
        phone: "",
        email: "",
        ratePerPoint: "",
        commissionPercentage: "",
        notes: "",
      });
    }
  }, [profile, form]);

  const handleSubmit = async (data: InsertProfile) => {
    setIsSubmitting(true);
    try {
      onSubmit(data);
      onClose();
    } catch (error) {
      console.error("Error submitting profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" data-testid="profile-modal">
        <DialogHeader>
          <DialogTitle data-testid="profile-modal-title">
            {isEditing ? "Edit Profile" : "Add Profile"}
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
                    Type <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="profile-type-select">
                        <SelectValue placeholder="Select Type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="uplink">Uplink</SelectItem>
                      <SelectItem value="downline">Downline</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Name <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter profile name"
                      {...field}
                      data-testid="profile-name-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Phone Number <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="+91 9876543210"
                      {...field}
                      data-testid="profile-phone-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      {...field}
                      data-testid="profile-email-input"
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
                      data-testid="profile-rate-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchType === "downline" && (
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
                        data-testid="profile-commission-input"
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
                      data-testid="profile-notes-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                data-testid="profile-cancel-button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
                data-testid="profile-submit-button"
              >
                {isSubmitting ? "Saving..." : isEditing ? "Update Profile" : "Save Profile"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
