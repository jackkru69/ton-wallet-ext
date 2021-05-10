import { Getters, Mutations, Actions, Module, createMapper } from "vuex-smart-module";
import { KeyPair, TonClient, signerNone } from "@tonclient/core";
import TonContract from "@/ton/ton.contract";
import SafeMultisig from "@/contracts/SafeMultisigWallet";
import SetCodeMultisig from "@/contracts/SetCodeMultisigWallet";
import SetCodeMultisig2 from "@/contracts/SetCodeMultisigWallet2";
import { getBalance } from "@/ton/ton.utils";
import { findAccByAddressAndReturnIndex, findTokenBySymbolAndReturnIndex } from "../../utils/index";
import Vue from "vue";
import { Store } from "vuex";
import Transfer from "@/contracts/Transfer";

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

export const contracts: any = {
  // original: null,
  "safe-multisig": SafeMultisig,
  "set-code-multisig": SetCodeMultisig,
  "set-code-multisig2": SetCodeMultisig2,
};
export type WalletType = "safe-multisig" | "set-code-multisig" | "set-code-multisig2";

export type TokenType = {
  name: string;
  symbol: string;
  balance: string;
  decimals: number;
};
export interface AccountInterface {
  address: string;
  walletType: WalletType;
  name: string;
  custodians: string[];
  publicKey: string;
  tokens: TokenType[];
  networks: string[];
  isExist: boolean;
  isRestoredWithKeyPair: boolean;
}
class AccountsState {
  accounts: AccountInterface[] = [];
}

class AccountsGetters extends Getters<AccountsState> {
  public get getAccountByAddress(): (address: string | undefined) => AccountInterface | undefined {
    return (address: string | undefined) => this.state.accounts.find((acc) => acc.address === address);
  }

  public get getTokenBySymbol(): (id: string | undefined, symbol: string) => TokenType | undefined {
    return (address, symbol) => {
      const accountIndex = findAccByAddressAndReturnIndex(this.state.accounts, address);
      const tokenIndex = findTokenBySymbolAndReturnIndex(this.state.accounts[accountIndex].tokens, symbol);
      return this.state.accounts[accountIndex].tokens[tokenIndex];
    };
  }

  public get accounts(): AccountInterface[] {
    return this.state.accounts;
  }

  public get accountsCount(): number {
    return this.state.accounts.length;
  }

  public get accountNameByAddress(): (address: any) => string {
    return (address: any) => {
      const accountIndex = findAccByAddressAndReturnIndex(this.state.accounts, address);
      return this.state.accounts[accountIndex].name;
    };
  }
}

class AccountsMutations extends Mutations<AccountsState> {
  addAccountMut(payload: AccountInterface) {
    this.state.accounts.push(payload);
  }

  updateBalanceByAddressMut({
    address,
    symbol,
    newBalance,
  }: {
    address: string | undefined;
    symbol: string;
    newBalance: string;
  }) {
    const accountIndex = findAccByAddressAndReturnIndex(this.state.accounts, address);
    const tokenIndex = findTokenBySymbolAndReturnIndex(this.state.accounts[accountIndex].tokens, symbol);
    this.state.accounts[accountIndex].tokens[tokenIndex].balance = newBalance;
  }

  addNetworkToAccount({ address, networkServer }: { address: string | undefined; networkServer: string }) {
    const accountIndex = findAccByAddressAndReturnIndex(this.state.accounts, address);
    if (!this.state.accounts[accountIndex].networks.includes(networkServer)) {
      this.state.accounts[accountIndex].networks.push(networkServer);
    }
  }

  deleteAccount(address: string | undefined) {
    const accountIndex = findAccByAddressAndReturnIndex(this.state.accounts, address);
    Vue.delete(this.state.accounts, accountIndex);
  }

  deleteAllAccounts() {
    this.state.accounts = [];
  }

  setIsExist({ address, exist }: { address: string | undefined; exist: boolean }) {
    const accountIndex = findAccByAddressAndReturnIndex(this.state.accounts, address);
    this.state.accounts[accountIndex].isExist = exist;
  }

  changeAccountName({ address, newName }: { address: any; newName: string }) {
    const accountIndex = findAccByAddressAndReturnIndex(this.state.accounts, address);
    this.state.accounts[accountIndex].name = newName;
  }
}

class AccountsActions extends Actions<AccountsState, AccountsGetters, AccountsMutations, AccountsActions> {
  store!: Store<any>;

  $init(store: Store<any>): void {
    this.store = store;
  }
  public async addAccount({
    custodians,
    keypair,
    walletType,
    name,
    networkServer,
    client,
    isDeployed,
    seedPhrase,
    password,
    isRestoredWithKeyPair,
  }: {
    custodians: string[];
    keypair: KeyPair;
    walletType: WalletType;
    name: string;
    networkServer: string;
    client: TonClient;
    seedPhrase?: string;
    isDeployed?: boolean;
    password: string;
    isRestoredWithKeyPair: boolean;
  }) {
    const contract = new TonContract({
      client: client,
      tonPackage: contracts[walletType],
      name: walletType,
      keys: keypair,
    });
    const address: any = await contract.calcAddress();
    this.store.dispatch("keystore/saveKey", {
      keyID: address,
      password,
      publicData: keypair.public,
      privateData: { secret: keypair.secret, seedPhrase },
    });
    this.store.commit("setIsLocked", false);
    const account: AccountInterface = {
      address: address,
      walletType: walletType,
      name: name,
      custodians,
      publicKey: keypair.public,
      networks: isDeployed ? [networkServer] : [],
      isExist: !!isDeployed,
      isRestoredWithKeyPair,
      tokens: [
        {
          name: name,
          symbol: "TON",
          balance: "0",
          decimals: 10,
        },
      ],
    };
    this.mutations.addAccountMut(account);
    this.store.commit("wallet/setActiveAccountAddress", address);
  }

  public async updateBalanceByAddress({
    address,
    symbol,
    client,
  }: {
    address: string | undefined;
    symbol: string;
    client: TonClient;
  }) {
    const account: AccountInterface | undefined = this.getters.getAccountByAddress(address);
    if (account) {
      const newBalance = await getBalance(client, account.address);
      this.mutations.updateBalanceByAddressMut({ address, symbol, newBalance });
    }
  }

  public setBalanceByAddressAndTokenSymbol({
    address,
    symbol,
    newBalance,
  }: {
    address: string | undefined;
    symbol: string;
    newBalance: string;
  }) {
    this.mutations.updateBalanceByAddressMut({ address, symbol, newBalance: newBalance });
  }

  public async deploy({
    address,
    client,
    networkServer,
    keypair,
  }: {
    address: string | undefined;
    symbol: string;
    networkServer: string;
    keypair: KeyPair;
    client: TonClient;
  }) {
    const account: AccountInterface | undefined = this.getters.getAccountByAddress(address);
    if (account) {
      const contract = new TonContract({
        client: client,
        tonPackage: contracts[account.walletType],
        name: account.walletType,
        keys: keypair,
      });
      const custodians = account.custodians;
      await contract.deploy({
        input: {
          owners: custodians,
          reqConfirms: custodians.length,
        },
      });
      this.mutations.addNetworkToAccount({ address, networkServer });
    }
  }

  public async transferOrProposeTransfer({
    addressFrom,
    addressTo,
    amount,
    message,
    client,
    keypair,
  }: {
    addressFrom: string;
    addressTo: string;
    amount: string;
    message: string;
    client: TonClient;
    keypair: KeyPair;
  }) {
    const account: AccountInterface | undefined = this.getters.getAccountByAddress(addressFrom);

    if (account) {
      const contract = new TonContract({
        client,
        tonPackage: contracts[account.walletType],
        name: account.walletType,
        keys: keypair,
        address: account.address,
      });
      let body = "";
      if (message) {
        body = (
          await client.abi.encode_message_body({
            abi: { type: "Contract", value: Transfer.abi },
            call_set: {
              function_name: "transfer",
              input: {
                comment: Buffer.from(message).toString("hex"),
              },
            },
            is_internal: true,
            signer: signerNone(),
          })
        ).body;
      }
      const result = await contract.call({
        functionName: "submitTransaction",
        input: {
          dest: addressTo,
          value: amount,
          bounce: false,
          allBalance: false,
          payload: body,
        },
      });

      return result.transaction.id;
    }
  }
}

export const accounts = new Module({
  state: AccountsState,
  getters: AccountsGetters,
  mutations: AccountsMutations,
  actions: AccountsActions,
});

export const accountsModuleMapper = createMapper(accounts);
