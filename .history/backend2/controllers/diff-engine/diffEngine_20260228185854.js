import fs from "fs"
import path from "path"

const JVCS_ROOT = path.join(process.cwd(), ".jvcs")

const IGNORE_FOLDERS = [
  ".jvcs",
  "node_modules",
  ".git"
]



function readFileSafe(filepath) {

    if(!fs.existsSync(filepath)) 
    return ""
    
    return fs.readFileSync(filepath,"utf-8")
}

