// import PostMessageStream from "post-message-stream";

// const s = document.createElement("script");
// // @ts-ignore
// s.src = browser.runtime.getURL("js/injection.js");
// s.onload = function() {
//   // @ts-ignore
//   this.remove();
// };
// (document.head || document.documentElement).appendChild(s);
// const injectionStream = new PostMessageStream({ name: "content-script", target: "injection" });

// injectionStream.on("data", (data) => {
//   // @ts-ignore
//   browser.runtime.sendMessage(data).then(function(response) {
//     injectionStream.write({ type: "response", data: response });
//   });
// });
// // @ts-ignore
// browser.runtime.onMessage.addListener(function(message, sender) {
//   // @ts-ignore
//   if (browser.runtime.id === sender.id) {
//     injectionStream.write({ type: "event", data: message });
//   }
// });
