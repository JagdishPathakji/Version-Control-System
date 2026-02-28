import fs from "fs"
import path from "path"

const JVCS_ROOT = path.join(process.cwd(), ".jvcs")

const IGNORE_FOLDERS = [
  ".jvcs",
  "node_modules",
  ".git"
]

const IGNORE_FILES = [
  ".DS_Store",
  "jvcs_hashcode.json",
  "meta.json",
  "HEAD",
  "config.json"
]

function fileExists(filepath) {
    return fs.existsSync(filepath)
}

function readFileSafe(filepath) {

    if(!fileExists(filepath)) return ""
    return fs.readFileSync(filepath, "utf-8")
}

function shouldIgnoreFile(fileName) {
    return IGNORE_FILES.includes(fileName)
}

function shouldIgnoreFolder(folderName) {
    return IGNORE_FOLDERS.includes(folderName)
}

export default function gitDiff()


