// CommonJS style
const fs = require("fs")
const path = require("path")
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

function loadDirectoryRecursive(dirPath, baseDir = dirPath, snapshot = {}) {

    if(!fileExists(dirPath)) return snapshot

    const entries = fs.readdirSync(dirPath)

    for(const entry of entries) {
        if(shouldIgnoreFile(entry)) continue
        if(shouldIgnoreFolder(entry)) continue

        const fullPath = path.join(dirPath, entry)
        const stat = fs.statSync(fullPath)
    
        if(stat.isDirectory()) {
            loadDirectoryRecursive(fullPath, baseDir, snapshot)
        } 
        else if (stat.isFile()) {
            const relativePath = path.relative(baseDir, fullPath)
            snapshot[relativePath] = readFileSafe(fullPath)
        }
    }

    return snapshot
}

function loadStageSnapshot() {
    const stagePath = path.join(JVCS_ROOT, "staging")
    return loadDirectoryRecursive(stagePath)
}

function loadWorkingDirectorySnapshot() {
    return loadDirectoryRecursive(process.cwd(), process.cwd())
}

function calculateLineDiff(leftContent, rightContent) {
    
    const leftLines = leftContent.split("\n")
    const rightLines = rightContent.split("\n")

    let added = 0
    let removed = 0

    const max = Math.max(leftLines.length, rightLines.length)

    for (let i = 0; i < max; i++) {
        if (leftLines[i] !== rightLines[i]) {
            if(leftLines[i] === undefined) {
                added++
            } 
            else if(rightLines[i] === undefined) {
                removed++
            }
            else {
                added++
                removed++
            }
        }
    }

    return { added, removed }
}

function buildDiffObject(filePath, leftContent, rightContent) {
    let status = "modified"

    if(!leftContent && rightContent) {
        status = "added"
    } 
    else if(leftContent && !rightContent) {
        status = "deleted"
    }

    return {
        path: filePath,
        status,
        leftContent,
        rightContent,
        stats: calculateLineDiff(leftContent, rightContent)
    }
}

function getDiff(mode, options = {}) {

    let leftSnapshot = {}
    let rightSnapshot = {}

    if(mode === "commit-vs-commit") {
        const { commitA, commitB } = options
        
        if(!commitA || !commitB) {
            throw new Error("commit-vs-commit requires commitA and commitB")
        }

        leftSnapshot = loadCommitSnapshot(commitA)
        rightSnapshot = loadCommitSnapshot(commitB)
    }
    else if(mode === "commit-vs-stage") {
        const { commitId } = options

        if(!commitId) {
            throw new Error("commit-vs-stage requires commitId")
        }

        leftSnapshot = loadCommitSnapshot(commitId)
        rightSnapshot = loadStageSnapshot()
    }
    else if(mode === "stage-vs-cwd") {
        leftSnapshot = loadStageSnapshot()
        rightSnapshot = loadWorkingDirectorySnapshot()
    }
    else {
        throw new Error("Invalid diff mode")
    }

    const allFiles = new Set([
        ...Object.keys(leftSnapshot),
        ...Object.keys(rightSnapshot)
    ])

    const diffResults = []

    for (const filePath of allFiles) {
        const leftContent = leftSnapshot[filePath] || ""
        const rightContent = rightSnapshot[filePath] || ""

        if(leftContent !== rightContent) {
            diffResults.push(
                buildDiffObject(filePath, leftContent, rightContent)
            )
        }
    }

    return diffResults
}

module.exports = getDiff