import { HubTabs } from '@/app/components/HubTabs'

export default function GuidesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="guide-shell">
      <HubTabs hub="guides" />
      {children}
    </div>
  )
}
