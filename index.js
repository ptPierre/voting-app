require('dotenv').config();

const express = require('express');
const app = express();
const fileUpload = require('express-fileupload');
const path = require('path');
const ethers = require('ethers');
const csv = require('csv-parser');
const fs = require('fs');

app.use(fileUpload({ extended: true }));
app.use('/src', express.static(path.join(__dirname, 'src')));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.json());

const port = 3000;

const HOLESKY_RPC_URL = process.env.HOLESKY_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

const { abi } = require('./artifacts/contracts/UpdatedVoting.sol/UpdatedVoting.json');
const provider = new ethers.providers.JsonRpcProvider(HOLESKY_RPC_URL);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);
const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

// Load users from CSV
const users = new Map();
fs.createReadStream('data/users.csv')
    .pipe(csv())
    .on('data', (row) => {
        users.set(row.address, row.role);
    })
    .on('end', () => {
        console.log('Loaded users:', Array.from(users.entries()));
    });

// Middleware to check authentication and role
const checkAuth = async (req, res, next) => {
    const address = req.headers['x-user-address'];
    const role = users.get(address?.toLowerCase());
    
    if (!role) {
        res.redirect('/');
        return;
    }
    
    if (role !== 'admin' && (req.path === '/CreateSession.html' || req.path === '/ListVoters.html')) {
        res.redirect('/');
        return;
    }
    
    next();
};

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'pages', 'index.html'));
});

app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'pages', 'index.html'));
});

app.get('/CreateSession.html', checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'pages', 'CreateSession.html'));
});

app.get('/ListVoters.html', checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'pages', 'ListVoters.html'));
});

app.get('/api/auth', (req, res) => {
    const requestAddress = req.query.address.toLowerCase();
    console.log('Received auth request for address:', requestAddress);
    console.log('Available users:', Array.from(users.keys()));

    // Check if the address exists (case-insensitive)
    const userAddress = Array.from(users.keys()).find(
        addr => addr.toLowerCase() === requestAddress
    );

    if (userAddress) {
        const role = users.get(userAddress);
        console.log('Found user with role:', role);
        res.json({ authorized: true, role });
    } else {
        console.log('User not found');
        res.json({ authorized: false });
    }
});

// Add middleware to check admin rights
const requireAdmin = async (req, res, next) => {
    const address = req.headers['x-user-address'];
    const role = users.get(address?.toLowerCase());
    
    if (role === 'admin') {
        next();
    } else {
        res.status(403).send('Unauthorized');
    }
};

app.post("/createSession", requireAdmin, async (req, res) => {
    const { topic, candidateNames, duration } = req.body;

    try {
        console.log("Creating new voting session...");
        const tx = await contractInstance.createVotingSession(topic, candidateNames, duration);
        await tx.wait();
        res.status(200).send("Voting session created successfully!");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error creating voting session.");
    }
});

app.post("/addCandidateToSession", requireAdmin, async (req, res) => {
    const { sessionId, candidateName } = req.body;

    try {
        console.log(`Adding candidate '${candidateName}' to session ${sessionId}...`);
        const tx = await contractInstance.addCandidateToSession(sessionId, candidateName);
        await tx.wait();
        res.status(200).send("Candidate added successfully!");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error adding candidate.");
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
