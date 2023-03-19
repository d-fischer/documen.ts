import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { defineConfig } from 'vite';
import Paths from './src/common/Paths';
import MonorepoGenerator from './src/generator/modes/MonorepoGenerator';

export default defineConfig(async () => {
	const monoRefJson = fs.readFileSync(path.join(process.cwd(), 'docs-mono.json'), 'utf-8');
	const monoRef = JSON.parse(monoRefJson);

	let generatorConfig;
	let mockFs;
	try {
		const generatorConfigJson = fs.readFileSync(path.join(__dirname, './testdocs/config.json'), 'utf-8');
		generatorConfig = {
			...JSON.parse(generatorConfigJson),
			versionBranchPrefix: undefined
		};
		function createMockFs(dirPath: string) {
			function worker(dirPath: string, prefix?: string): Array<[string, string]> {
				const fileNames = fs.readdirSync(dirPath);
				return fileNames.flatMap(fileName => {
					const prefixedPath = prefix ? path.join(prefix, fileName) : fileName;
					const fullPath = path.join(dirPath, fileName);
					const stat = fs.lstatSync(fullPath);
					if (stat.isDirectory()) {
						return worker(fullPath, prefixedPath);
					}

					return [[prefixedPath, fs.readFileSync(fullPath, 'utf-8')]];
				});
			}

			return new Map(worker(dirPath));
		}
		mockFs = createMockFs(path.resolve(__dirname, './testdocs'));
	} catch (e) {
		console.error(e);
		generatorConfig = {
			repoUser: 'twurple',
			repoName: 'twurple',
			repoBranch: 'versions/5.0',
			monorepoRoot: 'packages',
			mainPackage: 'twitch',
			mainBranchName: 'main',
			versionBranchPrefix: 'versions/',
			versionFolder: 'versions',

			__devManifest: {
				versions: ['5.0'],
				rootUrl: ''
			}
		};
	}

	const fsMap = await new MonorepoGenerator(generatorConfig)._generateFsMap(monoRef, {
		projectBase: path.resolve(process.cwd(), '../twitch')
	} as Paths);

	return {
		plugins: [react()],
		define: {
			__DOCTS_REFERENCE: monoRefJson,
			__DOCTS_CONFIG: JSON.stringify(generatorConfig),
			__DOCTS_FSMAP: JSON.stringify([...fsMap.entries()]).replace(/\$/g, '$$$$'),
			__DOCTS_MOCK_FS: mockFs ? JSON.stringify([...mockFs]) : 'null',
			__DOCTS_PATHS: JSON.stringify({ projectBase: path.resolve('../twitch') }),
			__DOCTS_COMPONENT_MODE: JSON.stringify('dynamic'),
			'process.env.SUPPORTS_DYNAMIC_ROUTING': false
		}
	};
});
