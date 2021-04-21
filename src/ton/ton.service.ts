import { TonClient } from "@tonclient/core";
import { libWeb } from "@tonclient/lib-web";

export class TonService {
  client: TonClient;
  network: string;

  static instance: TonService;

  constructor(network = "http://0.0.0.0") {
    if (TonService.instance) return TonService.instance;
    TonClient.useBinaryLibrary(libWeb);
    this.network = network;
    this.client = new TonClient({
      network: {
        server_address: network,
      },
    });

    TonService.instance = this;
  }

  public setNetwork(network: string): void {
    this.network = network;
    this.client = new TonClient({
      network: {
        server_address: network,
      },
    });
  }
}
