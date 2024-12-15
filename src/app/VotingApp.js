class VotingApp {
    constructor() {
        this.votingService = VotingService.getInstance();
        this.authService = AuthService.getInstance();
        this.initialize();
    }

    async initialize() {
        this.attachEventListeners();
        await this.checkAuthentication();
    }

    async checkAuthentication() {
        if (!this.authService.isAuthenticated) {
            this.showLoginScreen();
        } else {
            this.showAppContent();
        }
    }

    showLoginScreen() {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('appContent').style.display = 'none';
    }

    showAppContent() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('appContent').style.display = 'block';
        this.updateNavigation();
        this.protectNavigation();
    }

    protectNavigation() {
        if (!this.authService.isAdmin()) {
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
        }
    }

    updateNavigation() {
        const adminLinks = document.querySelectorAll('.admin-only');
        adminLinks.forEach(link => {
            link.style.display = this.authService.isAdmin() ? 'block' : 'none';
        });
    }

    attachEventListeners() {
        // Smooth scroll for internal links
        document.addEventListener('click', (e) => {
            if (e.target.tagName === 'A' && e.target.getAttribute('href')?.startsWith('#')) {
                e.preventDefault();
                const targetId = e.target.getAttribute('href').slice(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    }

    async connectMetamask() {
        try {
            const address = await this.votingService.connectWallet();
            const authResult = await this.authService.authenticateUser(address);
            
            if (authResult.success) {
                UIUtils.showNotification(`Connected as ${authResult.role}`);
                this.showAppContent();
            } else {
                UIUtils.showNotification(authResult.message, 'error');
            }
        } catch (error) {
            UIUtils.showNotification(error.message, 'error');
        }
    }

    async listVotingSessions() {
        const sessionsList = document.getElementById("sessionsList");
        sessionsList.innerHTML = '<div class="loading">Fetching active sessions...</div>';

        try {
            const sessions = await this.votingService.getActiveSessions();
            
            if (sessions.length === 0) {
                sessionsList.innerHTML = '<div class="no-sessions">No active voting sessions available.</div>';
                return;
            }

            const html = `
                <div class="sessions-grid">
                    ${sessions.map(session => UIUtils.renderSessionCard(session)).join('')}
                </div>
            `;
            sessionsList.innerHTML = html;
        } catch (error) {
            console.error("Error fetching sessions:", error);
            sessionsList.innerHTML = '<div class="error">Error fetching sessions and candidates.</div>';
        }
    }

    async vote() {
        const sessionId = document.getElementById("sessionId").value;
        const candidateId = document.getElementById("candidateId").value;
        const voteButton = document.querySelector('.vote-button');
        
        try {
            voteButton.disabled = true;
            voteButton.innerHTML = '<span class="loading-dots">Voting</span>';
            
            await this.votingService.vote(sessionId, candidateId);
            UIUtils.showNotification("Vote submitted successfully!");
            await this.listVotingSessions();
        } catch (error) {
            UIUtils.showNotification(error.message, 'error');
        } finally {
            voteButton.disabled = false;
            voteButton.innerHTML = 'Submit Vote';
        }
    }

    quickVote(sessionId) {
        document.getElementById('sessionId').value = sessionId;
        document.querySelector('.voting-section').scrollIntoView({ behavior: 'smooth' });
    }
}

// Initialize the application
window.addEventListener('DOMContentLoaded', () => {
    try {
        window.votingApp = new VotingApp();
        console.log('VotingApp initialized successfully');
    } catch (error) {
        console.error('Error initializing VotingApp:', error);
    }
}); 