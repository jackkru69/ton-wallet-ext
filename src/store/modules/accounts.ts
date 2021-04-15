import { Getters, Mutations, Actions, Module, createMapper, Context } from "vuex-smart-module";
import { KeyPair, TonClient } from "@tonclient/core";
import TonContract from "@/ton/ton.contract";
import SafeMultisig from "@/contracts/SafeMultisigWallet";
import SetCodeMultisig from "@/contracts/SetCodeMultisigWallet";
import SetCodeMultisig2 from "@/contracts/SetCodeMultisigWallet2";
import { getBalance } from "@/ton/ton.utils";
import { baseToAssetAmount, findByIdAndReturnIndex, sliceString } from "../../utils/index";
import { BigNumber } from "bignumber.js";
import { isEmpty } from "lodash";

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
  name: string;
  symbol: string;
  address: string;
  balance: string;
  decimals: number;
  numberOfCustodians: number;
  custodians: string[];
  networks: Array<number | null>;
  transactions: any[];
};
export interface AccountInterface {
  address: string;
  walletType: WalletType;
  id: number;
  name: string;
  keypair: KeyPair;
  tokens: TokenType[];
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

class AccountsGetters extends Getters<AccountsState> {
  public get getAccountById(): (id: number) => AccountInterface | undefined {
    return (id: number) => this.state.accounts.find((acc) => acc.id === id);
  }

  public get getTokenById(): (id: number, tokenId: number) => TokenType | undefined {
    return (id, tokenId) => {
      const accountIndex = findByIdAndReturnIndex(this.state.accounts, id);
      const tokenIndex = findByIdAndReturnIndex(this.state.accounts[accountIndex].tokens, tokenId);
      return this.state.accounts[accountIndex].tokens[tokenIndex];
    };
  }

  public get getFormattedTxsById(): (id: number, tokenId: number) => TxType[] | undefined {
    return (id, tokenId) => this.getters.getTokenById(id, tokenId)?.transactions.map((tx) => formatTx(tx));
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

  updateBalanceById({ id, tokenId, newBalance }: { id: number; tokenId: number; newBalance: string }) {
    const accountIndex = findByIdAndReturnIndex(this.state.accounts, id);
    const tokenIndex = findByIdAndReturnIndex(this.state.accounts[accountIndex].tokens, tokenId);
    this.state.accounts[accountIndex].tokens[tokenIndex].balance = newBalance;
  }

  addNetworkToToken({ id, tokenId, networkId }: { id: number; tokenId: number; networkId: number }) {
    if (!this.state.accounts[id].tokens[tokenId].networks.includes(networkId)) {
      this.state.accounts[id].tokens[tokenId].networks.push(networkId);
    }
  }

  setTransactions({ id, tokenId, transactions }: { id: number; tokenId: number; transactions: any[] }) {
    const accountIndex = findByIdAndReturnIndex(this.state.accounts, id);
    const tokenIndex = findByIdAndReturnIndex(this.state.accounts[accountIndex].tokens, tokenId);
    this.state.accounts[accountIndex].tokens[tokenIndex].transactions = transactions;
  }
}

class AccountsActions extends Actions<AccountsState, AccountsGetters, AccountsMutations, AccountsActions> {
  public async addAccount(payload: {
    custodians: string[];
    keypair: KeyPair;
    numberOfCustodians: number;
    walletType: WalletType;
    name: string;
    activeNetworkID: number | null;
    client: TonClient;
  }) {
    const { client, walletType, keypair, numberOfCustodians, name, custodians } = payload;

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
      keypair: keypair,
      tokens: [
        {
          id: 0,
          name: name,
          symbol: "TON",
          address: address,
          balance: "0",
          decimals: 10,
          numberOfCustodians,
          custodians,
          networks: [],
          transactions: [],
        },
      ],
    };
    this.mutations.addAccount(account);
  }

  public async updateBalanceById(payload: { id: number; tokenId: number; client: TonClient }) {
    const account: AccountInterface | undefined = this.getters.getAccountById(payload.id);

    const newBalance = await getBalance(payload.client, account!.address);
    this.mutations.updateBalanceById({ id: payload.id, tokenId: payload.tokenId, newBalance });
  }

  public setBalanceByIdAndTokenId(payload: { id: number; tokenId: number; client: TonClient; newBalance: string }) {
    this.mutations.updateBalanceById({ id: payload.id, tokenId: payload.tokenId, newBalance: payload.newBalance });
  }

  public async deploy({
    id,
    client,
    tokenId,
    networkId,
  }: {
    id: any;
    tokenId: number;
    networkId: number;
    client: TonClient;
  }) {
    const account: AccountInterface | undefined = this.getters.getAccountById(id);
    const contract = new TonContract({
      client: client,
      tonPackage: contracts[account!.walletType],
      name: account!.walletType,
      keys: account!.keypair,
    });
    const tokenIndex = findByIdAndReturnIndex(account!.tokens, tokenId);
    const custodians = account!.tokens[tokenIndex].custodians;
    await contract.deploy({
      input: {
        owners: custodians,
        reqConfirms: custodians.length,
      },
    });
    this.mutations.addNetworkToToken({ id, tokenId, networkId });
  }

  public async transferOrProposeTransfer(payload: {
    id: any;
    address: string;
    amount: string;
    message: string;
    client: TonClient;
  }) {
    const account: AccountInterface | undefined = this.getters.getAccountById(payload.id);
    const contract = new TonContract({
      client: payload.client,
      tonPackage: contracts[account!.walletType],
      name: account!.walletType,
      keys: account!.keypair,
      address: account!.address,
    });
    if (account!.tokens[0].custodians.length > 1) {
      const response = await contract.call({
        functionName: "submitTransaction",
        input: {
          dest: payload.address,
          value: payload.amount,
          bounce: true,
          allBalance: false,
          payload: payload.message,
        },
      });
      console.log(response);
    } else {
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
}

export const accounts = new Module({
  state: AccountsState,
  getters: AccountsGetters,
  mutations: AccountsMutations,
  actions: AccountsActions,
});

export const accountsModuleMapper = createMapper(accounts);
