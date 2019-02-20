import { GeneratorMode } from '../GeneratorMode';
import RouterMode from '../HTMLRenderer/RouterMode';

export interface ConfigArticle {
	name: string;
	title: string;
	file: string;
}

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
	repoUser: string | null;
	repoName: string | null;
	repoBranch: string;
	indexFile: string;
	indexTitle: string;
	categories?: ConfigCategory[];
	webpackProgressCallback?: (percentage: number, msg: string, moduleProgress?: string, activeModules?: string, moduleName?: string) => void;
}
