import { Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useError } from "@/hooks/useError";
import { logout } from "@/utils/logout";

interface MobileHeaderProps {
  onMenuClick: () => void;
}

export default function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  const { success } = useError();
  
  const handleLogout = async () => {
    // Show success message before logout
    success("You have been logged out successfully!", "Logout");
    
    // Perform logout (clears storage and redirects)
    await logout();
  };

  return (
    <div className="md:hidden bg-card border-b border-border p-4 flex items-center justify-between">
      <h1 className="text-lg font-semibold" data-testid="mobile-header-title">
        Bookie Inventory
      </h1>
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          data-testid="mobile-logout-button"
          title="Logout"
        >
          <LogOut className="h-5 w-5 text-muted-foreground" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          data-testid="mobile-menu-button"
        >
          <Menu className="h-5 w-5 text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
}
