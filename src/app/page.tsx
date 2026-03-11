'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import oreoLogo from '@/logo/oreoLogo.png'
import { supabase } from '@/lib/supabase'
import { calculateScore, getMaxPossibleScore } from '@/lib/scoring'
import { matchups, getOreoById } from '@/lib/oreos'
import Bracket from '@/components/Bracket'

type User = {
  username: string
  firstName: string
  lastName: string
}

type Vote = {
  matchupIndex: number
  winnerId: number
}

export default function Home() {
  const [step, setStep] = useState<'register' | 'vote' | 'results'>('register')
  const [user, setUser] = useState<User | null>(null)
  const [username, setUsername] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [votes, setVotes] = useState<Vote[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [email, setEmail] = useState('')
  const [dbError, setDbError] = useState('')
  const [officialResults, setOfficialResults] = useState<Record<number, number>>({})

  // Fetch official bracket for score display
  useEffect(() => {
    supabase.from('official_bracket').select('matchup_index, winner_id').then(({ data }) => {
      if (data) {
        const map: Record<number, number> = {}
        data.forEach((r) => { map[r.matchup_index] = r.winner_id })
        setOfficialResults(map)
      }
    })
  }, [])

  const checkUsername = async () => {
    if (!username.trim()) {
      setUsernameError('Username is required')
      return
    }
    
    try {
      const { data, error } = await supabase
        .from('participants')
        .select('username')
        .eq('username', username.toLowerCase())
        .single()
    
      if (data) {
        setUsernameError('Username already taken! Please choose another.')
      } else {
        setUsernameError('')
      }
    } catch (e) {
      // Table might not exist yet - allow it
      setUsernameError('')
    }
  }

  const register = async () => {
    if (!username.trim() || !firstName.trim() || !lastName.trim()) {
      setUsernameError('All fields are required')
      return
    }

    // Check username (may fail if table doesn't exist)
    try {
      const { data: existing } = await supabase
        .from('participants')
        .select('username')
        .eq('username', username.toLowerCase())
        .single()
    
      if (existing) {
        setUsernameError('Username already taken!')
        return
      }
    } catch (e) {
      // Table doesn't exist - continue
    }

    setUser({ username: username.toLowerCase(), firstName, lastName })
    setStep('vote')
  }

  const saveBracket = async () => {
    if (!user) return
    setSaving(true)
    setDbError('')

    // Build votes object
    const votesObject: Record<number, number> = {}
    votes.forEach(v => {
      votesObject[v.matchupIndex] = v.winnerId
    })

    try {
      const { error } = await supabase
        .from('participants')
        .insert({
          username: user.username,
          first_name: user.firstName,
          last_name: user.lastName,
          votes: votesObject,
          email: email || null,
          created_at: new Date().toISOString()
        })

      if (error) {
        console.error('Supabase error:', error)
        // Try saving to localStorage as fallback
        const localData = {
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          votes: votesObject,
          email: email,
          savedAt: new Date().toISOString()
        }
        localStorage.setItem('oreoBracket', JSON.stringify(localData))
        setSaved(true)
        setStep('results')
      } else {
        setSaved(true)
        setStep('results')
      }
    } catch (e) {
      // Save to localStorage as fallback
      const localData = {
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        votes: votesObject,
        email: email,
        savedAt: new Date().toISOString()
      }
      localStorage.setItem('oreoBracket', JSON.stringify(localData))
      setSaved(true)
      setStep('results')
    }
    setSaving(false)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-4">
        {/* Header */}
        <div className="text-center mb-6">
          <Link href="/">
            <Image
              src={oreoLogo}
              alt="Oreo Madness"
              width={oreoLogo.width}
              height={oreoLogo.height}
              className="mx-auto mb-2 h-auto w-auto max-h-40 md:max-h-52"
              priority
            />
          </Link>
          <p className="text-slate-400 text-lg">Predict the Best Oreo Bracket</p>
          <Link href="/leaderboard" className="text-orange-500 hover:underline text-sm mt-2 inline-block">View Leaderboard →</Link>
        </div>

        <div style={{ zoom: 0.9 }} className="origin-top">
        {step === 'register' && (
          <div className="max-w-md mx-auto bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-slate-700">
            <h2 className="text-2xl font-bold mb-6 text-center">Create Your Bracket</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">Username</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase())}
                    onBlur={checkUsername}
                    placeholder="your_username"
                    className="flex-1 px-4 py-3 rounded-xl bg-slate-700 border border-slate-600 focus:border-orange-500 focus:outline-none placeholder-slate-500"
                  />
                  <button
                    onClick={checkUsername}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-500 rounded-xl font-medium transition"
                  >
                    Check
                  </button>
                </div>
                {usernameError && (
                  <p className="text-red-400 text-sm mt-2">{usernameError}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-300">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Fiona"
                    className="w-full px-4 py-3 rounded-xl bg-slate-700 border border-slate-600 focus:border-orange-500 focus:outline-none placeholder-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-300">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Hand"
                    className="w-full px-4 py-3 rounded-xl bg-slate-700 border border-slate-600 focus:border-orange-500 focus:outline-none placeholder-slate-500"
                  />
                </div>
              </div>

              <button
                onClick={register}
                disabled={!username || !firstName || !lastName}
                className="w-full py-4 bg-orange-500 hover:bg-orange-400 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-xl font-bold text-lg transition shadow-lg"
              >
                Start Picking! 🎯
              </button>
            </div>
          </div>
        )}

        {step === 'vote' && user && (
          <div className="space-y-6 max-w-[95vw] lg:max-w-screen-2xl mx-auto">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Make Your Picks</h2>
              <p className="text-slate-400">Click any matchup to pick your winner</p>
            </div>

            <div className="w-full min-w-0">
              <Bracket votes={votes} onVoteChange={setVotes} />
            </div>

            {/* Save section */}
            {votes.length > 0 && (
              <div className="max-w-md mx-auto bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 space-y-4 border border-slate-700">
                <h3 className="text-xl font-bold text-center">Save Your Bracket!</h3>
                
                {votes.length < 15 && (
                  <p className="text-center text-amber-400 text-sm">
                    {votes.length < 8
                      ? `Pick all 8 Round of 16 matchups first`
                      : `You've picked ${votes.length}/15 — complete the bracket to pick your champion!`}
                  </p>
                )}
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-300">
                    Email (optional - we'll send you a copy)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl bg-slate-700 border border-slate-600 focus:border-orange-500 focus:outline-none placeholder-slate-500"
                  />
                </div>

                {dbError && (
                  <p className="text-amber-400 text-sm text-center">{dbError}</p>
                )}

                <button
                  onClick={saveBracket}
                  disabled={saving}
                  className="w-full py-4 bg-green-500 hover:bg-green-400 disabled:bg-slate-600 rounded-xl font-bold text-lg transition shadow-lg"
                >
                  {saving ? 'Saving...' : 'Save Bracket 💾'}
                </button>
              </div>
            )}
          </div>
        )}

        {step === 'results' && user && (() => {
          const votesMap: Record<string, number> = {}
          votes.forEach((v) => { votesMap[String(v.matchupIndex)] = v.winnerId })
          const score = Object.keys(officialResults).length > 0 ? calculateScore(votesMap, officialResults) : null
          return (
          <div className="max-w-md mx-auto bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl space-y-6 border border-slate-700">
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold mb-2">Bracket Saved!</h2>
              <p className="text-slate-400">
                Thanks {user.firstName}! Your predictions are in.
              </p>
              {score !== null && (
                <p className="text-orange-400 font-bold mt-2">Your score: {score} / {getMaxPossibleScore()}</p>
              )}
            </div>

            <div className="bg-black/30 rounded-xl p-4">
              <h3 className="font-bold mb-3 text-slate-300">Your Bracket:</h3>
              <div className="space-y-2">
                {votes.filter(v => v.matchupIndex < 8).map((v) => {
                  const match = matchups[v.matchupIndex]
                  const winner = getOreoById(v.winnerId)
                  return (
                    <div key={v.matchupIndex} className="flex justify-between text-sm">
                      <span className="text-slate-400">{match.date}:</span>
                      <span className="font-medium text-orange-400">#{winner?.seed} {winner?.name}</span>
                    </div>
                  )
                })}
                {votes.some(v => v.matchupIndex === 14) && (() => {
                  const champVote = votes.find(v => v.matchupIndex === 14)
                  const champ = champVote ? getOreoById(champVote.winnerId) : null
                  return champ ? (
                    <div className="mt-4 pt-4 border-t border-slate-600">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Champion:</span>
                        <span className="font-bold text-orange-400">#{champ.seed} {champ.name}</span>
                      </div>
                    </div>
                  ) : null
                })()}
              </div>
            </div>

            {email && (
              <p className="text-center text-sm text-slate-400">
                📧 Copy will be sent to {email}
              </p>
            )}

            <div className="flex gap-2">
              <Link href="/leaderboard" className="flex-1 py-3 bg-orange-500 hover:bg-orange-400 rounded-xl font-medium transition text-center">
                Leaderboard
              </Link>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-medium transition"
              >
                New Bracket
              </button>
            </div>
          </div>
        )})()}
        </div>
      </div>
    </main>
  )
}
