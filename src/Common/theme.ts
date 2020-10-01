const theme = {
	colors: {
		background: {
			default: '#141414',
			hover: '#333333',
			active: '#242424'
		},
		text: '#b9b9b9',
		link: '#949494',
		border: '#444',
		accent: {
			default: '#647d0f',
			focus: '#88ab14'
		},
		badges: {
			async: '#cccc70',
			deprecated: '#cc7070'
		}
	},
	fonts: {
		code: 'Monaco, Menlo, "Lucida Console", monospace'
	},
	spacing: {
		unit: 8
	}
};

export default theme;
export type Theme = typeof theme;

declare module '@material-ui/styles' {
	// eslint-disable-next-line @typescript-eslint/no-empty-interface
	interface DefaultTheme extends Theme {
	}
}
