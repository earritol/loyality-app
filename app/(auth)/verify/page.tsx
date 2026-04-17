'use client'

import { useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import { verifyOtp } from '@/lib/actions/auth'
import type { ActionResult } from '@/lib/types'

const initialState: ActionResult = { success: false }

export default function VerifyPage() {
  const [state, action, pending] = useActionState(verifyOtp, initialState)
  const searchParams = useSearchParams()
  const email = searchParams.get('email') ?? ''

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-[400px] bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-2xl font-semibold text-gray-900">Check your email</h1>
        <p className="mt-2 text-sm text-gray-500">
          Enter the code we sent to{' '}
          {email ? <span className="font-medium text-gray-700">{email}</span> : 'your email'}.
        </p>
        <form action={action} className="mt-6 space-y-4">
          <input type="hidden" name="email" value={email} />
          <div>
            <label htmlFor="token" className="block text-sm font-medium text-gray-700">
              Code
            </label>
            <input
              id="token"
              name="token"
              type="text"
              inputMode="numeric"
              placeholder="123456"
              required
              autoFocus
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2.5 text-center text-lg tracking-widest placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          {state.error && (
            <p role="alert" className="text-sm text-red-600">{state.error}</p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pending ? 'Verifying...' : 'Verify'}
          </button>
        </form>
      </div>
    </div>
  )
}
