const NodeExternals = require('webpack-node-externals');

module.exports = {
    ...require('./webpack.config'),
    devtool: 'inline-source-map',
    externals: [NodeExternals()],
    target: 'node',
    output: {
        devtoolModuleFilenameTemplate: '[absolute-resource-path]',
        devtoolFallbackModuleFilenameTemplate: '[absolute-resource-path]?[hash]'
    }
}
