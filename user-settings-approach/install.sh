#!/bin/bash

# Apache Logs Monitor - Simple Global Installer

set -e

echo "🚀 Installing Apache Logs Monitor globally..."

# Download and install script
mkdir -p ~/.vscode
# curl -fsSL https://raw.githubusercontent.com/magicoli/vscode-apache-logs-monitor/master/apache-logs-monitor.js -o ~/.vscode/apache-logs-monitor.js
chmod +x ~/.vscode/apache-logs-monitor.js

# Find VS Code settings file
SETTINGS_FILE=""
for path in "$HOME/.vscode-server/data/Machine/settings.json" "$HOME/.config/Code/User/settings.json" "$HOME/Library/Application Support/Code/User/settings.json"; do
    if [ -f "$path" ]; then
        SETTINGS_FILE="$path"
        break
    fi
done

if [ -z "$SETTINGS_FILE" ]; then
    # Create default settings file
    mkdir -p "$HOME/.vscode-server/data/Machine"
    SETTINGS_FILE="$HOME/.vscode-server/data/Machine/settings.json"
    echo "{}" > "$SETTINGS_FILE"
fi

# Update settings with Node.js
node -e "
const fs = require('fs');
let settings = JSON.parse(fs.readFileSync('$SETTINGS_FILE', 'utf8') || '{}');
settings.launch = settings.launch || {};
settings.launch.configurations = settings.launch.configurations || [];
settings.launch.configurations = settings.launch.configurations.filter(c => c.name !== 'Apache Logs Monitor');
settings.launch.configurations.push({
    type: 'node',
    request: 'launch',
    name: 'Apache Logs Monitor (installed through install.sh)',
    program: '\${userHome}/.vscode/apache-logs-monitor.js',
    console: 'integratedTerminal',
    cwd: '\${workspaceFolder}'
});
fs.writeFileSync('$SETTINGS_FILE', JSON.stringify(settings, null, 4));
"

echo "✅ Apache Logs Monitor installed! Available in Run and Debug panel (F5) in all projects."
