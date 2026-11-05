import { loadEnvConfig } from '@next/env'
import { readFile } from 'node:fs/promises'
loadEnvConfig(process.cwd())

async function main() {
  const { getMigrations } = await import('better-auth/db/migration')
  const { getAuth } = await import('../lib/auth')
  const { getPool } = await import('../lib/db')
  const { runMigrations } = await getMigrations(getAuth().options)
  await runMigrations()
  await getPool().query(await readFile(new URL('./forum-schema.sql',import.meta.url),'utf8'))
  console.log('JHDB authentication and forum schema migrated successfully.')
  await getPool().end()
}
main().catch((error)=>{console.error({name:error?.name,code:error?.code,message:String(error?.message).replace(/postgres(?:ql)?:\/\/[^\s]+/g,'[redacted]')});process.exitCode=1})
