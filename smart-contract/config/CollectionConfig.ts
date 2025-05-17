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
  hiddenMetadataUri: "ipfs://__CID__/hidden.json", // Not used
  maxSupply: 50,
  mintPrice: 0,
  maxMintAmountPerTx: 50,
  contractAddress: "0x6da362a9020eAA4B495BdFf26C1f071E0d1F4F73",
  marketplaceIdentifier: "lu-nft",
  marketplaceConfig: Marketplaces.openSea,
};

export default CollectionConfig;
