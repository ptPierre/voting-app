class VotingApp {
    constructor() {
        // Initializes the VotingApp class by obtaining instances of VotingService and AuthService
        // Singleton pattern
        this.votingService = VotingService.getInstance();
        this.authService = AuthService.getInstance();
        this.initialize();
    }

    async initialize() {
        // Attaches event listeners and checks the user's session authentication status
        this.attachEventListeners();
        await this.authService.checkSession();
        if (this.authService.isAuthenticated) {
            // Displays the application content if the user is authenticated
            this.showAppContent();
        } else {
            // Displays the login screen if the user is not authenticated
            this.showLoginScreen();
        }
    }

    showLoginScreen() {
        // Displays the login screen and hides the application content
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('appContent').style.display = 'none';
    }

    showAppContent() {
        // Displays the application content and hides the login screen
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('appContent').style.display = 'block';
        this.updateNavigation(); // Updates navigation based on user role
        this.protectNavigation(); // Restricts access to admin-only pages if needed
    }

    protectNavigation() {
        // Sets up navigation protection based on user role
        if (!this.authService.isAdmin()) {
            // Prevents non-admin users from accessing admin-only pages
            window.addEventListener('click', (e) => {
                const link = e.target.closest('a');
                if (link && (
                    link.href.includes('CreateSession.html') || 
                    link.href.includes('ListVoters.html')
                )) {
                    e.preventDefault();
                    UIUtils.showNotification('Access denied. Admin rights required.', 'error');
                }
            });
        } else {
            // Enables navigation to admin-only pages for admin users
            console.log('Setting up admin navigation');
            window.addEventListener('click', (e) => {
                const link = e.target.closest('a');
                if (link && (
                    link.href.includes('CreateSession.html') || 
                    link.href.includes('ListVoters.html')
                )) {
                    e.preventDefault();
                    console.log('Admin clicking protected link:', link.href);
                    this.navigateToPage(link.href);
                }
            });
        }
    }

    updateNavigation() {
        // Updates the visibility of admin-only links based on the user's role
        const adminLinks = document.querySelectorAll('.admin-only');
        adminLinks.forEach(link => {
            link.style.display = this.authService.isAdmin() ? 'block' : 'none';
        });
    }

    attachEventListeners() {
        // Observes button clicks
        // Observer pattern
        const connectButton = document.querySelector('.login-box button');
        if (connectButton) {
            connectButton.addEventListener('click', () => this.connectMetamask());
        }
    }

    async connectMetamask() {
        // Handles the MetaMask connection and user authentication

        console.log('Attempting to connect to MetaMask');
        try {
            const address = await this.votingService.connectWallet(); // Connects to the wallet
            console.log('Got wallet address:', address);
            const authResult = await this.authService.authenticateUser(address); // Authenticates the user
            
            if (authResult.success) {
                // Displays success notification and shows the app content
                UIUtils.showNotification(`Connected as ${authResult.role}`);
                this.showAppContent();
            } else {
                // Displays an error message if authentication fails
                UIUtils.showNotification(authResult.message, 'error');
            }
        } catch (error) {
            // Handles connection errors
            console.error('Connection error:', error);
            UIUtils.showNotification(error.message, 'error');
        }
    }

    async listVotingSessions() {
        // Fetches and displays the list of active voting sessions
        //MVC: Controller

        const sessionsList = document.getElementById("sessionsList");
        UIUtils.showLoadingPopup('Fetching active sessions...');

        try {
            const sessions = await this.votingService.getActiveSessions(); // Fetches active sessions
            
            if (sessions.length === 0) {
                // Displays a message if no sessions are available
                sessionsList.innerHTML = '<div class="no-sessions">No active voting sessions available.</div>';
                UIUtils.hideLoadingPopup();
                return;
            }

            // Renders the sessions as HTML cards
            const html = `
                <div class="sessions-grid">
                    ${sessions.map(session => UIUtils.renderSessionCard(session)).join('')}
                </div>
            `;
            sessionsList.innerHTML = html;
            UIUtils.hideLoadingPopup();
        } catch (error) {
            // Displays an error message if fetching sessions fails
            console.error("Error fetching sessions:", error);
            sessionsList.innerHTML = '<div class="error">Error fetching sessions and candidates.</div>';
            UIUtils.hideLoadingPopup();
        }
    }

    async vote() {
        // Handles the voting process for a selected session and candidate

        const sessionId = document.getElementById("sessionId").value; // Retrieves the session ID
        const candidateId = document.getElementById("candidateId").value; // Retrieves the candidate ID
        const voteButton = document.querySelector('.vote-button');
        
        try {
            voteButton.disabled = true; // Disables the vote button to prevent duplicate submissions
            voteButton.innerHTML = '<span class="loading-dots">Voting</span>'; // Shows a loading indicator
            
            await this.votingService.vote(sessionId, candidateId); // Submits the vote
            UIUtils.showNotification("Vote submitted successfully!");
            await this.listVotingSessions(); // Updates the list of sessions
        } catch (error) {
            // Displays an error message if the voting process fails
            UIUtils.showNotification(error.message, 'error');
        } finally {
            voteButton.disabled = false; // Re-enables the vote button
            voteButton.innerHTML = 'Submit Vote';
        }
    }

    quickVote(sessionId) {
        // Prepares the voting section for a quick vote by setting the session ID and scrolling to the section
        document.getElementById('sessionId').value = sessionId;
        document.querySelector('.voting-section').scrollIntoView({ behavior: 'smooth' });
    }

    navigateToPage(url) {
        // Navigates to a specified URL
        window.location.href = url;
    }
}

// Initialize the application when the DOM is fully loaded
window.addEventListener('DOMContentLoaded', () => {
    try {
        // Creates a global instance of VotingApp
        window.votingApp = new VotingApp();
        console.log('VotingApp initialized successfully');
    } catch (error) {
        // Logs an error if initialization fails
        console.error('Error initializing VotingApp:', error);
    }
});
