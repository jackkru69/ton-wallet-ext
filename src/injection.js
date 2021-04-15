// import PostMessageStream from "post-message-stream";

// const stream = new PostMessageStream({ name: "injection", target: "content-script" });
// const responses = [];
// const timeout = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
// const waitResponse = async (requestId) => {
//   for (let i = responses.length - 1; i >= 0; i--) {
//     if (responses[i].requestId === requestId) {
//       const response = responses[i];
//       responses.splice(i, 1);
//       if (0 !== response.code) {
//         throw { code: response.code, text: response.error };
//       } else {
//         return response.data;
//       }
//     }
//   }
//   await timeout(500);
//   return await waitResponse(requestId);
// };
// const request = async (method, params) => {
//   const requestId = Math.random()
//     .toString(36)
//     .substring(7);
//   const data = { requestId, method, data: params };
//   stream.write(data);
//   return waitResponse(requestId);
// };
// stream.on("data", (data) => responses.push(data));

// window.freeton = {
//   request: (method, params) => request(method, params),
// };
