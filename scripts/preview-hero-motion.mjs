// A separate, loopback-only, low-priority dev server. Never deploys or pushes.
import { spawn } from 'node:child_process'
import { setPriority } from 'node:os'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
try { setPriority(0, 10) } catch { /* scheduling support varies by host */ }
const child = spawn(process.execPath,
  [fileURLToPath(new URL('../node_modules/next/dist/bin/next', import.meta.url)), 'dev', '--hostname', '127.0.0.1', '--port', '3188'],
  { cwd: root, stdio: 'inherit', env: { ...process.env, JHDB_DIST_DIR: '.next-hero-motion' }, windowsHide: true })
child.on('spawn', () => { try { setPriority(child.pid, 10) } catch { /* nonessential optimisation */ } })
child.on('error', error => { console.error(error.message); process.exitCode = 1 })
child.on('exit', code => { process.exitCode = code ?? 0 })
process.on('SIGINT', () => child.kill('SIGINT'))
process.on('SIGTERM', () => child.kill('SIGTERM'))
