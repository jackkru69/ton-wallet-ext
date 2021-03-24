module.exports = {
  transpileDependencies: ["vuetify"],
  pages: {
    popup: {
      template: "public/browser-extension.html",
      entry: "./src/popup/main.ts",
      title: "Popup",
    },
    standalone: {
      template: "public/browser-extension.html",
      entry: "./src/standalone/main.ts",
      title: "Standalone",
      filename: "index.html",
    },
  },
  pluginOptions: {
    browserExtension: {
      componentOptions: {
        background: {
          entry: "src/background.ts",
        },
      },
    },
  },
};
