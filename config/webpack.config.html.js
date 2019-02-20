'use strict';

const autoprefixer = require('autoprefixer');
const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const paths = require('./paths');
const getClientEnvironment = require('./env');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const publicPath = paths.servedPath;
const publicUrl = publicPath.slice(0, -1);
const env = getClientEnvironment(publicUrl);

module.exports = outDir => ({
	mode: 'production',
	target: 'node',
	externals: nodeExternals({whitelist: [/\.css$/]}),
	bail: true,
	devtool: 'source-map',
	entry: [paths.entryPoints.html],
	context: __dirname,
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
		extensions: ['.ts', '.tsx', '.js', '.jsx', '.css'],
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
				exclude: /node_modules/,
				loader: 'ts-loader',
				options: {
					transpileOnly: true,
					compilerOptions: {
						importHelpers: false
					}
				}
			},
			{
				test: /\.css$/,
				loader: [
					{
						loader: MiniCssExtractPlugin.loader,
						options: {
							publicPath: '../../'
						}
					},
					{
						loader: 'css-loader',
						options: {
							importLoaders: 1,
							minimize: true,
							sourceMap: true,
						},
					},
					{
						loader: 'postcss-loader',
						options: {
							// Necessary for external CSS imports to work
							// https://github.com/facebookincubator/create-react-app/issues/2677
							ident: 'postcss',
							sourceMap: true,
							plugins: () => [
								require('postcss-flexbugs-fixes'),
								autoprefixer({
									browsers: [
										'>1%',
										'last 4 versions',
										'Firefox ESR',
										'not ie < 9', // React doesn't support IE8 anyway
									],
									flexbox: 'no-2009',
								}),
							],
						},
					},
				],
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
		new ForkTsCheckerWebpackPlugin(),
		new webpack.DefinePlugin(env.stringified),
		new MiniCssExtractPlugin({
			filename: 'static/css/style.css'
		})
	],
	node: {
		__dirname: false
	},
});
