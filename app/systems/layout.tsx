import { HubTabs } from '@/app/components/HubTabs'

export default function SystemsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <HubTabs hub="systems" />
      {children}
    </div>
  )
}
