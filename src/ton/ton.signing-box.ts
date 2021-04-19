import { TonClient, KeyPair } from "@tonclient/core";
import { SEED_PHRASE_DICTIONARY_ENGLISH, HD_PATH } from "./ton.utils";

export default class SigningBox {
  client: TonClient;
  seedPhrase: string;
  wordCount: number;
  keys: KeyPair;
  publicKey: string;
  constructor(client: TonClient, seedPhrase: string, wordCount: number) {
    this.client = client;
    this.seedPhrase = seedPhrase;
    this.wordCount = wordCount;
  }

  async get_public_key() {
    if (!this.publicKey) {
      this.keys = await this.client.crypto.mnemonic_derive_sign_keys({
        dictionary: SEED_PHRASE_DICTIONARY_ENGLISH,
        word_count: this.wordCount,
        phrase: this.seedPhrase,
        path: HD_PATH,
      });
      this.publicKey = this.keys.public;
    }
    return {
      public_key: this.publicKey,
    };
  }

  async sign(params: any) {
    return await this.client.crypto.sign({
      keys: this.keys,
      unsigned: params.unsigned,
    });
  }
}
