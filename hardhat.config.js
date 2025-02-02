require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

//require("@nomiclabs/hardhat-ethers")

 const HOLESKY_RPC_URL = process.env.HOLESKY_RPC_URL
 const PRIVATE_KEY = process.env.PRIVATE_KEY

 module.exports = {
     defaultNetwork: "holesky",
     networks: {
         hardhat: {
             // // If you want to do some forking, uncomment this
             // forking: {
             // url: MAINNET_RPC_URL
             // }
         },
         localhost: {
         },
         holesky: {
             url: HOLESKY_RPC_URL,
             accounts: [PRIVATE_KEY],
             saveDeployments: true,
         },
     },

  solidity: "0.8.0",
};