import { getAllUpdates } from '@/lib/data'
import LandingPage from './LandingPage'

export default function Page() {
  const updates = getAllUpdates().slice(0, 8).map((u) => ({
    id: u.id,
    date: u.date,
    title: u.title,
    content: u.content,
  }))

  return <LandingPage updates={updates} />
}
