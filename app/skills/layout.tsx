import { HubTabs } from '@/app/components/HubTabs'

export default function SkillsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <HubTabs hub="skills" />
      {children}
    </div>
  )
}
