import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  icon: LucideIcon;
  variant?: "default" | "positive" | "negative";
  onIconClick?: () => void;
}

export function StatCard({ title, value, change, icon: Icon, variant = "default", onIconClick }: StatCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "positive":
        return "border-green-500/30 bg-green-500/5";
      case "negative":
        return "border-red-500/30 bg-red-500/5";
      default:
        return "border-primary/30 bg-primary/5";
    }
  };

  const getChangeColor = () => {
    if (!change) return "";
    if (change.startsWith("+")) return "text-green-400";
    if (change.startsWith("-")) return "text-red-400";
    return "text-muted-foreground";
  };

  return (
    <Card className={`bg-gradient-card border ${getVariantStyles()} shadow-card hover:shadow-elevated transition-all duration-300 animate-fadeIn`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {onIconClick ? (
          <button
            onClick={onIconClick}
            aria-label="Abrir atalhos"
            className="p-1 rounded-md border border-primary/30 hover:bg-primary/10 text-primary"
          >
            <Icon className="h-4 w-4" />
          </button>
        ) : (
          <Icon className="h-4 w-4 text-primary" />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground mb-1">
          {value}
        </div>
        {change && (
          <p className={`text-xs ${getChangeColor()}`}>
            {change} em relação ao mês anterior
          </p>
        )}
      </CardContent>
    </Card>
  );
}
