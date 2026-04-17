import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-gray-900">Loyalty App</h1>
        <p className="mt-3 text-gray-500">
          Earn rewards at your favorite local businesses. Track your visits and redeem perks.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/login"
            className="inline-block rounded-md bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
