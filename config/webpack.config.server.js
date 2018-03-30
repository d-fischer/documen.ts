'use strict';

const autoprefixer = require('autoprefixer');
const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const paths = require('./paths');
const getClientEnvironment = require('./env');

const publicPath = paths.servedPath;
const publicUrl = publicPath.slice(0, -1);
const env = getClientEnvironment(publicUrl);

if (env.stringified['process.env'].NODE_ENV !== '"production"') {
	throw new Error('Production builds must have NODE_ENV=production.');
}

module.exports = {
	mode: 'production',
	target: 'node',
	externals: nodeExternals({whitelist: [/\.css$/]}),
	bail: true,
	devtool: 'source-map',
	entry: [paths.serverIndexJs],
	context: __dirname,
	output: {
		path: paths.serverBuild,
		filename: 'server.js',
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
		extensions: ['.ts', '.tsx', '.js', '.jsx', '.css'],
	},
	module: {
		strictExportPresence: true,
		rules: [
			{
				test: /\.tsx?$/,
				loader: 'tslint-loader',
				enforce: 'pre',
				include: paths.appSrc,
				options: {
					typeCheck: true
				}
			},
			{
				test: /\.js$/,
				loader: 'source-map-loader',
				enforce: 'pre',
				include: paths.appSrc,
			},
			{
				exclude: [
					/\.html$/,
					/\.[jt]sx?$/,
					/\.css$/,
					/\.s[ac]ss/,
					/\.json$/,
					/\.bmp$/,
					/\.gif$/,
					/\.jpe?g$/,
					/\.png$/,
					/Resources\/.+\.svg$/
				],
				loader: 'file-loader',
				options: {
					name: 'static/media/[name].[hash:8].[ext]',
					emitFile: false
				},
			},
			{
				test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
				loader: 'url-loader',
				options: {
					limit: 10000,
					name: 'static/media/[name].[hash:8].[ext]',
					emitFile: false
				},
			},
			{
				test: /\.tsx?$/,
				include: paths.appSrc,
				loader: 'awesome-typescript-loader',
			},
			{
				test: /\.css$/,
				exclude: /node_modules/,
				loader: [
					{
						loader: 'css-loader/locals',
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
				]
			},
			{
				test: /\.css$/,
				include: /node_modules/,
				loader: 'css-loader/locals'
			},
			{
				test: /\.s[ac]ss$/,
				loader: [
					{
						loader: 'css-loader/locals',
						options: {
							importLoaders: 1,
							minimize: true,
							sourceMap: true
						}
					},
					{
						loader: 'sass-loader',
						options: {
							sourceMap: true,
							includePaths: [
								path.resolve(paths.appNodeModules, './compass-mixins/lib')
							]
						}
					}
				]
			},
			{
				test: /Resources\/.+\.svg$/,
				exclude: /node_modules/,
				loader: 'svg-react-loader'
			}
		],
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
		new webpack.DefinePlugin(env.stringified),
		new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
	],
	node: {
		__dirname: false
	},
};
