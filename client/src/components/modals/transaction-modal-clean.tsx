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
import { Card, CardContent } from "@/components/ui/card";
import axios from '@/config/axiosInstance';
import { API } from '@/config/apiEndpoints';
import { useError } from '@/hooks/useError';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

// Transaction type interface
interface TransactionType {
  id: string;
  name: string;
}

// Profile interface
interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string;
  country_code: string;
  transactionType: string;
}

// Form values interface - matches your curl API exactly
interface TransactionFormValues {
  transactionTypeId: string;
  profileId: string;
  toProfileId: string; // For DOWNLINE transactions
  toUserId: string | null; // Will be null for UPLINK, profileId for DOWNLINE
  date: string;
  amount: number; // Changed from points to amount
  ratePerPoint: number;
  notes: string;
  status: boolean;
  paymentStatus: boolean;
}

// Validation schema - matches your curl API exactly
const transactionValidationSchema = Yup.object({
  transactionTypeId: Yup.string()
    .required("Transaction type is required")
    .min(1, "Please select a transaction type"),
  profileId: Yup.string()
    .required("Profile is required")
    .min(1, "Please select a profile"),
  toProfileId: Yup.string().when('transactionTypeId', {
    is: (transactionTypeId: string) => {
      // Check if this is a DOWNLINE transaction type
      return transactionTypeId && transactionTypeId !== '';
    },
    then: (schema: any) => schema.required("To Profile is required for DOWNLINE transactions"),
    otherwise: (schema: any) => schema.optional(),
  }),
  toUserId: Yup.string().nullable(),
  date: Yup.string()
    .required("Date is required")
    .matches(/^\d{2}-\d{2}-\d{2}$/, "Date must be in DD-MM-YY format"),
  amount: Yup.number()
    .required("Amount is required")
    .min(1, "Amount must be at least 1")
    .max(99999999999, "Amount cannot exceed 99,999,999,999")
    .integer("Amount must be a whole number"),
  ratePerPoint: Yup.number()
    .required("Rate per point is required")
    .min(0.01, "Rate must be at least 0.01")
    .max(999999, "Rate cannot exceed 999,999"),
  notes: Yup.string()
    .max(500, "Notes cannot exceed 500 characters")
    .optional(),
  status: Yup.boolean()
    .required("Status is required"),
  paymentStatus: Yup.boolean()
    .required("Payment status is required"),
});

export default function TransactionModal({
  isOpen,
  onClose,
  onSubmit,
}: TransactionModalProps) {
  const { handleApi, success } = useError();

  const formik = useFormik({
    initialValues: {
      transactionTypeId: "",
      profileId: "",
      toProfileId: "",
      toUserId: null,
      date: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'), // DD-MM-YY format
      amount: 0,
      ratePerPoint: 0,
      notes: "",
      status: true,
      paymentStatus: true,
    },
    enableReinitialize: true,
    validationSchema: transactionValidationSchema,
    onSubmit: async (values: TransactionFormValues) => {
      try {
        // Determine toUserId based on transaction type
        const selectedTransactionType = transactionTypes.find(t => t.id === values.transactionTypeId);
        const isDownlineTransaction = selectedTransactionType?.name === 'DOWNLINE';
        
        // Prepare payload exactly matching your curl API
        const payload = {
          transactionTypeId: values.transactionTypeId,
          profileId: values.profileId,
          toUserId: isDownlineTransaction ? values.toProfileId : null,
          amount: values.amount,
          ratePerPoint: values.ratePerPoint,
          notes: values.notes,
          date: values.date,
          status: values.status,
          paymentStatus: values.paymentStatus,
        };

        console.log('Transaction API Payload:', JSON.stringify(payload, null, 2));
        
        const response = await axios.post(API.TRANSACTION_CREATE, payload);

        if (response.data.success === false) {
          handleApi(new Error(response.data.message || 'Transaction creation failed.'));
          return;
        }

        success(response.data.message || "Transaction created successfully!", "Transaction Created");
        
        // Call parent onSubmit callback
        onSubmit(payload);
        
        // Close modal after successful API call
        onClose();
      } catch (error) {
        console.error('Transaction creation error:', error);
        handleApi(error);
      }
    },
  });

  // Fetch transaction types
  const { data: transactionTypes = [], isLoading: isLoadingTypes } = useQuery<TransactionType[]>({
    queryKey: ['transaction-types'],
    queryFn: async () => {
      const response = await axios.get(API.TRANSACTION_TYPES);
      return response.data.data || response.data;
    },
    enabled: isOpen,
  });

  // Fetch UPLINK profiles (always needed)
  const { data: uplinkProfiles = [], isLoading: isLoadingUplinkProfiles } = useQuery<Profile[]>({
    queryKey: ['uplink-profiles'],
    queryFn: async () => {
      const uplinkType = transactionTypes.find(t => t.name === 'UPLINK');
      if (!uplinkType) return [];
      
      const response = await axios.post(API.PROFILE_BY_TRANSACTION_TYPE, {
        transactionTypeId: uplinkType.id
      });
      return response.data.data || [];
    },
    enabled: isOpen && transactionTypes.length > 0,
  });

  // Fetch DOWNLINE profiles (only needed for DOWNLINE transactions)
  const { data: downlineProfiles = [], isLoading: isLoadingDownlineProfiles } = useQuery<Profile[]>({
    queryKey: ['downline-profiles'],
    queryFn: async () => {
      const downlineType = transactionTypes.find(t => t.name === 'DOWNLINE');
      if (!downlineType) return [];
      
      const response = await axios.post(API.PROFILE_BY_TRANSACTION_TYPE, {
        transactionTypeId: downlineType.id
      });
      return response.data.data || [];
    },
    enabled: isOpen && transactionTypes.length > 0,
  });

  // Calculate total amount
  const totalAmount = formik.values.amount * formik.values.ratePerPoint;

  // Determine which profiles to show based on transaction type
  const selectedTransactionType = transactionTypes.find(t => t.id === formik.values.transactionTypeId);
  const isDownlineTransaction = selectedTransactionType?.name === 'DOWNLINE';
  const isUplinkTransaction = selectedTransactionType?.name === 'UPLINK';

  // Determine which profiles to show in the first dropdown
  const firstDropdownProfiles = isUplinkTransaction ? uplinkProfiles : 
                                isDownlineTransaction ? uplinkProfiles : [];
  const firstDropdownLoading = isUplinkTransaction ? isLoadingUplinkProfiles : 
                              isDownlineTransaction ? isLoadingUplinkProfiles : false;

  // For DOWNLINE transactions, second dropdown shows DOWNLINE profiles
  const secondDropdownProfiles = isDownlineTransaction ? downlineProfiles : [];
  const secondDropdownLoading = isDownlineTransaction ? isLoadingDownlineProfiles : false;

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      formik.resetForm();
    }
  }, [isOpen]);

  // Reset profile selections when transaction type changes
  useEffect(() => {
    if (formik.values.transactionTypeId) {
      formik.setFieldValue('profileId', '');
      formik.setFieldValue('toProfileId', '');
      formik.setFieldValue('toUserId', null);
    }
  }, [formik.values.transactionTypeId]);

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
        </DialogHeader>

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Transaction Type Dropdown */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="transactionTypeId">
                Transaction Type <span className="text-destructive">*</span>
              </Label>
              {isLoadingTypes ? (
                <div className="flex items-center justify-center p-3 border rounded-md">
                  <div className="text-sm text-muted-foreground">Loading transaction types...</div>
                </div>
              ) : (
                <Select 
                  onValueChange={(value) => formik.setFieldValue("transactionTypeId", value)}
                  value={formik.values.transactionTypeId}
                >
                  <SelectTrigger data-testid="transaction-type-select">
                    <SelectValue placeholder="Select Transaction Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {transactionTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {formik.touched.transactionTypeId && formik.errors.transactionTypeId && (
                <p className="text-sm text-destructive">{formik.errors.transactionTypeId}</p>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="profileId">
                {isDownlineTransaction ? "From Profile (UPLINK)" : "Profile (UPLINK)"} <span className="text-destructive">*</span>
              </Label>
              {firstDropdownLoading ? (
                <div className="flex items-center justify-center p-3 border rounded-md">
                  <div className="text-sm text-muted-foreground">Loading UPLINK profiles...</div>
                </div>
              ) : (
                <Select 
                  onValueChange={(value) => formik.setFieldValue("profileId", value)}
                  value={formik.values.profileId}
                >
                  <SelectTrigger data-testid="transaction-profile-select">
                    <SelectValue placeholder={isDownlineTransaction ? "Select From Profile (UPLINK)" : "Select Profile (UPLINK)"} />
                  </SelectTrigger>
                  <SelectContent>
                    {firstDropdownProfiles.map((profile) => (
                      <SelectItem key={profile.id} value={profile.id}>
                        {profile.name} ({profile.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {formik.touched.profileId && formik.errors.profileId && (
                <p className="text-sm text-destructive">{formik.errors.profileId}</p>
              )}
            </div>

            {/* To Profile Dropdown - Only for DOWNLINE transactions */}
            {isDownlineTransaction && (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="toProfileId">
                  To Profile (DOWNLINE) <span className="text-destructive">*</span>
                </Label>
                {secondDropdownLoading ? (
                  <div className="flex items-center justify-center p-3 border rounded-md">
                    <div className="text-sm text-muted-foreground">Loading DOWNLINE profiles...</div>
                  </div>
                ) : (
                  <Select 
                    onValueChange={(value) => formik.setFieldValue("toProfileId", value)}
                    value={formik.values.toProfileId}
                  >
                    <SelectTrigger data-testid="transaction-to-profile-select">
                      <SelectValue placeholder="Select To Profile (DOWNLINE)" />
                    </SelectTrigger>
                    <SelectContent>
                      {secondDropdownProfiles.map((profile) => (
                        <SelectItem key={profile.id} value={profile.id}>
                          {profile.name} ({profile.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {formik.touched.toProfileId && formik.errors.toProfileId && (
                  <p className="text-sm text-destructive">{formik.errors.toProfileId}</p>
                )}
              </div>
            )}

            {/* Date Field */}
            <div className="space-y-2">
              <Label htmlFor="date">
                Date (DD-MM-YY) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="date"
                name="date"
                type="text"
                placeholder="22-09-25"
                value={formik.values.date}
                onChange={(e) => {
                  // Allow only numbers and dashes, format as DD-MM-YY
                  let value = e.target.value.replace(/[^0-9-]/g, '');
                  if (value.length > 8) value = value.slice(0, 8);
                  if (value.length === 2 && !value.includes('-')) value += '-';
                  if (value.length === 5 && value.split('-').length === 2) value += '-';
                  formik.setFieldValue('date', value);
                }}
                onBlur={formik.handleBlur}
                data-testid="transaction-date-input"
              />
              {formik.touched.date && formik.errors.date && (
                <p className="text-sm text-destructive">{formik.errors.date}</p>
              )}
            </div>

            {/* Amount Field */}
            <div className="space-y-2">
              <Label htmlFor="amount">
                Amount <span className="text-destructive">*</span>
              </Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                min="1"
                max="99999999999"
                step="1"
                placeholder="99999999999"
                value={formik.values.amount || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  formik.setFieldValue('amount', value ? parseInt(value) : 0);
                }}
                onBlur={formik.handleBlur}
                data-testid="transaction-amount-input"
              />
              {formik.touched.amount && formik.errors.amount && (
                <p className="text-sm text-destructive">{formik.errors.amount}</p>
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
                min="0.01"
                max="999999"
                step="0.01"
                placeholder="2"
                value={formik.values.ratePerPoint || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  formik.setFieldValue('ratePerPoint', value ? parseFloat(value) : 0);
                }}
                onBlur={formik.handleBlur}
                data-testid="transaction-rate-input"
              />
              {formik.touched.ratePerPoint && formik.errors.ratePerPoint && (
                <p className="text-sm text-destructive">{formik.errors.ratePerPoint}</p>
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
                data-testid="transaction-notes-input"
              />
              {formik.touched.notes && formik.errors.notes && (
                <p className="text-sm text-destructive">{formik.errors.notes}</p>
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
                <SelectTrigger data-testid="transaction-status-select">
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

            {/* Payment Status Field */}
            <div className="space-y-2">
              <Label htmlFor="paymentStatus">
                Payment Status <span className="text-destructive">*</span>
              </Label>
              <Select 
                onValueChange={(value) => formik.setFieldValue("paymentStatus", value === "true")}
                value={formik.values.paymentStatus.toString()}
              >
                <SelectTrigger data-testid="transaction-payment-status-select">
                  <SelectValue placeholder="Select Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Paid</SelectItem>
                  <SelectItem value="false">Unpaid</SelectItem>
                </SelectContent>
              </Select>
              {formik.touched.paymentStatus && formik.errors.paymentStatus && (
                <p className="text-sm text-destructive">{formik.errors.paymentStatus}</p>
              )}
            </div>

            {/* Total Amount Display */}
            <div className="md:col-span-2">
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <Label className="text-sm font-medium">Total Amount</Label>
                      <p className="text-xs text-muted-foreground">Calculated automatically</p>
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      ₹{totalAmount.toFixed(2)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4 md:col-span-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                data-testid="transaction-cancel-button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={formik.isSubmitting}
                data-testid="transaction-submit-button"
              >
                {formik.isSubmitting ? "Creating..." : "Create Transaction"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
