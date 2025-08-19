import * as vscode from 'vscode';
import { spawn, execSync } from 'child_process';

export class ApacheLogsDebugAdapterFactory implements vscode.DebugAdapterDescriptorFactory {
    createDebugAdapterDescriptor(session: vscode.DebugSession): vscode.ProviderResult<vscode.DebugAdapterDescriptor> {
        return new vscode.DebugAdapterInlineImplementation(new ApacheLogsDebugAdapter());
    }
}

interface DebugRequest {
    type: string;
    command: string;
    seq: number;
    arguments?: any;
}

export class ApacheLogsDebugAdapter implements vscode.DebugAdapter {
    private sendMessage = new vscode.EventEmitter<vscode.DebugProtocolMessage>();
    private availableLogs = new Map<string, string>();
    private tailProcess: any = null;

    readonly onDidSendMessage: vscode.Event<vscode.DebugProtocolMessage> = this.sendMessage.event;

    handleMessage(message: vscode.DebugProtocolMessage): void {
        const request = message as any;
        if (request.type === 'request') {
            this.handleRequest(request);
        }
    }

    private handleRequest(request: DebugRequest): void {
        switch (request.command) {
            case 'initialize':
                this.sendResponse(request, {
                    supportsEvaluateForHovers: false,
                    supportsStepBack: false,
                    supportsSetVariable: false,
                    supportsRestartFrame: false,
                    supportsGotoTargetsRequest: false,
                    supportsStepInTargetsRequest: false,
                    supportsCompletionsRequest: true,
                    supportsModulesRequest: false,
                    supportsRestartRequest: false,
                    supportsExceptionOptions: false,
                    supportsValueFormattingOptions: false,
                    supportsExceptionInfoRequest: false,
                    supportTerminateDebuggee: true,
                    supportsDelayedStackTraceLoading: false,
                    supportsLoadedSourcesRequest: false,
                    supportsLogPoints: false,
                    supportsTerminateThreadsRequest: false,
                    supportsSetExpression: false,
                    supportsTerminateRequest: true,
                    completionTriggerCharacters: ['.', '['],
                    supportsBreakpointLocationsRequest: false
                });
                break;

            case 'launch':
                this.sendEvent('initialized');
                this.findAndDisplayLogs();
                break;

            case 'evaluate':
                this.handleEvaluate(request);
                break;

            case 'terminate':
                if (this.tailProcess) {
                    this.tailProcess.kill('SIGTERM');
                }
                this.sendResponse(request, {});
                break;

            default:
                this.sendResponse(request, {});
                break;
        }
    }

    private findAndDisplayLogs(): void {
        try {
            // Search for ErrorLog directives in enabled sites
            const command = `sudo grep -i "ErrorLog" /etc/apache2/sites-enabled/*.conf 2>/dev/null || true`;
            const output = execSync(command, { encoding: 'utf8' });
            
            if (output.trim()) {
                const lines = output.trim().split('\n');
                const serverNames = new Map();
                
                lines.forEach(line => {
                    const match = line.match(/\/etc\/apache2\/sites-enabled\/([^:]+):\s*ErrorLog\s+(.+)/i);
                    if (match) {
                        const siteFile = match[1];
                        let logPath = match[2].trim();
                        
                        logPath = logPath.replace(/^["']|["']$/g, '');
                        
                        if (logPath.startsWith('${APACHE_LOG_DIR}')) {
                            logPath = logPath.replace('${APACHE_LOG_DIR}', '/var/log/apache2');
                        } else if (!logPath.startsWith('/')) {
                            logPath = `/var/log/apache2/${logPath}`;
                        }

                        try {
                            const configCommand = `sudo cat /etc/apache2/sites-enabled/${siteFile} | grep -E "^[[:space:]]*ServerName" | head -1`;
                            const serverOutput = execSync(configCommand, { encoding: 'utf8' });
                            const serverMatch = serverOutput.match(/^\s*ServerName\s+(\S+)/i);
                            
                            let serverName = siteFile.replace('.conf', '');
                            if (serverMatch && serverMatch[1] && !serverMatch[1].includes('#')) {
                                serverName = serverMatch[1].trim();
                            }
                            
                            const isSSL = siteFile.includes('ssl') || siteFile.includes('443');
                            const existingEntry = serverNames.get(serverName);
                            
                            if (!existingEntry || (isSSL && !existingEntry.isSSL)) {
                                serverNames.set(serverName, { siteFile, logPath, isSSL });
                                
                                let displayName = serverName;
                                if (isSSL) displayName += ' (SSL)';
                                
                                this.availableLogs.set(displayName, logPath);
                            }
                        } catch (error) {
                            this.availableLogs.set(siteFile.replace('.conf', ''), logPath);
                        }
                    }
                });
            }
        } catch (error) {
            this.sendOutput(`Error reading Apache configuration: ${error}`);
        }

        this.showAvailableLogs();
    }

    private showAvailableLogs(): void {
        let index = 1;
        for (const [site, logPath] of this.availableLogs) {
            const logFile = logPath.split('/').pop();
            this.sendOutput(`${index}. ${site} → ${logFile}`);
            index++;
        }
        this.sendOutput('Commands: select(1,3,5) | all() | stop() | list()');
    }

    private handleEvaluate(request: DebugRequest): void {
        const expression = request.arguments.expression.trim();
        
        if (expression.startsWith('select(')) {
            const match = expression.match(/select\(([^)]+)\)/);
            if (match) {
                const indices = match[1].split(',').map((s: string) => parseInt(s.trim()) - 1);
                const sites = Array.from(this.availableLogs.keys());
                const logPaths = indices
                    .filter((i: number) => i >= 0 && i < sites.length)
                    .map((i: number) => this.availableLogs.get(sites[i])!);
                
                this.startTailing(logPaths);
                this.sendEvaluateResponse(request, `Selected ${logPaths.length} log(s)`);
                return;
            }
        }
        
        if (expression === 'all()') {
            const logPaths = Array.from(this.availableLogs.values());
            this.startTailing(logPaths);
            this.sendEvaluateResponse(request, `Following all ${logPaths.length} log(s)`);
            return;
        }
        
        if (expression === 'stop()') {
            if (this.tailProcess) {
                this.tailProcess.kill('SIGTERM');
                this.tailProcess = null;
                this.sendEvaluateResponse(request, '🛑 Stopped following logs');
            } else {
                this.sendEvaluateResponse(request, '❌ No active tail process');
            }
            return;
        }
        
        if (expression === 'list()') {
            this.showAvailableLogs();
            this.sendEvaluateResponse(request, 'Showing available logs');
            return;
        }
        
        this.sendEvaluateResponse(request, 'Unknown command. Use: select(1,2), all(), stop(), list()');
    }

    private startTailing(logPaths: string[]): void {
        if (this.tailProcess) {
            this.sendOutput('🛑 Stopping current tail process...');
            this.tailProcess.kill('SIGTERM');
        }
        
        if (logPaths.length === 0) {
            this.sendOutput('❌ No logs selected.');
            return;
        }
        
        this.sendOutput(`\n🚀 Following ${logPaths.length} log file(s):`);
        logPaths.forEach(file => this.sendOutput(`   • ${file}`));
        this.sendOutput('\n📄 Log output:\n');
        
        const args = ['tail', '-Fn0'].concat(logPaths);
        this.tailProcess = spawn('sudo', args, {
            stdio: ['pipe', 'pipe', 'pipe']
        });
        
        this.tailProcess.stdout.on('data', (data: Buffer) => {
            this.sendOutput(data.toString());
        });
        
        this.tailProcess.stderr.on('data', (data: Buffer) => {
            this.sendOutput(data.toString());
        });
        
        this.tailProcess.on('close', (code: number) => {
            this.sendOutput(`\n📊 Tail process exited with code ${code}`);
            this.tailProcess = null;
        });
    }

    private sendOutput(text: string): void {
        this.sendEvent('output', {
            category: 'console',
            output: text + '\n'
        });
    }

    private sendResponse(request: DebugRequest, body: any): void {
        const response = {
            type: 'response',
            seq: 0,
            command: request.command,
            request_seq: request.seq,
            success: true,
            body: body
        };
        this.sendMessage.fire(response);
    }

    private sendEvent(event: string, body?: any): void {
        const message = {
            type: 'event',
            seq: 0,
            event: event,
            body: body
        };
        this.sendMessage.fire(message);
    }

    private sendEvaluateResponse(request: DebugRequest, result: string): void {
        this.sendResponse(request, {
            result: result,
            variablesReference: 0
        });
    }

    dispose(): void {
        if (this.tailProcess) {
            this.tailProcess.kill('SIGTERM');
        }
    }
}
