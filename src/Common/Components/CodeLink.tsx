import * as React from 'react';
import { ReferenceNode } from '../Reference';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faCode } from '@fortawesome/free-solid-svg-icons';
import config from '../Config';

import './CodeLink.scss';

interface CodeLinkProps {
	symbol: ReferenceNode;
}

const CodeLink: React.FC<CodeLinkProps> = ({ symbol }) => config.repoUser && config.repoName && symbol.sources && symbol.sources.length ? (
	<a className="CodeLink" href={`https://github.com/${config.repoUser}/${config.repoName}/blob/master/src/${symbol.sources[0].fileName}#L${symbol.sources[0].line}`}>
		<Icon icon={faCode} className="CodeLink__icon"/>
	</a>
) : null;

export default CodeLink;
