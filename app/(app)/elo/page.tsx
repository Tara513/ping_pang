import { getEloPageData } from "@/lib/data/shared-profile"
import { EloClient } from "./EloClient"

export default async function EloPage() {
  const data = await getEloPageData()
  return <EloClient data={data} />
}
