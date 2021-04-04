import {KeyPair, TonClient} from '@tonclient/core';

export type TonPackage = {
  image: string;
  abi: {};
};

export class TonContract {
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

  client: TonClient;
  name: string;
  tonPackage: TonPackage;
  keys?: KeyPair;
  address?: string;

  async init(params?: any) {
    await this.calcAddress(params);
  }

  async callLocal({
    functionName,
    input = {},
  }: {
    functionName: string;
    input?: {};
  }) {
    const account = await this.client.net.query_collection({
      collection: 'accounts',
      filter: {id: {eq: this.address}},
      result: 'boc data',
    });
    const message = await this.client.tvm.run_tvm({
      message: (
        await this.client.abi.encode_message({
          signer: {type: 'None'},
          abi: {type: 'Contract', value: this.tonPackage.abi},
          call_set: {
            function_name: functionName,
            input,
          },
          address: this.address,
        })
      ).message,
      account: account.result[0].boc,
    });
    const messageDecoded = await this.client.abi.decode_message({
      abi: {type: 'Contract', value: this.tonPackage.abi},
      message: message.out_messages[0],
    });
    return messageDecoded;
  }

  async call({functionName, input}: {functionName: string; input?: any}) {
    if (process.env.DEBUG) {
      console.log('functionName', functionName);
      console.log('input', input);
    }
    const result = await this.client.processing.process_message(
      {
        message_encode_params: {
          abi: {type: 'Contract', value: this.tonPackage.abi},
          address: this.address,
          signer: this.keys
            ? {
                type: 'Keys',
                keys: this.keys,
              }
            : {
                type: 'None',
              },
          call_set: {
            function_name: functionName,
            input,
          },
        },
        send_events: true,
      },
      (params, responseType) => {
        if (process.env.DEBUG) {
          console.log('response type', responseType);
          console.log('params', params);
        }
      },
    );
    return result;
  }

  async calcAddress({initialData} = {initialData: {}}) {
    if (!this.keys) return;
    const deployMsg = await this.client.abi.encode_message({
      abi: {type: 'Contract', value: this.tonPackage.abi},
      signer: {
        type: 'Keys',
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

  async deploy({initialData, input}: {initialData?: any; input?: any} = {}) {
    if (!this.keys) throw new Error('keys not specified');
    try {
      const deployMsg = await this.client.abi.encode_message({
        abi: {type: 'Contract', value: this.tonPackage.abi},
        signer: {
          type: 'Keys',
          keys: this.keys,
        },
        deploy_set: {
          tvc: this.tonPackage.image,
          initial_data: initialData,
        },
        call_set: {
          function_name: 'constructor',
          input,
        },
      });
      return await this.client.processing.send_message({
        message: deployMsg.message,
        send_events: false,
      });
    } catch (err) {
      console.log('deploy error: ', err);
      throw new Error(err);
    }
  }

  async getBalance() {
    if (!this.address) throw new Error('address not specified');
    const {result} = await this.client.net.query_collection({
      collection: 'accounts',
      filter: {id: {eq: this.address}},
      result: 'id balance',
    });
    if (!result[0]) {
      return '';
    }
    return parseInt(result[0].balance, 16);
  }
}
