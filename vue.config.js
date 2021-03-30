module.exports = {
  transpileDependencies: ["vuetify"],
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
