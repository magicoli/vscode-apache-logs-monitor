#!/bin/bash

# Apache Logs Monitor Extension - Rebuild Script
# Automatically compiles TypeScript and packages the extension

set -e  # Exit on any error

EXTENSION_DIR="/home/magic/vscode-console-apache-monitor"
EXTENSION_NAME="apache-logs-monitor"

echo "🔧 Rebuilding Apache Logs Monitor Extension..."
echo "================================================"

# Change to extension directory
cd "$EXTENSION_DIR"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Are we in the right directory?"
    exit 1
fi

# Clean previous build
echo "🧹 Cleaning previous build..."
if [ -d "out" ]; then
    rm -rf out
fi

# Remove old .vsix files
if ls *.vsix 1> /dev/null 2>&1; then
    echo "🗑️  Removing old .vsix files..."
    rm -f *.vsix
fi

# Compile TypeScript
echo "⚡ Compiling TypeScript..."
npm run compile

if [ $? -ne 0 ]; then
    echo "❌ TypeScript compilation failed!"
    exit 1
fi

echo "✅ TypeScript compilation successful"

# Package the extension
echo "📦 Packaging extension..."
npx vsce package --allow-missing-repository --no-yarn

if [ $? -ne 0 ]; then
    echo "❌ Extension packaging failed!"
    exit 1
fi

# Find the generated .vsix file
VSIX_FILE=$(ls ${EXTENSION_NAME}-*.vsix 2>/dev/null | head -n1)

if [ -z "$VSIX_FILE" ]; then
    echo "❌ No .vsix file found after packaging!"
    exit 1
fi

# Rename to version-less filename for consistency
FINAL_VSIX="${EXTENSION_NAME}.vsix"
if [ "$VSIX_FILE" != "$FINAL_VSIX" ]; then
    echo "📝 Renaming $VSIX_FILE to $FINAL_VSIX"
    mv "$VSIX_FILE" "$FINAL_VSIX"
    VSIX_FILE="$FINAL_VSIX"
fi

echo "✅ Extension packaged successfully: $VSIX_FILE"

# Get file size in human readable format
FILE_SIZE=$(du -h "$VSIX_FILE" | cut -f1)
echo "📁 Package size: $FILE_SIZE"

echo ""
echo "🎉 Rebuild complete!"
echo "================================================"
echo "Extension file: $VSIX_FILE"
echo ""
echo "To install on your Mac:"
echo "1. Copy to Mac: scp $(whoami)@$(hostname):$EXTENSION_DIR/$VSIX_FILE ~/Downloads/"
echo "2. Install in VS Code: Extensions > Install from VSIX..."
echo "3. Select the downloaded file and restart VS Code"
echo ""
echo "To test locally:"
echo "code --install-extension $VSIX_FILE"
