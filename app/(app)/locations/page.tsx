'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { MapPin, Clock, Table2, Dumbbell, Trophy, Search } from 'lucide-react'
import type { Location } from '@/lib/types'
import { getLocations } from '@/lib/api'

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getLocations().then(l => { setLocations(l); setLoading(false) })
  }, [])

  const filtered = locations.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.city.toLowerCase().includes(search.toLowerCase()),
  )

  if (loading) return <PageLoader />

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-heading font-bold text-xl text-onyx">Lieux</h2>
        <p className="text-sm text-onyx-400">{locations.length} lieux enregistrés</p>
      </div>

      <Input
        icon={Search}
        placeholder="Rechercher un lieu..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {/* Map placeholder */}
      <div className="h-40 bg-onyx-50 rounded-[8px] border border-onyx-100 flex items-center justify-center">
        <div className="text-center">
          <MapPin size={24} className="text-onyx-300 mx-auto mb-2" />
          <p className="text-sm text-onyx-400">Carte disponible avec token Mapbox</p>
          <p className="text-xs text-onyx-300">Configurer NEXT_PUBLIC_MAPBOX_TOKEN</p>
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map(location => (
          <LocationCard key={location.id} location={location} />
        ))}
      </div>
    </div>
  )
}

function LocationCard({ location: loc }: { location: Location }) {
  return (
    <Card padding="sm">
      <div className="flex items-start gap-3">
        <div className="size-10 rounded-[6px] bg-evergreen/10 flex items-center justify-center shrink-0">
          <MapPin size={16} className="text-evergreen" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-onyx">{loc.name}</p>
          {loc.club_name && <p className="text-xs text-onyx-400">{loc.club_name}</p>}
          <p className="text-xs text-onyx-400 mt-0.5">{loc.address}, {loc.city}</p>

          <div className="flex gap-3 mt-2">
            {loc.tables_count && (
              <span className="flex items-center gap-1 text-xs text-onyx-400">
                <Table2 size={11} />
                {loc.tables_count} tables
              </span>
            )}
            {loc.hours && (
              <span className="flex items-center gap-1 text-xs text-onyx-400">
                <Clock size={11} />
                {loc.hours}
              </span>
            )}
          </div>

          <div className="flex gap-3 mt-1">
            {loc.sessions_count > 0 && (
              <span className="flex items-center gap-1 text-xs text-evergreen font-medium">
                <Dumbbell size={11} />
                {loc.sessions_count} séances
              </span>
            )}
            {loc.matches_count > 0 && (
              <span className="flex items-center gap-1 text-xs text-blue-pp-dark font-medium">
                <Trophy size={11} />
                {loc.matches_count} matchs
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
