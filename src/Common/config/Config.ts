import { GeneratorMode } from '../GeneratorMode';
import RouterMode from '../HTMLRenderer/RouterMode';

export interface ConfigInternalArticle {
	name: string;
	title: string;
	file: string;
}

export interface ConfigExternalArticle {
	name: string;
	title: string;
	externalLink: string;
}

export type ConfigArticle = ConfigInternalArticle | ConfigExternalArticle;

export interface ConfigCategory {
	name: string;
	title: string;
	articles: ConfigArticle[];
}

export default interface Config {
	configDir: string | null;
	inputDirs: string[];
	outputDir: string;
	mode: GeneratorMode;
	routerMode: RouterMode;
	baseDir: string;
	baseUrl: string;
	monorepoRoot?: string;
	ignoredPackages: string[];
	subPackage?: string;
	repoUser: string | null;
	repoName: string | null;
	repoBaseFolder: string | null;
	repoBranch: string;
	indexFile: string;
	indexTitle: string;
	categories?: ConfigCategory[];
	packages?: Record<string, Config>;
	webpackProgressCallback?: (percentage: number, msg: string, moduleProgress?: string, activeModules?: string, moduleName?: string) => void;
}
