require("dotenv").config();
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-truffle5");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("@nomiclabs/hardhat-solhint");
require("hardhat-contract-sizer");
require("@openzeppelin/hardhat-upgrades");

const PRIVATE_KEY = process.env.PRIVATE_KEY;

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  // print the private keys
  const accounts = await hre.ethers.getSigners();
  const address = accounts[0].address;
  const balance = await hre.ethers.provider.getBalance(address);
  console.log("Address: ", address);
  console.log("Balance: ", hre.ethers.utils.formatEther(balance));
});
//0x7f37c4f9c647DC1736f5Da761B7797c36BAa2A75
// add token to tokenregistry contract
task("add-token", "Add token to token registry")
  .addParam("token", "Token address", false, types.string)
  .setAction(async (taskArgs, hre) => {
    const { ethers } = hre;
    const tokenRegistry = await hre.ethers.getContractAt(
      "FantomTokenRegistry",
      "0x7f37c4f9c647DC1736f5Da761B7797c36BAa2A75"
    );
    const tx = await tokenRegistry.add(taskArgs.token);
    const receipt = await tx.wait();
    console.log("Token added to registry:", receipt);
  });

task("set-price-feed", "set oracle on price feed").setAction(
  async (taskArgs, hre) => {
    const { ethers } = hre;
    const priceFeed = await hre.ethers.getContractAt(
      "FantomPriceFeed",
      "0x5De7a78bD519514dED63Ab91F51Fe0310b4b17E6"
    );
    const tx = await priceFeed.registerOracle(
      "0xf1277d1Ed8AD466beddF92ef448A132661956621",
      "0xe04676B9A9A2973BCb0D1478b5E1E9098BBB7f3D"
    );
    const receipt = await tx.wait();
    console.log("registered price for token", receipt);
  }
);

// deploy dai and usdc contracts
task("deploy-dai-usdc", "deploy dai and usdc contracts").setAction(
  async (taskArgs, hre) => {
    //deploy contract
    //get deployer account
    const [deployer] = await hre.ethers.getSigners();
    const Dai = await hre.ethers.getContractFactory("Dai");
    const dai = await Dai.deploy();
    await dai.deployed();
    console.log("Dai deployed to:", dai.address);
    const USDC = await hre.ethers.getContractFactory("Usdc");
    const usdc = await USDC.deploy();
    await usdc.deployed();
    console.log("USDC deployed to:", usdc.address);
  }
);

task("deploy-artion", "deploy artion 721").setAction(async (taskArgs, hre) => {
  //deploy contract
  //get deployer account
  const [deployer] = await hre.ethers.getSigners();
  const Artion721 = await hre.ethers.getContractFactory("Artion721");
  const artion721 = await Artion721.deploy(
    "IR",
    "Default Collection for IR",
    deployer.address,
    hre.ethers.utils.parseEther(".1")
  );
  await artion721.deployed();
  console.log("Artion721 deployed to:", artion721.address);
});

//mint nft
task("mint-shoes-nft", "mint nft").setAction(async (taskArgs, hre) => {
  const tokenUri =
    "https://artion.mypinata.cloud/ipfs/QmNxEbKeyn5igQcnxqq8dfk6ebTaYtnDREEZTkVNHwDRLJ/";
  const receiver = "0x75965652aC872E3A9fd3c9ad8E290473c23d763c";
  const contract = "0x053901f1b1b18e9f0e6fe63b153ccef3042fc6b5";
  const NFT = await hre.ethers.getContractFactory("FantomNFTTradable"); //FantomArtTradable, FantomNFTTradable
  const nft = await NFT.attach(contract);
  for (i = 1; i <= 3; i++) {
    const tx = await nft.mint(receiver, tokenUri + i, {
      value: hre.ethers.utils.parseEther("0.1"),
    });
    const receipt = await tx.wait();
    console.log("NFT minted:", receipt.transactionHash);
  }
});

// get tokenUri
task("get-token-uri", "get tokenUri").setAction(async (taskArgs, hre) => {
  const NFT = await hre.ethers.getContractFactory("FantomArtTradable"); //FantomArtTradable, FantomNFTTradable
  const nft = await NFT.attach("0x79d44a6EbB9E173BF8527D89c7cF568c6D8c483D");
  const tokenUri = await nft.uri("1");
  console.log("Token URI:", tokenUri);
});

// Deploy the contract
task("create-nft-collection", "create a new NFT collection").setAction(
  async (taskArgs, hre) => {
    const erc1155Info = {
      address: "0x3a8c3eA861Ca1Ffc709b27c5187562c298221776",
      name: "FantomArtFactory",
    };
    const erc721Info = {
      address: "0x22ED03fc5d40e0a2cf4f21CBD0452E8B6f814a30",
      name: "FantomNFTFactory",
    };

    const factoryInfo = erc721Info;
    const factory = await hre.ethers.getContractAt(
      factoryInfo.name,
      factoryInfo.address
    );

    await factory.updatePlatformFee(hre.ethers.utils.parseEther("0.1"));
    const platformFee = await factory.platformFee();
    console.log("Platform fee: ", hre.ethers.utils.formatEther(platformFee));

    await factory.updateMintFee(hre.ethers.utils.parseEther("0.1"));
    const mintFee = await factory.mintFee();
    console.log("Mint fee: ", hre.ethers.utils.formatEther(mintFee));

    const tx = await factory.createNFTContract("Fantasy", "FANTASY", {
      value: hre.ethers.utils.parseEther("0.1"),
    });
    const receipt = await tx.wait();
    console.log("NFT contract deployed to:", receipt);

    // const { ethers } = hre;
    // const [deployer] = await ethers.getSigners();
    // const signer = deployer; // for simplicity
    // console.log("Deploying contracts with the account:", deployer.address);
    // console.log("Account balance:", (await deployer.getBalance()).toString());
    // console.log("Signer address:", signer.address);

    // const transactionCount = await deployer.getTransactionCount();
    // const airdropDeployedAddress = getContractAddress({
    //   from: deployer.address,
    //   nonce: transactionCount + 1, //add 1 to the nonce to get the address of the airdrop contract since it will be deployed after the ParaToken contract
    // });

    // const ParaToken = await ethers.getContractFactory("ParaToken");
    // const paraToken = await ParaToken.deploy(
    //   "Para Token",
    //   "para",
    //   airdropDeployedAddress
    // );
    // console.log("ParaToken deployed to:", paraToken.address);

    // const authorizedMerkleClaimant = {
    //   claimer: taskArgs.merkleClaimAddress,
    //   amount: ethers.utils.parseUnits(taskArgs.merkleClaimAmount, 18),
    // };
    // const merkleTree = generateMerkleTree([authorizedMerkleClaimant]);
    // const merkleRoot = merkleTree.getHexRoot();
    // console.log(
    //   "Merkle root:",
    //   merkleRoot,
    //   " calculated for claimant: ",
    //   authorizedMerkleClaimant.claimer,
    //   " with amount: ",
    //   authorizedMerkleClaimant.amount.toString(),
    //   " in wei"
    // );

    // const Airdrop = await ethers.getContractFactory("Airdrop");
    // const airdrop = await Airdrop.deploy(
    //   merkleRoot,
    //   signer.address,
    //   paraToken.address
    // );
    // console.log("Airdrop deployed to:", airdrop.address);
  }
);

module.exports = {
  solidity: {
    version: "0.8.0",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  gasReporter: {
    currency: "USD",
    enabled: false,
    gasPrice: 50,
  },
  networks: {
    mainnet: {
      url: `https://fantom-mainnet.public.blastapi.io	`,
      chainId: 250,
      accounts: [`0x${PRIVATE_KEY}`],
    },
    testnet: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/S2fsBdDO0wxUKFELcz-AOqwatw1eaWkF`,
      chainId: 80001,
      accounts: [`0x${PRIVATE_KEY}`],
    },
    coverage: {
      url: "http://localhost:8555",
    },

    localhost: {
      url: `http://127.0.0.1:8545`,
    },
  },
  etherscan: {
    apiKey: "46DD6NK19R2AZQQIJIY1FXR85HKM2XSNBE",
  },
};
