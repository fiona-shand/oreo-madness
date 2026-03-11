'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

export default function BackButton() {
  const router = useRouter()
  const pathname = usePathname()
  const isHome = pathname === '/'

  if (isHome) return null

  return (
    <div className="fixed top-4 left-4 z-50 flex items-center gap-2">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/90 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition backdrop-blur-sm shadow-sm"
        aria-label="Go back"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back
      </button>
      <Link
        href="/"
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/90 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition backdrop-blur-sm shadow-sm"
        aria-label="Go home"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        Home
      </Link>
    </div>
  )
}
