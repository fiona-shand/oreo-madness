'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import oreoLogo from '@/logo/oreoLogo.png'
import { supabase } from '@/lib/supabase'
import { calculateScore, getMaxPossibleScore } from '@/lib/scoring'
import { getOreoById } from '@/lib/oreos'

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
  const [officialResults, setOfficialResults] = useState<Record<number, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const [participantsRes, resultsRes] = await Promise.all([
        supabase.from('participants').select('id, username, first_name, last_name, votes, created_at').order('created_at', { ascending: false }),
        supabase.from('official_bracket').select('matchup_index, winner_id'),
      ])

      const resultsMap: Record<number, number> = {}
      if (resultsRes.data && !resultsRes.error) {
        resultsRes.data.forEach((r) => {
          resultsMap[Number(r.matchup_index)] = Number(r.winner_id)
        })
      }
      setOfficialResults(resultsMap)

      if (participantsRes.data && !participantsRes.error) {
        const hasResults = Object.keys(resultsMap).length > 0
        const withScores = participantsRes.data.map((p) => ({
          ...p,
          score: hasResults ? calculateScore(p.votes ?? {}, resultsMap) : undefined,
        }))
        withScores.sort((a, b) => (b.score ?? -1) - (a.score ?? -1))
        setParticipants(withScores)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const hasOfficialResults = Object.keys(officialResults).length > 0

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <Link href="/">
            <Image src={oreoLogo} alt="Oreo Madness" width={oreoLogo.width} height={oreoLogo.height} className="mx-auto mb-2 h-auto w-auto max-h-32" priority />
          </Link>
          <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
          <p className="text-slate-400">
            {hasOfficialResults ? `Ranked by bracket accuracy (max ${getMaxPossibleScore()} points)` : 'Set the official bracket in Admin to see scores'}
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <Link href="/" className="text-orange-500 hover:underline">Make Your Bracket</Link>
            <Link href="/admin" className="text-orange-500 hover:underline">Set Official Results</Link>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          {loading ? (
            <p className="text-center text-slate-400">Loading...</p>
          ) : participants.length === 0 ? (
            <p className="text-center text-slate-400">No brackets yet. Be the first!</p>
          ) : (
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-600">
                      <th className="text-left py-4 px-4 font-bold">#</th>
                      <th className="text-left py-4 px-4 font-bold">Name</th>
                      <th className="text-left py-4 px-4 font-bold">Username</th>
                      {hasOfficialResults && <th className="text-right py-4 px-4 font-bold">Score</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {participants.map((p, i) => (
                      <tr key={p.id} className="border-b border-slate-700/50 last:border-0">
                        <td className="py-3 px-4 text-slate-400">{i + 1}</td>
                        <td className="py-3 px-4 font-medium">{p.first_name} {p.last_name}</td>
                        <td className="py-3 px-4 text-slate-400">@{p.username}</td>
                        {hasOfficialResults && (
                          <td className="py-3 px-4 text-right">
                            <span className="text-orange-400 font-bold">{p.score ?? 0}</span>
                            <span className="text-slate-500 text-sm">/{getMaxPossibleScore()}</span>
                          </td>
                        )}
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
