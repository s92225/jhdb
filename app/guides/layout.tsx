import { HubTabs } from '@/app/components/HubTabs'

export default function GuidesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <HubTabs hub="guides" />
      {children}
    </div>
  )
}
