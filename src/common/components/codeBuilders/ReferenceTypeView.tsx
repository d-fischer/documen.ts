import { faExternalLink } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { makeStyles } from '@mui/styles';
import React from 'react';
import type { ReferenceNode, ReferenceReferenceType, ReferenceType } from '../../reference';
import { createExternalLink } from '../../tools/CodeTools';
import TypeLink from '../TypeLink';
import Type from './Type';

interface ReferenceTypeProps {
	isOptional: boolean;
	def: ReferenceReferenceType | ReferenceNode;
	typeArguments?: ReferenceType[];
}

const useStyles = makeStyles(
	theme => ({
		link: {
			color: theme.colors.link,
			fontWeight: 'bold',
			textDecoration: 'none'
		}
	}),
	{ name: 'ReferenceTypeView' }
);

const ReferenceTypeView: React.FC<ReferenceTypeProps> = ({ isOptional, typeArguments, def }) => {
	const classes = useStyles();
	const externalLink = createExternalLink((def as ReferenceReferenceType).externalReference);
	return (
		<>
			{isOptional && '?'}
			{externalLink ? (
				<a className={classes.link} href={externalLink}>
					<Icon icon={faExternalLink} size="sm" /> {def.name}
				</a>
			) : (
				<TypeLink name={def.name} id={def.id}>
					{def.name}
				</TypeLink>
			)}
			{typeArguments?.length ? (
				<>
					&lt;
					{typeArguments.map((param, idx) => (
						<React.Fragment key={idx}>
							{idx === 0 ? '' : ', '}
							<Type def={param} />
						</React.Fragment>
					))}
					&gt;
				</>
			) : null}
		</>
	);
};

export default ReferenceTypeView;
