const path = require("path");
const webpack = require("webpack");
const VueLoaderPlugin = require("vue-loader/lib/plugin");

module.exports = {
	mode: "production",
	devtool: "inline-cheap-module-source-map",
	externals: [require("webpack-node-externals")()],
	entry: {
		"index": "./src/index.ts"
	},
	plugins: [
		new VueLoaderPlugin()
	],
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
				test: /\.ts$/,
				loader: "ts-loader",
				options: {
					appendTsSuffixTo: [/\.vue$/],
				}
			},
			{
				test: /\.vue$/,
				loader: "vue-loader",
				options: {
					loaders: {
						ts: "babel-loader!ts-loader"
					}
				}
			}
		]
	}
};
