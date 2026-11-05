type ProfileRow = { displayName: string | null; gameId: string | null }
type Query = (sql: string, values: string[]) => Promise<{ rows: ProfileRow[] }>

export async function readGoogleProfile(userId: string, query: Query) {
  // Google linkage and profile are checked together. Existing members need one
  // read after session validation, not three serial network trips and an INSERT.
  const { rows } = await query(`
    SELECT p.display_name AS "displayName",p.game_id AS "gameId"
    FROM account a LEFT JOIN forum_profiles p ON p.user_id=a."userId"
    WHERE a."userId"=$1 AND a."providerId"=$2 LIMIT 1`, [userId, 'google'])
  if (!rows[0]) return null
  if (rows[0].displayName !== null) return rows[0]
  // Only initialize a profile on first use. ON CONFLICT preserves a name saved
  // by another request; the following read sees that committed profile.
  await query('INSERT INTO forum_profiles (user_id,display_name) VALUES ($1,$2) ON CONFLICT (user_id) DO NOTHING', [userId, `江湖同道 ${userId.slice(-4)}`])
  const profile = await query('SELECT display_name AS "displayName",game_id AS "gameId" FROM forum_profiles WHERE user_id=$1', [userId])
  return profile.rows[0] || null
}
