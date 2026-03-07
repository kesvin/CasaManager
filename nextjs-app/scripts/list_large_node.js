const fs = require('fs')
const path = require('path')
const root = path.resolve(__dirname, '..')
const out = 'C:/Users/kesvi/nextjs_large_node.json'
const results = []
function walk(dir){
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for(const e of entries){
    try{
      const full = path.join(dir, e.name)
      if(e.isDirectory()){
        walk(full)
      }else if(e.isFile()){
        const stat = fs.statSync(full)
        if(stat.size > 5 * 1024 * 1024){
          results.push({ fullName: full, bytes: stat.size, mb: +(stat.size/1024/1024).toFixed(2) })
        }
      }
    }catch(err){ }
  }
}
walk(root)
fs.writeFileSync(out, JSON.stringify(results, null, 2))
console.log('WROTE', out)
