'use strict';

const PORT = process.env.PORT || 3000;

const autoprefixer = require('autoprefixer');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const getClientEnvironment = require('./env');
const paths = require('./paths');
const fs = require('fs-extra');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const publicPath = '/';
const publicUrl = '';
const env = getClientEnvironment(publicUrl);

module.exports = {
	mode: 'development',
	devtool: 'cheap-module-source-map',
	devServer: {
		disableHostCheck: true,
		clientLogLevel: 'none',
		contentBase: paths.appPublic,
		watchContentBase: true,
		inline: true,
		hot: true,
		port: PORT,
		historyApiFallback: true,
		watchOptions: {
			ignored: /node_modules/
		},
		stats: {
			entrypoints: true
		}
	},
	entry: [
		require.resolve('react-error-overlay'),
		paths.entryPoints.spa,
	],
	output: {
		path: paths.appBuild,
		pathinfo: true,
		filename: 'static/js/bundle.js',
		chunkFilename: 'static/js/[name].chunk.js',
		publicPath: publicPath,
		devtoolModuleFilenameTemplate: info =>
			path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
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
				test: /\.tsx?$/,
				loader: 'ts-loader',
				options: {
					transpileOnly: true,
					configFile: 'tsconfig-spa.json'
				}
			},
			{
				test: /\.css$/,
				use: [
					'style-loader',
					{
						loader: 'css-loader',
						options: {
							importLoaders: 1,
						},
					},
					{
						loader: 'postcss-loader',
						options: {
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
			}
		],
	},
	plugins: [
		new HtmlWebpackPlugin({
			inject: true,
			template: paths.appHtml,
		}),
		new webpack.NamedModulesPlugin(),
		new ForkTsCheckerWebpackPlugin(),
		new webpack.DefinePlugin(env.stringified),
		new webpack.DefinePlugin({
			__DOCTS_REFERENCE: fs.readFileSync(path.join(process.cwd(), 'docs.json'), 'UTF-8'),
			__DOCTS_CONFIG: '{"repoUser": "d-fischer", "repoName": "twitch"}'
		}),
		new webpack.HotModuleReplacementPlugin(),
		new CaseSensitivePathsPlugin(),
		new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
	],
	node: {
		dgram: 'empty',
		fs: 'empty',
		net: 'empty',
		tls: 'empty',
	},
	performance: {
		hints: false,
	},
};
