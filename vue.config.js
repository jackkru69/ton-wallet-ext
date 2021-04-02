// eslint-disable-next-line @typescript-eslint/no-var-requires
const CopyPlugin = require("copy-webpack-plugin");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");

module.exports = {
  transpileDependencies: ["vuetify"],
  configureWebpack: {
    plugins: [
      new CopyPlugin([
        {
          from: path.join(__dirname, "./node_modules/@tonclient/lib-web/tonclient.wasm"),
          to: path.join(__dirname, "public"),
          toType: "dir",
        },
      ]),
    ],
  },
  pages: {
    popup: {
      template: "public/popup.html",
      entry: "./src/popup/main.ts",
    },
    standalone: {
      template: "public/index.html",
      entry: "./src/standalone/main.ts",
      filename: "index.html",
    },
  },
  pluginOptions: {
    browserExtension: {
      componentOptions: {
        background: {
          entry: "src/background.ts",
        },
        contentScripts: {
          entries: {
            "content-script": ["src/content-script.ts"],
          },
        },
      },
    },
  },
};
