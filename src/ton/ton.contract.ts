import { KeyPair, TonClient } from "@tonclient/core";

export type TonPackage = {
  image: string;
  abi: {};
};

export default class TonContract {
  constructor({
    client,
    name,
    tonPackage,
    keys,
    address,
  }: {
    client: TonClient;
    name: string;
    tonPackage: TonPackage;
    keys?: KeyPair;
    address?: string;
  }) {
    this.client = client;
    this.name = name;
    this.tonPackage = tonPackage;
    this.keys = keys;
    this.address = address;
  }

  boc: any;
  bocFetching?: Promise<string>;
  client: TonClient;
  name: string;
  tonPackage: TonPackage;
  keys?: KeyPair;
  address?: string;

  async init(params?: any) {
    await this.calcAddress(params);
  }

  fetchBoc() {
    if (!this.bocFetching) {
      this.bocFetching = new Promise((res, rej) => {
        this.client.net
          .query_collection({
            collection: "accounts",
            filter: { id: { eq: this.address } },
            result: "boc data",
          })
          .then(
            (account) => {
              if (!account.result[0]) {
                this.bocFetching = undefined;
                rej(new Error("account not found"));
              }
              res(account.result[0].boc);
              this.bocFetching = undefined;
            },
            (err) => {
              rej(err);
              this.bocFetching = undefined;
            }
          );
      });
    }
    return this.bocFetching;
  }

  async run({
    functionName,
    input = {},
    preventFetchBoc = false,
  }: {
    functionName: string;
    input?: {};
    preventFetchBoc?: boolean;
  }) {
    if (process.env.DEBUG) console.log(`${this.name} run ${functionName}`);
    if (!preventFetchBoc || !this.boc) this.boc = await this.fetchBoc();
    try {
      const message = await this.client.tvm.run_tvm({
        message: (
          await this.client.abi.encode_message({
            signer: { type: "None" },
            abi: { type: "Contract", value: this.tonPackage.abi },
            call_set: {
              function_name: functionName,
              input,
            },
            address: this.address,
          })
        ).message,
        account: this.boc,
        abi: { type: "Contract", value: this.tonPackage.abi },
      });
      // @ts-ignore
      return message.decoded.out_messages[0] as DecodedMessageBody;
    } catch (err) {
      console.error(err);
      throw new Error(err);
    }
  }

  async call({ functionName, input, keys }: { functionName: string; input?: any; keys?: KeyPair }) {
    const _keys = keys || this.keys || undefined;
    const result = await this.client.processing.process_message({
      message_encode_params: {
        abi: { type: "Contract", value: this.tonPackage.abi },
        address: this.address,
        signer: _keys
          ? {
              type: "Keys",
              keys: _keys,
            }
          : {
              type: "None",
            },
        call_set: {
          function_name: functionName,
          input,
        },
      },
      send_events: true,
    });
    return result;
  }

  async send({ message }: { message: string }) {
    const result = await this.client.processing.send_message({
      message,
      send_events: true,
    });
    return result;
  }

  async encodeMessage({
    functionName,
    input,
    keys,
  }: {
    functionName: string;
    input?: any;
    keys?: KeyPair;
  }): Promise<string> {
    const _keys = keys || this.keys || undefined;
    return (
      await this.client.abi.encode_message({
        abi: { type: "Contract", value: this.tonPackage.abi },
        address: this.address,
        signer: _keys
          ? {
              type: "Keys",
              keys: _keys,
            }
          : {
              type: "None",
            },
        call_set: {
          function_name: functionName,
          input,
        },
      })
    ).message;
  }

  async calcAddress({ initialData } = { initialData: {} }) {
    if (!this.keys) return;
    const deployMsg = await this.client.abi.encode_message({
      abi: { type: "Contract", value: this.tonPackage.abi },
      signer: {
        type: "Keys",
        keys: this.keys,
      },
      deploy_set: {
        tvc: this.tonPackage.image,
        initial_data: initialData,
      },
    });
    this.address = deployMsg.address;
    return deployMsg.address;
  }

  async deploy({ initialData, input }: { initialData?: any; input?: any } = {}) {
    if (!this.keys) throw new Error("keys not specified");
    try {
      return await this.client.processing.process_message({
        message_encode_params: {
          abi: { type: "Contract", value: this.tonPackage.abi },
          signer: {
            type: "Keys",
            keys: this.keys,
          },
          deploy_set: {
            tvc: this.tonPackage.image,
            initial_data: initialData,
          },
          call_set: {
            function_name: "constructor",
            input,
          },
        },
        send_events: false,
      });
    } catch (err) {
      console.log(err);
      throw new Error(err);
    }
  }

  async getBalance() {
    if (!this.address) throw new Error("address not specified");
    const { result } = await this.client.net.query_collection({
      collection: "accounts",
      filter: { id: { eq: this.address } },
      result: "id balance",
    });
    if (!result[0]) {
      return "";
    }
    return result[0].balance;
  }
}
