import { getTrainingProfileData } from "@/lib/data/shared-profile"
import { ProfileClient } from "./ProfileClient"

export default async function ProfilePage() {
  const data = await getTrainingProfileData()
  return <ProfileClient data={data} />
}
