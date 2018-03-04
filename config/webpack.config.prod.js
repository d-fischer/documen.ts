'use strict';

const autoprefixer = require('autoprefixer');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const paths = require('./paths');
const getClientEnvironment = require('./env');

const publicPath = paths.servedPath;
const shouldUseRelativeAssetPaths = publicPath === './';
const publicUrl = publicPath.slice(0, -1);
const env = getClientEnvironment(publicUrl);

if (env.stringified['process.env'].NODE_ENV !== '"production"') {
	throw new Error('Production builds must have NODE_ENV=production.');
}

const cssFilename = 'static/css/[name].[contenthash:8].css';

const extractTextPluginOptions = shouldUseRelativeAssetPaths
	? {publicPath: Array(cssFilename.split('/').length).join('../')}
	: {};

module.exports = {
	bail: true,
	devtool: 'source-map',
	entry: [paths.appIndexJs],
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
		plugins: [
			new ModuleScopePlugin(paths.appSrc),
		],
	},
	module: {
		strictExportPresence: true,
		rules: [
			{
				test: /\.tsx?$/,
				loader: require.resolve('tslint-loader'),
				enforce: 'pre',
				include: paths.appSrc,
				options: {
					typeCheck: true
				}
			},
			{
				test: /\.js$/,
				loader: require.resolve('source-map-loader'),
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
				loader: require.resolve('file-loader'),
				options: {
					name: 'static/media/[name].[hash:8].[ext]',
				},
			},
			{
				test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
				loader: require.resolve('url-loader'),
				options: {
					limit: 10000,
					name: 'static/media/[name].[hash:8].[ext]',
				},
			},
			{
				test: /\.tsx?$/,
				include: paths.appSrc,
				loader: require.resolve('awesome-typescript-loader')
			},
			{
				test: /\.css$/,
				loader: ExtractTextPlugin.extract({
					fallback: require.resolve('style-loader'),
					use: [
						{
							loader: require.resolve('css-loader'),
							options: {
								importLoaders: 1,
								minimize: true,
								sourceMap: true,
							},
						},
						{
							loader: require.resolve('postcss-loader'),
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
					],
					...extractTextPluginOptions
				}),
			},
			{
				test: /\.s[ac]ss$/,
				loader: ExtractTextPlugin.extract({
					fallback: require.resolve('style-loader'),
					use: [
						{
							loader: require.resolve('css-loader'),
							options: {
								importLoaders: 1,
								minimize: true,
								sourceMap: true
							}
						},
						{
							loader: require.resolve('sass-loader'),
							options: {
								sourceMap: true,
								includePaths: [
									path.resolve(paths.appNodeModules, './compass-mixins/lib')
								]
							}
						}
					],
					...extractTextPluginOptions
				})
			},
			{
				test: /Resources\/.+\.svg$/,
				exclude: /node_modules/,
				loader: 'svg-react-loader'
			}
		],
	},
	plugins: [
		new InterpolateHtmlPlugin(env.raw),
		new HtmlWebpackPlugin({
			inject: true,
			template: paths.appHtml,
			minify: {
				removeComments: true,
				collapseWhitespace: true,
				removeRedundantAttributes: true,
				useShortDoctype: true,
				removeEmptyAttributes: true,
				removeStyleLinkTypeAttributes: true,
				keepClosingSlash: true,
				minifyJS: true,
				minifyCSS: true,
				minifyURLs: true,
			},
		}),
		new webpack.DefinePlugin(env.stringified),
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings: false,
				comparisons: false,
			},
			output: {
				comments: false,
				ascii_only: true,
			},
			sourceMap: true,
		}),
		new ExtractTextPlugin({filename: cssFilename}),
		new ManifestPlugin({fileName: 'asset-manifest.json'}),
		new SWPrecacheWebpackPlugin({
			dontCacheBustUrlsMatching: /\.\w{8}\./,
			filename: 'service-worker.js',
			logger(message) {
				if (message.indexOf('Total precache size is') === 0) {
					return;
				}
				if (message.indexOf('Skipping static resource') === 0) {
					return;
				}
				console.log(message);
			},
			minify: false,
			navigateFallback: publicUrl + '/index.html',
			staticFileGlobsIgnorePatterns: [/\.map$/, /asset-manifest\.json$/],
		}),
		new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
		new webpack.ProgressPlugin()
	],
	node: {
		dgram: 'empty',
		fs: 'empty',
		net: 'empty',
		tls: 'empty',
	},
};
