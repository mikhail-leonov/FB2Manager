const fs = require("fs");
const path = require("path");

const { FB2_EXTENSION, UPLOAD_DIR } = require("../../core/constants");

function isFb2(filePath) {
    const isFB2 = path.extname(filePath).toLowerCase() === FB2_EXTENSION;
     if (!isFB2) {
        try {
            fs.unlinkSync(filePath);
            console.log(`Deleted non-fb2 file: ${filePath}`);
        } catch (err) {
            console.error(`Error deleting file ${filePath}:`, err.message);
        }
    }
     return isFB2;
}
// recursively collect ONLY fb2 files
function getAllFiles(dir = UPLOAD_DIR, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            getAllFiles(fullPath, fileList);
        } else if (isFb2(fullPath)) {
            fileList.push(fullPath);
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

    // check again after cleaning children
    const after = fs.readdirSync(dir);
    if (after.length === 0 && dir !== UPLOAD_DIR) {
        fs.rmdirSync(dir);
    }
}

module.exports = {
    getAllFiles,
    removeEmptyDirs
};