const path = require("path");
const webpack = require("webpack");
const VueLoaderPlugin = require("vue-loader/lib/plugin");

module.exports = {
	entry: {
		"index": "./src/index.ts"
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
				test: /\.ts$/,
				use: [
					{
						loader: "ts-loader",
						options: {
							appendTsSuffixTo: [/\.vue$/],
						}
					}
				]
			},
			{
				test: /\.vue$/,
				use: [
					"vue-loader"
				]
			}
		]
	},
	plugins: [
		new VueLoaderPlugin()
	]
};
