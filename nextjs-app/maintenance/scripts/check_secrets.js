import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

function grepFiles(files, regex){
  const matches = []
  for(const f of files){
    try{
      const content = fs.readFileSync(f, 'utf8')
      if(regex.test(content)) matches.push(f)
    }catch(e){ /* ignore unreadable */ }
  }
  return matches
}

function main(){
  let files = []
  try{
    const out = execSync('git ls-files', { encoding: 'utf8' })
    files = out.split(/\r?\n/).filter(Boolean)
  }catch(e){
    const walk = (dir) => {
      for(const name of fs.readdirSync(dir)){
        const p = path.join(dir, name)
        const st = fs.statSync(p)
        if(st.isDirectory()) walk(p)
        else files.push(p)
      }
    }
    walk(process.cwd())
  }

  const patterns = [
    /NEXT_PUBLIC_SUPABASE_ANON_KEY\s*=\s*/i,
    /SUPABASE_SERVICE_ROLE_KEY\s*=\s*/i,
    /NEXT_PUBLIC_SUPABASE_URL\s*=\s*/i,
    /postgresql:\/\//i,
    /eyJ[A-Za-z0-9_-]{10,}\.\[A-Za-z0-9_-]{10,}\.\[A-Za-z0-9_-]{10,}/,
  ]

  const issues = []
  for(const pat of patterns){
    const m = grepFiles(files, pat)
    if(m.length) issues.push({ pattern: pat.toString(), files: m })
  }

  if(issues.length){
    console.error('Potential secrets found in tracked files:')
    for(const it of issues){
      console.error('-', it.pattern)
      it.files.forEach(f => console.error('   ', f))
    }
    console.error('\nAdvice: move secrets to .env.local, add to .gitignore, and rotate keys if leaked.')
    process.exit(2)
  }

  console.log('No obvious secrets found in tracked files.')
}

main()
