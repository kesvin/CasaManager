import { spawnSync } from 'child_process'
import fs from 'fs'
import path from 'path'

function hasCmd(cmd){
  try{ const r = spawnSync(cmd, ['-h'], { stdio: 'ignore' }); return r.status === 0 || r.status === null }catch(e){return false}
}

async function main(){
  const repo = path.join(process.cwd(), 'public')
  console.log('Scanning public/ for large assets...')
  function walk(dir){
    const res = []
    for(const name of fs.readdirSync(dir)){
      const p = path.join(dir, name)
      const st = fs.statSync(p)
      if(st.isDirectory()) res.push(...walk(p))
      else res.push({ path: p, size: st.size })
    }
    return res
  }
  const assets = walk(repo).sort((a,b)=>b.size-a.size)
  assets.slice(0,20).forEach(a=> console.log((a.size/1024).toFixed(1)+' KB', a.path))

  // video optimization suggestion
  const videos = assets.filter(a=> /\.mp4$|\.mov$|\.webm$/i.test(a.path))
  if(videos.length){
    console.log('\nFound videos:')
    videos.forEach(v=> console.log(' -', v.path))
    if(hasCmd('ffmpeg')){
      console.log('\nffmpeg detected — you can transcode with:')
      videos.forEach(v=>{
        const out = v.path.replace(/\.mp4$/i,'.webm')
        console.log(`ffmpeg -i "${v.path}" -c:v libvpx-vp9 -b:v 500k -crf 30 "${out}"`)
      })
    } else {
      console.log('\nffmpeg not found locally. Install ffmpeg to transcode videos or run in CI.')
    }
  }

  // images suggestion
  const images = assets.filter(a=> /\.jpe?g$|\.png$|\.gif$/i.test(a.path))
  if(images.length){
    console.log('\nImage optimization suggestions:')
    images.slice(0,10).forEach(img=> console.log(' -', img.path))
    console.log('\nUse `cwebp` or `sharp` to produce webp/avif variants. Example (cwebp):')
    console.log('cwebp -q 80 input.jpg -o output.webp')
  }

  console.log('\nWhen done, upload optimized assets to CDN or Supabase Storage and update references to use optimized variants.')
}

main()
