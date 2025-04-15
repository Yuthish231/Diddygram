const fs = require('fs');
const path = require('path');

// Create logs directory if not exists
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

// Log function
function logActivity(message) {
    const date = new Date();
    const logFileName = `${date.toISOString().split('T')[0]}-log.txt`;  // e.g., 2025-04-13-log.txt
    const filePath = path.join(logDir, logFileName);
    const timestamp = date.toLocaleString();

    const logEntry = `[${timestamp}] ${message}\n`;

    fs.appendFile(filePath, logEntry, (err) => {
        if (err) console.error("Logging error:", err);
    });
}

module.exports = logActivity;
