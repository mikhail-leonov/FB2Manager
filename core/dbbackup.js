const fs = require("fs");
const path = require("path");
const { DB_FILE, BACKUP_DIR } = require("./constants");

const BACKUP_FILE = path.join(BACKUP_DIR, "db.backup");

function backupDatabase() {
    try {
        // Ensure backup directory exists
        if (!fs.existsSync(BACKUP_DIR)) {
            fs.mkdirSync(BACKUP_DIR, { recursive: true });
            console.log(`Created backup directory: ${BACKUP_DIR}`);
        }

        // Delete existing backup if it exists
        if (fs.existsSync(BACKUP_FILE)) {
            fs.unlinkSync(BACKUP_FILE);
            console.log(`Deleted existing backup: ${BACKUP_FILE}`);
        }

        // Check if source database exists
        if (!fs.existsSync(DB_FILE)) {
            console.log(`Source database not found at: ${DB_FILE}`);
            return false;
        }

        // Copy database to backup location
        fs.copyFileSync(DB_FILE, BACKUP_FILE);
        console.log(`Database backed up successfully to: ${BACKUP_FILE}`);

        // Verify backup was created
        const backupStats = fs.statSync(BACKUP_FILE);
        const dbStats = fs.statSync(DB_FILE);
        
        if (backupStats.size === dbStats.size) {
            console.log(`Backup verified: ${backupStats.size} bytes`);
            return true;
        } else {
            console.error(`Backup size mismatch! Source: ${dbStats.size}, Backup: ${backupStats.size}`);
            return false;
        }
    } catch (error) {
        console.error(`Failed to backup database: ${error.message}`);
        return false;
    }
}

function getBackupInfo() {
    if (!fs.existsSync(BACKUP_FILE)) {
        return { exists: false };
    }
    
    const stats = fs.statSync(BACKUP_FILE);
    return {
        exists: true,
        size: stats.size,
        modified: stats.mtime,
        path: BACKUP_FILE
    };
}

function restoreFromBackup() {
    try {
        if (!fs.existsSync(BACKUP_FILE)) {
            console.log("No backup file found to restore");
            return false;
        }
        
        // Close any open database connections first
        // This should be called before re-initializing the database
        
        fs.copyFileSync(BACKUP_FILE, DB_FILE);
        console.log(`Database restored from backup: ${BACKUP_FILE}`);
        return true;
    } catch (error) {
        console.error(`Failed to restore database: ${error.message}`);
        return false;
    }
}

module.exports = {
    backupDatabase,
    getBackupInfo,
    restoreFromBackup,
    BACKUP_FILE
};