module.exports = {
	plugins: ['react'],
	extends: ['@d-fischer', 'plugin:react/recommended'],
	rules: {
		'filenames/match-exported': 'off',
		'react/prop-types': 'off',
		'@typescript-eslint/explicit-module-boundary-types': 'off'
	},
	parserOptions: {
		project: ['tsconfig.json', 'tsconfig-html.json', 'tsconfig-spa.json', 'tsconfig-enhance.json']
	},
	settings: {
		react: {
			version: 'detect'
		}
	}
};
