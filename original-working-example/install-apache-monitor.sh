#!/bin/bash
# Apache Logs Monitor - Installation Script

echo "🔧 Installing Apache Logs Monitor for VS Code..."

# Create .vscode directory if it doesn't exist
if [ ! -d ".vscode" ]; then
    mkdir .vscode
    echo "✅ Created .vscode directory"
fi

# Copy or update launch.json
if [ -f ".vscode/launch.json" ]; then
    echo "⚠️  launch.json already exists. Backing up as launch.json.backup"
    cp .vscode/launch.json .vscode/launch.json.backup
fi

# Add the configuration
cat > .vscode/launch.json << 'LAUNCH_EOF'
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Apache Logs Monitor",
            "type": "node",
            "request": "launch",
            "program": "${userHome}/.vscode/scripts/tail-apache-log-debug.js",
            "console": "internalConsole",
            "outputCapture": "std",
            "cwd": "${workspaceFolder}"
        }
    ]
}
LAUNCH_EOF

echo "✅ Apache Logs Monitor installed!"
echo "📋 Usage:"
echo "   1. Open Run and Debug (Ctrl+Shift+D)"
echo "   2. Select 'Apache Logs Monitor'"
echo "   3. Press F5"
echo "   4. Use commands: select(1,2), all(), stop(), list()"
