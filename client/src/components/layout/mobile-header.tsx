import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileHeaderProps {
  onMenuClick: () => void;
}

export default function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  return (
    <div className="md:hidden bg-card border-b border-border p-4 flex items-center justify-between">
      <h1 className="text-lg font-semibold" data-testid="mobile-header-title">
        Bookie Inventory
      </h1>
      <Button
        variant="ghost"
        size="icon"
        onClick={onMenuClick}
        data-testid="mobile-menu-button"
      >
        <Menu className="h-5 w-5 text-muted-foreground" />
      </Button>
    </div>
  );
}
