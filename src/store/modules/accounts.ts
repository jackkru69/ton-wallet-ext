import { Getters, Mutations, Actions, Module, createMapper } from "vuex-smart-module";
import { KeyPair, TonClient } from "@tonclient/core";
import TonContract from "@/ton/ton.contract";
import SafeMultisig from "@/contracts/SafeMultisigWallet";
import SetCodeMultisig from "@/contracts/SetCodeMultisigWallet";
import SetCodeMultisig2 from "@/contracts/SetCodeMultisigWallet2";
import { getBalance } from "@/ton/ton.utils";
import {
  baseToAssetAmount,
  findAccByAddressAndReturnIndex,
  findTokenBySymbolAndReturnIndex,
  sliceString,
} from "../../utils/index";
import Vue from "vue";
import { Store } from "vuex";

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
  name: string;
  symbol: string;
  balance: string;
  decimals: number;
  transactions: any[];
  pendingTransactions: any[];
};
export interface AccountInterface {
  address: string;
  walletType: WalletType;
  name: string;
  custodians: string[];
  tokens: TokenType[];
  networks: Array<number | null>;
  isExist: boolean;
}

export type TxType = {
  account_addr: string;
  balance_delta: string;
  id: string;
  in_message: {
    dst: string;
    id: string;
    msg_type_name: string;
    src: string;
    status_name: string;
    value: string;
  };
  out_messages: {
    dst: string;
    id: string;
    msg_type_name: string;
    src: string;
    status_name: string;
    value: string;
  }[];
  now: number;
  status_name: string;
  tr_type_name: string;
};

export type TxPendingType = {
  bounce: boolean;
  confirmationsMask: string;
  creator: string;
  dest: string;
  id: string;
  index: string;
  payload: string;
  sendFlags: string;
  signsReceived: string;
  signsRequired: string;
  value: string;
};

class AccountsState {
  accounts: AccountInterface[] = [];
}

const formatTx = (tx: TxType) => {
  // const isNegative = new BigNumber(tx.balance_delta).isNegative();
  return {
    ...tx,
    fId: sliceString(tx.id),
    // fSrc: isNegative ? sliceString(tx.account_addr) : sliceString(tx.in_message.src),
    // fDst:
    //   !isNegative && isEmpty(tx.out_messages) ? sliceString(tx.in_message.dst) : sliceString(tx.out_messages[0].dst),
    fValue: baseToAssetAmount(tx.balance_delta, "TON"),
  };
};

const formatPendingTx = (tx: TxPendingType) => {
  // const isNegative = new BigNumber(tx.balance_delta).isNegative();
  return {
    ...tx,
    fId: sliceString(tx.id),
  };
};

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

  public get getFormattedTxsByAddress(): (address: string | undefined, symbol: string) => TxType[] | undefined {
    return (address, tokenId) =>
      this.getters.getTokenBySymbol(address, tokenId)?.transactions.map((tx) => formatTx(tx));
  }

  public get getFormattedPendingTxsByAddress(): (
    address: string | undefined,
    symbol: string
  ) => TxPendingType[] | undefined {
    return (address, tokenId) =>
      this.getters.getTokenBySymbol(address, tokenId)?.pendingTransactions.map((tx) => formatPendingTx(tx));
  }

  public get accounts(): AccountInterface[] {
    return this.state.accounts;
  }

  public get accountsCount(): number {
    return this.state.accounts.length;
  }
}

class AccountsMutations extends Mutations<AccountsState> {
  addAccountMut(payload: AccountInterface) {
    this.state.accounts.push(payload);
  }

  updateBalanceById({
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

  addNetworkToAccount({ address, networkId }: { address: string | undefined; networkId: number }) {
    const accountIndex = findAccByAddressAndReturnIndex(this.state.accounts, address);
    if (!this.state.accounts[accountIndex].networks.includes(networkId)) {
      this.state.accounts[accountIndex].networks.push(networkId);
    }
  }

  setTransactions({ address, symbol, transactions }: { address: string; symbol: string; transactions: any[] }) {
    const accountIndex = findAccByAddressAndReturnIndex(this.state.accounts, address);
    const tokenIndex = findTokenBySymbolAndReturnIndex(this.state.accounts[accountIndex].tokens, symbol);
    this.state.accounts[accountIndex].tokens[tokenIndex].transactions = transactions;
  }

  setPendingTransactions({
    address,
    symbol,
    pendingTransactions,
  }: {
    address: string | undefined;
    symbol: string;
    pendingTransactions: any[];
  }) {
    const accountIndex = findAccByAddressAndReturnIndex(this.state.accounts, address);
    const tokenIndex = findTokenBySymbolAndReturnIndex(this.state.accounts[accountIndex].tokens, symbol);
    this.state.accounts[accountIndex].tokens[tokenIndex].pendingTransactions = pendingTransactions;
  }

  deleteAccount(address: string | undefined) {
    const accountIndex = findAccByAddressAndReturnIndex(this.state.accounts, address);
    Vue.delete(this.state.accounts, accountIndex);
  }

  setIsExist({ address, exist }: { address: string | undefined; exist: boolean }) {
    const accountIndex = findAccByAddressAndReturnIndex(this.state.accounts, address);
    this.state.accounts[accountIndex].isExist = exist;
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
    network,
    client,
    isDeployed,
    password,
  }: {
    custodians: string[];
    keypair: KeyPair;
    walletType: WalletType;
    name: string;
    network: number | null;
    client: TonClient;
    isDeployed?: boolean;
    password: string;
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
      privateData: keypair.secret,
    });
    this.store.commit("setIsLocked", false);
    const account: AccountInterface = {
      address: address,
      walletType: walletType,
      name: name,
      custodians,
      networks: isDeployed ? [network] : [],
      isExist: !!isDeployed,
      tokens: [
        {
          name: name,
          symbol: "TON",
          balance: "0",
          decimals: 10,
          transactions: [],
          pendingTransactions: [],
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

    const newBalance = await getBalance(client, account!.address);
    this.mutations.updateBalanceById({ address, symbol, newBalance });
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
    this.mutations.updateBalanceById({ address, symbol, newBalance: newBalance });
  }

  public async deploy({
    address,
    client,
    networkId,
    keypair,
  }: {
    address: string | undefined;
    symbol: string;
    networkId: number;
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
      this.mutations.addNetworkToAccount({ address, networkId });
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
      if (account.custodians.length > 1) {
        await contract.call({
          functionName: "submitTransaction",
          input: {
            dest: addressTo,
            value: amount,
            bounce: true,
            allBalance: false,
            payload: message,
          },
        });
        const response = await contract.run({
          functionName: "getTransactions",
        });
        this.mutations.setPendingTransactions({
          address: addressFrom,
          symbol: "TON",
          pendingTransactions: response.value.transactions,
        });
      } else {
        await contract.call({
          functionName: "sendTransaction",
          input: {
            dest: addressTo,
            value: amount,
            bounce: false,
            flags: 1,
            payload: message,
          },
        });
      }
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
