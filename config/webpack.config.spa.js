'use strict';

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const paths = require('./paths');
const getClientEnvironment = require('./env');

const publicPath = paths.servedPath;
const publicUrl = publicPath.slice(0, -1);
const env = getClientEnvironment(publicUrl);

if (env.stringified['process.env'].NODE_ENV !== '"production"') {
	throw new Error('Production builds must have NODE_ENV=production.');
}

module.exports = (outDir, { title }) =>  ({
	mode: 'production',
	bail: true,
	devtool: 'source-map',
	entry: paths.entryPoints.spa,
	context: paths.appRoot,
	output: {
		path: paths.appBuild,
		filename: 'static/js/bundle.js',
		publicPath: publicPath,
		devtoolModuleFilenameTemplate: info =>
			path
				.relative(paths.appSrc, info.absoluteResourcePath)
				.replace(/\\/g, '/'),
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
					configFile: 'tsconfig-spa.json'
				}
			}
		]
	},
	optimization: {
		minimize: true
	},
	performance: {
		hints: false
	},
	stats: {
		children: false,
		modules: false
	},
	plugins: [
		new HtmlWebpackPlugin({
			inject: true,
			template: paths.appHtml,
			templateParameters: {
				title: title ?? 'Documentation'
			},
			minify: {
				removeComments: true,
				collapseWhitespace: true,
				removeRedundantAttributes: true,
				useShortDoctype: true,
				removeEmptyAttributes: true,
				removeStyleLinkTypeAttributes: true,
				keepClosingSlash: true,
				minifyJS: true,
				minifyURLs: true,
			},
		}),
		new webpack.DefinePlugin(env.stringified),
		new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
	],
});
