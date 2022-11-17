/**
* @type import('hardhat/config').HardhatUserConfig
*/
require('dotenv').config();
require("@nomiclabs/hardhat-ethers");
const { API_KEY, PRIVATE_KEY } = process.env;
module.exports = {
   solidity: "0.8.9",
   defaultNetwork: "goerli",
   networks: {
      hardhat: {},
      goerli: {
         url: `https://eth-goerli.alchemyapi.io/v2/${API_KEY}`,
         accounts: [`0x${PRIVATE_KEY}`]
      }
   },
}