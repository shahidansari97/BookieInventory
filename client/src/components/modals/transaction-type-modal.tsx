import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axios from "@/config/axiosInstance";
import { API } from "@/config/apiEndpoints";
import { useError } from "@/hooks/useError";

interface TransactionTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void; // Callback to refresh list
  type?: any | null;
}

interface TransactionTypeFormData {
  id?: string;
  name: string;
  title: string;
  status: boolean;
}

const createValidationSchema = Yup.object({
  name: Yup.string().required("Name is required").min(2, "Name must be at least 2 characters"),
  title: Yup.string().required("Title is required").min(2, "Title must be at least 2 characters"),
  status: Yup.boolean().required("Status is required"),
});

const updateValidationSchema = Yup.object({
  id: Yup.string().required("ID is required for update"),
  name: Yup.string().required("Name is required").min(2, "Name must be at least 2 characters"),
  title: Yup.string().required("Title is required").min(2, "Title must be at least 2 characters"),
  status: Yup.boolean().required("Status is required"),
});

export default function TransactionTypeModal({ isOpen, onClose, onSubmit, type }: TransactionTypeModalProps) {
  const { handleApi, success } = useError();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!type;

  const formik = useFormik({
    initialValues: {
      id: "",
      name: "",
      title: "",
      status: true,
    },
    validationSchema: isEditing ? updateValidationSchema : createValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values: TransactionTypeFormData) => {
      setIsSubmitting(true);
      try {
        const normalized: TransactionTypeFormData = {
          ...values,
          status: values.status === true,
        };

        let response;
        if (isEditing) {
          response = await axios.post(API.TRANSACTION_TYPE_UPDATE, normalized);
        } else {
          const { id: _omitId, ...createPayload } = normalized;
          response = await axios.post(API.TRANSACTION_TYPE_CREATE, createPayload);
        }

        if (response.data.success) {
          success(isEditing ? "Transaction type updated successfully!" : "Transaction type created successfully!");
          onClose();
          onSubmit(); // Refresh list
          formik.resetForm();
        } else {
          handleApi({ response: { status: 422, data: { message: response.data.message || `Failed to ${isEditing ? 'update' : 'create'} transaction type` } } });
        }
      } catch (error: any) {
        console.error('Transaction type operation error:', error);
        handleApi(error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (type) {
        formik.setValues({
          id: type.id || "",
          name: type.name || "",
          title: type.title || "",
          status: type.status ?? true,
        });
      } else {
        formik.resetForm();
      }
    }
  }, [isOpen, type]);

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md" data-testid="transaction-type-modal">
        <DialogHeader>
          <DialogTitle data-testid="transaction-type-modal-title">
            {isEditing ? "Edit Transaction Type" : "Add Transaction Type"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input 
              id="name" 
              name="name" 
              value={formik.values.name} 
              onChange={formik.handleChange} 
              onBlur={formik.handleBlur}
              className={formik.touched.name && formik.errors.name ? "border-red-500" : ""}
              placeholder="e.g., UPLINK, DOWNLINE"
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-sm text-destructive">{formik.errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input 
              id="title" 
              name="title" 
              value={formik.values.title} 
              onChange={formik.handleChange} 
              onBlur={formik.handleBlur}
              className={formik.touched.title && formik.errors.title ? "border-red-500" : ""}
              placeholder="e.g., Inventory Taken From Uplink"
            />
            {formik.touched.title && formik.errors.title && (
              <p className="text-sm text-destructive">{formik.errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">
              Status <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formik.values.status ? "true" : "false"}
              onValueChange={(value) => formik.setFieldValue('status', value === "true")}
            >
              <SelectTrigger className={formik.touched.status && formik.errors.status ? "border-red-500" : ""}>
                <SelectValue placeholder="Select status" />
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

          <div className="flex gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1" 
              onClick={handleClose}
              data-testid="transaction-type-cancel-button"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1"
              data-testid="transaction-type-submit-button"
            >
              {isSubmitting ? "Saving..." : isEditing ? "Update Type" : "Create Type"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}


