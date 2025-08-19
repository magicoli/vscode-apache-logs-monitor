#!/bin/bash

# Apache Logs Monitor Extension - Watch & Auto-rebuild Script
# Watches for changes and automatically rebuilds the extension

EXTENSION_DIR="/home/magic/vscode-console-apache-monitor"
WATCH_DIRS="src package.json tsconfig.json"

echo "👀 Watching for changes in Apache Logs Monitor Extension..."
echo "Monitoring: $WATCH_DIRS"
echo "Press Ctrl+C to stop watching"
echo "================================================"

cd "$EXTENSION_DIR"

# Check if inotify-tools is available
if ! command -v inotifywait &> /dev/null; then
    echo "⚠️  inotifywait not found. Install with: sudo apt-get install inotify-tools"
    echo "Falling back to manual rebuild script..."
    echo "Run: ./rebuild-extension.sh"
    exit 1
fi

# Watch for file changes and rebuild
inotifywait -m -r -e modify,create,delete,move \
    --include '.*\.(ts|js|json)$' \
    $WATCH_DIRS 2>/dev/null | \
while read dir action file; do
    echo ""
    echo "🔄 Detected change: $dir$file ($action)"
    echo "⏱️  $(date '+%H:%M:%S') - Starting rebuild..."
    
    if ./rebuild-extension.sh; then
        echo "✅ $(date '+%H:%M:%S') - Rebuild successful!"
        echo "👀 Watching for more changes..."
    else
        echo "❌ $(date '+%H:%M:%S') - Rebuild failed!"
        echo "👀 Fix the error and save to try again..."
    fi
done
