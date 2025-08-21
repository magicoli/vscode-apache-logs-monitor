#!/usr/bin/env node

const { spawn, execSync } = require('child_process');

// Store log files and current selection
let availableLogs = new Map();
let selectedLogs = [];
let tailProcess = null;

// Function to find ErrorLog entries from Apache configuration
function findConfiguredLogFiles() {
    const logFiles = new Map(); // Map to store site -> log path
    const serverNames = new Map(); // Track server names to prioritize SSL
    
    try {
        // Search for ErrorLog directives in enabled sites
        const command = `sudo grep -i "ErrorLog" /etc/apache2/sites-enabled/*.conf 2>/dev/null || true`;
        const output = execSync(command, { encoding: 'utf8' });
        
        if (output.trim()) {
            const lines = output.trim().split('\n');
            
            lines.forEach(line => {
                // Parse: /etc/apache2/sites-enabled/site.conf:        ErrorLog /path/to/error.log
                const match = line.match(/\/etc\/apache2\/sites-enabled\/([^:]+):\s*ErrorLog\s+(.+)/i);
                if (match) {
                    const siteFile = match[1];
                    let logPath = match[2].trim();
                    
                    // Remove quotes if present
                    logPath = logPath.replace(/^["']|["']$/g, '');
                    
                    // Handle relative paths and variables
                    if (logPath.startsWith('${APACHE_LOG_DIR}')) {
                        logPath = logPath.replace('${APACHE_LOG_DIR}', '/var/log/apache2');
                    } else if (!logPath.startsWith('/')) {
                        logPath = `/var/log/apache2/${logPath}`;
                    }
                    
                    // Get server name from the site file
                    try {
                        const configCommand = `sudo cat /etc/apache2/sites-enabled/${siteFile} | grep -E "^[[:space:]]*ServerName" | head -1`;
                        const serverOutput = execSync(configCommand, { encoding: 'utf8' });
                        const serverMatch = serverOutput.match(/^\s*ServerName\s+(\S+)/i);
                        
                        let serverName = siteFile.replace('.conf', '');
                        if (serverMatch && serverMatch[1] && !serverMatch[1].includes('#')) {
                            serverName = serverMatch[1].trim();
                        }
                        
                        // Check if this is SSL site
                        const isSSL = siteFile.includes('ssl') || siteFile.includes('443');
                        
                        // If we already have this server name, prefer SSL version
                        const existingEntry = serverNames.get(serverName);
                        if (!existingEntry || (isSSL && !existingEntry.isSSL)) {
                            serverNames.set(serverName, { siteFile, logPath, isSSL });
                            
                            // Clean display name
                            let displayName = serverName;
                            if (isSSL) displayName += ' (SSL)';
                            
                            logFiles.set(displayName, logPath);
                        }
                    } catch (error) {
                        // Fallback: use site file name
                        logFiles.set(siteFile.replace('.conf', ''), logPath);
                    }
                }
            });
        }
    } catch (error) {
        console.error('Error reading Apache configuration:', error.message);
    }
    
    return logFiles;
}

// Function to display available logs
function showAvailableLogs() {
    let index = 1;
    for (const [site, logPath] of availableLogs) {
        // Extract just the filename from the path for cleaner display
        const logFile = logPath.split('/').pop();
        console.log(`${index}. ${site} → ${logFile}`);
        index++;
    }
    
    console.log('Commands: select(1,3,5) | all() | stop() | list()');
}

// Function to start following logs
function startTailing(logPaths) {
    if (tailProcess) {
        console.log('🛑 Stopping current tail process...');
        tailProcess.kill('SIGTERM');
    }
    
    if (logPaths.length === 0) {
        console.log('❌ No logs selected.');
        return;
    }
    
    console.log(`\n🚀 Following ${logPaths.length} log file(s):`);
    logPaths.forEach(file => console.log(`   • ${file}`));
    console.log('\n📄 Log output:\n');
    
    // Use sudo tail -Fn0 with selected files
    const args = ['tail', '-Fn0'].concat(logPaths);
    tailProcess = spawn('sudo', args, {
        stdio: ['pipe', 'pipe', 'pipe']
    });
    
    // Pipe output to console
    tailProcess.stdout.on('data', (data) => {
        process.stdout.write(data);
    });
    
    tailProcess.stderr.on('data', (data) => {
        process.stderr.write(data);
    });
    
    tailProcess.on('close', (code) => {
        console.log(`\n📊 Tail process exited with code ${code}`);
        tailProcess = null;
    });
}

// Global functions for debug console
global.select = function(...indices) {
    const sites = Array.from(availableLogs.keys());
    const logPaths = indices
        .map(i => parseInt(i) - 1)
        .filter(i => i >= 0 && i < sites.length)
        .map(i => availableLogs.get(sites[i]));
    
    startTailing(logPaths);
    return `Selected ${logPaths.length} log(s)`;
};

global.all = function() {
    const logPaths = Array.from(availableLogs.values());
    startTailing(logPaths);
    return `Following all ${logPaths.length} log(s)`;
};

global.stop = function() {
    if (tailProcess) {
        tailProcess.kill('SIGTERM');
        tailProcess = null;
        return '🛑 Stopped following logs';
    }
    return '❌ No active tail process';
};

global.list = function() {
    showAvailableLogs();
    return 'Showing available logs';
};

// Initialize
console.log('🔍 Scanning Apache configuration for ErrorLog entries...');

availableLogs = findConfiguredLogFiles();

if (availableLogs.size === 0) {
    console.error('❌ No Apache error logs found in configuration.');
    console.error('Make sure you have sudo access and Apache sites are configured.');
    process.exit(1);
}

showAvailableLogs();

// Handle process termination
process.on('SIGINT', () => {
    if (tailProcess) {
        tailProcess.kill('SIGTERM');
    }
    process.exit(0);
});

process.on('SIGTERM', () => {
    if (tailProcess) {
        tailProcess.kill('SIGTERM');
    }
    process.exit(0);
});

// Keep the process alive
setInterval(() => {}, 1000);
