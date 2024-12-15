class SessionManager {
    constructor() {
        this.votingService = VotingService.getInstance();
        this.initialize();
    }

    async initialize() {
        this.attachEventListeners();
    }

    attachEventListeners() {
        const form = document.querySelector('form');
        if (form) {
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
        submitButton.innerHTML = '<span class="loading-dots">Creating Session</span>';

        try {
            await this.votingService.createVotingSession(topic, candidateNames, duration);
            UIUtils.showNotification("Session created successfully!");
            this.resetForm();
        } catch (error) {
            UIUtils.showNotification(error.message, 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = 'Create Session';
        }
    }

    validateSessionInput(topic, candidateNames, duration) {
        if (!topic || topic.trim().length === 0) {
            UIUtils.showNotification("Please enter a valid topic", "error");
            return false;
        }

        if (candidateNames.length < 2) {
            UIUtils.showNotification("Please enter at least 2 candidates", "error");
            return false;
        }

        if (!duration || duration < 1) {
            UIUtils.showNotification("Please enter a valid duration", "error");
            return false;
        }

        return true;
    }

    resetForm() {
        document.getElementById("sessionTopic").value = '';
        document.getElementById("sessionCandidates").value = '';
        document.getElementById("sessionDuration").value = '';
    }
}

// Initialize the session manager
window.addEventListener('DOMContentLoaded', () => {
    window.sessionManager = new SessionManager();
}); 