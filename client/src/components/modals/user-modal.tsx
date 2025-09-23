import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
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
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useError } from "@/hooks/useError";
import axios from "@/config/axiosInstance";
import { API } from "@/config/apiEndpoints";

interface UserFormData {
  id?: string;
  name: string;
  email: string;
  password: string;
  country_code: string;
  phone: string;
  status?: boolean;
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => void;
  user?: any | null;
}

const createValidationSchema = Yup.object({
  name: Yup.string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  country_code: Yup.string()
    .required("Country code is required"),
  phone: Yup.string()
    .required("Phone number is required")
    .matches(/^[0-9]{10,15}$/, "Phone number must be 10-15 digits"),
});

const updateValidationSchema = Yup.object({
  name: Yup.string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .optional(),
  country_code: Yup.string()
    .required("Country code is required"),
  phone: Yup.string()
    .required("Phone number is required")
    .matches(/^[0-9]{10,15}$/, "Phone number must be 10-15 digits"),
  status: Yup.boolean()
    .required("Status is required"),
});

export default function UserModal({
  isOpen,
  onClose,
  user,
}: UserModalProps) {
  const { handleApi, success, handle } = useError();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!user;

  const formik = useFormik({
    initialValues: {
      id: "",
      name: "",
      email: "",
      password: "",
      country_code: "+91",
      phone: "",
      status: true,
    },
    validationSchema: isEditing ? updateValidationSchema : createValidationSchema,
    onSubmit: async (values: UserFormData) => {
      setIsSubmitting(true);
      try {
        console.log('Submitting user data:', values);
        
        let payload = { ...values };
        
        // For updates, remove password if empty
        if (isEditing && (!payload.password || payload.password === "")) {
          const { password, ...dataWithoutPassword } = payload;
          payload = dataWithoutPassword as UserFormData;
        }
        
        let response;
        if (isEditing) {
          // Update user
          response = await axios.post(API.USER_UPDATE, payload);
          console.log('User update response:', response.data);
        } else {
          // Create user
          response = await axios.post(API.USER_REGISTER, payload);
          console.log('User registration response:', response.data);
        }
        
        if (response.data.success) {
          const action = isEditing ? 'updated' : 'created';
          success(response.data.message || `User ${action} successfully!`);
          onClose();
          formik.resetForm();
        } else {
          // Backend returns success=false with 200; surface its message using API-style error
          handleApi({ response: { status: 422, data: { message: response.data.message } } });
        }
      } catch (error: any) {
        console.error('User operation error:', error);
        handleApi(error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} user`);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // Reset form when modal opens/closes or when switching between add/edit modes
  useEffect(() => {
    if (isOpen) {
      if (user) {
        formik.setValues({
          id: user.id || "",
          name: user.name || "",
          email: user.email || "",
          password: "",
          country_code: user.country_code || "+91",
          phone: user.phone || "",
          status: user.status || false,
        });
      } else {
        formik.resetForm();
      }
    }
  }, [isOpen, user]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    formik.setFieldValue('phone', value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" data-testid="user-modal">
        <DialogHeader>
          <DialogTitle data-testid="user-modal-title">
            {isEditing ? "Edit User" : "Add User"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          {/* Two-column grid layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter full name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={formik.touched.name && formik.errors.name ? "border-red-500" : ""}
                data-testid="user-name-input"
              />
              {formik.touched.name && formik.errors.name && (
                <p className="text-sm text-red-500">{formik.errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="user@example.com"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={formik.touched.email && formik.errors.email ? "border-red-500" : ""}
                data-testid="user-email-input"
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-sm text-red-500">{formik.errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">
                Password {!isEditing && <span className="text-destructive">*</span>}
                {isEditing && <span className="text-muted-foreground text-sm"> (Leave blank to keep current)</span>}
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder={isEditing ? "Leave blank to keep current password" : "Min 6 characters"}
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={formik.touched.password && formik.errors.password ? "border-red-500" : ""}
                data-testid="user-password-input"
              />
              {formik.touched.password && formik.errors.password && (
                <p className="text-sm text-red-500">{formik.errors.password}</p>
              )}
            </div>

            {/* Country Code */}
            <div className="space-y-2">
              <Label htmlFor="country_code">
                Country Code <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formik.values.country_code}
                onValueChange={(value) => formik.setFieldValue('country_code', value)}
              >
                <SelectTrigger className={formik.touched.country_code && formik.errors.country_code ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select country code" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="+91">+91 (India)</SelectItem>
                  <SelectItem value="+1">+1 (USA)</SelectItem>
                  <SelectItem value="+44">+44 (UK)</SelectItem>
                  <SelectItem value="+61">+61 (Australia)</SelectItem>
                  <SelectItem value="+971">+971 (UAE)</SelectItem>
                </SelectContent>
              </Select>
              {formik.touched.country_code && formik.errors.country_code && (
                <p className="text-sm text-red-500">{formik.errors.country_code}</p>
              )}
            </div>
          </div>

          {/* Phone - spans both columns */}
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
              placeholder="Enter phone number (10-15 digits)"
              value={formik.values.phone}
              onChange={handlePhoneChange}
              onBlur={formik.handleBlur}
              className={formik.touched.phone && formik.errors.phone ? "border-red-500" : ""}
              data-testid="user-phone-input"
            />
            {formik.touched.phone && formik.errors.phone && (
              <p className="text-sm text-red-500">{formik.errors.phone}</p>
            )}
          </div>

          {/* Status - only show for editing */}
          {isEditing && (
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
                <p className="text-sm text-red-500">{formik.errors.status}</p>
              )}
            </div>
          )}

          {/* Action buttons - span both columns */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              data-testid="user-cancel-button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formik.isValid}
              className="flex-1"
              data-testid="user-submit-button"
            >
              {isSubmitting ? "Creating..." : isEditing ? "Update User" : "Create User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}