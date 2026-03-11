'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import oreoLogo from '@/logo/oreoLogo.png'

type Participant = {
  id: string
  username: string
  first_name: string
  last_name: string
  votes: Record<string, number>
  score?: number
  created_at: string
}

export default function LeaderboardPage() {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [hasOfficialResults, setHasOfficialResults] = useState(false)
  const [loading, setLoading] = useState(true)
  const [myUsername, setMyUsername] = useState<string | null>(null)

  useEffect(() => {
    setMyUsername(typeof window !== 'undefined' ? localStorage.getItem('oreoUsername') : null)
  }, [])

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/leaderboard')
        const data = await res.json()
        if (!res.ok) {
          setLoading(false)
          return
        }
        setParticipants(data.participants || [])
        setHasOfficialResults(data.hasOfficialResults ?? false)
        setLoading(false)
      } catch {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="w-full max-w-[95vw] lg:max-w-screen-2xl mx-auto px-6 py-8">
        <div className="relative text-center mb-8">
          {myUsername && (
            <Link
              href={`/bracket/${encodeURIComponent(myUsername)}`}
              className="absolute right-0 top-0 text-orange-500 hover:underline text-sm"
            >
              My bracket
            </Link>
          )}
          <Link href="/">
            <Image src={oreoLogo} alt="Oreo Madness" width={oreoLogo.width} height={oreoLogo.height} className="mx-auto mb-2 h-auto w-auto max-h-32" priority />
          </Link>
          <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
          <p className="text-slate-600">
            {hasOfficialResults ? 'Ranked by bracket accuracy' : 'Set the official bracket in Admin to see scores'}
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <Link href="/" className="text-orange-500 hover:underline">Make Your Bracket</Link>
            <Link href="/admin" className="text-orange-500 hover:underline">Set Official Results</Link>
          </div>
        </div>

        <div className="w-full max-w-full">
          {loading ? (
            <p className="text-center text-slate-600">Loading...</p>
          ) : participants.length === 0 ? (
            <p className="text-center text-slate-600">No brackets yet. Be the first!</p>
          ) : (
            <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-4 px-4 font-bold">#</th>
                      <th className="text-left py-4 px-4 font-bold">Name</th>
                      <th className="text-left py-4 px-4 font-bold">Username</th>
                      {hasOfficialResults && <th className="text-right py-4 px-4 font-bold">Points</th>}
                      <th className="text-left py-4 px-4 font-bold"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.map((p, i) => (
                      <tr key={p.id} className="border-b border-slate-200 last:border-0 hover:bg-slate-100 transition-colors">
                        <td className="py-3 px-4 text-slate-600">{i + 1}</td>
                        <td className="py-3 px-4 font-medium">{p.first_name} {p.last_name}</td>
                        <td className="py-3 px-4">
                          <Link href={`/bracket/${encodeURIComponent(p.username)}`} className="text-orange-500 hover:underline">
                            @{p.username}
                          </Link>
                        </td>
                        {hasOfficialResults && (
                          <td className="py-3 px-4 text-right">
                            <span className="text-orange-400 font-bold">{p.score ?? 0}</span>
                          </td>
                        )}
                        <td className="py-3 px-4">
                          <Link href={`/bracket/${encodeURIComponent(p.username)}`} className="text-orange-500 hover:underline text-sm">
                            View bracket
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
