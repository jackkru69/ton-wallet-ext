/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const PostMessageStream = require("post-message-stream");
import extensionizer from "extensionizer";

const s = document.createElement("script");
s.src = extensionizer.runtime.getURL("js/injection.js");
s.onload = function() {
  this.remove();
};
(document.head || document.documentElement).appendChild(s);
const injectionStream = new PostMessageStream({ name: "content-script", target: "injection" });
injectionStream.on("data", (data) => {
  //@todo disconnect
  chrome.runtime.sendMessage(data, function(response) {
    injectionStream.write({ type: "response", data: response });
  });
});

extensionizer.runtime.onMessage.addListener(function(message, sender) {
  if (extensionizer.runtime.id === sender.id) {
    injectionStream.write({ type: "event", data: message });
  }
});
