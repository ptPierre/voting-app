// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

contract UpdatedVoting {
    struct Candidate {
        string name;
        uint256 voteCount;
    }

    struct VotingSession {
        string topic; // The topic of the voting session
        Candidate[] candidates;
        uint256 votingStart;
        uint256 votingEnd;
        mapping(address => bool) voters;
    }

    mapping(uint256 => VotingSession) public sessions; // Mapping of session ID to VotingSession
    uint256 public sessionCount; // Counter for session IDs
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }

    modifier validSession(uint256 _sessionId) {
        require(_sessionId > 0 && _sessionId <= sessionCount, "Invalid session ID");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function createVotingSession(
        string memory _topic,
        string[] memory _candidateNames,
        uint256 _durationInMinutes
    ) public onlyOwner {
        sessionCount++;
        VotingSession storage newSession = sessions[sessionCount];
        newSession.topic = _topic;
        newSession.votingStart = block.timestamp;
        newSession.votingEnd = block.timestamp + (_durationInMinutes * 1 minutes);

        for (uint256 i = 0; i < _candidateNames.length; i++) {
            newSession.candidates.push(Candidate({
                name: _candidateNames[i],
                voteCount: 0
            }));
        }
    }

    function addCandidateToSession(uint256 _sessionId, string memory _candidateName) 
        public 
        onlyOwner 
        validSession(_sessionId) 
    {
        require(bytes(_candidateName).length > 0, "Candidate name cannot be empty");
        require(
            block.timestamp < sessions[_sessionId].votingEnd,
            "Cannot add candidates to ended session"
        );

        sessions[_sessionId].candidates.push(Candidate({
            name: _candidateName,
            voteCount: 0
        }));
    }

    function vote(uint256 _sessionId, uint256 _candidateIndex) public {
        VotingSession storage session = sessions[_sessionId];
        require(block.timestamp >= session.votingStart, "Voting has not started yet");
        require(block.timestamp < session.votingEnd, "Voting has ended");
        require(!session.voters[msg.sender], "You have already voted in this session");
        require(_candidateIndex < session.candidates.length, "Invalid candidate index");

        session.candidates[_candidateIndex].voteCount++;
        session.voters[msg.sender] = true;
    }

    function getCandidates(uint256 _sessionId) public view returns (Candidate[] memory) {
        VotingSession storage session = sessions[_sessionId];
        return session.candidates;
    }

    function getVotingStatus(uint256 _sessionId) public view returns (bool) {
        VotingSession storage session = sessions[_sessionId];
        return (block.timestamp >= session.votingStart && block.timestamp < session.votingEnd);
    }

    function getRemainingTime(uint256 _sessionId) public view returns (uint256) {
        VotingSession storage session = sessions[_sessionId];
        require(block.timestamp >= session.votingStart, "Voting has not started yet");
        if (block.timestamp >= session.votingEnd) {
            return 0;
        }
        return session.votingEnd - block.timestamp;
    }

    function getSessionDetails(uint256 _sessionId) public view returns (
        string memory topic,
        uint256 votingStart,
        uint256 votingEnd,
        Candidate[] memory candidates
    ) {
        VotingSession storage session = sessions[_sessionId];
        topic = session.topic;
        votingStart = session.votingStart;
        votingEnd = session.votingEnd;
        candidates = session.candidates;
    }
}
