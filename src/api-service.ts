import axios, { AxiosRequestConfig } from "axios";
import { getQueryFromOptions, getStringifyJsonFromOptionsLoopBack } from "./utils/index";

export let accessToken = "";

axios.interceptors.request.use((config: any) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

export type PatchProviderRequest = {
  id: string;
  name?: string;
  minDeposit?: string;
  minWithdraw?: string;
  maxWithdraw?: string;
};

export type CommissionRequest = {
  id?: string;
  format?: string;
  value?: string;
  notLowerThen?: string;
};

export type CommissionHistoryRequest = {
  offset?: number;
  limit?: number;
  skip?: number;
  order?: string;
  where?: object;
  // fields?: {
  //   id?: boolean;
  //   comissionId?: boolean;
  //   amount?: boolean;
  //   transferId?: boolean;
  //   withdrawId?: boolean;
  // };
};

export type BalancesRequest = {
  offset?: number;
  limit?: number;
  skip?: number;
  order?: string;
  where?: object;
  fields?: {
    id?: true;
    externalId?: true;
    ton?: true;
    eth?: true;
  };
  include?: [
    {
      relation?: string;
      // scope?: {
      //   offset?: 0;
      //   limit?: 100;
      //   skip?: 0;
      //   order?: string;
      //   where?: {
      //     additionalProp1?: {};
      //   };
      //   fields?: {};
      //   include?: [
      //     {
      //       additionalProp1: {};
      //     }
      //   ];
      // };
    }
  ];
};

export type DepositsRequest = {
  offset?: number;
  limit?: number;
  skip?: number;
  order?: string;
  where?: object;
  // fields: {
  //   id: true;
  //   timestamp: true;
  //   amount: true;
  //   transitTx: true;
  //   bankTx: true;
  //   identityId: true;
  //   providerId: true;
  // };
  // include: [
  //   {
  //     relation: "string";
  //     scope: {
  //       offset: 0;
  //       limit: 100;
  //       skip: 0;
  //       order: "string";
  //       where: {
  //         additionalProp1: {};
  //       };
  //       fields: {};
  //       include: [
  //         {
  //           additionalProp1: {};
  //         }
  //       ];
  //     };
  //   },
  //   "string"
  // ];
};

export type WithdrawsRequest = {
  offset?: number;
  limit?: number;
  skip?: number;
  order?: string;
  where?: object;
  // fields: {
  //   id: true;
  //   amount: true;
  //   address: true;
  //   timestamp: true;
  //   transactionId: true;
  //   status: true;
  //   providerId: true;
  //   identityId: true;
  // };
  include?: object[];
};

export type TransfersRequest = {
  offset?: number;
  limit?: number;
  skip?: number;
  order?: string;
  where?: object;
  include?: object[];
  // fields: {
  //   id: true;
  //   amount: true;
  //   providerId: true;
  //   senderIdentityId: true;
  //   recipientIdentityId: true;
  // };
};

export type CreateWithdrawRequest = {
  amount?: string;
  address?: string;
  operationInitiator?: string;
  providerId?: string;
  identityId?: string;
};

export type CreateTransferRequest = {
  amount?: string;
  operationInitiator?: string;
  providerId?: string;
  senderIdentityId?: string;
  recipientIdentityId?: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

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

  public setHeaders(headers: any) {
    this.headers = headers;
    this.headers = { ...this.headers, ...headers };
  }
  public addHeaders(headers: any) {
    this.headers = { ...this.headers, ...headers };
  }

  public setToken(token: string) {
    accessToken = token;
  }

  public setRoot(API_ROOT: string) {
    this.API_ROOT = API_ROOT;
  }

  //PROVIDERS
  public async fetchProviders() {
    const response = await this.call({
      method: "GET",
      url: `${this.API_ROOT}/providers`,
    });
    return response;
  }

  public async fetchProviderById(id: string) {
    const response = await this.call({
      method: "GET",
      url: `${this.API_ROOT}/providers/${id}`,
    });
    return response;
  }

  public async patchProviderById(id: string, opts: Omit<PatchProviderRequest, "id">) {
    const response = await this.call({
      method: "PATCH",
      url: `${this.API_ROOT}/providers/${id}`,
      data: { ...opts },
    });
    return response;
  }

  //COMMISSIONS
  public async fetchCommissionHistory(opts: CommissionHistoryRequest) {
    const response = await this.call({
      method: "GET",
      url: `${this.API_ROOT}/comission-histories${getStringifyJsonFromOptionsLoopBack(opts)}`,
    });
    return response;
  }

  public async fetchCommissionHistoryCount(opts: Pick<CommissionHistoryRequest, "where">) {
    const response = await this.call({
      method: "GET",
      url: `${this.API_ROOT}/comission-histories/count${getStringifyJsonFromOptionsLoopBack(opts, "where=")}`,
    });
    return response;
  }

  public async fetchCommissionHistoryTotal(opts: Pick<CommissionHistoryRequest, "where">) {
    const response = await this.call({
      method: "GET",
      url: `${this.API_ROOT}/comission-histories/total${getStringifyJsonFromOptionsLoopBack(opts)}`,
    });
    return response;
  }

  public async fetchCommissionHistoryById(id: string, opts: CommissionHistoryRequest) {
    const response = await this.call({
      method: "GET",
      url: `${this.API_ROOT}/comission-histories/${id}${getQueryFromOptions(opts)}`,
    });
    return response;
  }

  public async fetchCommissions() {
    const response = await this.call({
      method: "GET",
      url: `${this.API_ROOT}/comissions`,
    });
    return response;
  }

  public async patchCommissionById(id?: string, opts?: CommissionRequest) {
    const response = await this.call({
      method: "PATCH",
      url: `${this.API_ROOT}/comissions/${id}`,
      data: { ...opts },
    });
    return response;
  }

  //BALANCES
  public async fetchBalances(opts: BalancesRequest) {
    const response = await this.call({
      method: "GET",
      url: `${this.API_ROOT}/identities${getStringifyJsonFromOptionsLoopBack(opts)}`,
    });
    return response;
  }

  public async fetchBalanceByID(id?: string, opts?: BalancesRequest) {
    const response = await this.call({
      method: "GET",
      url: `${this.API_ROOT}/identities/${id}${getStringifyJsonFromOptionsLoopBack(opts)}`,
    });
    return response;
  }

  public async fetchBalancesCount(opts: Pick<BalancesRequest, "where">) {
    const response = await this.call({
      method: "GET",
      url: `${this.API_ROOT}/identities/count${getStringifyJsonFromOptionsLoopBack(opts, "where=")}`,
    });
    return response;
  }

  public async fetchBalancesTotal(opts: BalancesRequest) {
    const response = await this.call({
      method: "GET",
      url: `${this.API_ROOT}/balances/total${getStringifyJsonFromOptionsLoopBack(opts)}`,
    });
    return response;
  }

  //DEPOSITS
  public async fetchDeposits(opts: DepositsRequest) {
    const response = await this.call({
      method: "GET",
      url: `${this.API_ROOT}/deposits${getStringifyJsonFromOptionsLoopBack(opts)}`,
    });
    return response;
  }

  public async fetchDepositsTotal(opts: Pick<DepositsRequest, "where">) {
    const response = await this.call({
      method: "GET",
      url: `${this.API_ROOT}/deposits/count${getStringifyJsonFromOptionsLoopBack(opts, "where=")}`,
    });
    return response;
  }

  //TRANSFERS
  public async fetchTransfers(opts: TransfersRequest) {
    const response = await this.call({
      method: "GET",
      url: `${this.API_ROOT}/transfers${getStringifyJsonFromOptionsLoopBack(opts)}`,
    });
    return response;
  }

  public async fetchTransfersTotal(opts: any) {
    const response = await this.call({
      method: "GET",
      url: `${this.API_ROOT}/transfers/count${getStringifyJsonFromOptionsLoopBack(opts, "where=")}`,
    });
    return response;
  }

  public async createTransfer(opts: CreateTransferRequest) {
    const response = await this.call({
      method: "POST",
      url: `${this.API_ROOT}/transfers`,
      data: { ...opts },
    });
    return response;
  }

  //WITHDRAWS
  public async fetchWithdraws(opts: WithdrawsRequest) {
    const response = await this.call({
      method: "GET",
      url: `${this.API_ROOT}/withdraws${getStringifyJsonFromOptionsLoopBack(opts)}`,
    });
    return response;
  }

  public async fetchWithdrawsTotal(opts: Pick<WithdrawsRequest, "where">) {
    const response = await this.call({
      method: "GET",
      url: `${this.API_ROOT}/withdraws/count${getStringifyJsonFromOptionsLoopBack(opts, "where=")}`,
    });
    return response;
  }

  public async createWithdraw(opts: CreateWithdrawRequest) {
    const response = await this.call({
      method: "POST",
      url: `${this.API_ROOT}/withdraws`,
      data: { ...opts },
    });
    return response;
  }

  public async login(opts: LoginRequest) {
    const response = await this.call({
      method: "POST",
      url: `${this.API_ROOT}/users/login`,
      data: { ...opts },
    });
    return response;
  }

  private async call(requestConfig: AxiosRequestConfig): Promise<any> {
    return await axios({ ...requestConfig, headers: this.headers });
  }
}
