import { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import { type InsertProfile, type Profile } from "@shared/schema";
import axios from '@/config/axiosInstance';
import { API } from '@/config/apiEndpoints';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: InsertProfile) => void;
  profile?: Profile | null;
}

// Transaction type interface
interface TransactionType {
  id: string;
  name: string;
}

// Form validation schema using Yup
const profileValidationSchema = Yup.object({
  transactionTypeId: Yup.string().required("Transaction type is required"),
  name: Yup.string().required("Name is required").min(2, "Name must be at least 2 characters"),
  phone: Yup.string()
    .required("Phone number is required")
    .matches(/^[0-9+\-\s()]+$/, "Please enter a valid phone number")
    .min(10, "Phone number must be at least 10 digits"),
  email: Yup.string().email("Please enter a valid email address").optional(),
  ratePerPoint: Yup.string()
    .required("Rate per point is required")
    .matches(/^\d+(\.\d{1,2})?$/, "Please enter a valid rate (e.g., 1.50)"),
  commissionPercentage: Yup.string()
    .optional()
    .matches(/^\d+(\.\d{1,2})?$/, "Please enter a valid percentage (e.g., 5.00)")
    .test('max-value', 'Commission cannot exceed 100%', function(value: any) {
      if (!value) return true;
      return parseFloat(value) <= 100;
    }),
  notes: Yup.string().optional(),
});

export default function ProfileModal({
  isOpen,
  onClose,
  onSubmit,
  profile,
}: ProfileModalProps) {
  const isEditing = !!profile;

  // Fetch transaction types from your API
  const { data: transactionTypes = [], isLoading: isLoadingTypes } = useQuery<TransactionType[]>({
    queryKey: ['transaction-types'],
    queryFn: async () => {
      const response = await axios.get(API.TRANSACTION_TYPES);
      return response.data.data || response.data;
    },
    enabled: isOpen,
  });

  const formik = useFormik({
    initialValues: {
      transactionTypeId: "",
      name: "",
      phone: "",
      email: "",
      ratePerPoint: "",
      commissionPercentage: "",
      notes: "",
    },
    validationSchema: profileValidationSchema,
    onSubmit: async (values) => {
      try {
        // Convert form data to InsertProfile format
        const profileData: InsertProfile = {
          type: "uplink", // Default type since we removed the type field
          name: values.name,
          phone: values.phone,
          email: values.email || undefined,
          ratePerPoint: parseFloat(values.ratePerPoint),
          commissionPercentage: values.commissionPercentage ? parseFloat(values.commissionPercentage) : undefined,
          notes: values.notes || null,
          // Add transactionTypeId if your schema supports it
          ...(values.transactionTypeId && { transactionTypeId: values.transactionTypeId }),
        };
        
        onSubmit(profileData);
        onClose();
      } catch (error) {
        console.error("Error submitting profile:", error);
      }
    },
  });

  useEffect(() => {
    if (profile) {
      formik.setValues({
        transactionTypeId: (profile as any).transactionTypeId || "",
        name: profile.name,
        phone: profile.phone,
        email: profile.email || "",
        ratePerPoint: profile.ratePerPoint.toString(),
        commissionPercentage: profile.commissionPercentage?.toString() || "",
        notes: profile.notes || "",
      });
    } else {
      formik.resetForm();
    }
  }, [profile]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" data-testid="profile-modal">
        <DialogHeader>
          <DialogTitle data-testid="profile-modal-title">
            {isEditing ? "Edit Profile" : "Add Profile"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          {/* Transaction Types Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="transactionTypeId">
              Transaction Type <span className="text-destructive">*</span>
            </Label>
            <Select 
              onValueChange={(value) => formik.setFieldValue("transactionTypeId", value)}
              value={formik.values.transactionTypeId}
            >
              <SelectTrigger data-testid="profile-transaction-type-select">
                <SelectValue placeholder={isLoadingTypes ? "Loading..." : "Select Transaction Type"} />
              </SelectTrigger>
              <SelectContent>
                {transactionTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formik.touched.transactionTypeId && formik.errors.transactionTypeId && (
              <p className="text-sm text-destructive">{formik.errors.transactionTypeId}</p>
            )}
          </div>

          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter profile name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              data-testid="profile-name-input"
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-sm text-destructive">{formik.errors.name}</p>
            )}
          </div>

          {/* Phone Field */}
          <div className="space-y-2">
            <Label htmlFor="phone">
              Phone Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phone"
              name="phone"
              placeholder="+91 9876543210"
              value={formik.values.phone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              data-testid="profile-phone-input"
            />
            {formik.touched.phone && formik.errors.phone && (
              <p className="text-sm text-destructive">{formik.errors.phone}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="email@example.com"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              data-testid="profile-email-input"
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-sm text-destructive">{formik.errors.email}</p>
            )}
          </div>

          {/* Rate per Point Field */}
          <div className="space-y-2">
            <Label htmlFor="ratePerPoint">
              Rate per Point <span className="text-destructive">*</span>
            </Label>
            <Input
              id="ratePerPoint"
              name="ratePerPoint"
              type="number"
              step="0.01"
              placeholder="1.50"
              value={formik.values.ratePerPoint}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              data-testid="profile-rate-input"
            />
            {formik.touched.ratePerPoint && formik.errors.ratePerPoint && (
              <p className="text-sm text-destructive">{formik.errors.ratePerPoint}</p>
            )}
          </div>

          {/* Commission Percentage Field */}
          <div className="space-y-2">
            <Label htmlFor="commissionPercentage">Commission Percentage</Label>
            <Input
              id="commissionPercentage"
              name="commissionPercentage"
              type="number"
              step="0.01"
              min="0"
              max="100"
              placeholder="5.00"
              value={formik.values.commissionPercentage}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              data-testid="profile-commission-input"
            />
            {formik.touched.commissionPercentage && formik.errors.commissionPercentage && (
              <p className="text-sm text-destructive">{formik.errors.commissionPercentage}</p>
            )}
          </div>

          {/* Notes Field */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              rows={3}
              placeholder="Optional notes..."
              value={formik.values.notes}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              data-testid="profile-notes-input"
            />
            {formik.touched.notes && formik.errors.notes && (
              <p className="text-sm text-destructive">{formik.errors.notes}</p>
            )}
          </div>

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
              disabled={formik.isSubmitting}
              className="flex-1"
              data-testid="profile-submit-button"
            >
              {formik.isSubmitting ? "Saving..." : isEditing ? "Update Profile" : "Save Profile"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
