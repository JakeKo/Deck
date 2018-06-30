const path = require("path");
const webpack = require("webpack");

module.exports = {
	entry: { },
	output: {
		path: path.resolve(__dirname, "./dist"),
		publicPath: "/dist/",
		filename: "[name].bundle.js"
	},
	module: {
		rules: [
			{
				test: /\.styl$/,
				use: [
					"stylus-loader"
				],
			},
			{
				test: /\.ts$/,
				use: [
					"ts-loader"
				]
			},
			{
				test: /\.html$/,
				use: [
					"html-loader"
				]
			}
		]
	}
};
