'use client'

import { useState } from 'react'
import { getOreoById } from '@/lib/oreos'

type Vote = {
  matchupIndex: number
  winnerId: number
}

type BracketProps = {
  votes: Vote[]
  onVoteChange: (votes: Vote[]) => void
}

// Round of 16 matchups
const matchups = [
  { idx: 0, date: 'Mar 16', seed1: 1, seed2: 9 },
  { idx: 1, date: 'Mar 17', seed1: 8, seed2: 10 },
  { idx: 2, date: 'Mar 18', seed1: 5, seed2: 11 },
  { idx: 3, date: 'Mar 19', seed1: 4, seed2: 12 },
  { idx: 4, date: 'Mar 20', seed1: 6, seed2: 13 },
  { idx: 5, date: 'Mar 23', seed1: 3, seed2: 14 },
  { idx: 6, date: 'Mar 24', seed1: 7, seed2: 10 },
  { idx: 7, date: 'Mar 25', seed1: 2, seed2: 15 },
]

export default function Bracket({ votes, onVoteChange }: BracketProps) {
  const [selectedMatchup, setSelectedMatchup] = useState<{round: string, idx: number, seed1: number, seed2: number} | null>(null)

  // Only allow picking R16 first
  const [r16Done, setR16Done] = useState(false)
  const [qfDone, setQfDone] = useState(false)

  const getWinner = (round: string, idx: number) => {
    if (round === 'r16') {
      const v = votes.find(v => v.matchupIndex === idx)
      return v?.winnerId || null
    }
    return null
  }

  const handlePick = (winnerId: number) => {
    if (!selectedMatchup) return
    
    const { round, idx, seed1, seed2 } = selectedMatchup
    
    // Validate - can only pick R16 first
    if (round !== 'r16') {
      alert('Complete Round of 16 first!')
      setSelectedMatchup(null)
      return
    }
    
    // Add to votes
    const newVotes = votes.filter(v => v.matchupIndex !== idx)
    newVotes.push({ matchupIndex: idx, winnerId })
    onVoteChange(newVotes)
    
    // Check if R16 is done
    if (newVotes.length === 8) {
      setR16Done(true)
    }
    
    setSelectedMatchup(null)
  }

  const MatchupBox = ({ round, idx, seed1, seed2, disabled }: { round: string, idx: number, seed1: number, seed2: number, disabled?: boolean }) => {
    const o1 = getOreoById(seed1)
    const o2 = getOreoById(seed2)
    const winner = getWinner(round, idx)
    
    return (
      <button
        onClick={() => !disabled && setSelectedMatchup({round, idx, seed1, seed2})}
        disabled={disabled}
        className={`
          w-36 p-2 rounded border-2 text-xs text-left transition-all
          ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
          ${winner ? 'border-green-500 bg-green-500/20' : 'border-slate-600 bg-slate-800 hover:border-orange-500'}
        `}
      >
        <div className={`${winner === o1?.id ? 'text-orange-400 font-bold' : 'text-slate-300'}`}>
          {o1?.name || 'TBD'}
        </div>
        <div className={`${winner === o2?.id ? 'text-orange-400 font-bold' : 'text-slate-300'}`}>
          {o2?.name || 'TBD'}
        </div>
      </button>
    )
  }

  return (
    <div className="w-full overflow-x-auto py-8">
      <div className="min-w-[1400px] flex justify-center">
        
        {/* LEFT SIDE */}
        <div className="flex items-center gap-0">
          
          {/* ROUND OF 16 - LEFT */}
          <div className="flex flex-col gap-1">
            <div className="text-orange-500 font-bold text-xs mb-2 text-center">ROUND OF 16</div>
            {matchups.slice(0, 4).map((m, i) => (
              <div key={i} className="h-16 flex items-center">
                <MatchupBox round="r16" idx={i} seed1={m.seed1} seed2={m.seed2} disabled={r16Done} />
              </div>
            ))}
          </div>

          {/* Connector */}
          <div className="w-4 flex flex-col justify-around h-72 py-8">
            <div className="border-r-2 border-slate-500 h-full"></div>
          </div>

          {/* QF - LEFT */}
          <div className="flex flex-col gap-1">
            <div className="text-orange-500 font-bold text-xs mb-2 text-center">QF</div>
            {matchups.slice(0, 2).map((m, i) => (
              <div key={i} className="h-16 flex items-center">
                <div className="w-4"></div>
                <MatchupBox round="qf" idx={i} seed1={0} seed2={0} disabled={!r16Done} />
              </div>
            ))}
          </div>

          {/* Connector */}
          <div className="w-4 flex flex-col justify-around h-72 py-8">
            <div className="border-r-2 border-slate-500 h-full"></div>
          </div>

          {/* SF - LEFT */}
          <div className="flex flex-col gap-1">
            <div className="text-orange-500 font-bold text-xs mb-2 text-center">SF</div>
            <div className="h-16 flex items-center">
              <div className="w-8"></div>
              <MatchupBox round="sf" idx={0} seed1={0} seed2={0} disabled={!qfDone} />
            </div>
          </div>

          {/* Connector */}
          <div className="w-4 flex flex-col justify-around h-72 py-8">
            <div className="border-r-2 border-slate-500 h-full"></div>
          </div>

          {/* LEFT FINAL */}
          <div className="flex flex-col justify-center h-72">
            <MatchupBox round="finalL" idx={0} seed1={0} seed2={0} disabled={!qfDone} />
          </div>
        </div>

        {/* CENTER */}
        <div className="flex flex-col items-center justify-center mx-8">
          <div className="w-16 border-t-4 border-slate-500"></div>
          <div className="text-orange-500 font-bold text-lg py-4">CHAMPIONSHIP</div>
          <div className="w-16 border-t-4 border-slate-500"></div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-0">
          
          {/* RIGHT FINAL */}
          <div className="flex flex-col justify-center h-72">
            <MatchupBox round="finalR" idx={1} seed1={0} seed2={0} disabled={!qfDone} />
          </div>

          {/* Connector */}
          <div className="w-4 flex flex-col justify-around h-72 py-8">
            <div className="border-l-2 border-slate-500 h-full"></div>
          </div>

          {/* SF - RIGHT */}
          <div className="flex flex-col gap-1">
            <div className="text-orange-500 font-bold text-xs mb-2 text-center">SF</div>
            <div className="h-16 flex items-center">
              <MatchupBox round="sf" idx={1} seed1={0} seed2={0} disabled={!qfDone} />
              <div className="w-8"></div>
            </div>
          </div>

          {/* Connector */}
          <div className="w-4 flex flex-col justify-around h-72 py-8">
            <div className="border-l-2 border-slate-500 h-full"></div>
          </div>

          {/* QF - RIGHT */}
          <div className="flex flex-col gap-1">
            <div className="text-orange-500 font-bold text-xs mb-2 text-center">QF</div>
            {matchups.slice(4, 6).map((m, i) => (
              <div key={i} className="h-16 flex items-center">
                <MatchupBox round="qf" idx={i+2} seed1={0} seed2={0} disabled={!r16Done} />
                <div className="w-4"></div>
              </div>
            ))}
          </div>

          {/* Connector */}
          <div className="w-4 flex flex-col justify-around h-72 py-8">
            <div className="border-l-2 border-slate-500 h-full"></div>
          </div>

          {/* ROUND OF 16 - RIGHT */}
          <div className="flex flex-col gap-1">
            <div className="text-orange-500 font-bold text-xs mb-2 text-center">ROUND OF 16</div>
            {matchups.slice(4, 8).map((m, i) => (
              <div key={i} className="h-16 flex items-center">
                <MatchupBox round="r16" idx={i+4} seed1={m.seed1} seed2={m.seed2} disabled={r16Done} />
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Modal */}
      {selectedMatchup && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl p-8 max-w-md w-full border border-slate-700">
            <h3 className="text-xl font-bold mb-2 text-center">
              {matchups[selectedMatchup.idx].date}
            </h3>
            <p className="text-slate-400 text-center mb-6">Who wins?</p>

            <div className="flex gap-4">
              {[
                { seed: selectedMatchup.seed1 },
                { seed: selectedMatchup.seed2 }
              ].map(({ seed }) => {
                const oreo = getOreoById(seed)
                return (
                  <button
                    key={seed}
                    onClick={() => handlePick(oreo?.id || seed)}
                    className="flex-1 p-6 rounded-xl bg-slate-800 border-2 border-slate-600 hover:border-orange-500 transition-all"
                  >
                    <div className="text-lg font-bold">{oreo?.name || 'TBD'}</div>
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => setSelectedMatchup(null)}
              className="mt-6 w-full py-3 bg-slate-700 hover:bg-slate-600 rounded-xl transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="text-center mt-6 text-slate-400">
        Picks: {votes.length} / 8 | {!r16Done && 'Complete Round of 16 first!'}
      </div>
    </div>
  )
}
