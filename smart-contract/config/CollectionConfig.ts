import CollectionConfigInterface from "../lib/CollectionConfigInterface";
import * as Networks from "../lib/Networks";
import * as Marketplaces from "../lib/Marketplaces";

const CollectionConfig: CollectionConfigInterface = {
  testnet: Networks.ethereumTestnet,
  mainnet: Networks.ethereumMainnet,
  // The contract name can be updated using the following command:
  // yarn rename-contract NEW_CONTRACT_NAME
  // Please DO NOT change it manually!
  contractName: "LUNFTMINTER",
  tokenName: "Latvijas Universitātes NFT",
  tokenSymbol: "LUNFT",
  hiddenMetadataUri: "ipfs://__CID__/hidden.json",
  maxSupply: 100,
  mintPrice: 0.015,
  maxMintAmountPerTx: 5,
  contractAddress: "0x6835A4c4C1c90A96dEC31D356a352999BA17FBAB",
  marketplaceIdentifier: "lu-nft",
  marketplaceConfig: Marketplaces.openSea,
};

export default CollectionConfig;
