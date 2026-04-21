import { Skeleton } from '@/components/ui/skeleton'

export default function LoadingPerfil() {
  return (
    <div className="min-h-screen bg-gana-bg">
      <div className="max-w-lg mx-auto px-4 py-8">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="mt-4 h-64 w-full" />
      </div>
    </div>
  )
}
