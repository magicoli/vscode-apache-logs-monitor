#!/bin/bash
# Apache Logs Monitor - Global Installation Script

set -e

echo "🔧 Installing Apache Logs Monitor..."

# Install script globally
mkdir -p ~/.vscode
curl -fsSL https://raw.githubusercontent.com/magicoli/vscode-apache-logs-monitor/master/apache-logs-monitor.js -o ~/.vscode/apache-logs-monitor.js
# DEBUG: copy current file instead of downloading it:
# cp apache-logs-monitor.js ~/.vscode/apache-logs-monitor.js
chmod +x ~/.vscode/apache-logs-monitor.js

# Download and run launch configuration updater
curl -fsSL https://raw.githubusercontent.com/magicoli/vscode-apache-logs-monitor/master/update-launch.js | node
# DEBUG: use current script instead of downloading it:
# cat update-launch.js | node

echo ""
echo "✅ Apache Logs Monitor installed!"
echo "📋 Usage:"
echo "   1. Open Run and Debug (Ctrl+Shift+D)"
echo "   2. Select 'Apache Logs Monitor'"
echo "   3. Press F5"
