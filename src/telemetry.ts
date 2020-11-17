import { default as VSCodeTelemetryReporter } from 'vscode-extension-telemetry';
import { getPackageInfo } from './utils';

let reporter:VSCodeTelemetryReporter;
export function reportTelemetry(eventName: string, properties?: { [key: string]: string; }, measurements?: { [key: string]: number; }){
	if(reporter){
        reporter.sendTelemetryEvent(eventName, properties, measurements);
	}
}

export function initTelemetry(){
	//Register telemetry
	let packageinfo = getPackageInfo();
	if(packageinfo){
		reporter = new VSCodeTelemetryReporter(packageinfo.name, packageinfo.version, packageinfo.aiKey);
	}
}

