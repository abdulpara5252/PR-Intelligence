import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ErrorCardProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorCard({
  message = "Something went wrong while loading data.",
  onRetry,
}: ErrorCardProps) {
  return (
    <Card className="rounded-sm border-destructive/30">
      <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
        <AlertCircle className="size-8 text-destructive" />
        <p className="text-sm text-muted-foreground">{message}</p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Retry
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
