import axios, { AxiosRequestConfig } from "axios";

// export let accessToken = "";

// axios.interceptors.request.use((config: any) => {
//   if (accessToken) {
//     config.headers.Authorization = `Bearer ${accessToken}`;
//   }
//   return config;
// });
export default class ApiService {
  public static getInstance() {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private static instance: ApiService;
  private headers = {
    "content-type": "application/json",
  };

  private API_ROOT = "http://[::1]:3003";

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  // public setHeaders(headers: any) {
  //   this.headers = headers;
  //   this.headers = { ...this.headers, ...headers };
  // }
  // public addHeaders(headers: any) {
  //   this.headers = { ...this.headers, ...headers };
  // }

  // public setToken(token: string) {
  //   accessToken = token;
  // }

  public setRoot(API_ROOT: string) {
    this.API_ROOT = API_ROOT;
  }

  private async call(requestConfig: AxiosRequestConfig): Promise<any> {
    return await axios({ ...requestConfig, headers: this.headers });
  }
}
