# Basic Voting DApp with Hardhat on Holesky

## Overview

This project is a simple **Voting DApp** built using **Hardhat** and **Solidity**, and deployed on the **Holesky** network. The contract allows users to vote for candidates in an election, view the status of the election, and check the remaining time before the voting ends.

The smart contract allows:
- **Adding candidates** by the owner.
- **Voting for candidates** by users.
- **Viewing the voting status** and the **remaining time**.
- **Viewing vote counts** of all candidates.
### Install depedencies

```bash
npm install
```


### Deploy a new Smart Contract

Once the dependencies are installed, you can deploy the contract to the **Holesky** network with a custom voting duration.

To deploy the contract with a specific duration (in minutes), run:

```bash
npx hardhat run scripts/deploy.js --network holesky
```
### Environnement varibles in en .env
 ```bash
HOLESKY_RPC_URL= ""
PRIVATE_KEY= ""
CONTRACT_ADDRESS=""
```

### Run the application
```bash
node index.js
```
