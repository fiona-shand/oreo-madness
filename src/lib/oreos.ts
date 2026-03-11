// Oreo data and bracket configuration
import type { StaticImageData } from 'next/image'
import classicImg from '@/logo/classic.png'
import mintImg from '@/logo/mint.png'
import thinsImg from '@/logo/thins.png'
import goldenImg from '@/logo/golden.png'
import birthdaycakeImg from '@/logo/birthdaycake.png'
import peanutbutterImg from '@/logo/peanutbutter.png'
import lemonImg from '@/logo/lemon.png'
import reesesImg from '@/logo/reeses.png'
import toffeecrunchImg from '@/logo/toffeecrunch.png'
import darkchocolateImg from '@/logo/darkcholocate.png'
import javachipImg from '@/logo/javachip.png'
import marvelImg from '@/logo/marvel.png'
import megastuffedImg from '@/logo/megastuffed.png'
import easterImg from '@/logo/easter.png'
import cookiedoughImg from '@/logo/cookiedough.png'
import loadedImg from '@/logo/loaded.png'

export const oreoImages: Record<number, StaticImageData> = {
  1: classicImg,
  2: mintImg,
  3: thinsImg,
  4: goldenImg,
  5: birthdaycakeImg,
  6: peanutbutterImg,
  7: lemonImg,
  8: reesesImg,
  9: toffeecrunchImg,
  10: darkchocolateImg,
  11: javachipImg,
  12: marvelImg,
  13: megastuffedImg,
  14: easterImg,
  15: cookiedoughImg,
  16: loadedImg,
}

export const oreos = [
  { id: 1, name: 'Classic', seed: 1 },
  { id: 2, name: 'Mint', seed: 8 },
  { id: 3, name: 'Thins', seed: 5 },
  { id: 4, name: 'Goldens', seed: 4 },
  { id: 5, name: 'Bday Cake', seed: 6 },
  { id: 6, name: 'Peanut Butter', seed: 3 },
  { id: 7, name: 'Lemon', seed: 7 },
  { id: 8, name: 'Reeses', seed: 2 },
  { id: 9, name: 'Toffee Crunch', seed: 16 },
  { id: 10, name: 'Dark Chocolate', seed: 9 },
  { id: 11, name: 'Java Chip', seed: 12 },
  { id: 12, name: 'Marvel', seed: 13 },
  { id: 13, name: 'Mega Stuffed', seed: 11 },
  { id: 14, name: 'Easter', seed: 14 },
  { id: 15, name: 'Cookie Dough', seed: 10 },
  { id: 16, name: 'Loaded Oreo', seed: 15 },
] as const

export type Oreo = typeof oreos[number]

// Round 1 matchups (by date)
export const matchups = [
  { date: 'Monday, March 16', oreo1: 1, oreo2: 9 },      // Classic vs Toffee Crunch
  { date: 'Tuesday, March 17', oreo1: 2, oreo2: 10 },     // Mint vs Dark Chocolate
  { date: 'Wednesday, March 18', oreo1: 3, oreo2: 11 },   // Thins vs Java Chip
  { date: 'Thursday, March 19', oreo1: 4, oreo2: 12 },   // Goldens vs Marvel
  { date: 'Friday, March 20', oreo1: 5, oreo2: 13 },      // Bday Cake vs Mega Stuffed
  { date: 'Monday, March 23', oreo1: 6, oreo2: 14 },     // Peanut Butter vs Easter
  { date: 'Tuesday, March 24', oreo1: 7, oreo2: 15 },   // Lemon vs Cookie Dough
  { date: 'Wednesday, March 25', oreo1: 8, oreo2: 16 }, // Reeses vs Loaded Oreo
] as const

export type Matchup = typeof matchups[number]

// Get oreo by ID
export function getOreoById(id: number): Oreo | undefined {
  return oreos.find(o => o.id === id)
}

// Get oreo image by ID
export function getOreoImageById(id: number): StaticImageData | undefined {
  return oreoImages[id]
}
