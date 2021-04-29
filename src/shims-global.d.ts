export {};
declare global {
  interface Window {
    ton: {
      request: (method: any, params: any) => any;
    };
  }
}
