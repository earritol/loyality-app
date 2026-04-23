import { Skeleton } from '@/components/ui/skeleton'

export default function LoadingBackoffice() {
  return (
    <div className="min-h-screen bg-gana-bg">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-6 h-40 w-full" />
        <Skeleton className="mt-8 h-6 w-32" />
        <div className="mt-4 space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    </div>
  )
}
