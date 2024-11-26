require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ethers");
require("hardhat-deploy");
require("hardhat-deploy-ethers");
require("@chainlink/env-enc").config();
require("./task");

const PRIVATE_KEY = process.env.PRIVATE_KEY
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL
const AMOY_RPC_URL = process.env.AMOY_RPC_URL

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.27",
  namedAccounts:{
    firstAccount:{
      default:0
    }
  },
  networks:{
    sepolia:{
      chainId:11155111,
      url:SEPOLIA_RPC_URL,
      accounts:[PRIVATE_KEY],
      blockConfirmations:6
    },
    amoy:{
      chainId:80002,
      url:AMOY_RPC_URL,
      accounts:[PRIVATE_KEY],
      blockConfirmations:6
    }
  }
};
