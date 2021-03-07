/* eslint-disable no-console */
import ts from 'typescript';

function formatDiagnostics(diagnostics: readonly ts.Diagnostic[], host: ts.CompilerHost) {
	const shouldBePretty = !!ts.sys.writeOutputIsTTY?.();
	const formatHost: ts.FormatDiagnosticsHost = {
		getCanonicalFileName(fileName: string) {
			return host.getCanonicalFileName(fileName);
		},
		getCurrentDirectory() {
			return host.getCurrentDirectory();
		},
		getNewLine() {
			return host.getNewLine();
		}
	};
	if (shouldBePretty) {
		return ts.formatDiagnosticsWithColorAndContext(diagnostics, formatHost);
	}
	return ts.formatDiagnostics(diagnostics, formatHost);
}

function handleDiagnostics(
	diagnostics: readonly ts.Diagnostic[],
	host: ts.CompilerHost,
	errorPrefix = 'Unknown error'
) {
	if (diagnostics.length) {
		process.stderr.write('\n\n');
		console.error(formatDiagnostics(diagnostics, host));
		console.error(`${errorPrefix}. Exiting.`);
		process.exit(1);
	}
}

function handleConfigParsingErrors(parsedCommandLine: ts.ParsedCommandLine | undefined, host: ts.CompilerHost) {
	if (parsedCommandLine?.errors.length) {
		process.stderr.write('\n\n');
		console.error(formatDiagnostics(parsedCommandLine.errors, host));
		process.exit(1);
	}
	if (!parsedCommandLine) {
		process.stderr.write('\n\n');
		console.error('Unknown error parsing config.');
		process.exit(1);
	}
}

export function parseConfig(configFilePath: string) {
	const tempCompilerHost = ts.createCompilerHost({}, false);
	// from here https://github.com/Microsoft/TypeScript/blob/6fb0f6818ad48bf4f685e86c03405ddc84b530ed/src/compiler/program.ts#L2812
	const configParsingHost: ts.ParseConfigFileHost = {
		fileExists: f => tempCompilerHost.fileExists(f),
		readDirectory: (root, extensions, includes, depth?) =>
			tempCompilerHost.readDirectory ? tempCompilerHost.readDirectory(root, extensions, includes, depth) : [],
		readFile: f => tempCompilerHost.readFile(f),
		useCaseSensitiveFileNames: tempCompilerHost.useCaseSensitiveFileNames(),
		getCurrentDirectory: () => tempCompilerHost.getCurrentDirectory(),
		onUnRecoverableConfigFileDiagnostic: () => undefined
	};
	const parsedConfig = ts.getParsedCommandLineOfConfigFile(
		configFilePath,
		{},
		{
			...configParsingHost,
			onUnRecoverableConfigFileDiagnostic(d) {
				handleDiagnostics([d], tempCompilerHost);
			}
		}
	)!;

	handleConfigParsingErrors(parsedConfig, tempCompilerHost);

	return parsedConfig;
}
