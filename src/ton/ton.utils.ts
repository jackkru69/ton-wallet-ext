import { KeyPair, ResultOfMnemonicFromRandom, SortDirection, TonClient } from "@tonclient/core";
import giverPackage from "./giver.package";

export const seedPhraseDictionaryEnglish = 1;
const hdPath = "m/44'/396'/0'/0/0";

export async function generateSeed(
  client: TonClient,
  seedPhraseWorldCount: number
): Promise<ResultOfMnemonicFromRandom> {
  try {
    return await client.crypto.mnemonic_from_random({
      dictionary: seedPhraseDictionaryEnglish,
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
      dictionary: seedPhraseDictionaryEnglish,
      word_count: seedPhraseWorldCount,
      phrase: seedPhrase,
      path: hdPath,
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
      dictionary: seedPhraseDictionaryEnglish,
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

export async function subscribeAccount(
  client: TonClient,
  address: string,
  cb: (v: any) => any,
  result = "id balance(format:DEC)"
) {
  return await client.net.subscribe_collection(
    {
      collection: "accounts",
      filter: {
        id: {
          eq: address,
        },
      },
      result,
    },
    cb
  );
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
      "id account_addr status_name tr_type_name balance_delta(format:DEC) in_message { id msg_type_name status_name src dst value(format:DEC) } out_messages { id msg_type_name status_name src dst value(format:DEC) } now",
  });
  return result;
}
