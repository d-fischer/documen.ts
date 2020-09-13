'use strict';

const PORT = process.env.PORT || 3000;

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const getClientEnvironment = require('./env');
const paths = require('./paths');
const fs = require('fs');
const MonorepoGenerator = require('../lib/Generator/Modes/MonorepoGenerator').default;

const publicPath = '/';
const publicUrl = '';
const env = getClientEnvironment(publicUrl);

const monoRefJson = fs.readFileSync(path.join(process.cwd(), 'docs-mono.json'), 'utf-8');
const monoRefObj = JSON.parse(monoRefJson);
const gen = new MonorepoGenerator({});

const monoRef = gen._transformTopReferenceNode(monoRefObj);

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
		alias: {
			'react-dom': '@hot-loader/react-dom'
		},
		extensions: ['.ts', '.tsx', '.js', '.jsx'],
	},
	module: {
		strictExportPresence: true,
		rules: [
			{
				test: /\.tsx?$/,
				loader: 'ts-loader',
				options: {
					configFile: 'tsconfig-spa.json'
				}
			}
		],
	},
	plugins: [
		new HtmlWebpackPlugin({
			inject: true,
			template: paths.appHtml,
		}),
		new webpack.NamedModulesPlugin(),
		new webpack.DefinePlugin(env.stringified),
		new webpack.DefinePlugin({
			__DOCTS_REFERENCE: JSON.stringify(monoRef),
			__DOCTS_CONFIG: JSON.stringify({
				repoUser: 'd-fischer',
				repoName: 'twitch',
				repoBranch: 'master',
				monorepoRoot: 'packages',
				mainBranchName: 'master',
				versionBranchPrefix: 'support/',
				versionFolder: 'versions',
				__devManifest: {
					versions: ['4.2'],
					rootUrl: ''
				}
			}),
			__DOCTS_PATHS: JSON.stringify({ sourceBase: path.resolve('..'), projectBase: path.resolve('../twitch') }),
			__DOCTS_COMPONENT_MODE: JSON.stringify('dynamic')
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
