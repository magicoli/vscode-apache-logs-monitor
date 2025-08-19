import * as vscode from 'vscode';
import { ApacheLogsDebugAdapterFactory } from './apacheLogsDebugAdapter';

export function activate(context: vscode.ExtensionContext) {
    console.log('Apache Logs Monitor extension is now active!');

    // Register the debug adapter factory
    const debugAdapterFactory = new ApacheLogsDebugAdapterFactory();
    context.subscriptions.push(
        vscode.debug.registerDebugAdapterDescriptorFactory('apache-logs', debugAdapterFactory)
    );

    // Register command to start monitoring
    const startCommand = vscode.commands.registerCommand('apacheLogsMonitor.start', () => {
        vscode.debug.startDebugging(undefined, {
            type: 'apache-logs',
            request: 'launch',
            name: 'Apache Logs Monitor'
        });
    });

    context.subscriptions.push(startCommand);
}

export function deactivate() {}
