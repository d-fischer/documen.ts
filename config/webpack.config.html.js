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
		fallback: {
			dgram: false,
			fs: false,
			net: false,
			tls: false,
			perf_hooks: false,
		}
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
					transpileOnly: true,
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

module.exports = (outDir, { dev }) => [
	{
		...baseConfig,
		target: 'node',
		devtool: dev ? 'source-map' : false,
		entry: [paths.entryPoints.html],
		output: {
			path: outDir,
			filename: 'generator.js',
			devtoolModuleFilenameTemplate: info =>
				path
					.relative(paths.appSrc, info.absoluteResourcePath)
					.replace(/\\/g, '/'),
			library: 'DocumenTsHtmlGenerator',
			libraryTarget: 'umd'
		},
		plugins: [
			new webpack.DefinePlugin({
				...env.stringified,
				__DOCTS_COMPONENT_MODE: JSON.stringify('static')
			}),
			new CaseSensitivePathsPlugin(),
		],
		optimization: {
			minimize: false
		}
	},
	{
		...baseConfig,
		entry: [paths.entryPoints.enhance],
		devtool: dev ? 'source-map' : false,
		output: {
			path: outDir,
			pathinfo: true,
			filename: 'pe.js',
			publicPath,
		},
		module: {
			strictExportPresence: true,
			rules: [
				{
					test: /\.tsx?$/,
					loader: 'ts-loader',
					options: {
						transpileOnly: true,
						configFile: 'tsconfig-enhance.json'
					},
				}
			],
		},
		plugins: [
			new webpack.DefinePlugin({
				...env.stringified,
				__DOCTS_COMPONENT_MODE: JSON.stringify('dynamic')
			}),
			new CaseSensitivePathsPlugin(),
		],
		optimization: {
			minimize: !dev
		}
	}
];
