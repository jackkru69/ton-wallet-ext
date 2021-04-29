import { Getters, Mutations, Actions, Module, createMapper } from "vuex-smart-module";
import { Store } from "vuex";

export type Network = "http://0.0.0.0" | "http://net.ton.dev" | "http://main.ton.dev";
const timeout = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
class WalletState {
  isStoreRestored = false;
  activeNetworkID = 0;
  activeAccountAddress: string | undefined = undefined;
  subscriptionBalanceHandle: number | null = null;
  subscriptionTxsHandle: number | null = null;
}

class WalletGetters extends Getters<WalletState> {
  public get isStoreRestored(): boolean {
    return this.state.isStoreRestored;
  }

  public get activeNetworkID() {
    return this.state.activeNetworkID;
  }

  public get activeAccountAddress() {
    return this.state.activeAccountAddress;
  }

  public get subscriptionBalanceHandle(): number | null {
    return this.state.subscriptionBalanceHandle;
  }

  public get subscriptionTxsHandle(): number | null {
    return this.state.subscriptionTxsHandle;
  }
}

class WalletMutations extends Mutations<WalletState> {
  setIsStoreRestored(payload: boolean) {
    this.state.isStoreRestored = payload;
  }

  setNetwork(payload: number) {
    this.state.activeNetworkID = payload;
  }

  setActiveAccountAddress(address: string | undefined) {
    this.state.activeAccountAddress = address;
  }

  setSubscriptionBalanceHandle(payload: number | null) {
    this.state.subscriptionBalanceHandle = payload;
  }
}

class WalletActions extends Actions<WalletState, WalletGetters, WalletMutations, WalletActions> {
  store!: Store<any>;

  $init(store: Store<any>): void {
    this.store = store;
  }
  async isLoggedIn() {
    const accountsCount = await this.store.getters["accounts/accountsCount"];
    return accountsCount > 0;
  }

  async waitLoggedIn(): Promise<any> {
    if (await this.isLoggedIn()) {
      return;
    }
    await timeout(500);
    return await this.waitLoggedIn();
  }
}

export const wallet = new Module({
  state: WalletState,
  getters: WalletGetters,
  mutations: WalletMutations,
  actions: WalletActions,
});

export const walletModuleMapper = createMapper(wallet);
