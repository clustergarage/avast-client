var path = require('path');
// webpack plugins
var webpack = require('webpack');
var ProvidePlugin = require('webpack/lib/ProvidePlugin');
var DefinePlugin = require('webpack/lib/DefinePlugin');
var OccurrenceOrderPlugin = require('webpack/lib/optimize/OccurrenceOrderPlugin');
var DedupePlugin = require('webpack/lib/optimize/DedupePlugin');
var UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');
var CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var WebpackMd5Hash = require('webpack-md5-hash');
var ENV = process.env.NODE_ENV = process.env.ENV = 'production';
var HOST = process.env.HOST || 'localhost';
var PORT = process.env.PORT || 8080;

var metadata = {
    baseUrl: '/',
    host: HOST,
    port: PORT,
    ENV: ENV,
    title: 'Avast',
    description: 'Raspberry Pirates tinkerapp',
    author: 'Brett Fowle <brettfowle@gmail.com>'
};

module.exports = {
    // static data for index.html
    metadata: metadata,
    // for faster builds use 'eval'
    devtool: 'source-map',
    debug: true,

    entry: {
        vendor: './src/vendor.ts',
        main: './src/main.ts'
    },

    // config for our build files
    output: {
        path: root('dist'),
        filename: '[name].[chunkhash].bundle.js',
        sourceMapFilename: '[name].[chunkhash].bundle.map',
        chunkFilename: '[id].[chunkhash].chunk.js'
    },

    resolve: {
        cache: false,
        // ensure loader extensions match
        extensions: [
            '',
            '.ts',
            '.js',
            '.json',
            '.css',
            '.html'
        ]
    },

    module: {
        preLoaders: [{
            test: /\.ts$/,
            loader: 'tslint-loader',
            exclude: [/node_modules/]
        }],
        loaders: [
            // support for *.ts files.
            {
                test: /\.ts$/,
                loader: 'ts-loader',
                query: {
                    // remove TypeScript helpers to be injected below by DefinePlugin
                    compilerOptions: {
                        removeComments: true,
                        noEmitHelpers: true,
                    },
                    ignoreDiagnostics: [
                        2403, // 2403 -> Subsequent variable declarations
                        2300, // 2300 -> Duplicate identifier
                        2374, // 2374 -> Duplicate number index signature
                        2375  // 2375 -> Duplicate string index signature
                    ]
                },
                exclude: [ /\.(spec|e2e)\.ts$/ ]
            },
            // Support for *.json files.
            {
                test: /\.json$/,
                loader: 'json-loader'
            },
            // Support for *.css as raw text
            {
                test: /\.css$/,
                loader: 'raw-loader'
            },
            // support for *.html as raw text
            {
                test: /\.html$/,
                loader: 'raw-loader'
            }
        ]
    },

    plugins: [
        new WebpackMd5Hash(),
        new DedupePlugin(),
        new OccurrenceOrderPlugin(true),
        new CommonsChunkPlugin({
            name: 'vendor',
            filename: 'vendor.[chunkhash].bundle.js',
            minChunks: Infinity
        }),
        // static assets
        new CopyWebpackPlugin([{
            from: 'src/assets',
            to: 'assets'
        }]),
        // generating html
        new HtmlWebpackPlugin({
            template: 'src/index.html'
        }),
        new DefinePlugin({
            // environment helpers
            'process.env': {
                ENV: JSON.stringify(metadata.ENV),
                NODE_ENV: JSON.stringify(metadata.ENV)
            }
        }),
        new ProvidePlugin({
            // typescript helpers
            '__metadata': 'ts-helper/metadata',
            '__decorate': 'ts-helper/decorate',
            '__awaiter': 'ts-helper/awaiter',
            '__extends': 'ts-helper/extends',
            '__param': 'ts-helper/param',
            'Reflect': 'es7-reflect-metadata/dist/browser'
        }),
        new UglifyJsPlugin({
            // beautify: true,
            mangle: false,
            comments: false,
            compress : {
                screw_ie8 : true
            },
            //mangle: {
            //    screw_ie8: true
            //}
        })
    ],

    // other module loader config
    tslint: {
        emitErrors: true,
        failOnHint: true
    },

    // we need this due to problems with es6-shim
    node: {
        global: 'window',
        progress: false,
        crypto: 'empty',
        module: false,
        clearImmediate: false,
        setImmediate: false
    }
};

function root(args) {
    args = Array.prototype.slice.call(arguments, 0);
    return path.join.apply(path, [__dirname].concat(args));
}

function rootNode(args) {
    args = Array.prototype.slice.call(arguments, 0);
    return root.apply(path, ['node_modules'].concat(args));
}
