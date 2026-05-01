const fs = require("fs");
const path = require("path");
const unzipper = require("unzipper");

const { FB2_EXTENSION, ZIP_EXTENSION, UPLOAD_DIR } = require("../../core/constants");

function isFb2(filePath) {
    return path.extname(filePath).toLowerCase() === FB2_EXTENSION;
}

function isZip(filePath) {
    return path.extname(filePath).toLowerCase() === ZIP_EXTENSION;
}

async function extractZip(filePath) {
    try {
        const parentDir = path.dirname(filePath);
        const baseName = path.basename(filePath, ZIP_EXTENSION);

        let extractDir = path.join(parentDir, baseName);
        let counter = 1;
        let finalDir = extractDir;

        while (fs.existsSync(finalDir)) {
            finalDir = `${extractDir}_${counter++}`;
        }

        console.log(`Extracting zip: ${filePath} → ${finalDir}`);
        fs.mkdirSync(finalDir, { recursive: true });

        await fs.createReadStream(filePath)
            .pipe(unzipper.Extract({ path: finalDir }))
            .promise();

        // delete ONLY after successful extraction
        fs.unlinkSync(filePath);

        console.log(`Extracted zip and deleted: ${filePath}`);
        return finalDir;

    } catch (err) {
        console.error(`Error extracting zip ${filePath}:`, err.message);

        // do NOT delete zip if extraction failed
        return null;
    }
}
async function getAllFiles(dir = UPLOAD_DIR, fileList = []) {
    if (!fs.existsSync(dir)) {
        return fileList;
    }

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            await getAllFiles(fullPath, fileList);

        } else if (isZip(fullPath)) {
            const extractedDir = await extractZip(fullPath);

            if (extractedDir && fs.existsSync(extractedDir)) {
                await getAllFiles(extractedDir, fileList);
            }

        } else if (isFb2(fullPath)) {
            fileList.push(fullPath);

        } else {
            try {
                fs.unlinkSync(fullPath);
                console.log(`Deleted non-fb2 file: ${fullPath}`);
            } catch (err) {
                console.error(`Error deleting file ${fullPath}:`, err.message);
            }
        }
    }

    return fileList;
}

// remove empty directories recursively
function removeEmptyDirs(dir = UPLOAD_DIR) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir);
    if (entries.length === 0 && dir !== UPLOAD_DIR) {
        fs.rmdirSync(dir);
        return;
    }
    for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
            removeEmptyDirs(fullPath);
        }
    }
    const after = fs.readdirSync(dir);
    if (after.length === 0 && dir !== UPLOAD_DIR) {
        fs.rmdirSync(dir);
    }
}



module.exports = {
    getAllFiles,
    removeEmptyDirs,
    extractZip,     // optional, if you want direct access
    isFb2,          // optional
    isZip           // optional
};