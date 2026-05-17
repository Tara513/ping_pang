'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { Plus, Clock, Wrench } from 'lucide-react'
import type { Equipment } from '@/lib/types'
import { getEquipments } from '@/lib/api'
import { formatDate } from '@/lib/utils/format'

export default function EquipmentPage() {
  const [equipments, setEquipments] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getEquipments().then(e => { setEquipments(e); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader />

  const active = equipments.find(e => e.active)
  const history = equipments.filter(e => !e.active)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-bold text-xl text-onyx">Matériel</h2>
        <Button variant="primary" size="sm" icon={Plus}>Nouveau</Button>
      </div>

      {/* Active equipment */}
      {active && (
        <div>
          <p className="text-xs font-semibold text-onyx-400 uppercase tracking-wide mb-2">Matériel actif</p>
          <EquipmentCard equipment={active} active />
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-onyx-400 uppercase tracking-wide mb-2">Historique</p>
          <div className="space-y-2">
            {history.map(eq => (
              <EquipmentCard key={eq.id} equipment={eq} active={false} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function EquipmentCard({ equipment: eq, active }: { equipment: Equipment; active: boolean }) {
  return (
    <Card className={active ? 'border-evergreen/30' : ''}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Wrench size={15} className="text-onyx-400" />
          <CardTitle>{eq.blade.brand} {eq.blade.model}</CardTitle>
        </div>
        <div className="flex items-center gap-1.5">
          {active && <Badge variant="lime">Actif</Badge>}
          <span className="flex items-center gap-1 text-xs text-onyx-400">
            <Clock size={12} />
            {eq.hours_played}h
          </span>
        </div>
      </CardHeader>

      <div className="space-y-2 text-sm">
        <EquipRow label="Bois" value={`${eq.blade.brand} ${eq.blade.model}`} />
        <EquipRow
          label="Coup droit"
          value={`${eq.forehand_rubber.brand} ${eq.forehand_rubber.model}`}
          sub={`${eq.forehand_rubber.thickness}mm`}
        />
        <EquipRow
          label="Revers"
          value={`${eq.backhand_rubber.brand} ${eq.backhand_rubber.model}`}
          sub={`${eq.backhand_rubber.thickness}mm`}
        />
        <EquipRow label="Depuis le" value={formatDate(eq.start_date)} />
      </div>
    </Card>
  )
}

function EquipRow({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-start justify-between py-1.5 border-b border-onyx-50 last:border-0">
      <span className="text-onyx-400 shrink-0 mr-3">{label}</span>
      <span className="text-right">
        <span className="font-medium text-onyx">{value}</span>
        {sub && <span className="text-onyx-400 ml-1 text-xs">{sub}</span>}
      </span>
    </div>
  )
}
