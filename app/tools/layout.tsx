import { HubTabs } from '@/app/components/HubTabs'

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <HubTabs hub="tools" />
      {children}
    </div>
  )
}
