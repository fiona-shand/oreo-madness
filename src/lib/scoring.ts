// Compare participant bracket to official results and calculate score

export type VotesMap = Record<string, number> // matchup_index (as string from JSON) -> winner_id

export function calculateScore(
  votes: VotesMap | Record<number, number> | null | undefined,
  officialResults: Record<number, number> // matchup_index -> winner_id
): number {
  if (!votes || typeof votes !== 'object') return 0
  let score = 0
  for (let i = 0; i <= 14; i++) {
    const playerPick = votes[String(i)] ?? votes[i]
    const actualWinner = officialResults[i]
    if (playerPick != null && actualWinner != null && Number(playerPick) === Number(actualWinner)) {
      score++
    }
  }
  return score
}

export function getMaxPossibleScore(): number {
  return 15 // R16 (8) + QF (4) + SF (2) + Champion (1)
}
