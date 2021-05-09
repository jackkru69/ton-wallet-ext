import { Getters, Mutations, Actions, Module, createMapper } from "vuex-smart-module";

export const defaultNetworks = [
  { name: "TON testnet network", server: "http://net.ton.dev", explorer: "https://net.ton.live", isDev: true },
  { name: "TON mainnet network", server: "http://main.ton.dev", explorer: "https://ton.live", isDev: false },
  { name: "TON local network", server: "http://0.0.0.0", explorer: "", isDev: true },
];

export interface NetworkInterface {
  name: string;
  server: string;
  explorer: string;
  isDev: boolean;
}

class NetworksState {
  networks: NetworkInterface[] = defaultNetworks;
}

class NetworksGetters extends Getters<NetworksState> {
  public get getNetworkByServer(): (server: string) => NetworkInterface | undefined {
    return (server: string) => this.state.networks.find((net) => net.server === server);
  }

  public get networks(): NetworkInterface[] {
    return this.state.networks;
  }

  public get networksForSelect(): { title: string; value: string }[] {
    return this.state.networks.map((network) => ({ title: network.name, value: network.server }));
  }
}

class NetworksMutations extends Mutations<NetworksState> {
  addNetwork(payload: NetworkInterface) {
    this.state.networks.push(payload);
  }
}

class NetworksActions extends Actions<NetworksState, NetworksGetters, NetworksMutations, NetworksActions> {
  public addNetwork(payload: NetworkInterface) {
    this.mutations.addNetwork(payload);
  }
}

export const networks = new Module({
  state: NetworksState,
  getters: NetworksGetters,
  mutations: NetworksMutations,
  actions: NetworksActions,
});

export const networksModuleMapper = createMapper(networks);
