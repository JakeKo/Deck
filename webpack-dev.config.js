const path = require("path");
const webpack = require("webpack");
const VueLoaderPlugin = require("vue-loader/lib/plugin");

module.exports = {
    mode: "development",
    entry: {
        "index": "./src/index.ts"
    },
    plugins: [
        new VueLoaderPlugin()
    ],
    devServer: {
        contentBase: __dirname,
        compress: true,
        port: 8080
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        publicPath: "/dist/",
        filename: "[name].bundle.js"
    },
    resolve: {
        extensions: [".ts", ".js", ".json", ".vue"],
        alias: {
            vue: "vue/dist/vue.runtime.esm.js"
        }
    },
    module: {
        rules: [
            {
                enforce: "pre",
                test: /\.ts$/,
                loader: "tslint-loader",
                exclude: /(node_modules)/,
                options: {
                    configFile: "tslint.json"
                }
            },
            {
                test: /\.ts$/,
                exclude: /node_modules|vue\/src/,
                loader: "ts-loader",
                options: {
                    appendTsSuffixTo: [/\.vue$/],
                }
            },
			{
				test: /\.scss$/,
				use: [
					"vue-style-loader",
					"css-loader",
					"sass-loader"
				],
			},
			{
				test: /\.sass$/,
				use: [
					"vue-style-loader",
					"css-loader",
					"sass-loader?indentedSyntax"
				],
			},
            {
                test: /\.vue$/,
                loader: "vue-loader",
                options: {
                    loaders: {
                        ts: [
                            "babel-loader",
                            "ts-loader",
                            "tslint-loader"
                        ],
                        scss: [
                            "vue-style-loader",
                            "css-loader",
                            "sass-loader"
                        ],
                        sass: [
                            "vue-style-loader",
                            "css-loader",
                            "sass-loader?indentedSyntax"
                        ]
                    }
                }
            }
        ]
    }
};
