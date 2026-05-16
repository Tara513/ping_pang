import type { Session, Match } from "@/types/database"
import { generateFakeBallData } from "@/lib/utils/generateFakeBallData"

const today = new Date()
const daysAgo = (n: number) => {
  const d = new Date(today)
  d.setDate(d.getDate() - n)
  return d.toISOString().split("T")[0]
}

export const demoSessions: Partial<Session>[] = [
  { session_type: "technique", duration_min: 90, date: daysAgo(1), feeling: 4, fatigue: 3, motivation: 5, exercises: [{ name: "Coup droit croisé" }, { name: "Bloc revers" }, { name: "Service pendule" }], notes: "Bonne séance, progression sur le service", has_description: true, location: "Ping Pang Paris" },
  { session_type: "match", duration_min: 120, date: daysAgo(3), feeling: 3, fatigue: 4, motivation: 4, exercises: [], has_description: true, location: "Club Omnisports" },
  { session_type: "service", duration_min: 45, date: daysAgo(5), feeling: 5, fatigue: 2, motivation: 5, exercises: [{ name: "Service pendule" }, { name: "Service bombe" }, { name: "Variation longueur" }], has_description: true },
  { session_type: "technique", duration_min: 75, date: daysAgo(7), feeling: 4, fatigue: 3, motivation: 4, exercises: [{ name: "Flick revers" }, { name: "Coup droit longue ligne" }], has_description: true },
  { session_type: "physique", duration_min: 60, date: daysAgo(9), feeling: 3, fatigue: 5, motivation: 3, exercises: [{ name: "Footwork" }, { name: "Shadow" }], has_description: true, location: "Salle de sport" },
  { session_type: "competition", duration_min: 240, date: daysAgo(11), feeling: 4, fatigue: 5, motivation: 5, exercises: [], has_description: true, location: "Tournoi Paris Est" },
  { session_type: "chill", duration_min: 30, date: daysAgo(13), feeling: 5, fatigue: 1, motivation: 3, has_description: false },
  { session_type: "technique", duration_min: 90, date: daysAgo(15), feeling: 4, fatigue: 2, motivation: 5, exercises: [{ name: "Multiball coup droit" }, { name: "Revers to revers" }], has_description: true },
  { session_type: "match", duration_min: 90, date: daysAgo(18), feeling: 2, fatigue: 4, motivation: 3, has_description: true },
  { session_type: "service", duration_min: 45, date: daysAgo(21), feeling: 4, fatigue: 2, motivation: 4, exercises: [{ name: "Services courts" }], has_description: true },
  { session_type: "technique", duration_min: 60, date: daysAgo(25), feeling: 5, fatigue: 2, motivation: 5, exercises: [{ name: "Smash" }, { name: "Lobbing" }], has_description: true },
  { session_type: "physique", duration_min: 45, date: daysAgo(30), feeling: 3, fatigue: 4, motivation: 4, has_description: false },
]

export const demoMatches: Partial<Match>[] = [
  {
    opponent_name: "Thomas M.",
    result: "win",
    score_player: [11, 9, 11, 11],
    score_opponent: [8, 11, 7, 9],
    sets_won: 3, sets_lost: 1,
    match_type: "friendly",
    date: daysAgo(2),
    location: "Ping Pang Paris",
    ball_data: generateFakeBallData("demo-1") as never,
  },
  {
    opponent_name: "Léa D.",
    result: "loss",
    score_player: [8, 11, 7, 9],
    score_opponent: [11, 8, 11, 11],
    sets_won: 1, sets_lost: 3,
    match_type: "league",
    date: daysAgo(4),
    ball_data: generateFakeBallData("demo-2") as never,
  },
  {
    opponent_name: "Carlos R.",
    result: "win",
    score_player: [11, 11, 11],
    score_opponent: [6, 8, 9],
    sets_won: 3, sets_lost: 0,
    match_type: "training",
    date: daysAgo(7),
    location: "Salle Bercy",
  },
  {
    opponent_name: "Marc L.",
    result: "win",
    score_player: [11, 8, 9, 11, 11],
    score_opponent: [9, 11, 11, 8, 9],
    sets_won: 3, sets_lost: 2,
    match_type: "tournament",
    date: daysAgo(12),
    location: "Tournoi Paris Est",
    ball_data: generateFakeBallData("demo-4") as never,
  },
  {
    opponent_name: "Julie P.",
    result: "loss",
    score_player: [9, 7, 11, 8],
    score_opponent: [11, 11, 9, 11],
    sets_won: 1, sets_lost: 3,
    match_type: "league",
    date: daysAgo(16),
  },
  {
    opponent_name: "Antoine B.",
    result: "win",
    score_player: [11, 11, 9, 11],
    score_opponent: [7, 8, 11, 8],
    sets_won: 3, sets_lost: 1,
    match_type: "friendly",
    date: daysAgo(20),
  },
]
