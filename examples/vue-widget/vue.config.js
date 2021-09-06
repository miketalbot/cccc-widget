const { configure } = require("@testing-library/dom")
const path = require("path")

module.exports = {
    chainWebpack: config => {
        config.module
            .rule("images")
            .use("url-loader")
            .tap(options => {
                return { ...options, limit: 1000000, fallback: undefined }
            })
        config.devServer.set("headers", {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Methods": "*"
        })
    }
}
