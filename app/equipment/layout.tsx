import { HubTabs } from '@/app/components/HubTabs'

export default function EquipmentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <HubTabs hub="equipment" />
      {children}
    </div>
  )
}
