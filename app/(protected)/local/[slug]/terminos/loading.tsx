import { Skeleton } from '@/components/ui/skeleton'

export default function LoadingTerminos() {
  return (
    <div className="min-h-screen bg-gana-bg">
      <div className="max-w-lg mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-6 h-40 w-full" />
        <Skeleton className="mt-6 h-60 w-full" />
      </div>
    </div>
  )
}
