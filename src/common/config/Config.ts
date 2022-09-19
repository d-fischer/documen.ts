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

export interface ConfigArticleCategory {
	name: string;
	indexTitle?: string;
	indexFile?: string;
	title?: string;
	groups?: ConfigArticleGroup[];
}

export interface ConfigArticleGroup {
	name: string;
	title: string;
	articles?: ConfigArticle[];
}

export interface ReferenceConfigCategory {
	name: string;
	title: string;
}

export interface ReferenceConfig {
	categories?: ReferenceConfigCategory[];
}

export interface Manifest {
	versions?: string[];
	defaultVersion: string;
	rootUrl: string;
}

export interface Config {
	dev: boolean;
	prettier: boolean;
	configDir: string | null;
	outputDir: string;
	persistentFiles?: string[];
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
	defaultVersion?: string;
	ignoredPackages?: string[];
	title: string | null;
	repoUser: string | null;
	repoName: string | null;
	repoBaseFolder: string | null;
	repoBranch: string;
	indexFile: string;
	indexTitle: string;
	categories?: ConfigArticleCategory[];
	referenceConfig?: Record<string, ReferenceConfig>;
	shouldEnhance: boolean;
	webpackProgressCallback?: (
		percentage: number,
		msg: string,
		moduleProgress?: string,
		activeModules?: string,
		moduleName?: string
	) => void;
	/** @private */
	__devManifest?: Manifest;
}
