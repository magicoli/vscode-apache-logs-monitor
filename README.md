# Apache Logs Monitor for VS Code

A simple VS Code extension to monitor Apache error logs in the Debug Console.

![Version: 1.0.0](https://badgen.net/badge/Version/1.0.0/grey)
![VS Code: 1.74+](https://badgen.net/badge/VS%20Code/1.74+/blue)
![License: ISC](https://badgen.net/badge/License/ISC/green)

## What it does

- Shows Apache error logs in VS Code Debug Console
- Finds Apache sites automatically from `/etc/apache2/sites-enabled/`
- Lets you switch between different site logs
- Basic commands: `select`, `all`, `stop`, `list`

## Installation

1. Download the `.vsix` file from [releases](https://github.com/magicoli/vscode-apache-logs-monitor/releases)
2. Install it: `code --install-extension apache-logs-monitor-1.0.0.vsix`
3. Press `F5` in any project and select "Apache Logs Monitor"

## Usage

In the Debug Console, type:
- `select` - pick a site to monitor
- `all` - show logs from all sites  
- `stop` - stop monitoring
- `list` - show available sites

## Requirements

- Apache with standard Debian/Ubuntu config layout
- Access to `/etc/apache2/sites-enabled/` and log files
- May need `sudo` for log file access

## Example

```
[14:30:45] Starting Apache Logs Monitor...
[14:30:45] Found sites: example.com, api.example.com
[14:30:45] Monitoring: /var/log/apache2/example.com_error.log

> select
1. example.com - /var/log/apache2/example.com_error.log
2. api.example.com - /var/log/apache2/api.example.com_error.log
Choose [1-2]: 2

[14:31:02] Switching to: api.example.com
[14:31:02] [error] [client 192.168.1.100] PHP Notice: Undefined variable
```

## Development

```bash
git clone https://github.com/magicoli/vscode-apache-logs-monitor.git
cd vscode-apache-logs-monitor
npm install
npm run compile
npx vsce package
```

Use `./dev.sh build` to rebuild or `./dev.sh watch` for auto-rebuild.

## Notes

- This is a basic utility extension for Apache log monitoring
- Works with standard Apache configurations on Debian/Ubuntu
- For remote servers, install the extension on each server (not your local machine)
- Uses VS Code's Debug Adapter Protocol for console integration

## License

ISC License - see [LICENSE](LICENSE) file.
