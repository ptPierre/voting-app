const hre = require("hardhat");
const ethers = require("ethers");

// async function main() {
//   // Convert proposal names to bytes32 format
// //   const proposalNames = [
// //       ethers.utils.formatBytes32String("Eva"),
// //       ethers.utils.formatBytes32String("Pierre"),
// //       ethers.utils.formatBytes32String("Manon")
// //   ];
//   const votingDuration = 86400; // 1 day in seconds

//   const Voting = await ethers.getContractFactory("Ballot");
//   const voting = await Voting.deploy([ethers.utils.formatBytes32String("Eva"), ethers.utils.formatBytes32String("Pierre"), ethers.utils.formatBytes32String("Manon")]
//   , votingDuration);

//   await voting.deployed(); // Wait for contract deployment
//   console.log("Contract deployed to:", voting.address);
// }

// // Run the main function
// main().catch((error) => {
//   console.error(error);
//   process.exitCode = 1;
// });


async function main() {
    const MyContract = await getContractFactory("Ballot");
    const myContract = await MyContract.deploy(["Eva", "Pierre", "Manon"], votingDuration);
    console.log("Contract deployed to address:", myContract.address);

  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
