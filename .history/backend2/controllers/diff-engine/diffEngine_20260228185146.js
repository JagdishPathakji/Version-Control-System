import fs from "fs"
import path from "path"

const JVCS_ROOT = path.join(process.cwd(), ".jvcs")

function readFileSafe()