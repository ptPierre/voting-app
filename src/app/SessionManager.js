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
        // Handles the creation of a new voting session

        const topic = document.getElementById("sessionTopic").value; // Retrieves the session topic
        const candidateNames = document.getElementById("sessionCandidates").value
            .split(",") // Splits the input string into an array
            .map(name => name.trim()) // Trims whitespace from each candidate name
            .filter(name => name.length > 0); // Removes empty strings from the array
        const duration = document.getElementById("sessionDuration").value; // Retrieves the session duration

        // Validates the input fields before proceeding
        if (!this.validateSessionInput(topic, candidateNames, duration)) {
            return;
        }

        const submitButton = document.querySelector('button[type="submit"]');
        submitButton.disabled = true; // Disables the submit button to prevent multiple clicks
        submitButton.innerHTML = '<span class="loading-dots">Creating Session</span>'; // Shows a loading indicator

        try {
            // Sends a request to the VotingService to create a new voting session
            await this.votingService.createVotingSession(topic, candidateNames, duration);
            // Displays a success message to the user
            UIUtils.showNotification("Session created successfully!");
            this.resetForm(); // Resets the form fields
        } catch (error) {
            // Displays an error message if the session creation fails
            UIUtils.showNotification(error.message, 'error');
        } finally {
            // Re-enables the submit button and resets its content
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
