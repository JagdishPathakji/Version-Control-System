import fs from "fs"
import path from "path"

const JVCS_ROOT = path.join(process.cwd(), ".jvcs")

function readFileSafe(filepath) {

    if(!fs.existsSync(filepath)) 
    return ""
    
    return fs.readFileSync(filepath,"utf-8")
}

