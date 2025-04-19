import CollectionConfigInterface from '../lib/CollectionConfigInterface';
import * as Networks from '../lib/Networks';
import * as Marketplaces from '../lib/Marketplaces';
import whitelistAddresses from './whitelist.json';

const CollectionConfig: CollectionConfigInterface = {
  testnet: Networks.ethereumTestnet,
  mainnet: Networks.ethereumMainnet,
  // The contract name can be updated using the following command:
  // yarn rename-contract NEW_CONTRACT_NAME
  // Please DO NOT change it manually!
  contractName: 'LUNFTMINTER',
  tokenName: 'Latvijas Universitātes NFT',
  tokenSymbol: 'LUNFT',
  hiddenMetadataUri: 'ipfs://__CID__/hidden.json',
  maxSupply: 100,
  whitelistSale: {
    price: 0.01,
    maxMintAmountPerTx: 10,
  },
  preSale: {
    price: 0.011,
    maxMintAmountPerTx: 3,
  },
  publicSale: {
    price: 0.015,
    maxMintAmountPerTx: 5,
  },
  contractAddress: "",
  marketplaceIdentifier: 'lu-nft',
  marketplaceConfig: Marketplaces.openSea,
  whitelistAddresses,
};

export default CollectionConfig;
