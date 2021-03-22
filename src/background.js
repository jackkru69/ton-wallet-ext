// @ts-ignore
browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log("Hello from the background");
});
