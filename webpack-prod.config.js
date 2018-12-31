const Path = require("path");

module.exports = require("./webpack.config");
module.exports.mode = "production";
module.exports.devtool = false;
module.exports.output = { path: Path.resolve(__dirname, "dist") };
