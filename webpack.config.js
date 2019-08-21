const Path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    devtool: 'inline-source-map',
    output: {
        publicPath: '/'
    },
    resolve: {
        extensions: ['.ts', '.js', '.json', '.vue'],
        alias: {
            vue: 'vue/dist/vue.runtime.esm.js'
        }
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                include: [Path.resolve(__dirname, 'src')],
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            appendTsSuffixTo: [/\.vue$/],
                        }
                    },
                    'tslint-loader'
                ]
            },
            {
                test: /\.scss$/,
                use: [
                    'vue-style-loader',
                    'css-loader',
                    'sass-loader'
                ]
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    loaders: {
                        ts: [
                            {
                                loader: 'ts-loader',
                                options: {
                                    appendTsSuffixTo: [/\.vue$/],
                                }
                            },
                            'tslint-loader'
                        ],
                        scss: [
                            'vue-style-loader',
                            'css-loader',
                            'sass-loader'
                        ]
                    }
                }
            }
        ]
    },
    plugins: [
        new VueLoaderPlugin(),
        new HtmlWebpackPlugin({
            title: 'Deck',
            favicon: './favicon.ico',
            meta: {
                'viewport': 'width=device-width, initial-scale=1.0',
                'cache-control': { 'http-equiv': 'cache-control', 'content': 'private' },
                'author': 'Jacob Koperski',
                'description': 'Deck is an open-source, well-armed, safe-to-swallow, and fluoride-free application for editing and presenting slide decks.',
                'copyright': 'COPYRIGHT &copy; WILLIAM JACOB KOPERSKI 2018',
                'og:title': 'Jacob Koperski',
                'og:image': '',
                'og:description': 'Deck is an open-source, well-armed, safe-to-swallow, and fluoride-free application for editing and presenting slide decks.',
                'og:url': 'https://jakeko.github.io/Deck/',
                'og:type': 'website',
                'twitter:card': 'summary',
                'twitter:title': 'Jacob Koperski',
                'twitter:image': '',
                'twitter:description': 'Deck is an open-source, well-armed, safe-to-swallow, and fluoride-free application for editing and presenting slide decks.'
            },
            
        })
    ]
};
