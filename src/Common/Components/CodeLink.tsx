import * as React from 'react';
import { ReferenceNode } from '../Reference';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faCode } from '@fortawesome/free-solid-svg-icons';

import './CodeLink.scss';

interface CodeLinkProps {
	symbol: ReferenceNode;
}

const CodeLink: React.SFC<CodeLinkProps> = ({ symbol }) => symbol.sources && symbol.sources.length ? (
	<a className="CodeLink" href={`https://github.com/d-fischer/twitch/blob/master/src/${symbol.sources[0].fileName}#L${symbol.sources[0].line}`}>
		<Icon icon={faCode} className="CodeLink__icon"/>
	</a>
) : null;

export default CodeLink;
