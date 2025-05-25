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
  contractAddress: "0x9193bd80886F72Bb49d328CCb38c4Ae5F827FC23",
  marketplaceIdentifier: "lu-nft",
  marketplaceConfig: Marketplaces.openSea,
};

export default CollectionConfig;
