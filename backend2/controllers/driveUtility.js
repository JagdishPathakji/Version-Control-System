const { getDriveClient } = require("../config/drive-config");
const drive = getDriveClient()

async function getDirectoryStructure(username,reponame,commitId) {

    async function findOrCreateFolder(name,parentId=null) {

        const query = [
            `name='${name}'`,
            "mimeType='application/vnd.google-apps.folder'",
            "trashed=false"
        ]

        if(parentId) {
            query.push(`'${parentId}' in parents`)
        }

        const res = await drive.files.list({
            q: query.join(" and "),
            fields: "files(id,name)"
        })

        if (res.data.files.length > 0)
        return { id: res.data.files[0].id, alreadyExists: true };

        const folderMetaData = {
            name,
            mimeType: "application/vnd.google-apps.folder",
        }
        if(parentId) folderMetaData.parents = [parentId];

        const folder = await drive.files.create({
            resource: folderMetaData,
            fields: "id"
        })

        return { id: folder.data.id, alreadyExists: false };
    }

    // Build folder hierarchy in drive
    const githubClone = await findOrCreateFolder("GithubClone");
    const userFolder = await findOrCreateFolder(username,githubClone.id)
    const repoFolder = await findOrCreateFolder(reponame,userFolder.id)
    const commitFolderName = `commit_${commitId}`
    const commitFolder = await findOrCreateFolder(commitFolderName,repoFolder.id)

    return {
        githubCloneId: githubClone.id,
        userFolderId: userFolder.id,
        repoFolderId: repoFolder.id,
        commitFolderId: commitFolder.id,
        commitAlreadyExists: commitFolder.alreadyExists
    }
}

module.exports = getDirectoryStructure