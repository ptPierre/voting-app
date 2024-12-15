const hre = require("hardhat");
const ethers = require("ethers");

async function main() {
    const Voting = await hre.ethers.getContractFactory("UpdatedVoting");
    const Voting_ = await Voting.deploy();

    await Voting_.deployed();

    console.log("Contract address:", Voting_.address);

  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });