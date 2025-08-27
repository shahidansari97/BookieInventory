import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  valueColor?: string;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  iconColor,
  iconBgColor,
  valueColor = "text-primary",
}: StatCardProps) {
  return (
    <Card data-testid={`stat-card-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground" data-testid="stat-title">
              {title}
            </p>
            <p className={`text-2xl font-bold ${valueColor}`} data-testid="stat-value">
              {value}
            </p>
          </div>
          <div className={`${iconBgColor} p-3 rounded-full`}>
            <Icon className={`${iconColor} h-5 w-5`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
