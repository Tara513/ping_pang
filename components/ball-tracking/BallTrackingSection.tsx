"use client"

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import type { BallData } from "@/types/database"
import Card from "@/components/ui/Card"
import Badge from "@/components/ui/Badge"

const SPIN_COLORS = ["#4A5240", "#C8352A", "#E8C840", "#8A9178"]

function SpeedGauge({ speed, maxSpeed }: { speed: number; maxSpeed: number }) {
  const pct = Math.min(speed / 130, 1)
  const angle = -140 + pct * 280
  const r = 60
  const cx = 75
  const cy = 75

  const polarToCartesian = (angle: number) => ({
    x: cx + r * Math.cos((angle * Math.PI) / 180),
    y: cy + r * Math.sin((angle * Math.PI) / 180),
  })

  const start = polarToCartesian(-140)
  const end = polarToCartesian(angle)
  const largeArc = pct * 280 > 180 ? 1 : 0

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 150 100" className="w-40">
        {/* Track */}
        <path
          d={`M ${polarToCartesian(-140).x} ${polarToCartesian(-140).y} A ${r} ${r} 0 1 1 ${polarToCartesian(140).x} ${polarToCartesian(140).y}`}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Fill */}
        {pct > 0 && (
          <path
            d={`M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`}
            fill="none"
            stroke="#4A5240"
            strokeWidth="8"
            strokeLinecap="round"
          />
        )}
        {/* Value */}
        <text x={cx} y={cy - 5} textAnchor="middle" fill="#F5F2EC" fontSize="22" fontFamily="var(--font-bebas)">
          {Math.round(maxSpeed)}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="#8A9178" fontSize="8">
          km/h max
        </text>
      </svg>
    </div>
  )
}

interface SpinChartProps {
  topspin: number
  backspin: number
  sidespin: number
  flat: number
}

function SpinChart({ topspin, backspin, sidespin, flat }: SpinChartProps) {
  const data = [
    { name: "Topspin", value: topspin },
    { name: "Backspin", value: backspin },
    { name: "Sidespin", value: sidespin },
    { name: "Plat", value: flat },
  ].filter((d) => d.value > 0)

  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width="100%" height={140}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={35}
            outerRadius={55}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={SPIN_COLORS[i]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: "#2A2A2A", border: "none", color: "#F5F2EC", fontSize: 11 }}
            formatter={(v) => [`${v}`, ""]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center mt-1">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-1">
            <div className="w-2 h-2" style={{ backgroundColor: SPIN_COLORS[i] }} />
            <span className="text-[10px] text-sage">{d.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SetBarChart({ sets }: { sets: BallData["by_set"] }) {
  return (
    <ResponsiveContainer width="100%" height={120}>
      <BarChart data={sets} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
        <XAxis
          dataKey="set_number"
          tick={{ fill: "#8A9178", fontSize: 10 }}
          tickFormatter={(v) => `S${v}`}
        />
        <YAxis tick={{ fill: "#8A9178", fontSize: 10 }} />
        <Tooltip
          contentStyle={{ background: "#2A2A2A", border: "none", color: "#F5F2EC", fontSize: 11 }}
        />
        <Bar dataKey="avg_speed" name="Vitesse moy." fill="#4A5240" radius={[0, 0, 0, 0]} />
        <Bar dataKey="rallies" name="Échanges" fill="#8A9178" radius={[0, 0, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default function BallTrackingSection({ data }: { data: BallData }) {
  const { summary, by_set } = data

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Badge label="Données capteur" color="green" size="md" />
      </div>

      {/* Speed + Spin */}
      <Card>
        <div className="text-[10px] text-sage uppercase tracking-wider mb-3 font-semibold">Vitesse & Spin</div>
        <div className="grid grid-cols-2 gap-4">
          <SpeedGauge speed={summary.avg_speed_kmh} maxSpeed={summary.max_speed_kmh} />
          <SpinChart
            topspin={summary.topspin_count}
            backspin={summary.backspin_count}
            sidespin={summary.sidespin_count}
            flat={summary.flat_hit_count}
          />
        </div>
      </Card>

      {/* Stats clés */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Vitesse moy.", value: `${Math.round(summary.avg_speed_kmh)} km/h` },
          { label: "Spin max", value: `${Math.round(summary.max_spin_rpm)} rpm` },
          { label: "Total échanges", value: summary.total_rallies },
          { label: "Plus long échange", value: `${summary.longest_rally} pts` },
          { label: "Moy. échange", value: `${summary.avg_rally_length} pts` },
          { label: "Précision service", value: `${summary.serve_accuracy_pct}%` },
        ].map((s) => (
          <div key={s.label} className="bg-surface border border-white/[0.08] p-3">
            <div className="text-[10px] text-sage uppercase tracking-wider">{s.label}</div>
            <div className="font-display text-2xl text-white mt-0.5">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Par set */}
      {by_set.length > 0 && (
        <Card>
          <div className="text-[10px] text-sage uppercase tracking-wider mb-3 font-semibold">Par set — Vitesse & Échanges</div>
          <SetBarChart sets={by_set} />
        </Card>
      )}
    </div>
  )
}
