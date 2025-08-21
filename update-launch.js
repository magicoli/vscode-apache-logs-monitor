#!/usr/bin/env node

// Apache Logs Monitor - Launch Configuration Updater
// Updates VS Code launch.json to include Apache Logs Monitor

const fs = require('fs');
const path = require('path');

const LAUNCH_FILE = '.vscode/launch.json';
const CONFIG_NAME = 'Apache Logs Monitor (installed through update-launch.js)';

function updateLaunchJson() {
    let launch = { version: "0.2.0", configurations: [] };
    
    // Read existing launch.json if it exists
    if (fs.existsSync(LAUNCH_FILE)) {
        try {
            const content = fs.readFileSync(LAUNCH_FILE, 'utf8');
            launch = JSON.parse(content);
            console.log('📝 Updating existing launch.json...');
        } catch (error) {
            console.log('⚠️  Error reading launch.json, creating new one...');
        }
    } else {
        console.log('📝 Creating new launch.json...');
    }

    // Ensure configurations array exists
    if (!Array.isArray(launch.configurations)) {
        launch.configurations = [];
    }

    // Remove existing Apache Logs Monitor configurations
    launch.configurations = launch.configurations.filter(config => 
        !config.name || !config.name.includes('Apache Logs Monitor')
    );

    // Add new Apache Logs Monitor configuration
    launch.configurations.push({
        name: CONFIG_NAME,
        type: 'node',
        request: 'launch',
        program: '${userHome}/.vscode/apache-logs-monitor.js',
        console: 'internalConsole',
        internalConsoleOptions: 'openOnSessionStart',
        outputCapture: 'std',
        cwd: '${userHome}',  // Run from home directory to avoid package.json conflicts
        env: {
            NODE_OPTIONS: ''  // Clear any problematic Node options
        }
    });

    // Write updated launch.json
    fs.writeFileSync(LAUNCH_FILE, JSON.stringify(launch, null, 4));
    console.log('✅ Launch configuration updated');
}

// Create .vscode directory if it doesn't exist
if (!fs.existsSync('.vscode')) {
    fs.mkdirSync('.vscode');
    console.log('📁 Created .vscode directory');
}

// Create backup if launch.json exists
if (fs.existsSync(LAUNCH_FILE)) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const backupFile = `${LAUNCH_FILE}.backup.${timestamp}`;
    fs.copyFileSync(LAUNCH_FILE, backupFile);
    console.log(`💾 Backup created: ${backupFile}`);
}

// Update launch configuration
updateLaunchJson();
