const path = require("path");
const webpack = require("webpack");

module.exports = {
	entry: {
		"index": "./src/index.ts"
	},
	output: {
		path: path.resolve(__dirname, "dist"),
		publicPath: "/dist/",
		filename: "[name].bundle.js"
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: [
					"ts-loader"
				]
			}
		]
	}
};
