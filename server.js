const http = require("http");
const router = require("./app/routes");
const { bootstrapDatabase } = require("./core/bootstrap");
const { IMPORT_TIMEOUT_MS } = require("./core/constants");

const PORT = 3000;
const VERSION = "0.1.34";

bootstrapDatabase();

const server = http.createServer(async (req, res) => {
    try {
        // Increase timeout for this specific request if it's an import
        if (req.url === '/import-stream') {
            req.setTimeout(IMPORT_TIMEOUT_MS);
            res.setTimeout(IMPORT_TIMEOUT_MS);
        }
        
        return await router(req, res);
    } catch (e) {
        console.error(e);
        res.writeHead(500);
        res.end("Internal Server Error");
    }
});

// Critical: Increase server timeouts to prevent hanging during large imports
server.timeout = IMPORT_TIMEOUT_MS;
server.keepAliveTimeout = IMPORT_TIMEOUT_MS;
server.headersTimeout = IMPORT_TIMEOUT_MS;
server.requestTimeout = IMPORT_TIMEOUT_MS; // 1 hour (Node.js 13+)

// Handle server errors
server.on('error', (err) => {
    console.error('Server error:', err);
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please close other processes or use a different port.`);
        process.exit(1);
    }
});

// Graceful shutdown handling
let isShuttingDown = false;

function gracefulShutdown(signal) {
    if (isShuttingDown) return;
    isShuttingDown = true;
    
    console.log(`\n${signal} received, shutting down gracefully...`);
    
    server.close(() => {
        console.log('HTTP server closed');
        
        // Close database connection if needed
        const db = require("./core/db");
        if (db && db.close) {
            db.close();
            console.log('Database connection closed');
        }
        
        console.log('Shutdown complete');
        process.exit(0);
    });
    
    // Force shutdown after 30 seconds if graceful shutdown fails
    setTimeout(() => {
        console.error('Could not close connections in time, forcing shutdown');
        process.exit(1);
    }, 30000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

server.listen(PORT, () => {
    console.log(`Server v${VERSION} running on http://localhost:${PORT}`);
    console.log(`Max import duration: ${IMPORT_TIMEOUT_MS / 3600000} hour(s)`);
});