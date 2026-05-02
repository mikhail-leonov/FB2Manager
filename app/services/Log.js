const fs = require("fs");
const { LOG_FILE } = require("../../core/constants");

function Log(msg) {
    console.log(msg);
    try {
        fs.appendFileSync(LOG_FILE, msg + "\n");
    } catch (err) {
        console.error("Error writing to log file:", err);
    }
    if (global.sseLogSend) {
        try {
            global.sseLogSend(msg);
        } catch (err) {
            console.error("Error sending to SSE:", err);
        }
    }
}
module.exports = Log;