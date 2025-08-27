import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Sidebar from "@/components/layout/sidebar";
import MobileHeader from "@/components/layout/mobile-header";
import NotFound from "@/pages/not-found";

// Import all pages
import Dashboard from "@/pages/dashboard";
import Profiles from "@/pages/profiles";
import Transactions from "@/pages/transactions";
import Ledger from "@/pages/ledger";
import Settlement from "@/pages/settlement";
import Reports from "@/pages/reports";
import Users from "@/pages/users";
import Audit from "@/pages/audit";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/profiles" component={Profiles} />
      <Route path="/transactions" component={Transactions} />
      <Route path="/ledger" component={Ledger} />
      <Route path="/settlement" component={Settlement} />
      <Route path="/reports" component={Reports} />
      <Route path="/users" component={Users} />
      <Route path="/audit" component={Audit} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <div className="min-h-screen bg-background text-foreground">
          {/* Mobile Header */}
          <MobileHeader onMenuClick={handleToggleSidebar} />

          <div className="flex">
            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />

            {/* Main Content */}
            <main className="flex-1 md:ml-0 min-h-screen">
              <Router />
            </main>
          </div>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
