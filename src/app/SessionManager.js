class SessionManager {
    constructor() {
        // Initializes the SessionManager class and retrieves an instance of the VotingService
        this.votingService = VotingService.getInstance();
        this.initialize();
    }

    async initialize() {
        // Sets up event listeners needed for session management
        this.attachEventListeners();
    }

    attachEventListeners() {
        // Attaches a submit event listener to the session creation form

        const form = document.querySelector('form');
        if (form) {
            // Prevents the default form submission behavior and triggers the session creation process
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.createSession();
            });
        }
    }

    async createSession() {
        const topic = document.getElementById("sessionTopic").value;
        const candidateNames = document.getElementById("sessionCandidates").value
            .split(",")
            .map(name => name.trim())
            .filter(name => name.length > 0);
        const duration = document.getElementById("sessionDuration").value;

        if (!this.validateSessionInput(topic, candidateNames, duration)) {
            return;
        }

        const submitButton = document.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        UIUtils.showLoadingPopup('Creating new voting session...');

        try {
            // Initialize VotingService first
            await this.votingService.initialize();

            // Create session directly through smart contract
            const tx = await this.votingService.contract.createVotingSession(
                topic,
                candidateNames,
                duration
            );
            
            // Wait for transaction to be mined
            console.log('Waiting for transaction:', tx.hash);
            await tx.wait();
            console.log('Transaction confirmed');

            UIUtils.showNotification("Session created successfully!");
            this.resetForm();
        } catch (error) {
            console.error('Transaction failed:', error);
            UIUtils.showNotification("Failed to create session", 'error');
        } finally {
            UIUtils.hideLoadingPopup();
            submitButton.disabled = false;
            submitButton.innerHTML = 'Create Session';
        }
    }

    validateSessionInput(topic, candidateNames, duration) {
        // Validates the session input fields to ensure all required data is provided

        if (!topic || topic.trim().length === 0) {
            // Checks if the topic is provided and not empty
            UIUtils.showNotification("Please enter a valid topic", "error");
            return false;
        }

        if (candidateNames.length < 2) {
            // Ensures at least two candidate names are provided
            UIUtils.showNotification("Please enter at least 2 candidates", "error");
            return false;
        }

        if (!duration || duration < 1) {
            // Validates that a positive duration value is provided
            UIUtils.showNotification("Please enter a valid duration", "error");
            return false;
        }

        return true; // Returns true if all validations pass
    }

    resetForm() {
        // Clears all input fields in the session creation form

        document.getElementById("sessionTopic").value = ''; // Resets the topic field
        document.getElementById("sessionCandidates").value = ''; // Resets the candidates field
        document.getElementById("sessionDuration").value = ''; // Resets the duration field
    }
}

// Initialize the session manager when the DOM is fully loaded
window.addEventListener('DOMContentLoaded', () => {
    // Creates a global instance of SessionManager
    window.sessionManager = new SessionManager();
});
