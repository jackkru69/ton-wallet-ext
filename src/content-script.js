// /* eslint-disable no-undef */
// import PostMessageStream from "post-message-stream";

// const s = document.createElement("script");
// s.src = chrome.runtime.getURL("js/injection.js");
// s.onload = function() {
//   this.remove();
// };
// (document.head || document.documentElement).appendChild(s);

// const injectionStream = new PostMessageStream({ name: "content-script", target: "injection" });
// injectionStream.on("data", (data) => {
//   chrome.runtime.sendMessage(data, function(response) {
//     injectionStream.write(response);
//   });
// });
