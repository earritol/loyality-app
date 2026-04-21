import { Skeleton } from '@/components/ui/skeleton'

export default function LoadingAdmin() {
  return (
    <div className="min-h-screen bg-gana-bg">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-4 w-24" />
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      </div>
    </div>
  )
}
