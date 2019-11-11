'use strict';

const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const paths = require('./paths');
const getClientEnvironment = require('./env');

const publicPath = paths.servedPath;
const publicUrl = publicPath.slice(0, -1);
const env = getClientEnvironment(publicUrl);

module.exports = outDir => ({
	mode: 'production',
	target: 'node',
	externals: nodeExternals(),
	bail: true,
	devtool: 'source-map',
	entry: [paths.entryPoints.html],
	context: paths.appRoot,
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
					compilerOptions: {
						importHelpers: false
					}
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
	plugins: [
		new webpack.DefinePlugin(env.stringified)
	],
	node: {
		__dirname: false
	},
});
