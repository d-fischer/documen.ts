import { createContext } from 'react';
import { Config } from './Config';
import Paths from '../../common/Paths';

declare global {
	const __DOCTS_CONFIG: Config;
	const __DOCTS_PATHS: Paths;
	const __DOCTS_MOCK_FS: [string, string][] | null;
}

const { projectBase, rootUrl } = __DOCTS_PATHS;
export { projectBase, rootUrl };

export const ConfigContext = createContext(__DOCTS_CONFIG);
// noinspection UnnecessaryLocalVariableJS
const mockFsValues = __DOCTS_MOCK_FS;
export const mockFs = mockFsValues ? new Map(__DOCTS_MOCK_FS) : null;

if (typeof window !== 'undefined') {
	const wnd = window as any;
	wnd.__paths = __DOCTS_PATHS;
	wnd.__mockFs = mockFs;
}
