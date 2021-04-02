import { TonClient } from "@tonclient/core";
import { libWeb } from "@tonclient/lib-web";

export class TonService {
  client: TonClient;

  static instance: TonService;

  constructor() {
    if (TonService.instance) return TonService.instance;
    TonClient.useBinaryLibrary(libWeb);
    this.client = new TonClient({
      network: {
        server_address: "http://net.ton.dev",
      },
    });

    TonService.instance = this;
  }

  async getBalance(address: string) {
    if (!address) throw new Error("address not specified");
    const { result } = await this.client.net.query_collection({
      collection: "accounts",
      filter: { id: { eq: address } },
      result: "id balance",
    });
    if (!result[0]) {
      return "";
    }
    return parseInt(result[0].balance, 16);
  }
}
