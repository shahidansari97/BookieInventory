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
import { useError } from '@/hooks/useError';

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

// Form values interface
interface ProfileFormValues {
  transactionTypeId: string;
  name: string;
  phone: string;
  email: string;
  countryCode: string;
  notes: string;
  status: boolean;
}

// Form validation schema using Yup
const profileValidationSchema = Yup.object({
  transactionTypeId: Yup.string().required("Transaction type is required"),
  name: Yup.string().required("Name is required").min(2, "Name must be at least 2 characters"),
  phone: Yup.string()
    .required("Phone number is required")
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must not exceed 15 digits"),
  email: Yup.string().email("Please enter a valid email address").optional(),
  countryCode: Yup.string().required("Country code is required"),
  notes: Yup.string().optional(),
  status: Yup.boolean().required("Status is required"),
});

export default function ProfileModal({
  isOpen,
  onClose,
  onSubmit,
  profile,
}: ProfileModalProps) {
  const isEditing = !!profile;
  const { handleApi, success } = useError();

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
      countryCode: "+91",
      notes: "",
      status: true,
    },
    enableReinitialize: true,
    validationSchema: profileValidationSchema,
    onSubmit: async (values: ProfileFormValues) => {
      try {
        // Call your profile creation API exactly like your curl
        const response = await axios.post(API.PROFILE_CREATE, {
          transactionTypeId: values.transactionTypeId,
          name: values.name,
          email: values.email,
          country_code: values.countryCode,
          phone: values.phone, // Send phone as separate field
          notes: values.notes,
          status: values.status,
        });

        if (response.data.success === false) {
          handleApi(new Error(response.data.message || 'Profile creation failed.'));
          return;
        }

        success(response.data.message || "Profile created successfully!", "Profile Created");
        
        // Close modal after successful API call
        onClose();
      } catch (error) {
        handleApi(error);
      }
    },
  });

  // Handle form initialization when profile changes
  useEffect(() => {
    if (profile) {
      formik.setValues({
        transactionTypeId: (profile as any).transactionTypeId || "",
        name: profile.name,
        phone: profile.phone,
        email: profile.email || "",
        countryCode: "+91",
        notes: profile.notes || "",
        status: true,
      });
    } else if (isOpen) {
      // Reset form when opening for new profile
      formik.resetForm();
    }
  }, [profile, isOpen]); // Only depend on profile and isOpen

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl" data-testid="profile-modal">
        <DialogHeader>
          <DialogTitle data-testid="profile-modal-title">
            {isEditing ? "Edit Profile" : "Add Profile"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={formik.handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Transaction Types Dropdown */}
          <div className="space-y-2 md:col-span-2">
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

          {/* Country Code Field */}
          <div className="space-y-2">
            <Label htmlFor="countryCode">
              Country Code <span className="text-destructive">*</span>
            </Label>
            <Input
              id="countryCode"
              name="countryCode"
              placeholder="+91"
              value={formik.values.countryCode}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              data-testid="profile-country-code-input"
            />
            {formik.touched.countryCode && formik.errors.countryCode && (
              <p className="text-sm text-destructive">{formik.errors.countryCode}</p>
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
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="9854784784"
              value={formik.values.phone}
              onChange={(e) => {
                // Only allow numeric input
                const value = e.target.value.replace(/[^0-9]/g, '');
                formik.setFieldValue('phone', value);
              }}
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

          {/* Status Field */}
          <div className="space-y-2">
            <Label htmlFor="status">
              Status <span className="text-destructive">*</span>
            </Label>
            <Select 
              onValueChange={(value) => formik.setFieldValue("status", value === "true")}
              value={formik.values.status.toString()}
            >
              <SelectTrigger data-testid="profile-status-select">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
            {formik.touched.status && formik.errors.status && (
              <p className="text-sm text-destructive">{formik.errors.status}</p>
            )}
          </div>

          {/* Notes Field */}
          <div className="space-y-2 md:col-span-2">
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

          <div className="flex space-x-3 pt-4 md:col-span-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
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
