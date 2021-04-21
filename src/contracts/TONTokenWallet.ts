const abi = {
  "ABI version": 2,
  header: ["pubkey", "time", "expire"],
  functions: [
    {
      name: "constructor",
      inputs: [
        { name: "name", type: "bytes" },
        { name: "symbol", type: "bytes" },
        { name: "decimals", type: "uint8" },
        { name: "tokens", type: "uint256" },
        { name: "imageWallet", type: "cell" },
      ],
      outputs: [],
    },
    { name: "accept", inputs: [{ name: "tokens", type: "uint256" }], outputs: [] },
    {
      name: "transfer",
      inputs: [
        { name: "dest", type: "address" },
        { name: "tokens", type: "uint256" },
        { name: "grams", type: "uint128" },
      ],
      outputs: [],
    },
    {
      name: "internalTransfer",
      inputs: [
        { name: "sender_key", type: "uint256" },
        { name: "tokens", type: "uint256" },
      ],
      outputs: [],
    },
    {
      name: "allowance",
      inputs: [],
      outputs: [
        {
          components: [
            { name: "spender", type: "address" },
            { name: "allowedToken", type: "uint256" },
          ],
          name: "value0",
          type: "tuple",
        },
      ],
    },
    {
      name: "approve",
      inputs: [
        { name: "spender", type: "address" },
        { name: "remainingTokens", type: "uint256" },
        { name: "tokens", type: "uint256" },
      ],
      outputs: [],
    },
    {
      name: "transferFrom",
      inputs: [
        { name: "dest", type: "address" },
        { name: "to", type: "address" },
        { name: "tokens", type: "uint256" },
        { name: "grams", type: "uint128" },
      ],
      outputs: [],
    },
    {
      name: "internalTransferFrom",
      inputs: [
        { name: "to", type: "address" },
        { name: "tokens", type: "uint256" },
      ],
      outputs: [],
    },
    { name: "disapprove", inputs: [], outputs: [] },
    { name: "_root_address", inputs: [], outputs: [{ name: "_root_address", type: "address" }] },
    { name: "_root_publicKey", inputs: [], outputs: [{ name: "_root_publicKey", type: "uint256" }] },
    { name: "_wallet_publicKey", inputs: [], outputs: [{ name: "_wallet_publicKey", type: "uint256" }] },
    { name: "_tokens", inputs: [], outputs: [{ name: "_tokens", type: "uint256" }] },
    { name: "_name", inputs: [], outputs: [{ name: "_name", type: "bytes" }] },
    { name: "_symbol", inputs: [], outputs: [{ name: "_symbol", type: "bytes" }] },
    { name: "_decimals", inputs: [], outputs: [{ name: "_decimals", type: "uint8" }] },
    { name: "_image_wallet", inputs: [], outputs: [{ name: "_image_wallet", type: "cell" }] },
    {
      name: "_allowance",
      inputs: [],
      outputs: [
        {
          components: [
            { name: "spender", type: "address" },
            { name: "allowedToken", type: "uint256" },
          ],
          name: "_allowance",
          type: "tuple",
        },
      ],
    },
  ],
  data: [
    { key: 1, name: "_root_address", type: "address" },
    { key: 2, name: "_root_publicKey", type: "uint256" },
    { key: 3, name: "_wallet_publicKey", type: "uint256" },
    { key: 4, name: "_tokens", type: "uint256" },
  ],
  events: [],
};

export default {
  abi,
  image:
    "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",
};
