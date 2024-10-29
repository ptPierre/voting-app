// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

/// @title Voting with delegation.
contract Ballot {
    struct Voter {
        bool voted;  // if true, that person already voted
        address delegate; // person delegated to
        uint vote;   // index of the voted proposal
    }

    struct Proposal {
        bytes32 name;   // short name (up to 32 bytes)
        uint voteCount; // number of accumulated votes
    }

    address public chairperson;
    Proposal[] public proposals;
    mapping(address => Voter) public voters;

    /// Create a new ballot to choose one of `proposalNames`.
    constructor(bytes32[] memory proposalNames) {
        chairperson = msg.sender;

        for (uint i = 0; i < proposalNames.length; i++) {
            proposals.push(Proposal({
                name: proposalNames[i],
                voteCount: 0
            }));
        }
    }

    // Function for the chairperson to add a new proposal
    function addProposal(bytes32 proposalName) external {
        require(msg.sender == chairperson, "Only chairperson can add proposals.");
        proposals.push(Proposal({
            name: proposalName,
            voteCount: 0
        }));
    }

    /// Vote on a proposal by index. Each address can only vote once.
    function vote(uint proposal) external {
        Voter storage sender = voters[msg.sender];
        require(!sender.voted, "Already voted."); // Check if the voter has already voted
        require(proposal < proposals.length, "Invalid proposal."); // Check if the proposal index is valid

        sender.voted = true; // Mark the voter as having voted
        sender.vote = proposal;

        // Increment the vote count for the selected proposal
        proposals[proposal].voteCount += 1;
    }

    /// Delegate your vote to another voter.
    function delegate(address to) external {
        Voter storage sender = voters[msg.sender];
        require(!sender.voted, "Already voted."); // Cannot delegate if already voted
        require(to != msg.sender, "Self-delegation is disallowed.");

        while (voters[to].delegate != address(0)) {
            to = voters[to].delegate;
            require(to != msg.sender, "Found loop in delegation.");
        }

        Voter storage delegate_ = voters[to];
        require(!delegate_.voted, "Delegate has already voted."); // Delegate must not have voted yet

        sender.voted = true;
        sender.delegate = to;

        if (delegate_.voted) {
            proposals[delegate_.vote].voteCount += 1;
        } else {
            delegate_.vote = sender.vote;
        }
    }

    /// Get the total votes for a specific proposal
    function getVoteCount(uint proposalIndex) external view returns (uint) {
        require(proposalIndex < proposals.length, "Invalid proposal index.");
        return proposals[proposalIndex].voteCount;
    }

    /// @dev Computes the winning proposal.
    function winningProposal() public view returns (uint winningProposal_) {
        uint winningVoteCount = 0;
        for (uint p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
                winningProposal_ = p;
            }
        }
    }

    /// Returns the name of the winning proposal.
    function winnerName() external view returns (bytes32 winnerName_) {
        winnerName_ = proposals[winningProposal()].name;
    }
}
