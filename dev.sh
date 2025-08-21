#!/bin/bash

# Apache Logs Monitor Extension - Development Helper
# Quick commands for extension development

EXTENSION_DIR="/home/magic/vscode-console-apache-monitor"

show_help() {
    echo "🛠️  Apache Logs Monitor Extension - Development Helper"
    echo "================================================"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  build     - Clean build and package the extension"
    echo "  watch     - Watch for changes and auto-rebuild"
    echo "  test      - Install extension locally for testing"
    echo "  clean     - Clean build artifacts"
    echo "  install   - Show installation instructions"
    echo "  help      - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 build    # One-time rebuild"
    echo "  $0 watch    # Auto-rebuild on changes"
    echo "  $0 test     # Install for local testing"
}

case "$1" in
    "build")
        echo "🔧 Building extension..."
        cd "$EXTENSION_DIR" && ./rebuild-extension.sh
        ;;
    "watch")
        echo "👀 Starting watch mode..."
        cd "$EXTENSION_DIR" && ./watch-rebuild.sh
        ;;
    "test")
        echo "🧪 Installing extension locally for testing..."
        cd "$EXTENSION_DIR"
        VSIX_FILE="apache-logs-monitor.vsix"
        if [ ! -f "$VSIX_FILE" ]; then
            echo "❌ No .vsix file found. Run './dev.sh build' first."
            exit 1
        fi
        code --install-extension "$VSIX_FILE"
        echo "✅ Extension installed. Restart VS Code to use it."
        ;;
    "clean")
        echo "🧹 Cleaning build artifacts..."
        cd "$EXTENSION_DIR"
        rm -rf out *.vsix
        echo "✅ Cleaned build artifacts"
        ;;
    "install")
        echo "📋 Installation Instructions:"
        echo "1. Copy to Mac: scp $(whoami)@$(hostname):$EXTENSION_DIR/apache-logs-monitor.vsix ~/Downloads/"
        echo "2. In VS Code: Cmd+Shift+P → 'Extensions: Install from VSIX...'"
        echo "3. Select the downloaded .vsix file"
        echo "4. Restart VS Code"
        ;;
    "help"|"")
        show_help
        ;;
    *)
        echo "❌ Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
