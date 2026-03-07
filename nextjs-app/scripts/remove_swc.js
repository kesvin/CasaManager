const fs = require('fs')
const files = [
  'C:/Users/kesvi/OneDrive/Trabajo VIVECODING/Proyecto CasaManager/nextjs-app/node_modules/@next/.swc-win32-x64-msvc-fZefOhe0/next-swc.win32-x64-msvc.node',
  'C:/Users/kesvi/OneDrive/Trabajo VIVECODING/Proyecto CasaManager/nextjs-app/node_modules/@next/swc-win32-x64-msvc/next-swc.win32-x64-msvc.node'
]
files.forEach(f=>{
  try{
    if(fs.existsSync(f)){
      fs.unlinkSync(f)
      console.log('UNLINKED', f)
    } else console.log('MISSING', f)
  }catch(e){
    console.error('ERR', f, e.message)
  }
})
