const path = require('path')
const HtmlWebPackPlugin = require('html-webpack-plugin')

module.exports = {
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.html$/,
                use: [
                    {
                        loader: 'html-loader'
                    }
                ]
            }
        ]
    },
    // mode: 'development',
    // entry: './src/index.js',
    // output: {
    //     filename: 'main.js',
    //     path: path.resolve(__dirname, 'dist')
    // },
    // devtool: 'inline-source-map',
    // devServer: {
    //     contentBase: './public'
    // },
    plugins: [
        new HtmlWebPackPlugin({
            template: './public/index.html',
            filename: './index.html'
        })
    ]
}