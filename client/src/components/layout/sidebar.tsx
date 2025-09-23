import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  ArrowLeftRight,
  Calculator,
  Send,
  BarChart3,
  UserCog,
  History,
  LogOut,
} from "lucide-react";
import { useError } from "@/hooks/useError";
import { logout } from "@/utils/logout";

const navigationItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/profiles", label: "Profiles", icon: Users },
  { path: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { path: "/ledger", label: "Ledger", icon: Calculator },
  { path: "/settlement", label: "Settlement", icon: Send },
  { path: "/reports", label: "Reports", icon: BarChart3 },
  { path: "/users", label: "Users", icon: UserCog },
  { path: "/audit", label: "Audit Trail", icon: History },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location, setLocation] = useLocation();
  const { success } = useError();
  const [userInfo, setUserInfo] = useState<any | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        setUserInfo(JSON.parse(stored));
      }
    } catch {
      setUserInfo(null);
    }
  }, []);
  
  const handleLogout = async () => {
    // Show success message before logout
    success("You have been logged out successfully!", "Logout");
    
    // Close sidebar
    onClose();
    
    // Perform logout (clears storage and redirects)
    await logout();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
          data-testid="sidebar-overlay"
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border shadow-lg md:shadow-none transition-transform duration-300 flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
        data-testid="sidebar"
      >
        <div className="p-4 border-b border-border hidden md:block">
          <h1 className="text-xl font-bold text-primary" data-testid="sidebar-title">
            Bookie System
          </h1>
        </div>
        
        <nav className="p-4 space-y-2 flex flex-col h-full">
          {navigationItems
            .filter((item) => {
              // Only show Users menu for role = 1 (admin)
              if (item.path === "/users") {
                return userInfo?.role === 1 || userInfo?.role === "1";
              }
              return true;
            })
            .map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={onClose}
                data-testid={`nav-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                className={cn(
                  "flex items-center space-x-3 p-3 rounded-lg transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          
          {/* Logout Button */}
          <div className="mt-auto pt-4 border-t border-border">
            {userInfo && (
              <div className="px-3 pb-3 text-sm text-muted-foreground">
                <div className="font-medium text-foreground truncate" data-testid="sidebar-user-name">
                  {userInfo.name || userInfo.fullName || userInfo.username || userInfo.profile?.name || "User"}
                </div>
                {userInfo.email && (
                  <div className="truncate" data-testid="sidebar-user-email">{userInfo.email}</div>
                )}
              </div>
            )}
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted"
              data-testid="logout-button"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </Button>
          </div>
        </nav>
      </aside>
    </>
  );
}
