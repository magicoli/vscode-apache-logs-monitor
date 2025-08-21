#!/bin/bash

# Apache Logs Monitor VS Code Extension - Quick Install Script
# Usage: curl -fsSL https://raw.githubusercontent.com/magicoli/vscode-apache-logs-monitor/master/install.sh | bash

set -e

EXTENSION_URL="https://raw.githubusercontent.com/magicoli/vscode-apache-logs-monitor/master/apache-logs-monitor.vsix"
EXTENSION_NAME="apache-logs-monitor.vsix"

echo "🚀 Installing Apache Logs Monitor VS Code Extension..."

# Check if code command is available
if ! command -v code &> /dev/null; then
    echo "❌ VS Code 'code' command not found in PATH"
    echo "   Please make sure VS Code is installed and the 'code' command is available"
    echo "   You can enable it from VS Code: View → Command Palette → 'Shell Command: Install code command in PATH'"
    exit 1
fi

# Check VS Code version
echo "📋 Checking VS Code version..."
CODE_VERSION=$(code --version | head -n1)
echo "   Found: $CODE_VERSION"

# Install extension directly from URL
echo "📦 Installing extension from GitHub..."
if code --install-extension "$EXTENSION_URL"; then
    echo "✅ Apache Logs Monitor extension installed successfully!"
    echo ""
    echo "🎯 Next steps:"
    echo "   1. Open any project in VS Code"
    echo "   2. Press F5 to start debugging"
    echo "   3. Select 'Apache Logs Monitor' from the dropdown"
    echo ""
    echo "💡 In the Debug Console, use these commands:"
    echo "   • select - pick a site to monitor"
    echo "   • all    - show logs from all sites"
    echo "   • stop   - stop monitoring"
    echo "   • list   - show available sites"
else
    echo "❌ Installation failed"
    echo "   You can try manually:"
    echo "   code --install-extension $EXTENSION_URL"
    exit 1
fi
