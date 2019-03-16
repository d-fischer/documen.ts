import injectSheet, { StyleCreator, Styles, WithSheet as OrigWithSheet } from 'react-jss';
import { Theme } from '../Theme';

type WithSheet<S extends string | Styles | StyleCreator<keyof S>> = OrigWithSheet<S, Theme>;

function createStyles<T extends string>(styles: Styles<T> | StyleCreator<T, Theme>): Styles<T> | StyleCreator<T, Theme> {
	return styles;
}

export { createStyles, injectSheet as withStyles, WithSheet, Styles };
