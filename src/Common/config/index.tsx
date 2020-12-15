import { createContext } from 'react';
import { Config } from './Config';
import Paths from '../../Common/Paths';

declare global {
	const __DOCTS_CONFIG: Config;
	const __DOCTS_PATHS: Paths;
}

const { projectBase, sourceBase, rootUrl } = __DOCTS_PATHS;
export { projectBase, sourceBase, rootUrl };

if (typeof window !== 'undefined') {
	(window as any).__paths = __DOCTS_PATHS;
}

export const ConfigContext = createContext(__DOCTS_CONFIG);
