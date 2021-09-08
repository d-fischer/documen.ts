'use strict';

const PORT = process.env.PORT || 3000;

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReactRefreshPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const getClientEnvironment = require('./env');
const paths = require('./paths');
const fs = require('fs');
const MonorepoGenerator = require('../lib/generator/modes/MonorepoGenerator').default;

const publicPath = '/';
const publicUrl = '';
const env = getClientEnvironment(publicUrl);

const monoRefJson = fs.readFileSync(path.join(process.cwd(), 'docs-mono.json'), 'utf-8');
const monoRef = JSON.parse(monoRefJson);
let generatorConfig;
let mockFs;
try {
	const generatorConfigJson = fs.readFileSync(path.join(__dirname, '../testdocs/config.json'), 'utf-8');
	generatorConfig = {
		...JSON.parse(generatorConfigJson),
		versionBranchPrefix: undefined
	};
	function createMockFs(dirPath) {
		function worker(dirPath, prefix) {
			const fileNames = fs.readdirSync(dirPath);
			return fileNames.flatMap(fileName => {
				const prefixedPath = prefix ? path.join(prefix, fileName) : fileName;
				const fullPath = path.join(dirPath, fileName);
				const stat = fs.lstatSync(fullPath);
				if (stat.isDirectory()) {
					return worker(fullPath, prefixedPath);
				}

				return [[prefixedPath, fs.readFileSync(fullPath, 'utf-8')]];
			});
		}

		return new Map(worker(dirPath));
	}
	mockFs = createMockFs(path.resolve(__dirname, '../testdocs'));
} catch (e) {
	console.error(e);
	generatorConfig = {
		repoUser: 'twurple',
		repoName: 'twurple',
		repoBranch: 'versions/5.0',
		monorepoRoot: 'packages',
		mainPackage: 'twitch',
		mainBranchName: 'main',
		versionBranchPrefix: 'versions/',
		versionFolder: 'versions',

		__devManifest: {
			versions: ['5.0'],
			rootUrl: ''
		}
	};
}

const fsMapPromise = new MonorepoGenerator(generatorConfig)._generateFsMap(monoRef, { projectBase: path.resolve(process.cwd(), '../twitch') });

module.exports = fsMapPromise.then(fsMap => ({
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
		fallback: {
			dgram: false,
			fs: false,
			net: false,
			tls: false
		}
	},
	module: {
		strictExportPresence: true,
		rules: [
			{
				test: /\.tsx?$/,
				exclude: /node_modules/,
				use: [
					{
						loader: 'babel-loader',
						options: {
							plugins: ['react-refresh/babel']
						}
					},
					{
						loader: 'ts-loader',
						options: {
							configFile: 'tsconfig-spa.json'
						}
					}
				]
			}
		],
	},
	plugins: [
		new ReactRefreshPlugin(),
		new HtmlWebpackPlugin({
			inject: true,
			template: paths.appHtml,
			templateParameters: {
				title: `[DEV] ${generatorConfig.title ?? 'documen.ts'}`
			}
		}),
		new webpack.DefinePlugin(env.stringified),
		new webpack.DefinePlugin({
			__DOCTS_REFERENCE: JSON.stringify(monoRef),
			__DOCTS_CONFIG: JSON.stringify(generatorConfig),
			__DOCTS_FSMAP: JSON.stringify([...fsMap]),
			__DOCTS_MOCK_FS: mockFs ? JSON.stringify([...mockFs]) : 'null',
			__DOCTS_PATHS: JSON.stringify({ projectBase: path.resolve('../twitch') }),
			__DOCTS_COMPONENT_MODE: JSON.stringify('dynamic')
		}),
		new CaseSensitivePathsPlugin(),
		new webpack.IgnorePlugin({ resourceRegExp: /^\.\/locale$/, contextRegExp: /moment$/ }),
	],
	performance: {
		hints: false,
	},
}));
