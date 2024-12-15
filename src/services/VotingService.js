class VotingService {
    // Initializes the VotingService class with Ethereum contract details
    constructor() {
        this.contractAddress = "0x31F51048c5Db70651e4499776792BCBa3A63797F";
        this.provider = null;
        this.signer = null;
        this.contract = null;
        this.contractAbi = [{
          "inputs": [],
          "stateMutability": "nonpayable",
          "type": "constructor"
        }, {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "_sessionId",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "_candidateName",
              "type": "string"
            }
          ],
          "name": "addCandidateToSession",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        }, {
          "inputs": [
            {
              "internalType": "string",
              "name": "_topic",
              "type": "string"
            },
            {
              "internalType": "string[]",
              "name": "_candidateNames",
              "type": "string[]"
            },
            {
              "internalType": "uint256",
              "name": "_durationInMinutes",
              "type": "uint256"
            }
          ],
          "name": "createVotingSession",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        }, {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "_sessionId",
              "type": "uint256"
            }
          ],
          "name": "getCandidates",
          "outputs": [
            {
              "components": [
                {
                  "internalType": "string",
                  "name": "name",
                  "type": "string"
                },
                {
                  "internalType": "uint256",
                  "name": "voteCount",
                  "type": "uint256"
                }
              ],
              "internalType": "struct UpdatedVoting.Candidate[]",
              "name": "",
              "type": "tuple[]"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        }, {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "_sessionId",
              "type": "uint256"
            }
          ],
          "name": "getRemainingTime",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        }, {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "_sessionId",
              "type": "uint256"
            }
          ],
          "name": "getSessionDetails",
          "outputs": [
            {
              "internalType": "string",
              "name": "topic",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "votingStart",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "votingEnd",
              "type": "uint256"
            },
            {
              "components": [
                {
                  "internalType": "string",
                  "name": "name",
                  "type": "string"
                },
                {
                  "internalType": "uint256",
                  "name": "voteCount",
                  "type": "uint256"
                }
              ],
              "internalType": "struct UpdatedVoting.Candidate[]",
              "name": "candidates",
              "type": "tuple[]"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        }, {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "_sessionId",
              "type": "uint256"
            }
          ],
          "name": "getVotingStatus",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        }, {
          "inputs": [],
          "name": "owner",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        }, {
          "inputs": [],
          "name": "sessionCount",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        }, {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "name": "sessions",
          "outputs": [
            {
              "internalType": "string",
              "name": "topic",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "votingStart",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "votingEnd",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        }, {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "_sessionId",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "_candidateId",
              "type": "uint256"
            }
          ],
          "name": "vote",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        }]
    }

// Singleton pattern to ensure only one instance of VotingService
static getInstance() {
  if (!VotingService.instance) {
      VotingService.instance = new VotingService();
  }
  return VotingService.instance;
}

async initialize() {
    // Initializes the Ethereum connection and sets up the contract instance
    if (!window.ethereum) {
        console.error('MetaMask not found');
        throw new Error("MetaMask is not installed");
    }
    console.log('VotingService: Initializing');
    await window.ethereum.request({ method: 'eth_requestAccounts' }); // Requests access to user's Ethereum accounts
    this.provider = new ethers.providers.Web3Provider(window.ethereum);
    this.signer = this.provider.getSigner(); // Gets the signer for executing transactions
    this.contract = new ethers.Contract(
        this.contractAddress,
        this.contractAbi,
        this.signer
    );
    console.log('VotingService: Initialized successfully');
}

async connectWallet() {
    // Connects to MetaMask wallet and retrieves the user's address
    console.log('VotingService: Connecting wallet');
    await this.initialize();
    await this.provider.send("eth_requestAccounts", []); // Prompts user to connect their wallet
    const address = await this.signer.getAddress(); // Retrieves the connected wallet address
    console.log('VotingService: Connected address:', address);
    return address;
}

async createVotingSession(topic, candidateNames, duration) {
    // Creates a new voting session on the blockchain
    await this.initialize();
    UIUtils.showLoadingPopup('Creating voting session...');
    try {
        const tx = await this.contract.createVotingSession(topic, candidateNames, duration);
        await tx.wait(); // Waits for the transaction to be mined
        UIUtils.hideLoadingPopup();
        return true;
    } catch (error) {
        UIUtils.hideLoadingPopup();
        throw error;
    }
}

async vote(sessionId, candidateId) {
    // Casts a vote for a candidate in a specific voting session
    await this.initialize();
    console.log('Voting:', { sessionId, candidateId });
    UIUtils.showLoadingPopup('Submitting your vote...');
    
    try {
        const sessionIdInt = parseInt(sessionId);
        const candidateIdInt = parseInt(candidateId);
        
        if (isNaN(sessionIdInt) || isNaN(candidateIdInt)) {
            throw new Error('Invalid session ID or candidate ID');
        }
        
        const tx = await this.contract.vote(sessionIdInt, candidateIdInt);
        console.log('Vote transaction sent:', tx.hash);
        await tx.wait(); // Waits for the vote transaction to be mined
        UIUtils.hideLoadingPopup();
        return true;
    } catch (error) {
        UIUtils.hideLoadingPopup();
        // Handles specific error messages from the smart contract
        if (error.message.includes("You have already voted in this session")) {
            throw new Error("You have already voted in this session! Each address can only vote once.");
        } else if (error.message.includes("Voting has ended")) {
            throw new Error("This voting session has ended!");
        } else if (error.message.includes("Voting has not started yet")) {
            throw new Error("This voting session hasn't started yet!");
        } else if (error.message.includes("Invalid candidate index")) {
            throw new Error("Invalid candidate ID! Please check the available candidates.");
        }
        throw error;
    }
}

async getActiveSessions() {
    // Retrieves all active voting sessions from the blockchain
    await this.initialize();
    const sessionCount = await this.contract.sessionCount(); // Total number of sessions
    const sessions = [];

    for (let i = 1; i <= sessionCount; i++) {
        const isActive = await this.contract.getVotingStatus(i); // Checks if the session is active
        if (!isActive) continue;

        const session = await this.contract.getSessionDetails(i); // Fetches session details
        const candidates = await this.contract.getCandidates(i); // Fetches candidates in the session
        const remainingTime = await this.contract.getRemainingTime(i); // Fetches remaining time for the session

        sessions.push({
            id: i,
            topic: session.topic,
            candidates,
            remainingTime
        });
    }

    return sessions;
}

async getCandidates(sessionId) {
    // Retrieves the list of candidates for a specific voting session
    await this.initialize();
    return await this.contract.getCandidates(sessionId);
}

async addCandidate(sessionId, candidateName) {
    // Adds a new candidate to an existing voting session
    await this.initialize();
    UIUtils.showLoadingPopup('Adding candidate...');
    try {
        console.log('Adding candidate:', { sessionId, candidateName });
        const tx = await this.contract.addCandidateToSession(parseInt(sessionId), candidateName);
        console.log('Transaction sent:', tx.hash);
        await tx.wait(); // Waits for the transaction to be mined
        UIUtils.hideLoadingPopup();
        return true;
    } catch (error) {
        UIUtils.hideLoadingPopup();
        throw error;
    }
}
}