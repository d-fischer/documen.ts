import { createContext } from 'react';
import Config from './Config';
import Paths from '../../Common/Paths';

declare global {
	const __DOCTS_CONFIG: Config;
	const __DOCTS_PATHS: Paths;
}

const { projectBase, sourceBase } = __DOCTS_PATHS;
export { projectBase, sourceBase };

export const ConfigContext = createContext(__DOCTS_CONFIG);
