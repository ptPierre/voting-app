class CandidateManager {
    constructor() {
        this.votingService = VotingService.getInstance();
        this.initialize();
    }

    async initialize() {
        this.attachEventListeners();
    }

    attachEventListeners() {
        const listButton = document.querySelector('[data-action="list-candidates"]');
        if (listButton) {
            listButton.addEventListener('click', () => this.listCandidates());
        }

        const addButton = document.querySelector('[data-action="add-candidate"]');
        if (addButton) {
            addButton.addEventListener('click', () => this.addCandidate());
        }
    }

    async listCandidates() {
        const sessionId = document.getElementById("sessionIdManage").value;
        if (!this.validateSessionId(sessionId)) return;

        const candidatesList = document.getElementById("candidatesList");
        candidatesList.innerHTML = '<div class="loading">Fetching candidates...</div>';

        try {
            const candidates = await this.votingService.getCandidates(sessionId);
            candidatesList.innerHTML = this.renderCandidatesList(candidates);
        } catch (error) {
            UIUtils.showNotification(error.message, "error");
            candidatesList.innerHTML = '<div class="error">Error fetching candidates.</div>';
        }
    }

    async addCandidate() {
        const sessionId = document.getElementById("sessionIdManage").value;
        const candidateName = document.getElementById("newCandidateName").value;

        if (!this.validateInput(sessionId, candidateName)) return;

        const addButton = document.querySelector('[data-action="add-candidate"]');
        addButton.disabled = true;
        addButton.innerHTML = '<span class="loading-dots">Adding</span>';

        try {
            await this.votingService.addCandidate(sessionId, candidateName);
            UIUtils.showNotification("Candidate added successfully!");
            document.getElementById("newCandidateName").value = '';
            await this.listCandidates();
        } catch (error) {
            UIUtils.showNotification(error.message, "error");
        } finally {
            addButton.disabled = false;
            addButton.innerHTML = 'Add Candidate';
        }
    }

    validateSessionId(sessionId) {
        if (!sessionId || sessionId < 1) {
            UIUtils.showNotification("Please enter a valid session ID", "error");
            return false;
        }
        return true;
    }

    validateInput(sessionId, candidateName) {
        if (!this.validateSessionId(sessionId)) return false;

        if (!candidateName || candidateName.trim().length === 0) {
            UIUtils.showNotification("Please enter a valid candidate name", "error");
            return false;
        }
        return true;
    }

    renderCandidatesList(candidates) {
        if (!candidates || candidates.length === 0) {
            return '<div class="no-candidates">No candidates found for this session.</div>';
        }

        return `
            <ul>
                ${candidates.map((candidate, index) => `
                    <li>
                        <span class="candidate-name">${candidate.name}</span>
                        <span class="candidate-id">ID: ${index}</span>
                    </li>
                `).join('')}
            </ul>
        `;
    }
}

// Initialize the candidate manager
window.addEventListener('DOMContentLoaded', () => {
    window.candidateManager = new CandidateManager();
}); 