import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  unit?: string;
  className?: string;
}

export function MetricCard({
  icon: Icon,
  label,
  value,
  unit,
  className,
}: MetricCardProps) {
  return (
    <Card
      className={cn(
        "rounded-lg border-border shadow-[var(--shadow-xs)] transition-shadow hover:shadow-[var(--shadow-sm)]",
        className
      )}
    >
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
          <Icon className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="font-mono text-xl font-semibold leading-tight text-foreground">
            {value}
            {unit && (
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                {unit}
              </span>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
