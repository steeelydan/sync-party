import path from 'path';
import webpack from 'webpack';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import WebpackAssetsManifest from 'webpack-assets-manifest';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve('.env') });

const clientEnvVars = {
    NODE_ENV: JSON.stringify(process.env.NODE_ENV),
    SERVER_PORT: JSON.stringify(process.env.SERVER_PORT),
    WEBSOCKETS_PORT: JSON.stringify(process.env.WEBSOCKETS_PORT),
    APP_VERSION: JSON.stringify(process.env.npm_package_version)
};

console.log(
    'Building the client app with the following environment variables:',
    clientEnvVars
);

const webpackEntry = [path.resolve('src/client/src/index.tsx')];

const webpackOutput = {
    filename: 'bundle.[contenthash].js',
    path: path.resolve('build/public')
};

const webpackPlugins = [
    new webpack.DefinePlugin(clientEnvVars),
    new HtmlWebpackPlugin({
        template: path.resolve('src/client/index.html'),
        publicPath: '/'
    }),
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
        filename: 'style.[contenthash].css'
    }),
    new WebpackAssetsManifest({
        output: './assets-manifest.json'
    }),
    new CopyPlugin({
        patterns: [{ from: path.resolve('src/client/static'), to: './static' }]
    })
];

export default {
    mode:
        clientEnvVars.NODE_ENV === 'production' ? 'production' : 'development',
    devtool:
        clientEnvVars.NODE_ENV === 'production' ? false : 'inline-source-map',
    entry: webpackEntry,
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    output: webpackOutput,
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                options: {
                    configFile: path.resolve('src/client/tsconfig.json')
                }
            },
            {
                test: /\.(scss|css)$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'sass-loader',
                    'postcss-loader'
                ]
            }
        ]
    },
    plugins: webpackPlugins
};
