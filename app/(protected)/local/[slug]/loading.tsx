import { Skeleton } from '@/components/ui/skeleton'

export default function LoadingLocal() {
  return (
    <div className="min-h-screen bg-gana-bg">
      <div className="max-w-lg mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-6 h-24 w-full" />
        <div className="mt-8 space-y-3">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      </div>
    </div>
  )
}
