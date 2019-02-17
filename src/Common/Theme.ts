const theme = {
	colors: {
		background: {
			default: '#141414',
			hover: '#333333',
			active: '#242424'
		},
		text: '#b9b9b9',
		border: '#444',
		accent: {
			default: '#647d0f',
			focus: '#88ab14'
		}
	},
	fonts: {
		code: 'Monaco, Menlo, "Lucida Console", monospace'
	}
};

export default theme;
export type Theme = typeof theme;
