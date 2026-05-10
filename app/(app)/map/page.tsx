"use client"

export const dynamic = "force-dynamic"


import { useEffect, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import TopBar from "@/components/layout/TopBar"
import type { Session, Match } from "@/types/database"
import { demoSessions, demoMatches } from "@/lib/seeds/demoData"

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ""

interface LocationPoint {
  id: string
  type: "session" | "match"
  lat: number
  lng: number
  label: string
  date: string
  result?: string
}

export default function MapPage() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<unknown>(null)
  const [filter, setFilter] = useState<"all" | "session" | "match">("all")
  const [points, setPoints] = useState<LocationPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      let sessions: Partial<Session>[] = []
      let matches: Partial<Match>[] = []

      if (user) {
        const [sRes, mRes] = await Promise.all([
          supabase.from("sessions").select("*").eq("player_id", user.id),
          supabase.from("matches").select("*").eq("player_id", user.id),
        ])
        sessions = sRes.data?.length ? sRes.data : demoSessions as Session[]
        matches = mRes.data?.length ? mRes.data : demoMatches as Match[]
      } else {
        sessions = demoSessions as Session[]
        matches = demoMatches as Match[]
      }

      const locationPoints: LocationPoint[] = []

      // Demo locations for sessions without GPS
      const parisLocations = [
        { lat: 48.8566, lng: 2.3522, label: "Ping Pang Paris" },
        { lat: 48.8721, lng: 2.3314, label: "Club Omnisports" },
        { lat: 48.8399, lng: 2.3644, label: "Salle Bercy" },
        { lat: 48.8615, lng: 2.3407, label: "Tournoi Paris Est" },
        { lat: 48.883, lng: 2.3201, label: "Salle de sport" },
      ]

      sessions.forEach((s, i) => {
        const loc = parisLocations[i % parisLocations.length]
        locationPoints.push({
          id: `s-${s.id || i}`,
          type: "session",
          lat: s.location_lat ?? loc.lat + (Math.random() - 0.5) * 0.02,
          lng: s.location_lng ?? loc.lng + (Math.random() - 0.5) * 0.02,
          label: s.location || loc.label,
          date: s.date || "",
        })
      })

      matches.forEach((m, i) => {
        const loc = parisLocations[i % parisLocations.length]
        locationPoints.push({
          id: `m-${m.id || i}`,
          type: "match",
          lat: m.location_lat ?? loc.lat + (Math.random() - 0.5) * 0.02,
          lng: m.location_lng ?? loc.lng + (Math.random() - 0.5) * 0.02,
          label: m.location || loc.label,
          date: m.date || "",
          result: m.result ?? undefined,
        })
      })

      setPoints(locationPoints)
      setLoading(false)
    }
    loadData()
  }, [])

  useEffect(() => {
    if (!mapContainer.current || mapRef.current || loading) return
    if (!MAPBOX_TOKEN) return

    async function initMap() {
      const mapboxgl = (await import("mapbox-gl")).default
      await import("mapbox-gl/dist/mapbox-gl.css")

      mapboxgl.accessToken = MAPBOX_TOKEN

      const map = new mapboxgl.Map({
        container: mapContainer.current!,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [2.3522, 48.8566],
        zoom: 11,
      })

      mapRef.current = map

      map.on("load", () => {
        const filtered = points.filter((p) => filter === "all" || p.type === filter)

        filtered.forEach((point) => {
          const el = document.createElement("div")
          el.className = "map-marker"
          el.style.cssText = `
            width: 28px; height: 28px;
            background: ${point.type === "session" ? "#4A5240" : point.result === "win" ? "#4A5240" : "#C8352A"};
            border: 2px solid ${point.type === "match" ? "rgba(255,255,255,0.3)" : "transparent"};
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; font-size: 14px;
          `
          el.textContent = point.type === "session" ? "🏓" : "⚔️"

          const popup = new mapboxgl.Popup({ offset: 20, className: "pingtrack-popup" })
            .setHTML(`
              <div style="font-family: system-ui; color: #F5F2EC;">
                <div style="font-weight: 600; font-size: 13px;">${point.label}</div>
                <div style="font-size: 11px; color: #8A9178; margin-top: 2px;">
                  ${point.type === "session" ? "🏓 Séance" : "⚔️ Match"}
                  ${point.result ? (point.result === "win" ? " — Victoire" : " — Défaite") : ""}
                </div>
                <div style="font-size: 10px; color: #8A9178;">${point.date}</div>
              </div>
            `)

          new mapboxgl.Marker(el)
            .setLngLat([point.lng, point.lat])
            .setPopup(popup)
            .addTo(map)
        })
      })
    }

    initMap()
  }, [points, loading, filter])

  const filteredCount = points.filter((p) => filter === "all" || p.type === filter).length

  return (
    <>
      <TopBar title="Carte" />
      <div className="fixed inset-0 pt-14 pb-16 bg-black" style={{ zIndex: 0 }}>
        {/* Filter bar */}
        <div className="absolute top-14 left-0 right-0 z-10 flex gap-2 px-4 py-3 bg-black/80 backdrop-blur-sm border-b border-white/[0.06]">
          {(["all", "session", "match"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wide border transition-all ${
                filter === f ? "bg-white text-black border-white" : "border-white/20 text-sage hover:border-white/40"
              }`}
            >
              {f === "all" ? "Tous" : f === "session" ? "🏓 Séances" : "⚔️ Matchs"}
            </button>
          ))}
          <span className="ml-auto text-xs text-sage self-center">{filteredCount} lieux</span>
        </div>

        {!MAPBOX_TOKEN ? (
          <div className="flex items-center justify-center h-full flex-col gap-4 text-center px-8">
            <div className="text-5xl">🗺</div>
            <div className="font-display text-3xl font-light text-white">Carte</div>
            <p className="text-sage text-sm">
              Configure <code className="text-white bg-surface px-2 py-0.5">NEXT_PUBLIC_MAPBOX_TOKEN</code> pour activer la carte interactive.
            </p>
            <div className="mt-4 border border-white/10 bg-surface p-4 text-left w-full max-w-sm">
              <div className="text-[10px] text-sage uppercase tracking-wider mb-2">Tes lieux ({filteredCount})</div>
              <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
                {points.filter((p) => filter === "all" || p.type === filter).map((p) => (
                  <div key={p.id} className="flex items-center gap-2 text-xs text-white/60">
                    <span>{p.type === "session" ? "🏓" : "⚔️"}</span>
                    <span>{p.label}</span>
                    <span className="ml-auto text-sage">{p.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-sage">Chargement de la carte...</div>
          </div>
        ) : (
          <div ref={mapContainer} className="w-full h-full" />
        )}
      </div>
    </>
  )
}
