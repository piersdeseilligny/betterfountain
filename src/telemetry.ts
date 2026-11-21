import { getPackageInfo } from './utils';

let reporter: { sendTelemetryEvent(eventName: string, properties?: { [key: string]: string }, measurements?: { [key: string]: number }): void };
export function reportTelemetry(eventName: string, properties?: { [key: string]: string; }, measurements?: { [key: string]: number; }){
	if(reporter){
        reporter.sendTelemetryEvent(eventName, properties, measurements);
	}
}

export function initTelemetry(){
	// Telemetry's Node-based reporter is not available in browser extension hosts.
	if (require('vscode').env.uiKind === require('vscode').UIKind.Web) return;

	// Load the reporter only in the desktop extension host so webpack does not
	// leave an unresolved runtime dependency in the browser bundle.
	const telemetry = eval('require')('vscode-extension-telemetry');
	const VSCodeTelemetryReporter = telemetry.default || telemetry;
	const packageinfo = getPackageInfo();
	if(packageinfo){
		reporter = new VSCodeTelemetryReporter(packageinfo.name, packageinfo.version, packageinfo.aiKey);
	}
}

