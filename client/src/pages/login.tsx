import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TrendingUp, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const handleLogin = async (data: LoginForm) => {
    setIsLoading(true);
    setError("");

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Demo credentials check
      if (data.username === "admin" && data.password === "admin123") {
        toast({
          title: "Login Successful",
          description: "Welcome back to Bookie System!",
        });
        
        // Store login state (in a real app, you'd handle this properly)
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userRole", "bookie");
        localStorage.setItem("username", data.username);
        
        setLocation("/dashboard");
      } else if (data.username === "assistant" && data.password === "assistant123") {
        toast({
          title: "Login Successful",
          description: "Welcome back to Bookie System!",
        });
        
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userRole", "assistant");
        localStorage.setItem("username", data.username);
        
        setLocation("/dashboard");
      } else {
        setError("Invalid username or password");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4">
                {error && (
                  <Alert variant="destructive" data-testid="login-error">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your username"
                          {...field}
                          data-testid="username-input"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            {...field}
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
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                  data-testid="login-submit-button"
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            </Form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border/50" data-testid="demo-credentials">
              <h4 className="font-medium text-sm mb-2">Demo Credentials:</h4>
              <div className="text-xs space-y-1 text-muted-foreground">
                <div><strong>Bookie:</strong> admin / admin123</div>
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