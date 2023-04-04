import path from 'path';
import webpack from 'webpack';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
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

export default {
    mode:
        clientEnvVars.NODE_ENV === '"production"'
            ? 'production'
            : 'development', // FIXME Can't be correct
    devtool:
        clientEnvVars.NODE_ENV === '"production"' ? false : 'inline-source-map', // FIXME Can't be correct
    entry: [path.resolve('src/client/src/index.tsx')],
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    output: {
        filename: 'static/bundle.[contenthash].js',
        path: path.resolve('build/public')
    },
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
                    'postcss-loader'
                ]
            },
            {
                test: /\.(woff(2)?|eot|ttf|otf)$/,
                type: 'asset',
                generator: {
                    filename: 'static/[name][hash][ext][query]'
                }
            }
        ]
    },
    plugins: [
        new webpack.DefinePlugin(clientEnvVars),
        new HtmlWebpackPlugin({
            template: path.resolve('src/client/index.html'),
            publicPath: '/'
        }),
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: 'static/style.[contenthash].css'
        }),
        new CopyPlugin({
            patterns: [
                { from: path.resolve('src/client/static'), to: './static' },
                { from: path.resolve('src/client/static-toplevel'), to: '.' }
            ]
        })
    ]
};
