import { Getters, Mutations, Actions, Module, createMapper, Context } from "vuex-smart-module";
import { KeyPair, TonClient } from "@tonclient/core";
import TonContract from "@/ton/ton.contract";
import SafeMultisig from "@/contracts/SafeMultisigWallet";
import SetCodeMultisig from "@/contracts/SetCodeMultisigWallet";
import SetCodeMultisig2 from "@/contracts/SetCodeMultisigWallet2";
import { getBalance } from "@/ton/ton.utils";
import { findByIdAndReturnIndex } from "../../utils/index";

export type WalletType = "safe-multisig" | "set-code-multisig" | "set-code-multisig2";

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

export const contracts = {
  // original: null,
  "safe-multisig": SafeMultisig,
  "set-code-multisig": SetCodeMultisig,
  "set-code-multisig2": SetCodeMultisig2,
};
export type TokenType = {
  id: number;
  walletType: string;
  networkId: null | number;
  name: string;
  symbol: string;
  address: string;
  balance: string;
  decimals: number;
  numberOfCustodians: number;
  isRestored: boolean;
  isDeployed: boolean;
  custodians: { public: string; secret: string }[];
  networks: Array<number | null>;
};
export interface AccountInterface {
  address: string;
  walletType: WalletType;
  id: number;
  name: string;
  keypair: KeyPair;
  tokens: TokenType[];
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

  public get accountsCount(): number {
    return this.state.accounts.length;
  }
}

class AccountsMutations extends Mutations<AccountsState> {
  addAccount(payload: AccountInterface) {
    this.state.accounts.push(payload);
  }

  updateBalanceById(payload: { id: number; tokenId: number; newBalance: string }) {
    const accountIndex = findByIdAndReturnIndex(this.state.accounts, payload.id);
    this.state.accounts[accountIndex].tokens[payload.tokenId].balance = payload.newBalance;
  }

  updateDeployStatus({ id, tokenId }: { id: number; tokenId: number }) {
    this.state.accounts[id].tokens[tokenId].isDeployed = true;
  }
}

class AccountsActions extends Actions<AccountsState, AccountsGetters, AccountsMutations, AccountsActions> {
  public async addAccount(payload: {
    keypair: KeyPair;
    walletType: WalletType;
    name: string;
    activeNetworkID: number | null;
    numberOfCustodians: number;
    client: TonClient;
    isRestore: boolean;
  }) {
    const { client, walletType, keypair, name, activeNetworkID, numberOfCustodians, isRestore } = payload;
    const contract = new TonContract({
      client: client,
      tonPackage: contracts[walletType],
      name: walletType,
      keys: keypair,
    });
    const address: any = await contract.calcAddress();

    const account: AccountInterface = {
      address: address,
      walletType: walletType,
      id: this.state.accounts.length,
      name: name,
      keypair,
      tokens: [
        {
          id: 0,
          walletType: walletType,
          networkId: activeNetworkID,
          name: name,
          symbol: "TON",
          address: address,
          balance: "0",
          decimals: 10,
          numberOfCustodians: numberOfCustodians,
          custodians: [keypair],
          isRestored: isRestore,
          isDeployed: false,
          networks: [activeNetworkID],
        },
      ],
    };
    this.mutations.addAccount(account);
  }

  public async updateBalanceById(payload: { id: number; tokenId: number; client: TonClient }) {
    const account: AccountInterface = this.getters.getAccountById(payload.id);

    const newBalance = await getBalance(payload.client, account.address);
    this.mutations.updateBalanceById({ id: payload.id, tokenId: payload.tokenId, newBalance });
  }

  public async deploy(payload: { id: any; tokenId: number; client: TonClient }) {
    const { id, client, tokenId } = payload;
    const account: AccountInterface = this.getters.getAccountById(id);
    const contract = new TonContract({
      client: client,
      tonPackage: contracts[account.walletType],
      name: account.walletType,
      keys: account.keypair,
    });
    const tokenIndex = findByIdAndReturnIndex(account.tokens, tokenId);
    const custodians = account.tokens[tokenIndex].custodians;
    await contract.deploy({
      input: {
        owners: custodians.map((custodian) => `0x${custodian.public}`),
        reqConfirms: custodians.length,
      },
    });
    this.mutations.updateDeployStatus({ id, tokenId });
  }

  public async transfer(payload: { id: any; address: string; amount: string; message: string; client: TonClient }) {
    const account: AccountInterface = this.getters.getAccountById(payload.id);
    const contract = new TonContract({
      client: payload.client,
      tonPackage: contracts[account.walletType],
      name: account.walletType,
      keys: account.keypair,
      address: account.address,
    });
    await contract.call({
      functionName: "sendTransaction",
      input: {
        dest: payload.address,
        value: payload.amount,
        bounce: false,
        flags: 1,
        payload: payload.message,
      },
    });
  }
}

export const accounts = new Module({
  state: AccountsState,
  getters: AccountsGetters,
  mutations: AccountsMutations,
  actions: AccountsActions,
});

export const accountsModuleMapper = createMapper(accounts);
