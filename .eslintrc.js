module.exports = {
	plugins: ['react'],
	extends: ['@d-fischer', 'plugin:react/recommended'],
	rules: {
		'filenames/match-exported': 'off'
	},
	parserOptions: {
		project: ['tsconfig.json', 'tsconfig-html.json', 'tsconfig-spa.json']
	},
	settings: {
		react: {
			version: 'detect'
		}
	}
};
