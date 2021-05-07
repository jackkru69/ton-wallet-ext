import { KeyPair, ResultOfMnemonicFromRandom, SortDirection, TonClient } from "@tonclient/core";
import giverPackage from "./giver.package";
import Transfer from "@/contracts/Transfer";
import { BigNumber } from "bignumber.js";
import { sliceString, baseToAssetAmount } from "../utils/index";
import { TxType } from "@/types/transactions";

export const SEED_PHRASE_DICTIONARY_ENGLISH = 1;
export const HD_PATH = "m/44'/396'/0'/0/0";

const convert = (from: any, to: any) => (str: any) => Buffer.from(str, from).toString(to);

export const utf8ToHex = convert("utf8", "hex");
export const hexToUtf8 = convert("hex", "utf8");

export async function generateSeed(
  client: TonClient,
  seedPhraseWorldCount: number
): Promise<ResultOfMnemonicFromRandom> {
  try {
    return await client.crypto.mnemonic_from_random({
      dictionary: SEED_PHRASE_DICTIONARY_ENGLISH,
      word_count: seedPhraseWorldCount,
    });
  } catch (err) {
    console.error(err);
    throw new Error(err);
  }
}

export async function convertSeedToKeyPair(
  client: TonClient,
  seedPhrase: string,
  seedPhraseWorldCount: number
): Promise<KeyPair> {
  try {
    return await client.crypto.mnemonic_derive_sign_keys({
      dictionary: SEED_PHRASE_DICTIONARY_ENGLISH,
      word_count: seedPhraseWorldCount,
      phrase: seedPhrase,
      path: HD_PATH,
    });
  } catch (err) {
    console.error(err);
    throw new Error(err);
  }
}

export type TSendGramsInput = { dest: string; amount: string };

export const sendGrams = async (client: TonClient, input: TSendGramsInput) => {
  try {
    return await client.processing.process_message({
      message_encode_params: {
        abi: { type: "Contract", value: giverPackage.abi },
        signer: {
          type: "None",
        },
        address: giverPackage.address,
        call_set: {
          function_name: "sendGrams",
          input,
        },
      },
      send_events: false,
    });
  } catch (err) {
    console.error("sendGrams error: ", err);
  }
};

export async function validateSeedPhrase(client: TonClient, seedPhrase: string, seedPhraseWorldCount: number) {
  if (seedPhraseWorldCount === 12 || seedPhraseWorldCount === 24) {
    return await client.crypto.mnemonic_verify({
      phrase: seedPhrase,
      dictionary: SEED_PHRASE_DICTIONARY_ENGLISH,
      word_count: seedPhraseWorldCount,
    });
  } else return false;
}

export async function getBalance(client: TonClient, address: string) {
  if (!address) throw new Error("address not specified");
  const { result } = await client.net.query_collection({
    collection: "accounts",
    filter: { id: { eq: address } },
    result: "id balance(format:DEC)",
  });
  if (!result[0]) {
    return "0";
  }
  return result[0].balance;
}

export async function getAccountTxs(client: TonClient, address: string) {
  if (!address) throw new Error("address not specified");
  const { result } = await client.net.query_collection({
    collection: "transactions",
    filter: { account_addr: { eq: address }, balance_delta: { ne: "0x0" } },
    order: [
      { path: "now", direction: SortDirection.DESC },
      { path: "lt", direction: SortDirection.DESC },
    ],
    limit: 10,
    result:
      "id account_addr status_name tr_type_name balance_delta(format:DEC) in_message { id msg_type_name status_name src dst value(format:DEC) body } out_messages { id msg_type_name status_name src dst value(format:DEC) body} now",
  });
  const txsWithComment = await Promise.all(
    result.map(async (tx: TxType) => {
      let response;
      if ((tx.in_message && tx.in_message.body) || (tx.out_messages.length && tx.out_messages[0].body)) {
        try {
          const responseIn = await client.abi.decode_message_body({
            body: tx.in_message.body,
            is_internal: true,
            abi: { type: "Contract", value: Transfer.abi },
          });
          response = responseIn;
          // eslint-disable-next-line no-empty
        } catch (error) {}
        try {
          const responseOut = await client.abi.decode_message_body({
            body: tx.out_messages[0].body,
            is_internal: true,
            abi: { type: "Contract", value: Transfer.abi },
          });
          response = responseOut;
          // eslint-disable-next-line no-empty
        } catch (error) {}

        const comment: string = response ? Buffer.from(response.value.comment, "hex").toString("utf8") : "";
        return { ...tx, comment };
      }

      return { ...tx, comment: "" };
    })
  );
  return txsWithComment;
}

export async function checkDeployStatus(client: TonClient, address: string, statuses: number[]) {
  if (!address) throw new Error("address not specified");
  const { result } = await client.net.query_collection({
    collection: "accounts",
    filter: {
      id: {
        eq: address,
      },
    },
    result: "acc_type",
  });
  if (result[0]) {
    return statuses.includes(result[0].acc_type);
  } else return undefined;
}

export function getAccountExplorerLink(explorer: string, address: string) {
  return `${explorer}/accounts/accountDetails?id=${address}`;
}

export function getTxExplorerLink(explorer: string, txId: string) {
  return `${explorer}/transactions/transactionDetails?id=${txId}`;
}

const findValue = (transaction: any) => {
  const outgoing = transaction.out_messages.reduce(
    (total: any, msg: any) => total.plus(msg.value !== null ? msg.value : 0),
    new BigNumber(0)
  );
  return new BigNumber(transaction.in_message.value !== null ? transaction.in_message.value : 0).minus(outgoing);
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

export const formatTx = (tx: TxType) => {
  const value = findValue(tx);
  const address = findAddress(tx);
  return {
    ...tx,
    fId: sliceString(tx.id, 8),
    type: value.isLessThan(0) ? "minus" : "plus",
    address: sliceString(address),
    fValue: baseToAssetAmount(value.toString(), "TON", 3),
  };
};

export const validateAddress = (address: string) =>
  address ? address.match(/^(-1|0):[a-fA-F0-9]{64}$/g) !== null : false;
