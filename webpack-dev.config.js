const path = require("path");
const webpack = require("webpack");
const VueLoaderPlugin = require("vue-loader/lib/plugin");

module.exports = {
	mode: "development",
	externals: [require("webpack-node-externals")()],
	devtool: "inline-cheap-module-source-map",
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
	}
};
