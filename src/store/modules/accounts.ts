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
import { BigNumber } from "bignumber.js";

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

const findValue = (transaction: any) => {
  const outgoing = transaction.out_messages.reduce((total: any, msg: any) => total.plus(msg.value), new BigNumber(0));
  return new BigNumber(transaction.in_message.value || 0).minus(outgoing);
};

const findAddress = (transaction: any) => {
  if (transaction.out_messages.length > 0) {
    for (const item of transaction.out_messages) {
      if (item.dst != null) {
        return item.dst;
      }
    }
    return undefined;
  } else if (transaction.in_message.src != null) {
    return transaction.in_message.src;
  } else {
    return transaction.in_message.dst;
  }
};

const formatTx = (tx: TxType) => {
  const value = findValue(tx);
  const address = findAddress(tx);

  return {
    ...tx,
    fId: sliceString(tx.id),
    type: value.isLessThan(0) ? "minus" : "plus",
    address: sliceString(address),
    fValue: baseToAssetAmount(value.toString(), "TON", 3),
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
    network,
    client,
    isDeployed,
    seedPhrase,
    password,
  }: {
    custodians: string[];
    keypair: KeyPair;
    walletType: WalletType;
    name: string;
    network: number | null;
    client: TonClient;
    seedPhrase: string;
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
      privateData: { secret: keypair.secret, seedPhrase },
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
    this.mutations.updateBalanceByAddressMut({ address, symbol, newBalance });
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
            payload: Buffer.from(message).toString("hex"),
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
            payload: Buffer.from(message).toString("hex"),
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
