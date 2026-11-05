export const CATEGORIES = [
  { id: 'questions', label: '江湖問答' }, { id: 'skills', label: '武學研討' },
  { id: 'quests', label: '任務攻略' }, { id: 'general', label: '同道閒談' },
  { id: 'feedback', label: '資料修正' },
] as const
export type Category = typeof CATEGORIES[number]['id']
export class ForumError extends Error { constructor(public status: number, message: string) { super(message) } }
export function categoryLabel(id: string) { return CATEGORIES.find((c) => c.id === id)?.label || '其他' }
export function text(value: unknown, name: string, min: number, max: number) {
  if (typeof value !== 'string') throw new ForumError(400, `${name}格式不正確。`)
  const clean = value.trim().replace(/\r\n?/g, '\n')
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(clean)) throw new ForumError(400, `${name}含有不支援的字元。`)
  if ([...clean].length < min || [...clean].length > max) throw new ForumError(400, `${name}須為 ${min}–${max} 個字。`)
  return clean
}
export function postInput(value: Record<string, unknown>) {
  if (!CATEGORIES.some((c) => c.id === value.category)) throw new ForumError(400, '請選擇有效分類。')
  return { title: text(value.title, '標題', 4, 100), body: text(value.body, '內文', 10, 12000), category: value.category as Category }
}
export function profileInput(value: Record<string, unknown>) {
  if (Object.keys(value).some((key) => !['displayName','gameId'].includes(key))) throw new ForumError(400, '不支援的會員設定欄位。')
  const rawId = typeof value.gameId === 'string' ? value.gameId.normalize('NFKC') : value.gameId ?? ''
  const gameId = text(rawId, '遊戲 ID', 0, 32)
  if (gameId && !/^[\p{L}\p{N}_\- ]+$/u.test(gameId)) throw new ForumError(400, '遊戲 ID 只接受文字、數字、空格、底線及連字號。')
  return { displayName: text(value.displayName, '顯示名稱', 2, 30), gameId }
}
export function isAdminEmail(email: string, verified: boolean, allowlist = process.env.FORUM_ADMIN_EMAIL || '') {
  return verified && allowlist.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean).includes(email.trim().toLowerCase())
}
export function validId(id: string) { if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) throw new ForumError(404, '找不到此討論。'); return id }
