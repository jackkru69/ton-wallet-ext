import { Getters, Mutations, Actions, Module, createMapper } from "vuex-smart-module";

import * as sha256 from "fast-sha256";
import nacl from "tweetnacl";
import naclUtil from "tweetnacl-util";
import Vue from "vue";

const iterations = 10000;

interface KeyMetadata {
  nonce: string;
  iterations: number;
}

export type Key = {
  metadata: KeyMetadata;
  public: string;
  private: string;
};

class KeystoreState {
  keys: any = {};
}

function randomNonce() {
  return naclUtil.encodeBase64(nacl.randomBytes(nacl.secretbox.nonceLength));
}

function deriveHashFromPassword(password: string, metadata: KeyMetadata) {
  return sha256.pbkdf2(
    naclUtil.decodeUTF8(password),
    naclUtil.decodeBase64(metadata.nonce),
    metadata.iterations,
    nacl.secretbox.keyLength
  );
}

function decrypt(encryptedBase64: string, metadata: KeyMetadata, password: string) {
  const secretKey = deriveHashFromPassword(password, metadata);
  const decrypted = nacl.secretbox.open(
    naclUtil.decodeBase64(encryptedBase64),
    naclUtil.decodeBase64(metadata.nonce),
    secretKey
  );

  if (!decrypted) {
    throw new Error("Decryption failed.");
  }
  return JSON.parse(naclUtil.encodeUTF8(decrypted));
}

function encrypt(privateData: any, metadata: KeyMetadata, password: string): string {
  const secretKey = deriveHashFromPassword(password, metadata);
  const data = naclUtil.decodeUTF8(JSON.stringify(privateData));
  const encrypted = nacl.secretbox(data, naclUtil.decodeBase64(metadata.nonce), secretKey);
  return naclUtil.encodeBase64(encrypted);
}

class KeystoreGetters extends Getters<KeystoreState> {
  get getKeyIDs(): string[] {
    return Object.keys(this.state.keys);
  }
  get getPublicKeyData(): (keyID: string) => string {
    return (keyID: any) => this.state.keys[keyID].public;
  }
  get getPrivateData(): (keyID: string, password: string) => { secret: string; seedPhrase: string } {
    return (keyID: string, password: string) =>
      decrypt(this.state.keys[keyID].private, this.state.keys[keyID].metadata, password) as {
        secret: string;
        seedPhrase: string;
      };
  }
}

class KeystoreMutations extends Mutations<KeystoreState> {
  public saveKeyMut({
    keyID,
    metadata,
    privateData,
    publicData,
  }: {
    keyID: string;
    metadata: any;
    privateData: string;
    publicData: string;
  }) {
    Vue.set(this.state.keys, keyID, {
      metadata,
      public: publicData as any,
      private: privateData,
    });
  }
  removeKey(keyID: string) {
    Vue.delete(this.state.keys, keyID);
  }
  removeAllKey() {
    this.state.keys = [];
  }
}

class KeystoreActions extends Actions<KeystoreState, KeystoreGetters, KeystoreMutations, KeystoreActions> {
  saveKey({
    keyID,
    password,
    privateData,
    publicData,
  }: {
    keyID: string;
    password: string;
    privateData: string;
    publicData: string;
  }) {
    const metadata = {
      nonce: randomNonce(),
      iterations,
    };
    this.mutations.saveKeyMut({
      keyID,
      metadata,
      publicData,
      privateData: encrypt(privateData, metadata, password),
    });
  }

  removeKey(keyID: string) {
    if (!this.state.keys[keyID]) {
      throw new Error(`Cannot delete key ${keyID}. Key not found.`);
    }
    this.mutations.removeKey(keyID);
  }


  public changePassword({ password, newPassword }: { password: string; newPassword: string }) {
    this.getters.getKeyIDs.forEach((keyID: string) => {
      try {
        const publicData = this.getters.getPublicKeyData(keyID)
        const privateData = this.getters.getPrivateData(keyID, password)

        const metadata = {
          nonce: randomNonce(),
          iterations,
        };
        this.mutations.saveKeyMut({
          keyID,
          metadata,
          publicData,
          privateData: encrypt(privateData, metadata, newPassword),
        });
      } catch (error) {
        throw new Error("Invalid password")
      }
    })
  }
}

export const keystore = new Module({
  state: KeystoreState,
  getters: KeystoreGetters,
  mutations: KeystoreMutations,
  actions: KeystoreActions,
});

export const keystoreModuleMapper = createMapper(keystore);
