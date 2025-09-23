import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TrendingUp, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from '@/config/axiosInstance';
import { API } from '@/config/apiEndpoints';
import { useError } from '@/hooks/useError';

const loginValidationSchema = Yup.object({
  email: Yup.string().email("Valid email is required").required("Email is required"),
  password: Yup.string().required("Password is required"),
});

type LoginForm = { email: string; password: string };

export default function Login() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const { handleApi, success } = useError();

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: loginValidationSchema,
    onSubmit: async (values: LoginForm) => {
      setIsLoading(true);
      try {
        const response = await axios.post(API.LOGIN, values);
        if (response.data.success === false) {
          handleApi({ response: { status: 422, data: { message: response.data.message || 'Login failed.' } } });
          return;
        }
        success(response.data.message || "Welcome back to Bookie System!", "Login Successful");
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("user", JSON.stringify(response.data.data));
        setLocation("/dashboard");
      } catch (err: any) {
        handleApi(err);
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4" data-testid="login-page">
      <div className="w-full max-w-md">
        {/* Back to Landing */}
        <Button
          variant="ghost"
          onClick={() => setLocation("/")}
          className="mb-6 text-muted-foreground hover:text-foreground"
          data-testid="back-to-landing-button"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <Card className="border-border/50 shadow-xl" data-testid="login-card">
          <CardHeader className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-primary">Bookie System</h1>
            </div>
            <CardTitle className="text-2xl" data-testid="login-title">
              Welcome Back
            </CardTitle>
            <p className="text-muted-foreground" data-testid="login-description">
              Sign in to access your inventory management system
            </p>
          </CardHeader>

          <CardContent>
              <form onSubmit={formik.handleSubmit} className="space-y-4">

                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    {...formik.getFieldProps("email")}
                    data-testid="email-input"
                  />
                  {formik.touched.email && formik.errors.email ? (
                    <p className="text-sm text-destructive mt-1">{formik.errors.email}</p>
                  ) : null}
                </div>

                <div>
                  <Label>Password</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      {...formik.getFieldProps("password")}
                      data-testid="password-input"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      data-testid="toggle-password-button"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {formik.touched.password && formik.errors.password ? (
                    <p className="text-sm text-destructive mt-1">{formik.errors.password}</p>
                  ) : null}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                  data-testid="login-submit-button"
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border/50" data-testid="demo-credentials">
              <h4 className="font-medium text-sm mb-2">Demo Credentials:</h4>
              <div className="text-xs space-y-1 text-muted-foreground">
                <div><strong>Bookie:</strong> admin@mail.com / 123456</div>
                <div><strong>Assistant:</strong> assistant / assistant123</div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Need help? Contact your system administrator
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}