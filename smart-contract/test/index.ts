import chai, { expect } from "chai";
import ChaiAsPromised from "chai-as-promised";
import { BigNumber, utils } from "ethers";
import { ethers } from "hardhat";
import CollectionConfig from "./../config/CollectionConfig";
import ContractArguments from "../config/ContractArguments";
import { NftContractType } from "../lib/NftContractProvider";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

chai.use(ChaiAsPromised);

enum SaleType {
  PUBLIC_SALE = CollectionConfig.mintPrice,
}

function getPrice(saleType: SaleType, mintAmount: number) {
  return utils.parseEther(saleType.toString()).mul(mintAmount);
}

describe(CollectionConfig.contractName, function () {
  let owner!: SignerWithAddress;
  let user1!: SignerWithAddress;
  let user2!: SignerWithAddress;
  let externalUser!: SignerWithAddress;
  let contract!: NftContractType;

  before(async function () {
    [owner, user1, user2, externalUser] = await ethers.getSigners();
  });

  it("Contract deployment", async function () {
    const Contract = await ethers.getContractFactory(
      CollectionConfig.contractName
    );
    contract = (await Contract.deploy(...ContractArguments)) as NftContractType;

    await contract.deployed();
  });

  it("Check initial data", async function () {
    expect(await contract.name()).to.equal(CollectionConfig.tokenName);
    expect(await contract.symbol()).to.equal(CollectionConfig.tokenSymbol);
    expect(await contract.cost()).to.equal(getPrice(SaleType.PUBLIC_SALE, 1));
    expect(await contract.maxSupply()).to.equal(CollectionConfig.maxSupply);
    expect(await contract.maxMintAmountPerTx()).to.equal(
      CollectionConfig.maxMintAmountPerTx
    );
    expect(await contract.hiddenMetadataUri()).to.equal(
      CollectionConfig.hiddenMetadataUri
    );

    expect(await contract.paused()).to.equal(true);
    expect(await contract.revealed()).to.equal(false);

    await expect(contract.tokenURI(1)).to.be.revertedWith(
      "ERC721Metadata: URI query for nonexistent token"
    );
  });

  it("Before sale", async function () {
    // Nobody should be able to mint from a paused contract
    await expect(
      contract
        .connect(user1)
        .mint(1, { value: getPrice(SaleType.PUBLIC_SALE, 1) })
    ).to.be.revertedWith("The contract is paused!");
    await expect(
      contract
        .connect(user2)
        .mint(1, { value: getPrice(SaleType.PUBLIC_SALE, 1) })
    ).to.be.revertedWith("The contract is paused!");
    await expect(
      contract
        .connect(owner)
        .mint(1, { value: getPrice(SaleType.PUBLIC_SALE, 1) })
    ).to.be.revertedWith("The contract is paused!");

    // The owner should always be able to run mintForAddress
    await (await contract.mintForAddress(1, await owner.getAddress())).wait();
    await (await contract.mintForAddress(1, await user1.getAddress())).wait();
    // But not over the maxMintAmountPerTx
    await expect(
      contract.mintForAddress(
        await (await contract.maxMintAmountPerTx()).add(1),
        await user2.getAddress()
      )
    ).to.be.revertedWith("Invalid mint amount!");

    // Check balances
    expect(await contract.balanceOf(await owner.getAddress())).to.equal(1);
    expect(await contract.balanceOf(await user1.getAddress())).to.equal(1);
    expect(await contract.balanceOf(await user2.getAddress())).to.equal(0);
    expect(await contract.balanceOf(await externalUser.getAddress())).to.equal(
      0
    );
  });

  it("Public sale", async function () {
    await contract.setPaused(false);
    await contract
      .connect(user2)
      .mint(2, { value: getPrice(SaleType.PUBLIC_SALE, 2) });
    await contract
      .connect(user1)
      .mint(1, { value: getPrice(SaleType.PUBLIC_SALE, 1) });
    // Sending insufficient funds
    await expect(
      contract
        .connect(user2)
        .mint(1, { value: getPrice(SaleType.PUBLIC_SALE, 1).sub(1) })
    ).to.be.rejectedWith(
      Error,
      "insufficient funds for intrinsic transaction cost"
    );
    // Sending an invalid mint amount
    await expect(
      contract
        .connect(user1)
        .mint(await (await contract.maxMintAmountPerTx()).add(1), {
          value: getPrice(
            SaleType.PUBLIC_SALE,
            await (await contract.maxMintAmountPerTx()).add(1).toNumber()
          ),
        })
    ).to.be.revertedWith("Invalid mint amount!");

    // Pause sale
    await contract.setPaused(true);
  });

  it("Owner only functions", async function () {
    await expect(
      contract
        .connect(externalUser)
        .mintForAddress(1, await externalUser.getAddress())
    ).to.be.revertedWith("Ownable: caller is not the owner");
    await expect(
      contract.connect(externalUser).setRevealed(false)
    ).to.be.revertedWith("Ownable: caller is not the owner");
    await expect(
      contract.connect(externalUser).setCost(utils.parseEther("0.0000001"))
    ).to.be.revertedWith("Ownable: caller is not the owner");
    await expect(
      contract.connect(externalUser).setMaxMintAmountPerTx(99999)
    ).to.be.revertedWith("Ownable: caller is not the owner");
    await expect(
      contract.connect(externalUser).setHiddenMetadataUri("INVALID_URI")
    ).to.be.revertedWith("Ownable: caller is not the owner");
    await expect(
      contract.connect(externalUser).setUriPrefix("INVALID_PREFIX")
    ).to.be.revertedWith("Ownable: caller is not the owner");
    await expect(
      contract.connect(externalUser).setUriSuffix("INVALID_SUFFIX")
    ).to.be.revertedWith("Ownable: caller is not the owner");
    await expect(
      contract.connect(externalUser).setPaused(false)
    ).to.be.revertedWith("Ownable: caller is not the owner");
    await expect(contract.connect(externalUser).withdraw()).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );
  });

  it("Wallet of owner", async function () {
    expect(await contract.tokensOfOwner(await owner.getAddress())).deep.equal([
      BigNumber.from(1),
    ]);
    expect(await contract.tokensOfOwner(await user1.getAddress())).deep.equal([
      BigNumber.from(2),
      BigNumber.from(4),
    ]);
    expect(await contract.tokensOfOwner(await user2.getAddress())).deep.equal([
      BigNumber.from(3),
      BigNumber.from(5),
    ]);
    expect(
      await contract.tokensOfOwner(await externalUser.getAddress())
    ).deep.equal([]);
  });

  it("Supply checks (long)", async function () {
    if (process.env.EXTENDED_TESTS === undefined) {
      this.skip();
    }

    const alreadyMinted = 5;
    const maxMintAmountPerTx = 1000;
    const iterations = Math.floor(
      (CollectionConfig.maxSupply - alreadyMinted) / maxMintAmountPerTx
    );
    const expectedTotalSupply = iterations * maxMintAmountPerTx + alreadyMinted;
    const lastMintAmount = CollectionConfig.maxSupply - expectedTotalSupply;
    expect(await contract.totalSupply()).to.equal(alreadyMinted);

    await contract.setPaused(false);
    await contract.setMaxMintAmountPerTx(maxMintAmountPerTx);

    await Promise.all(
      [...Array(iterations).keys()].map(
        async () =>
          await contract.connect(user1).mint(maxMintAmountPerTx, {
            value: getPrice(SaleType.PUBLIC_SALE, maxMintAmountPerTx),
          })
      )
    );

    // Try to mint over max supply (before sold-out)
    await expect(
      contract.connect(user2).mint(lastMintAmount + 1, {
        value: getPrice(SaleType.PUBLIC_SALE, lastMintAmount + 1),
      })
    ).to.be.revertedWith("Max supply exceeded!");
    await expect(
      contract.connect(user2).mint(lastMintAmount + 2, {
        value: getPrice(SaleType.PUBLIC_SALE, lastMintAmount + 2),
      })
    ).to.be.revertedWith("Max supply exceeded!");

    expect(await contract.totalSupply()).to.equal(expectedTotalSupply);

    // Mint last tokens with owner address and test walletOfOwner(...)
    await contract.connect(owner).mint(lastMintAmount, {
      value: getPrice(SaleType.PUBLIC_SALE, lastMintAmount),
    });
    const expectedWalletOfOwner = [BigNumber.from(1)];
    for (const i of [...Array(lastMintAmount).keys()].reverse()) {
      expectedWalletOfOwner.push(
        BigNumber.from(CollectionConfig.maxSupply - i)
      );
    }
    expect(
      await contract.tokensOfOwner(await owner.getAddress(), {
        // Set gas limit to the maximum value since this function should be used off-chain only and it would fail otherwise...
        gasLimit: BigNumber.from("0xffffffffffffffff"),
      })
    ).deep.equal(expectedWalletOfOwner);

    // Try to mint over max supply (after sold-out)
    await expect(
      contract
        .connect(user1)
        .mint(1, { value: getPrice(SaleType.PUBLIC_SALE, 1) })
    ).to.be.revertedWith("Max supply exceeded!");

    expect(await contract.totalSupply()).to.equal(CollectionConfig.maxSupply);
  });

  it("Token URI generation", async function () {
    const uriPrefix = "ipfs://__COLLECTION_CID__/";
    const uriSuffix = ".json";
    const totalSupply = await contract.totalSupply();

    expect(await contract.tokenURI(1)).to.equal(
      CollectionConfig.hiddenMetadataUri
    );

    // Reveal collection
    await contract.setUriPrefix(uriPrefix);
    await contract.setRevealed(true);

    // ERC721A uses token IDs starting from 0 internally...
    await expect(contract.tokenURI(0)).to.be.revertedWith(
      "ERC721Metadata: URI query for nonexistent token"
    );

    // Testing first and last minted tokens
    expect(await contract.tokenURI(1)).to.equal(`${uriPrefix}1${uriSuffix}`);
    expect(await contract.tokenURI(totalSupply)).to.equal(
      `${uriPrefix}${totalSupply}${uriSuffix}`
    );
  });
});
