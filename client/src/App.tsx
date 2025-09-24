import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/ErrorBoundary";
import Sidebar from "@/components/layout/sidebar";
import MobileHeader from "@/components/layout/mobile-header";
import NotFound from "@/pages/not-found";
import { initializeGlobalErrorHandlers } from "@/utils/globalErrorHandler";

// Import all pages
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Profiles from "@/pages/profiles";
import Transactions from "@/pages/transactions";
import TransactionTypesPage from "@/pages/transaction-types";
import Ledger from "@/pages/ledger";
import Settlement from "@/pages/settlement";
import Reports from "@/pages/reports";
import Users from "@/pages/users";
import Audit from "@/pages/audit";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const [, setLocation] = useLocation();
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  useEffect(() => {
    if (!isLoggedIn) {
      setLocation("/login");
    }
  }, [isLoggedIn, setLocation]);

  if (!isLoggedIn) {
    return null;
  }

  return <Component />;
}

function AuthenticatedApp() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Mobile Header */}
      <MobileHeader onMenuClick={handleToggleSidebar} />

      <div className="flex">
        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />

        {/* Main Content */}
        <main className="flex-1 md:ml-0 min-h-screen">
          <Switch>
            <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
            <Route path="/profiles" component={() => <ProtectedRoute component={Profiles} />} />
            <Route path="/transactions" component={() => <ProtectedRoute component={Transactions} />} />
            <Route path="/transaction-types" component={() => <ProtectedRoute component={TransactionTypesPage} />} />
            <Route path="/ledger" component={() => <ProtectedRoute component={Ledger} />} />
            <Route path="/settlement" component={() => <ProtectedRoute component={Settlement} />} />
            <Route path="/reports" component={() => <ProtectedRoute component={Reports} />} />
            <Route path="/users" component={() => <ProtectedRoute component={Users} />} />
            <Route path="/audit" component={() => <ProtectedRoute component={Audit} />} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/dashboard" component={AuthenticatedApp} />
      <Route path="/profiles" component={AuthenticatedApp} />
      <Route path="/transactions" component={AuthenticatedApp} />
      <Route path="/transaction-types" component={AuthenticatedApp} />
      <Route path="/ledger" component={AuthenticatedApp} />
      <Route path="/settlement" component={AuthenticatedApp} />
      <Route path="/reports" component={AuthenticatedApp} />
      <Route path="/users" component={AuthenticatedApp} />
      <Route path="/audit" component={AuthenticatedApp} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    // Initialize global error handlers
    initializeGlobalErrorHandlers();
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
