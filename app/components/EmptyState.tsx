import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-12 text-center animate-fade-in">
      <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 animate-scale-in">
        <Icon className="h-10 w-10 text-primary" />
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">{description}</p>
      {action && <div className="animate-slide-in-bottom">{action}</div>}
    </div>
  );
}
