class VotingService {
    constructor() {
        this.contractAddress = "0xb544b2F8608b8332d816f6d3B8DBc1EE9E17c468";
        this.provider = null;
        this.signer = null;
        this.contract = null;
        this.contractAbi = [{
            "inputs": [],
            "stateMutability": "nonpayable",
            "type": "constructor"
          },
          {
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
          },
          {
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
          },
          {
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
          },
          {
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
          },
          {
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
          },
          {
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
          },
          {
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
          },
          {
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
          },
          {
            "inputs": [
              {
                "internalType": "uint256",
                "name": "_sessionId",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "_candidateIndex",
                "type": "uint256"
              }
            ],
            "name": "vote",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          }]; 
    }

    // Singleton pattern
    static getInstance() {
        if (!VotingService.instance) {
            VotingService.instance = new VotingService();
        }
        return VotingService.instance;
    }

    async initialize() {
        if (!window.ethereum) {
            throw new Error("MetaMask is not installed");
        }
        this.provider = new ethers.providers.Web3Provider(window.ethereum);
        this.signer = this.provider.getSigner();
        this.contract = new ethers.Contract(
            this.contractAddress,
            this.contractAbi,
            this.signer
        );
    }

    async connectWallet() {
        await this.initialize();
        await this.provider.send("eth_requestAccounts", []);
        const address = await this.signer.getAddress();
        return address;
    }

    async createVotingSession(topic, candidateNames, duration) {
        await this.initialize();
        const tx = await this.contract.createVotingSession(topic, candidateNames, duration);
        return await tx.wait();
    }

    async vote(sessionId, candidateId) {
        await this.initialize();
        const tx = await this.contract.vote(sessionId, candidateId);
        return await tx.wait();
    }

    async getActiveSessions() {
        await this.initialize();
        const sessionCount = await this.contract.sessionCount();
        const sessions = [];

        for (let i = 1; i <= sessionCount; i++) {
            const isActive = await this.contract.getVotingStatus(i);
            if (!isActive) continue;

            const session = await this.contract.getSessionDetails(i);
            const candidates = await this.contract.getCandidates(i);
            const remainingTime = await this.contract.getRemainingTime(i);

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
        await this.initialize();
        return await this.contract.getCandidates(sessionId);
    }

    async addCandidate(sessionId, candidateName) {
        await this.initialize();
        const tx = await this.contract.addCandidateToSession(sessionId, candidateName);
        return await tx.wait();
    }
} 