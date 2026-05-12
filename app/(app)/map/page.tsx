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

      const parisLocations = [
        { lat: 48.8566, lng: 2.3522, label: "Ping Pang Paris" },
        { lat: 48.8721, lng: 2.3314, label: "Club Omnisports" },
        { lat: 48.8399, lng: 2.3644, label: "Salle Bercy" },
        { lat: 48.8615, lng: 2.3407, label: "Tournoi Paris Est" },
        { lat: 48.883, lng: 2.3201, label: "Salle de sport" },
      ]

      const locationPoints: LocationPoint[] = [
        ...sessions.map((s, i) => {
          const loc = parisLocations[i % parisLocations.length]
          return {
            id: `s-${s.id || i}`,
            type: "session" as const,
            lat: s.location_lat ?? loc.lat + (Math.random() - 0.5) * 0.02,
            lng: s.location_lng ?? loc.lng + (Math.random() - 0.5) * 0.02,
            label: s.location || loc.label,
            date: s.date || "",
          }
        }),
        ...matches.map((m, i) => {
          const loc = parisLocations[i % parisLocations.length]
          return {
            id: `m-${m.id || i}`,
            type: "match" as const,
            lat: m.location_lat ?? loc.lat + (Math.random() - 0.5) * 0.02,
            lng: m.location_lng ?? loc.lng + (Math.random() - 0.5) * 0.02,
            label: m.location || loc.label,
            date: m.date || "",
            result: m.result ?? undefined,
          }
        }),
      ]

      setPoints(locationPoints)
      setLoading(false)
    }
    loadData()
  }, [])

  useEffect(() => {
    if (!mapContainer.current || mapRef.current || loading || !MAPBOX_TOKEN) return

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
        points
          .filter((p) => filter === "all" || p.type === filter)
          .forEach((point) => {
            const el = document.createElement("div")
            el.style.cssText = `
              width: 10px; height: 10px;
              background: ${point.type === "session" ? "#1A5C4A" : point.result === "win" ? "#1A5C4A" : "#C72927"};
              border: 1px solid rgba(255,255,255,0.3);
              cursor: pointer;
            `

            const popup = new mapboxgl.Popup({ offset: 16, className: "pingtrack-popup" })
              .setHTML(`
                <div style="font-family: system-ui; color: #F0EDE6; padding: 2px;">
                  <div style="font-size: 12px; font-weight: 500;">${point.label}</div>
                  <div style="font-size: 10px; color: #7A9E8E; margin-top: 2px;">
                    ${point.type === "session" ? "Séance" : "Match"}
                    ${point.result ? (point.result === "win" ? " · Victoire" : " · Défaite") : ""}
                  </div>
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
        <div className="absolute top-14 left-0 right-0 z-10 flex items-center gap-3 px-4 py-3 bg-black/90 backdrop-blur-sm border-b border-white/[0.06]">
          {(["all", "session", "match"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-[10px] uppercase tracking-[0.15em] border transition-all font-sans ${
                filter === f ? "border-white text-white" : "border-white/15 text-sage/50 hover:border-white/30"
              }`}
            >
              {f === "all" ? "Tout" : f === "session" ? "Séances" : "Matchs"}
            </button>
          ))}
          <span className="ml-auto text-[9px] text-sage/40 uppercase tracking-widest">{filteredCount} lieux</span>
        </div>

        {!MAPBOX_TOKEN ? (
          <div className="flex items-center justify-center h-full flex-col gap-6 text-center px-8">
            <div className="font-display font-light text-white/10 leading-none" style={{ fontSize: 88 }}>
              MAP
            </div>
            <div className="text-[10px] text-sage uppercase tracking-[0.25em]">
              Configure NEXT_PUBLIC_MAPBOX_TOKEN pour activer la carte
            </div>

            <div className="w-full max-w-sm mt-4">
              <div className="text-[9px] text-sage uppercase tracking-[0.2em] mb-3">
                Tes lieux ({filteredCount})
              </div>
              <div className="flex flex-col max-h-56 overflow-y-auto">
                {points
                  .filter((p) => filter === "all" || p.type === filter)
                  .map((p) => (
                    <div key={p.id} className="flex items-center gap-3 py-3 border-b border-white/[0.05]">
                      <div className={`w-[3px] self-stretch flex-shrink-0 ${p.type === "session" ? "bg-green-light" : "bg-red"}`} />
                      <span className="text-sm text-white/60 font-sans flex-1">{p.label}</span>
                      <span className="text-[10px] text-sage/40">{p.date}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-[10px] text-sage uppercase tracking-[0.2em]">Chargement…</div>
          </div>
        ) : (
          <div ref={mapContainer} className="w-full h-full" />
        )}
      </div>
    </>
  )
}
