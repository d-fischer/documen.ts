import { GeneratorMode } from '../GeneratorMode';
import RouterMode from '../htmlRenderer/RouterMode';

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

export interface Manifest {
	versions?: string[];
	rootUrl: string;
}

export interface Config {
	dev: boolean;
	prettier: boolean;
	configDir: string | null;
	outputDir: string;
	mode: GeneratorMode;
	routerMode: RouterMode;
	baseDir: string;
	baseUrl: string;
	packageScope?: string;
	monorepoRoot?: string;
	packageDirNames: string[] | null;
	mainPackage?: string;
	mainBranchName: string;
	version?: string;
	versionBranchPrefix?: string;
	versionFolder?: string;
	ignoredPackages?: string[];
	subPackage?: string;
	repoUser: string | null;
	repoName: string | null;
	repoBaseFolder: string | null;
	repoBranch: string;
	indexFile: string;
	indexTitle: string;
	categories?: ConfigCategory[];
	packages?: Record<string, Config>;
	shouldEnhance: boolean;
	webpackProgressCallback?: (percentage: number, msg: string, moduleProgress?: string, activeModules?: string, moduleName?: string) => void;
	/** @private */
	__devManifest?: Manifest;
}
