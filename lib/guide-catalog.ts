// The equipment walkthrough has its own page and is not a task in the guide catalogue.
export function visibleQuestEntries<T extends { id?: string; weapons?: unknown }>(items: T[]): T[] {
  return items.filter((q) => q.id !== 'quest-神兵取得流程' && !q.weapons)
}
