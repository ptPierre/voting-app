require('dotenv').config();

requireStack: [
    'C:\\Users\\Eva\\Documents\\ESILV\\My project\\Vote NodeJS-Hardhat\\index.js'
  ]

const express = require('express');
const app = express();
const fileUpload = require('express-fileupload');
app.use(
    fileUpload({
        extended:true}
    )
)
app.use(express.static(__dirname))
app.use(express.json())
const path = require('path');
const ethers = require('ethers');

var port = 3000;

const HOLESKY_RPC_URL_URL = process.env.HOLESKY_RPC_URL_URL_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

const {abi} = require('./artifacts/contracts/Voting.sol/Voting.json');
const provider = new ethers.providers.JsonRpcProvider(HOLESKY_RPC_URL_URL);

const signer = new ethers.Wallet(PRIVATE_KEY, provider);

const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
})

app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
})

app.post("/addCandidate", async (req, res) => {
    var vote = req.body.vote;
    console.log(vote)
    async function storeDataInBlockchain(vote) {
        console.log("Adding the candidate in voting contract...");
        const tx = await contractInstance.addCandidate(vote);
        await tx.wait();
    }
})



app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
})
