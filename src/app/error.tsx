'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <main className="min-h-screen bg-white text-slate-900 flex flex-col items-center justify-center px-4">
      <h1 className="text-2xl font-bold text-slate-900 mb-4">Something went wrong</h1>
      <p className="text-slate-600 text-center mb-6 max-w-md">
        {error.message || 'An unexpected error occurred.'}
      </p>
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="px-6 py-3 bg-orange-500 hover:bg-orange-400 text-white font-medium rounded-xl transition"
        >
          Try again
        </button>
        <Link
          href="/"
          className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium rounded-xl transition"
        >
          Go home
        </Link>
      </div>
    </main>
  )
}
