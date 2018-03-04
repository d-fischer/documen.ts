import * as React from 'react';
import { ReferenceNode } from '../Resources/data/reference';
import * as Icon from 'react-fontawesome';

import './CodeLink.scss';

interface CodeLinkProps {
	symbol: ReferenceNode;
}

const CodeLink: React.SFC<CodeLinkProps> = ({ symbol }) => symbol.sources && symbol.sources.length ? (
	<a className="CodeLink" href={`https://github.com/d-fischer/twitch/blob/master/src/${symbol.sources[0].fileName}#L${symbol.sources[0].line}`}>
		<Icon name="code"/>
	</a>
) : null;

export default CodeLink;
