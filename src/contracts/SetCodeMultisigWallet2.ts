const abi = {
  "ABI version": 2,
  header: ["pubkey", "time", "expire"],
  functions: [
    {
      name: "constructor",
      inputs: [
        {
          name: "owners",
          type: "uint256[]",
        },
        {
          name: "reqConfirms",
          type: "uint8",
        },
      ],
      outputs: [],
    },
    {
      name: "acceptTransfer",
      inputs: [
        {
          name: "payload",
          type: "bytes",
        },
      ],
      outputs: [],
    },
    {
      name: "sendTransaction",
      inputs: [
        {
          name: "dest",
          type: "address",
        },
        {
          name: "value",
          type: "uint128",
        },
        {
          name: "bounce",
          type: "bool",
        },
        {
          name: "flags",
          type: "uint8",
        },
        {
          name: "payload",
          type: "cell",
        },
      ],
      outputs: [],
    },
    {
      name: "submitTransaction",
      inputs: [
        {
          name: "dest",
          type: "address",
        },
        {
          name: "value",
          type: "uint128",
        },
        {
          name: "bounce",
          type: "bool",
        },
        {
          name: "allBalance",
          type: "bool",
        },
        {
          name: "payload",
          type: "cell",
        },
      ],
      outputs: [
        {
          name: "transId",
          type: "uint64",
        },
      ],
    },
    {
      name: "confirmTransaction",
      inputs: [
        {
          name: "transactionId",
          type: "uint64",
        },
      ],
      outputs: [],
    },
    {
      name: "isConfirmed",
      inputs: [
        {
          name: "mask",
          type: "uint32",
        },
        {
          name: "index",
          type: "uint8",
        },
      ],
      outputs: [
        {
          name: "confirmed",
          type: "bool",
        },
      ],
    },
    {
      name: "getParameters",
      inputs: [],
      outputs: [
        {
          name: "maxQueuedTransactions",
          type: "uint8",
        },
        {
          name: "maxCustodianCount",
          type: "uint8",
        },
        {
          name: "expirationTime",
          type: "uint64",
        },
        {
          name: "minValue",
          type: "uint128",
        },
        {
          name: "requiredTxnConfirms",
          type: "uint8",
        },
        {
          name: "requiredUpdConfirms",
          type: "uint8",
        },
      ],
    },
    {
      name: "getTransaction",
      inputs: [
        {
          name: "transactionId",
          type: "uint64",
        },
      ],
      outputs: [
        {
          components: [
            {
              name: "id",
              type: "uint64",
            },
            {
              name: "confirmationsMask",
              type: "uint32",
            },
            {
              name: "signsRequired",
              type: "uint8",
            },
            {
              name: "signsReceived",
              type: "uint8",
            },
            {
              name: "creator",
              type: "uint256",
            },
            {
              name: "index",
              type: "uint8",
            },
            {
              name: "dest",
              type: "address",
            },
            {
              name: "value",
              type: "uint128",
            },
            {
              name: "sendFlags",
              type: "uint16",
            },
            {
              name: "payload",
              type: "cell",
            },
            {
              name: "bounce",
              type: "bool",
            },
          ],
          name: "trans",
          type: "tuple",
        },
      ],
    },
    {
      name: "getTransactions",
      inputs: [],
      outputs: [
        {
          components: [
            {
              name: "id",
              type: "uint64",
            },
            {
              name: "confirmationsMask",
              type: "uint32",
            },
            {
              name: "signsRequired",
              type: "uint8",
            },
            {
              name: "signsReceived",
              type: "uint8",
            },
            {
              name: "creator",
              type: "uint256",
            },
            {
              name: "index",
              type: "uint8",
            },
            {
              name: "dest",
              type: "address",
            },
            {
              name: "value",
              type: "uint128",
            },
            {
              name: "sendFlags",
              type: "uint16",
            },
            {
              name: "payload",
              type: "cell",
            },
            {
              name: "bounce",
              type: "bool",
            },
          ],
          name: "transactions",
          type: "tuple[]",
        },
      ],
    },
    {
      name: "getTransactionIds",
      inputs: [],
      outputs: [
        {
          name: "ids",
          type: "uint64[]",
        },
      ],
    },
    {
      name: "getCustodians",
      inputs: [],
      outputs: [
        {
          components: [
            {
              name: "index",
              type: "uint8",
            },
            {
              name: "pubkey",
              type: "uint256",
            },
          ],
          name: "custodians",
          type: "tuple[]",
        },
      ],
    },
    {
      name: "submitUpdate",
      inputs: [
        {
          name: "codeHash",
          type: "uint256",
        },
        {
          name: "owners",
          type: "uint256[]",
        },
        {
          name: "reqConfirms",
          type: "uint8",
        },
      ],
      outputs: [
        {
          name: "updateId",
          type: "uint64",
        },
      ],
    },
    {
      name: "confirmUpdate",
      inputs: [
        {
          name: "updateId",
          type: "uint64",
        },
      ],
      outputs: [],
    },
    {
      name: "executeUpdate",
      inputs: [
        {
          name: "updateId",
          type: "uint64",
        },
        {
          name: "code",
          type: "cell",
        },
      ],
      outputs: [],
    },
    {
      name: "getUpdateRequests",
      inputs: [],
      outputs: [
        {
          components: [
            {
              name: "id",
              type: "uint64",
            },
            {
              name: "index",
              type: "uint8",
            },
            {
              name: "signs",
              type: "uint8",
            },
            {
              name: "confirmationsMask",
              type: "uint32",
            },
            {
              name: "creator",
              type: "uint256",
            },
            {
              name: "codeHash",
              type: "uint256",
            },
            {
              name: "custodians",
              type: "uint256[]",
            },
            {
              name: "reqConfirms",
              type: "uint8",
            },
          ],
          name: "updates",
          type: "tuple[]",
        },
      ],
    },
  ],
  data: [],
  events: [
    {
      name: "TransferAccepted",
      inputs: [
        {
          name: "payload",
          type: "bytes",
        },
      ],
      outputs: [],
    },
  ],
};

export default {
  abi,
  image:
    "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",
};
