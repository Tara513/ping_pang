import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { getCoachPageData } from "@/lib/data/coach"
import { CoachAnalysisClient } from "../CoachAnalysisClient"

export default async function CoachAnalysisPage() {
  const data = await getCoachPageData()

  return (
    <div className="space-y-5">
      <div>
        <Link href="/coach" className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-onyx-400">
          <ChevronLeft size={15} />
          Coach IA
        </Link>
        <h2 className="font-heading font-bold text-xl text-onyx">Analyse des matchs</h2>
        <p className="text-sm text-onyx-400">
          Analyse les matchs récents, y compris les matchs PGR projetés.
        </p>
      </div>

      <CoachAnalysisClient initialData={data} />
    </div>
  )
}
