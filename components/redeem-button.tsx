'use client'

import { useActionState } from 'react'
import { redeemReward } from '@/lib/actions/rewards'
import { Badge } from '@/components/ui/badge'
import type { ActionResult } from '@/lib/types'

const initialState: ActionResult = { success: false }

export function RedeemButton({ rewardId }: { rewardId: string }) {
  const [state, action, pending] = useActionState(redeemReward, initialState)

  if (state.success) {
    return <Badge variant="pending">⏳ Pendiente</Badge>
  }

  return (
    <div>
      <form action={action}>
        <input type="hidden" name="rewardId" value={rewardId} />
        <button
          type="submit"
          disabled={pending}
          className="rounded-full px-4 py-1.5 text-xs font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#22C55E', color: '#FFFFFF' }}
        >
          {pending ? '...' : '🎁 Canjear'}
        </button>
      </form>
      {state.error && (
        <p className="mt-1 text-xs max-w-[140px]" style={{ color: '#EF4444' }}>{state.error}</p>
      )}
    </div>
  )
}
