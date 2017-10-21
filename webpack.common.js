const path = require('path');
const webpack = require("webpack");
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const GoogleFontsPlugin = require("google-fonts-webpack-plugin");

module.exports = {
    entry: {
        'popup/app': './src/popup/app/app.js'
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.(html)$/,
                loader: 'html-loader'
            },
            {
                test: /.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                        outputPath: 'popup/fonts/',
                        publicPath: '/'
                    }
                }]
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin([
            path.resolve(__dirname, 'dist')
        ]),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery',
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: "popup/vendor",
            minChunks: function (module) {
                // this assumes your vendor imports exist in the node_modules directory
                return module.context && module.context.indexOf("node_modules") !== -1;
            }
        }),
        new HtmlWebpackPlugin({
            template: './src/popup/index.html',
            filename: 'popup/index.html'
        }),
        new CopyWebpackPlugin([
            // Temporarily copy the whole app folder, can be removed once
            // the templates uses template rather than using templateUrl.
            { from: './src/popup/app', to: 'popup/app' },
            './src/manifest.json',
            { from: './src/_locales', to: '_locales' },
            { from: './src/content', to: 'content' },
            { from: './src/edge', to: 'edge' },
            { from: './src/images', to: 'images' },
            { from: './src/lib', to: 'lib' },
            { from: './src/models', to: 'models' },
            { from: './src/notification', to: 'notification' },
            { from: './src/overlay', to: 'overlay' },
            { from: './src/scripts', to: 'scripts' },
            { from: './src/services', to: 'services' },
            './src/background.html',
            './src/background.js'
        ]),
        new GoogleFontsPlugin({
            fonts: [
                {
                    family: "Open Sans",
                    variants: [
                        "300italic", "400italic","600italic", "700italic","800italic",
                        "300", "400", "600", "700", "800"
                    ]
                },
            ],
            filename: "popup/css/fonts.css",
            path: "popup/fonts/"
		})
    ],
    resolve: {
        extensions: [ ".tsx", ".ts", ".js" ]
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist')
    }
};
