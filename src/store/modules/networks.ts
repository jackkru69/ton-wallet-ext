import { Getters, Mutations, Actions, Module, createMapper } from "vuex-smart-module";

const defaultNetworks = [
  { id: 0, name: "TON local network", server: "http://0.0.0.0", explorer: "", isDev: true },
  { id: 1, name: "TON testnet network", server: "http://net.ton.dev", explorer: "https://net.ton.live/", isDev: true },
  { id: 2, name: "TON mainnet network", server: "http://main.ton.dev", explorer: "https://ton.live", isDev: false },
];

export interface NetworkInterface {
  id: number;
  name: string;
  server: string;
  explorer: string;
  isDev: boolean;
}

class NetworksState {
  networks: NetworkInterface[] = defaultNetworks;
}

class NetworksGetters extends Getters<NetworksState> {
  public get getNetworkById(): any {
    return (id: number) => this.state.networks.find((net) => net.id === id);
  }

  public get networks(): NetworkInterface[] {
    return this.state.networks;
  }

  public get networksForSelect(): { title: string; value: number }[] {
    return this.state.networks.map((network) => ({ title: network.name, value: network.id }));
  }
}

class NetworksMutations extends Mutations<NetworksState> {
  addNetwork(payload: NetworkInterface) {
    this.state.networks.push(payload);
  }
}

class NetworksActions extends Actions<NetworksState, NetworksGetters, NetworksMutations, NetworksActions> {
  public addNetwork(payload: Omit<NetworkInterface, "id">) {
    this.mutations.addNetwork({
      id: this.getters.networks.length,
      ...payload,
    });
  }
}

export const networks = new Module({
  state: NetworksState,
  getters: NetworksGetters,
  mutations: NetworksMutations,
  actions: NetworksActions,
});

export const networksModuleMapper = createMapper(networks);
