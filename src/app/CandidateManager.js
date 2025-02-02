class CandidateManager {
    constructor() {
        // Initializes the CandidateManager class and retrieves an instance of the VotingService
        this.votingService = VotingService.getInstance();
        this.initialize();
    }

    async initialize() {
        // Sets up the necessary event listeners for candidate management actions
        this.attachEventListeners();
    }

    attachEventListeners() {
        // Attaches click event listeners to the "list candidates" and "add candidate" buttons

        const listButton = document.querySelector('[data-action="list-candidates"]');
        if (listButton) {
            // Handles listing candidates when the "list candidates" button is clicked
            listButton.addEventListener('click', () => this.listCandidates());
        }

        const addButton = document.querySelector('[data-action="add-candidate"]');
        if (addButton) {
            // Handles adding a new candidate when the "add candidate" button is clicked
            addButton.addEventListener('click', () => this.addCandidate());
        }
    }

    async listCandidates() {
        // Fetches and displays the list of candidates for a given session ID

        const sessionId = document.getElementById("sessionIdManage").value;
        if (!this.validateSessionId(sessionId)) return;

        const candidatesList = document.getElementById("candidatesList");
        candidatesList.innerHTML = '<div class="loading">Fetching candidates...</div>';

        try {
            // Fetches candidates from the VotingService
            const candidates = await this.votingService.getCandidates(sessionId);
            // Renders the fetched candidates to the candidates list
            candidatesList.innerHTML = this.renderCandidatesList(candidates);
        } catch (error) {
            // Displays an error message if fetching candidates fails
            UIUtils.showNotification(error.message, "error");
            candidatesList.innerHTML = '<div class="error">Error fetching candidates.</div>';
        }
    }

    async addCandidate() {
        // Adds a new candidate to the session and updates the candidate list

        const sessionId = document.getElementById("sessionIdManage").value;
        const candidateName = document.getElementById("newCandidateName").value;

        if (!this.validateInput(sessionId, candidateName)) return;

        const addButton = document.querySelector('[data-action="add-candidate"]');
        addButton.disabled = true;
        addButton.innerHTML = '<span class="loading-dots">Adding</span>';

        try {
            console.log('Adding candidate:', { sessionId, candidateName });
            await this.votingService.addCandidate(sessionId, candidateName);
            // Notifies the user of success and refreshes the candidate list
            UIUtils.showNotification("Candidate added successfully!");
            document.getElementById("newCandidateName").value = '';
            await this.listCandidates();
        } catch (error) {
            console.error('Error adding candidate:', error);
            // Displays an error message if adding the candidate fails
            UIUtils.showNotification(error.message, "error");
        } finally {
            // Re-enables the "add candidate" button and resets its content
            addButton.disabled = false;
            addButton.innerHTML = 'Add Candidate';
        }
    }

    validateSessionId(sessionId) {
        // Validates the session ID, ensuring it is a positive non-empty value

        if (!sessionId || sessionId < 1) {
            UIUtils.showNotification("Please enter a valid session ID", "error");
            return false;
        }
        return true;
    }

    validateInput(sessionId, candidateName) {
        // Validates the session ID and candidate name inputs

        if (!this.validateSessionId(sessionId)) return false;

        if (!candidateName || candidateName.trim().length === 0) {
            UIUtils.showNotification("Please enter a valid candidate name", "error");
            return false;
        }
        return true;
    }

    renderCandidatesList(candidates) {
        // Renders the list of candidates as an HTML string

        if (!candidates || candidates.length === 0) {
            // Displays a message if no candidates are found
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

// Initialize the candidate manager when the DOM is fully loaded
window.addEventListener('DOMContentLoaded', () => {
    // Creates a global instance of CandidateManager
    window.candidateManager = new CandidateManager();
});
