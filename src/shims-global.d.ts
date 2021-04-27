export {};
declare global {
  interface Window {
    freeton1: {
      request: (method: any, params: any) => any;
      eventListener: any;
    };
  }
}
