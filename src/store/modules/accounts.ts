import { Getters, Mutations, Actions, Module, createMapper } from "vuex-smart-module";
import { KeyPair } from "@tonclient/core";
import TonContract from "@/ton/ton.contract";
import SafeMultisig from "@/contracts/SafeMultisigWallet";
import SetCodeMultisig from "@/contracts/SetCodeMultisigWallet";
import SetCodeMultisig2 from "@/contracts/SetCodeMultisigWallet2";
import { Network } from "@/store/root";
import { TonService } from "@/ton/ton.service";

export type WalletType = "safe-multisig" | "set-code-multisig" | "set-code-multisig2";

export const networks = [
  { title: "local network", value: "http://0.0.0.0" },
  { title: "TON mainnet network", value: "http://main.ton.dev" },
  { title: "TON testnet network", value: "http://net.ton.dev" },
];

export const walletsTypes = [
  // {
  //   text: "Original TON wallet",
  //   value: "original",
  // },
  {
    text: "Safe Multisig TON wallet",
    value: "safe-multisig",
  },
  {
    text: "Set Code Multisig TON wallet",
    value: "set-code-multisig",
  },
  {
    text: "Set Code Multisig 2 TON wallet",
    value: "set-code-multisig2",
  },
];

const contracts = {
  // original: null,
  "safe-multisig": SafeMultisig,
  "set-code-multisig": SetCodeMultisig,
  "set-code-multisig2": SetCodeMultisig2,
};

export interface AccountInterface {
  address: string;
  walletType: WalletType;
  id: number;
  isRestored: boolean;
  isDeployed: boolean;
  keys: { public: string; secret: string };
  name: string;
  networks: { id: string; server: string; explorer: string; isDev: boolean }[];
  tokens: {
    id: number;
    walletType: string;
    networkId: string;
    name: string;
    symbol: string;
    address: string;
    balance: string;
    decimals: number;
    numberOfCustodians: number;
  }[];
}
class AccountsState {
  accounts: AccountInterface[] = [];
}

class AccountsGetters extends Getters<AccountsState> {
  public get getAccountById(): any {
    return (id: number) => this.state.accounts.find((acc) => acc.id === id);
  }

  public get accounts(): AccountInterface[] {
    return this.state.accounts;
  }
}

class AccountsMutations extends Mutations<AccountsState> {
  addAccount(payload: AccountInterface) {
    this.state.accounts.push(payload);
  }
}

class AccountsActions extends Actions<AccountsState, AccountsGetters, AccountsMutations, AccountsActions> {
  public async createNewAccount(payload: {
    keypair: KeyPair;
    walletType: WalletType;
    network: Network;
    name: string;
    numberOfCustodians: number;
  }) {
    const tonService = new TonService(payload.network);

    const contract = new TonContract({
      client: tonService.client,
      tonPackage: contracts[payload.walletType],
      name: payload.walletType,
      keys: payload.keypair,
    });
    const address: any = await contract.calcAddress();

    const account = {
      address: address,
      walletType: payload.walletType,
      id: this.state.accounts.length,
      isRestored: false,
      isDeployed: false,
      keys: payload.keypair,
      name: payload.name,
      networks: [{ id: payload.network, server: payload.network, explorer: payload.network, isDev: true }],
      tokens: [
        {
          id: 1,
          walletType: payload.walletType,
          networkId: payload.network,
          name: payload.name,
          symbol: "TON",
          address: address,
          balance: "0",
          decimals: 10,
          numberOfCustodians: payload.numberOfCustodians,
        },
      ],
    };
    this.mutations.addAccount(account);
  }
}

export const accounts = new Module({
  state: AccountsState,
  getters: AccountsGetters,
  mutations: AccountsMutations,
  actions: AccountsActions,
});

export const accountsModuleMapper = createMapper(accounts);
