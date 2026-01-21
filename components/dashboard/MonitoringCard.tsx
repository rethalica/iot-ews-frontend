import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface MonitoringCardProps {
  title: string;
  value: string | number;
  unit: string;
  icon: LucideIcon;
  statusColor?: string;
}

export function MonitoringCard({
  title,
  value,
  unit,
  icon: Icon,
  statusColor = "text-blue-500",
}: MonitoringCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-5 w-5 ${statusColor}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {value}
          <span className="ml-1 text-sm font-normal text-muted-foreground">
            {unit}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
