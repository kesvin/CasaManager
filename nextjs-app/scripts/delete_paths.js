const fs = require('fs')
const paths = [
  'C:/Users/kesvi/OneDrive/Trabajo VIVECODING/Proyecto CasaManager/nextjs-app/.git.embedded.bak',
  'C:/Users/kesvi/OneDrive/Trabajo VIVECODING/Proyecto CasaManager/nextjs-app/.next',
  'C:/Users/kesvi/OneDrive/Trabajo VIVECODING/Proyecto CasaManager/nextjs-app/node_modules'
]
paths.forEach(p=>{
  try{
    if(fs.existsSync(p)){
      fs.rmSync(p, { recursive: true, force: true })
      console.log('REMOVED', p)
    } else {
      console.log('MISSING', p)
    }
  }catch(e){
    console.error('ERR', p, e.message)
  }
})
