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

# Create a temporary file for the extension
TEMP_VSIX="/tmp/apache-logs-monitor.vsix"

# Download the extension
echo "⬇️  Downloading extension..."
if ! curl -fsSL "$EXTENSION_URL" -o "$TEMP_VSIX"; then
    echo "❌ Download failed"
    echo "   Please check your internet connection and try again"
    exit 1
fi
echo "✅ Download successful"

# Install the downloaded extension
echo "📦 Installing extension..."

# Capture the output to check for errors
INSTALL_OUTPUT=$(code --install-extension "$TEMP_VSIX" 2>&1)
INSTALL_EXIT_CODE=$?

# Check for error patterns in the output
if [ $INSTALL_EXIT_CODE -ne 0 ] || echo "$INSTALL_OUTPUT" | grep -q "Error:\|Failed\|restart VS Code"; then
    # Clean up the temporary file on failure
    rm -f "$TEMP_VSIX"
    echo "❌ Installation failed"
    echo "$INSTALL_OUTPUT"
    echo ""
    echo "   If you see a 'restart VS Code' message, please:"
    echo "   1. Restart VS Code"
    echo "   2. Run the install command again"
    echo ""
    echo "   You can also try manually:"
    echo "   curl -fsSL $EXTENSION_URL -o apache-logs-monitor.vsix"
    echo "   code --install-extension apache-logs-monitor.vsix"
    echo "   rm apache-logs-monitor.vsix"
    exit 1
fi

# Success case
rm -f "$TEMP_VSIX"
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
