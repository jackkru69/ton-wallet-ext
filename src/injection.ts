// import PostMessageStream from "post-message-stream";

// const stream = new PostMessageStream({ name: "injection", target: "content-script" });
// const responses: any = [];

// const timeout = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// const waitResponse = async (requestId: any): Promise<any> => {
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

// const request = async (method: any, params: any) => {
//   const requestId = Math.random()
//     .toString(36)
//     .substring(7);
//   const data = { requestId, method, data: params };
//   stream.write(data);
//   return waitResponse(requestId);
// };

// window.ton = {
//   request: (method: any, params: any) => request(method, params),
// };

// stream.on("data", (data: any) => {
//   if (data.type === "response") {
//     responses.push(data.data);
//   }
// });
