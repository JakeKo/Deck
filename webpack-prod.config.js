const Path = require("path");
const VueLoaderPlugin = require("vue-loader/lib/plugin");

module.exports = {
    mode: "production",
    plugins: [new VueLoaderPlugin()],
    devtool: "sourcemap",
    output: {
        path: Path.resolve(__dirname, "dist")
    },
    resolve: {
        extensions: [".ts", ".js", ".json", ".vue"],
        alias: {
            vue: "vue/dist/vue.runtime.min.js"
        }
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                include: [Path.resolve(__dirname, "src")],
                use: [
                    {
                        loader: "ts-loader",
                        options: {
                            appendTsSuffixTo: [/\.vue$/],
                        }
                    },
                    "tslint-loader"
                ]
            },
            {
                test: /\.scss$/,
                use: [
                    "vue-style-loader",
                    "css-loader",
                    "sass-loader"
                ]
            },
            {
                test: /\.vue$/,
                loader: "vue-loader",
                options: {
                    loaders: {
                        ts: [
                            {
                                loader: "ts-loader",
                                options: {
                                    appendTsSuffixTo: [/\.vue$/],
                                }
                            },
                            "tslint-loader"
                        ],
                        scss: [
                            "vue-style-loader",
                            "css-loader",
                            "sass-loader"
                        ]
                    }
                }
            }
        ]
    }
};
