'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import oreoLogo from '@/logo/oreoLogo.png'
import { supabase } from '@/lib/supabase'
import Bracket from '@/components/Bracket'

type Vote = { matchupIndex: number; winnerId: number }

type Participant = {
  id: string
  username: string
  first_name: string
  last_name: string
  votes: Record<string, number>
}

function votesToArray(votes: Record<string, number> | null | undefined): Vote[] {
  if (!votes || typeof votes !== 'object') return []
  return Object.entries(votes).map(([k, v]) => ({
    matchupIndex: Number(k),
    winnerId: Number(v),
  }))
}

export default function BracketPage() {
  const params = useParams()
  const username = decodeURIComponent(String(params?.username ?? ''))
  const [participant, setParticipant] = useState<Participant | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [myUsername, setMyUsername] = useState<string | null>(null)

  useEffect(() => {
    setMyUsername(typeof window !== 'undefined' ? localStorage.getItem('oreoUsername') : null)
  }, [])

  useEffect(() => {
    async function fetchBracket() {
      try {
        const { data, error: err } = await supabase
          .from('participants')
          .select('id, username, first_name, last_name, votes')
          .eq('username', username.toLowerCase())
          .single()

        if (err || !data) {
          setError('Bracket not found')
          setLoading(false)
          return
        }
        setParticipant(data as Participant)
      } catch {
        setError('Failed to load bracket')
      }
      setLoading(false)
    }
    fetchBracket()
  }, [username])

  const votes = participant ? votesToArray(participant.votes) : []

  return (
    <main className="min-h-screen bg-white text-slate-900 w-full">
      <div className="w-full max-w-[100vw] mx-auto px-2 sm:px-4 py-2">
        <div className="relative text-center mb-4">
          {myUsername && myUsername !== username.toLowerCase() && (
            <Link
              href={`/bracket/${encodeURIComponent(myUsername)}`}
              className="absolute right-0 top-0 text-orange-500 hover:underline text-sm"
            >
              My bracket
            </Link>
          )}
          <Link href="/">
            <Image
              src={oreoLogo}
              alt="Oreo Madness"
              width={oreoLogo.width}
              height={oreoLogo.height}
              className="mx-auto mb-1 h-auto w-auto max-h-24 md:max-h-28"
              priority
            />
          </Link>
          <p className="text-slate-600 text-sm">Predict the Best Oreo Bracket</p>
          <div className="flex justify-center gap-4 mt-2">
            <Link href="/leaderboard" className="text-orange-500 hover:underline text-sm">
              Leaderboard
            </Link>
            <Link href="/" className="text-orange-500 hover:underline text-sm">
              Make Your Bracket
            </Link>
          </div>
        </div>

        {loading ? (
          <p className="text-center text-slate-600 py-12">Loading bracket...</p>
        ) : error || !participant ? (
          <div className="text-center py-12">
            <p className="text-slate-600 mb-4">{error ?? 'Bracket not found'}</p>
            <Link href="/leaderboard" className="text-orange-500 hover:underline">
              Back to Leaderboard
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-1">
                {participant.first_name} {participant.last_name}&apos;s Bracket
              </h2>
              <p className="text-slate-600 text-sm">@{participant.username}</p>
            </div>
            <div className="w-full min-w-max">
              <Bracket votes={votes} readOnly />
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
