const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')
const ffmpegPath = require('ffmpeg-static')

if (!ffmpegPath) {
  console.error('No se encontró ffmpeg-static.')
  process.exit(1)
}

const outputDir = path.join(process.cwd(), 'public', 'videos')
const outputFile = path.join(outputDir, 'hero-particles.mp4')

fs.mkdirSync(outputDir, { recursive: true })

const args = [
  '-y',
  '-f',
  'lavfi',
  '-i',
  'color=c=0x030303:s=1280x720:r=24:d=7',
  '-f',
  'lavfi',
  '-i',
  'life=s=1280x720:rate=24:ratio=0.018:mold=14:seed=19:death_color=000000:life_color=ff2a00',
  '-f',
  'lavfi',
  '-i',
  'life=s=1280x720:rate=24:ratio=0.012:mold=10:seed=77:death_color=000000:life_color=ff6a2d',
  '-filter_complex',
  '[1:v]format=rgba,gblur=sigma=1.05,colorchannelmixer=aa=0.74[p1];[2:v]format=rgba,gblur=sigma=1.9,colorchannelmixer=aa=0.48[p2];[0:v][p1]overlay=x=30*sin(t*0.78)+12*cos(t*0.31):y=20*cos(t*0.67)+8*sin(t*0.29):shortest=1[tmp1];[tmp1][p2]overlay=x=-24*cos(t*0.72)+13*sin(t*0.25):y=17*sin(t*0.87)-9*cos(t*0.27):shortest=1[tmp2];[tmp2]eq=contrast=1.08:saturation=0.68:brightness=-0.01,format=yuv420p,split[a][b];[b]reverse[br];[a][br]concat=n=2:v=1:a=0[v]',
  '-map',
  '[v]',
  '-t',
  '14',
  '-r',
  '24',
  '-an',
  '-c:v',
  'libx264',
  '-preset',
  'medium',
  '-crf',
  '21',
  '-movflags',
  '+faststart',
  outputFile
]

const ffmpeg = spawn(ffmpegPath, args, { stdio: 'inherit' })

ffmpeg.on('close', (code) => {
  if (code === 0) {
    console.log(`Video generado: ${outputFile}`)
    process.exit(0)
  }

  console.error(`Error al generar video. Código: ${code}`)
  process.exit(code || 1)
})
