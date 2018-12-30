import * as React from 'react';
import { ReferenceType } from '../Reference';
import { buildType } from '../Tools/CodeBuilders';

import './TypeAliasHint.scss';

interface TypeAliasHintProps {
	name: string;
	type: ReferenceType;
}

const TypeAliasHint: React.FunctionComponent<TypeAliasHintProps> = ({ name, type }) => (
	<div className="TypeAliasHint">
		<abbr>{name}</abbr>
		<div className="TypeAliasHint__hint">
			<div className="TypeAliasHint__toolTip">
				{buildType(type)}
			</div>
		</div>
	</div>
);

export default TypeAliasHint;
