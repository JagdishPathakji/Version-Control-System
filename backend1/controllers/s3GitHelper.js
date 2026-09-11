const { S3Client, GetObjectCommand, PutObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const zlib = require('zlib');

// The SDK automatically picks up ~/.aws/credentials
const s3Client = new S3Client({ region: process.env.AWS_REGION || "ap-south-1" });
const BUCKET_NAME = "girgit-project"; 

async function getS3Object(key) {
    try {
        const command = new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key });
        const response = await s3Client.send(command);
        const byteArray = await response.Body.transformToByteArray();
        return Buffer.from(byteArray);
    } catch (err) {
        if (err.name === 'NoSuchKey') return null;
        throw err;
    }
}

async function getGitObject(prefix, oid) {
    const key = `${prefix}/objects/${oid}`;
    const compressed = await getS3Object(key);
    if (!compressed) return null;
    
    // In girgit, objects are stored uncompressed!
    const decompressed = compressed;
    
    // Format: "type\0content" (girgit does not include size in the header!)
    const nullIdx = decompressed.indexOf(0);
    const type = decompressed.subarray(0, nullIdx).toString('utf-8');
    const content = decompressed.subarray(nullIdx + 1);
    
    return { type, size: content.length, content };
}

async function getHeadRef(prefix) {
    const key = `${prefix}/HEAD`;
    const data = await getS3Object(key);
    if (!data) return null;
    const content = data.toString('utf-8').trim();
    if (content.startsWith("ref: ")) {
        return content.split("ref: ")[1];
    }
    return content;
}

async function getRefOid(prefix, refPath) {
    const key = `${prefix}/${refPath}`;
    const data = await getS3Object(key);
    if (!data) return null;
    return data.toString('utf-8').trim();
}

// Parses a tree object content into an array of entries
function parseTree(content) {
    const entries = [];
    const text = content.toString('utf-8').replace(/\r/g, '');
    const lines = text.split('\n');
    
    for (let line of lines) {
        if (!line.trim()) continue;
        // Format: "type oid name"
        const parts = line.split(' ');
        if (parts.length >= 3) {
            const type = parts[0];
            const oid = parts[1];
            const name = parts.slice(2).join(' ');
            entries.push({ type, oid, name });
        }
    }
    return entries;
}

// Parses a commit object content
function parseCommit(content) {
    const text = content.toString('utf-8').replace(/\r/g, '');
    const lines = text.split('\n');
    let tree = null;
    let parent = null;
    let parents = [];
    let author = null;
    let message = "";
    
    let i = 0;
    for (; i < lines.length; i++) {
        if (lines[i] === "") break;
        const [key, ...rest] = lines[i].split(' ');
        const val = rest.join(' ').trim();
        if (key === 'tree') tree = val;
        else if (key === 'parent') {
            if (!parent) parent = val;
            parents.push(val);
        }
        else if (key === 'author') author = val;
    }
    
    message = lines.slice(i + 1).join('\n').trim();
    
    return { tree, parent, parents, author, message };
}

const crypto = require('crypto');


// ... existing code ...

async function putS3Object(key, body) {
    const command = new PutObjectCommand({ Bucket: BUCKET_NAME, Key: key, Body: body });
    await s3Client.send(command);
}

function hashObject(data, type) {
    const obj = Buffer.concat([Buffer.from(type + '\0'), data]);
    const hash = crypto.createHash('sha1').update(obj).digest('hex');
    return { oid: hash, buffer: obj };
}

async function writeObject(prefix, data, type) {
    const { oid, buffer } = hashObject(data, type);
    await putS3Object(`${prefix}/objects/${oid}`, buffer);
    return oid;
}

async function getBranches(prefix) {
    try {
        const command = new ListObjectsV2Command({
            Bucket: BUCKET_NAME,
            Prefix: `${prefix}/refs/heads/`
        });
        const response = await s3Client.send(command);
        if (!response.Contents) return [];
        
        return response.Contents.map(obj => {
            const parts = obj.Key.split('/');
            return parts[parts.length - 1];
        });
    } catch (err) {
        return [];
    }
}

module.exports = {
    getGitObject,
    getHeadRef,
    getRefOid,
    parseTree,
    parseCommit,
    getBranches,
    writeObject,
    putS3Object
};
