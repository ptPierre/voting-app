const hre = require("hardhat");
const ethers = require("ethers");

async function main() {
    const Voting = await hre.ethers.getContractFactory("Voting");
    const Voting_ = await Voting.deploy(["Mark", "John", "Paul"], 200);

    await Voting_.deployed();

    console.log("Contract address:", Voting_.address);

  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });