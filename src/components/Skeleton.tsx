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
    <div className="gradient-surface rounded-lg p-4 shadow-card h-full flex flex-col">
      <div className="text-center mb-4">
        <Skeleton variant="avatar" className="mx-auto mb-3" />
        <Skeleton variant="text" className="w-32 mx-auto mb-2" />
        <Skeleton variant="text" className="w-24 h-3 mx-auto" />
      </div>
      
      <div className="flex-1 space-y-3">
        <div className="flex justify-center gap-2">
          <Skeleton className="w-16 h-5 rounded-full" />
          <Skeleton className="w-12 h-5 rounded-full" />
        </div>
        <Skeleton variant="text" className="w-full" />
        <Skeleton variant="text" className="w-3/4 mx-auto" />
        
        <div className="pt-2 space-y-2">
          <Skeleton variant="button" className="w-full" />
          <Skeleton variant="button" className="w-full" />
        </div>
      </div>
    </div>
  );
}

export function MentorPerfilSkeleton() {
  return (
    <div className="space-y-8">
      {/* Hero Section Skeleton */}
      <div className="gradient-surface rounded-2xl p-8 shadow-card text-center">
        <Skeleton variant="avatar" className="w-32 h-32 mx-auto mb-4" />
        <Skeleton variant="text" className="w-48 h-8 mx-auto mb-4" />
        <div className="flex justify-center gap-2 mb-4">
          <Skeleton className="w-16 h-6 rounded-full" />
          <Skeleton className="w-20 h-6 rounded-full" />
          <Skeleton className="w-14 h-6 rounded-full" />
        </div>
        <Skeleton variant="text" className="w-32 h-6 mx-auto mb-6" />
        <Skeleton variant="button" className="w-48 mx-auto" />
      </div>

      {/* Bio Section Skeleton */}
      <div className="gradient-surface rounded-xl p-6 shadow-card">
        <Skeleton variant="text" className="w-24 h-6 mb-4" />
        <div className="space-y-2">
          <Skeleton variant="text" className="w-full" />
          <Skeleton variant="text" className="w-full" />
          <Skeleton variant="text" className="w-3/4" />
        </div>
      </div>

      {/* Stats Section Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="gradient-surface rounded-lg p-4 shadow-card text-center">
            <Skeleton variant="text" className="w-16 h-8 mx-auto mb-2" />
            <Skeleton variant="text" className="w-24 h-4 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}