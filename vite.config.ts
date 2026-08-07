import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const execFileAsync = promisify(execFile)
const STATIC_SEO_SCRIPTS = [
  'scripts/prerender.mjs',
  'scripts/patch-contact-prerender.mjs',
  'scripts/promote-default-locale.mjs',
]

function staticSeoBuildPlugin(): Plugin {
  return {
    name: 'copero-static-seo-build',
    apply: 'build',
    async closeBundle() {
      for (const script of STATIC_SEO_SCRIPTS) {
        const { stdout, stderr } = await execFileAsync(process.execPath, [script], {
          cwd: process.cwd(),
          maxBuffer: 4 * 1024 * 1024,
        })
        if (stdout) process.stdout.write(stdout)
        if (stderr) process.stderr.write(stderr)
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), staticSeoBuildPlugin()],
})
