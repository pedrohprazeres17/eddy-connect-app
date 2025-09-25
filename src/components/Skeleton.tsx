import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "card" | "avatar" | "button";
}

export function Skeleton({ className, variant = "text" }: SkeletonProps) {
  const variants = {
    text: "h-4 rounded",
    card: "h-32 rounded-lg",
    avatar: "h-12 w-12 rounded-full",
    button: "h-10 rounded-md"
  };

  return (
    <div
      className={cn(
        "animate-pulse bg-muted/30 shimmer",
        variants[variant],
        className
      )}
      aria-label="Carregando conteúdo..."
    />
  );
}

interface SkeletonGroupProps {
  count?: number;
  className?: string;
  variant?: SkeletonProps["variant"];
}

export function SkeletonGroup({ count = 3, className, variant }: SkeletonGroupProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} variant={variant} className={className} />
      ))}
    </div>
  );
}

// Skeletons específicos para diferentes seções
export function CardSkeleton() {
  return (
    <div className="gradient-surface rounded-lg p-6 shadow-card">
      <Skeleton variant="text" className="w-3/4 mb-3" />
      <Skeleton variant="text" className="w-full mb-2" />
      <Skeleton variant="text" className="w-2/3" />
      <div className="mt-4">
        <Skeleton variant="button" className="w-24" />
      </div>
    </div>
  );
}

export function MentorCardSkeleton() {
  return (
    <div className="gradient-surface rounded-lg p-4 shadow-card">
      <div className="flex items-center gap-3 mb-3">
        <Skeleton variant="avatar" />
        <div className="flex-1">
          <Skeleton variant="text" className="w-32 mb-1" />
          <Skeleton variant="text" className="w-24 h-3" />
        </div>
      </div>
      <Skeleton variant="text" className="w-full mb-2" />
      <Skeleton variant="text" className="w-3/4" />
    </div>
  );
}