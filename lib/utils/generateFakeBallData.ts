import type { BallData } from "@/types/database"

export function generateFakeBallData(matchId: string, level: "amateur" | "pro" = "amateur"): BallData {
  const isAmateur = level === "amateur"
  const r = (min: number, max: number) => Math.round((Math.random() * (max - min) + min) * 10) / 10

  const avgSpeed = isAmateur ? r(28, 58) : r(55, 90)
  const maxSpeed = avgSpeed * r(1.6, 2.1)
  const avgSpin = isAmateur ? r(400, 1800) : r(1800, 4800)
  const maxSpin = avgSpin * r(1.5, 2.5)
  const totalRallies = Math.round(r(80, 200))
  const avgRallyLength = r(3, 12)
  const longestRally = Math.round(r(15, 45))
  const numSets = Math.round(r(3, 5))

  const total = Math.round(r(totalRallies * 0.3, totalRallies * 0.4))
  const backspin = Math.round(r(totalRallies * 0.15, totalRallies * 0.25))
  const sidespin = Math.round(r(totalRallies * 0.08, totalRallies * 0.15))
  const flat = totalRallies - total - backspin - sidespin

  return {
    match_id: matchId,
    recorded_at: new Date().toISOString(),
    summary: {
      avg_speed_kmh: avgSpeed,
      max_speed_kmh: Math.round(maxSpeed * 10) / 10,
      avg_spin_rpm: Math.round(avgSpin),
      max_spin_rpm: Math.round(maxSpin),
      total_rallies: totalRallies,
      avg_rally_length: avgRallyLength,
      longest_rally: longestRally,
      serve_accuracy_pct: Math.round(r(65, 95)),
      topspin_count: total,
      backspin_count: backspin,
      sidespin_count: sidespin,
      flat_hit_count: Math.max(0, flat),
    },
    by_set: Array.from({ length: numSets }, (_, i) => ({
      set_number: i + 1,
      avg_speed: r(avgSpeed * 0.85, avgSpeed * 1.15),
      max_speed: r(maxSpeed * 0.8, maxSpeed),
      avg_spin: Math.round(r(avgSpin * 0.8, avgSpin * 1.2)),
      rallies: Math.round(r(15, 45)),
    })),
  }
}
