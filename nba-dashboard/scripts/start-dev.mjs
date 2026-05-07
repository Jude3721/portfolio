import { copyFileSync } from 'fs'
import { spawn } from 'child_process'

copyFileSync('_index.src.html', 'index.html')

const vite = spawn('node', ['node_modules/vite/bin/vite.js', '--port', '5174'], { stdio: 'inherit' })
vite.on('exit', code => process.exit(code ?? 0))
