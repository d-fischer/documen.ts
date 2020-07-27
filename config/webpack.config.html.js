'use strict';

const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const path = require('path');
const webpack = require('webpack');
const paths = require('./paths');
const getClientEnvironment = require('./env');

const publicPath = paths.servedPath;
const publicUrl = publicPath.slice(0, -1);
const env = getClientEnvironment(publicUrl);

const baseConfig = {
	mode: 'production',
	bail: true,
	context: paths.appRoot,
	resolve: {
		modules: ['node_modules', paths.appNodeModules].concat(
			// It is guaranteed to exist because we tweak it in `env.js`
			process.env.NODE_PATH.split(path.delimiter).filter(Boolean)
		),
		extensions: ['.ts', '.tsx', '.js', '.jsx'],
	},
	module: {
		strictExportPresence: true,
		rules: [
			{
				test: /\.js$/,
				loader: 'source-map-loader',
				enforce: 'pre',
				include: paths.appSrc,
			},
			{
				test: /\.tsx?$/,
				loader: 'ts-loader',
				options: {
					configFile: 'tsconfig-html.json'
				}
			}
		]
	},
	performance: {
		hints: false
	},
	stats: {
		children: false,
		modules: false
	},
	node: {
		__dirname: false
	},
};

module.exports = outDir => [
	{
		...baseConfig,
		target: 'node',
		devtool: 'source-map',
		entry: [paths.entryPoints.html],
		output: {
			path: outDir,
			filename: 'generator.js',
			devtoolModuleFilenameTemplate: info =>
				path
					.relative(paths.appSrc, info.absoluteResourcePath)
					.replace(/\\/g, '/'),
			library: 'DocumenTSHTMLGenerator',
			libraryTarget: 'umd'
		},
		module: {
			strictExportPresence: true,
			rules: [
				{
					test: /\.tsx?$/,
					loader: 'ts-loader',
					options: {
						configFile: 'tsconfig-enhance.json'
					}
				}
			],
		},
		plugins: [
			new webpack.DefinePlugin({
				...env.stringified,
				__DOCTS_COMPONENT_MODE: JSON.stringify('static')
			}),
			new CaseSensitivePathsPlugin(),
		]
	},
	{
		...baseConfig,
		entry: [paths.entryPoints.enhance],
		output: {
			path: outDir,
			pathinfo: true,
			filename: 'pe.js',
			publicPath,
		},
		plugins: [
			new webpack.DefinePlugin({
				...env.stringified,
				__DOCTS_COMPONENT_MODE: JSON.stringify('dynamic')
			}),
			new CaseSensitivePathsPlugin(),
		],
		optimization: {
			minimize: true
		}
	}
];
