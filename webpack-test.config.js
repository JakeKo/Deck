const NodeExternals = require("webpack-node-externals");

module.exports = require("./webpack.config");
module.exports.devtool = "inline-cheap-module-source-map";
module.exports.externals = [NodeExternals()];
