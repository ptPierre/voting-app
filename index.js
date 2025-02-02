require('dotenv').config();

const express = require('express');
const app = express();
const fileUpload = require('express-fileupload');
const path = require('path');
const ethers = require('ethers');
const csv = require('csv-parser');
const fs = require('fs');
const session = require('express-session');
const cookieParser = require('cookie-parser');

app.use(fileUpload({ extended: true }));
app.use('/src', express.static(path.join(__dirname, 'src')));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(cookieParser());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

const port = 3002;

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
        users.set(row.address.trim(), row.role.trim());
    })
    .on('end', () => {
        console.log('Loaded users:', Array.from(users.entries()));
    });

// Middleware to check authentication and role
const checkAuth = async (req, res, next) => {
    const address = req.query.address;
    console.log('Checking auth for address:', address);
    
    if (!address) {
        if (req.session.user) {
            console.log('Using session user:', req.session.user);
            if (req.session.user.role === 'admin' || req.path === '/index.html') {
                next();
                return;
            }
        }
        res.redirect('/');
        return;
    }

    const role = users.get(address);
    
    if (!role) {
        console.log('No role found for address');
        res.redirect('/');
        return;
    }
    
    if (role !== 'admin' && (req.path === '/CreateSession.html' || req.path === '/ListVoters.html')) {
        console.log('Non-admin trying to access admin page');
        res.redirect('/');
        return;
    }
    
    req.session.user = {
        address: address,
        role: role
    };
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
    const requestAddress = req.query.address;
    console.log('Auth request for address:', requestAddress);
    const role = users.get(requestAddress);

    if (role) {
        console.log('Found role:', role);
        req.session.user = {
            address: requestAddress,
            role: role
        };
        res.json({ authorized: true, role });
    } else {
        console.log('No role found');
        res.json({ authorized: false });
    }
});

app.get('/api/check-session', (req, res) => {
    if (req.session.user) {
        res.json({ 
            authenticated: true, 
            user: req.session.user 
        });
    } else {
        res.json({ authenticated: false });
    }
});

// Add middleware to check admin rights
const requireAdmin = async (req, res, next) => {
    const address = req.headers['x-user-address'];
    console.log('Checking admin rights for:', address);
    // Check address case-insensitively
    const role = Array.from(users.keys()).find(
        addr => addr.toLowerCase() === address?.toLowerCase()
    );
    const userRole = role ? users.get(role) : null;
    console.log('User role:', userRole);
    
    if (userRole === 'admin') {
        next();
    } else {
        res.status(403).json({ 
            message: 'Unauthorized: Admin rights required',
            error: 'NOT_ADMIN'
        });
    }
};

app.post("/createSession", requireAdmin, async (req, res) => {
    const { topic, candidateNames, duration } = req.body;

    try {
        console.log("Creating session with params:", { topic, candidateNames, duration });
        
        if (!topic || !candidateNames || !duration) {
            return res.status(400).json({ 
                message: "Missing required parameters" 
            });
        }

        console.log("Creating new voting session...");
        const tx = await contractInstance.createVotingSession(topic, candidateNames, duration);
        console.log("Transaction sent:", tx.hash);
        await tx.wait();
        console.log("Transaction completed:", tx.hash);
        res.status(200).json({ 
            message: "Voting session created successfully!",
            transactionHash: tx.hash 
        });
    } catch (error) {
        console.error("Contract error:", error);
        res.status(500).json({ 
            message: error.message || "Error creating voting session",
            error: error.toString()
        });
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

app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            res.status(500).json({ error: 'Failed to logout' });
        } else {
            res.json({ success: true });
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
