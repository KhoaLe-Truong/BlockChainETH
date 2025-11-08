require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const SEPOLIA_URL = process.env.SEPOLIA_URL || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

const networks = {
  localhost: { url: "http://127.0.0.1:8545" }
};

// Chỉ thêm sepolia nếu đủ thông tin môi trường
if (SEPOLIA_URL && PRIVATE_KEY) {
  networks.sepolia = {
    url: SEPOLIA_URL,
    accounts: [PRIVATE_KEY]
  };
}

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: { optimizer: { enabled: true, runs: 200 } }
  },
  networks,
  gasReporter: { enabled: false }
};
