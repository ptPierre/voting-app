class UIUtils {
    static showNotification(message, type = 'success') {
        // Displays a notification on the screen with a given message and type (success, error, etc.)
        const notification = document.createElement('div');
        notification.className = `notification ${type}`; // Adds appropriate styling based on the type
        notification.textContent = message; // Sets the notification message

        // Remove any existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(n => n.remove());

        document.body.appendChild(notification);

        // Force reflow
        void notification.offsetHeight;

        notification.classList.add('show'); // Adds the 'show' class to make the notification visible

        // Removes the notification after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300); // Ensures smooth removal
        }, 5000); // Show for 5 seconds
    }

    static formatTime(seconds) {
        // Converts a time in seconds to a human-readable format (e.g., "2d 3h 15m")
        if (seconds <= 0) return 'Ended'; // Returns "Ended" if the time is 0 or less
        
        const days = Math.floor(seconds / (24 * 60 * 60)); // Calculates days
        const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60)); // Calculates hours
        const minutes = Math.floor((seconds % (60 * 60)) / 60); // Calculates minutes

        let timeString = '';
        if (days > 0) timeString += `${days}d `;
        if (hours > 0) timeString += `${hours}h `;
        if (minutes > 0) timeString += `${minutes}m`;

        // Returns the formatted time or "< 1m" if the remaining time is less than a minute
        return timeString.trim() || '< 1m';
    }

    static renderSessionCard(session) {
        // Generates and returns the HTML for a voting session card
        return `
            <div class="session-card active">
                <div class="session-header">
                    <h3>${session.topic}</h3>
                    <span class="session-status active">Active</span>
                </div>
                <div class="session-info">
                    <p><strong>Session ID:</strong> ${session.id} (Use this ID to vote)</p>
                    <p><strong>Time Remaining:</strong> ${this.formatTime(session.remainingTime)}</p>
                </div>
                <div class="candidates-list">
                    <h4>Candidates:</h4>
                    <ul>
                        ${session.candidates.map((candidate, index) => `
                            <li>
                                <span class="candidate-name">${candidate.name}</span>
                                <span class="candidate-id">(ID: ${index})</span>
                            </li>
                        `).join('')} <!-- Maps candidates to a list item -->
                    </ul>
                </div>
                <div class="vote-actions">
                    <!-- Adds a button to vote in the session -->
                    <button onclick="window.votingApp.quickVote(${session.id})" class="vote-button">Vote in this Session</button>
                </div>
            </div>
        `;
    }

    static showLoadingPopup(message = 'Processing transaction...') {
        // Displays a loading popup with a custom message
        const existingPopup = document.querySelector('.loading-popup');
        if (existingPopup) existingPopup.remove(); // Removes any existing popup before creating a new one

        const popup = document.createElement('div');
        popup.className = 'loading-popup';
        popup.innerHTML = `
            <div class="loading-popup-content">
                <div class="loading-spinner"></div> <!-- Spinner for visual indication -->
                <p>${message}</p>
            </div>
        `;
        document.body.appendChild(popup); // Appends the popup to the DOM
    }

    static hideLoadingPopup() {
        // Hides and removes the loading popup
        const popup = document.querySelector('.loading-popup');
        if (popup) {
            popup.classList.add('fade-out'); // Adds a fade-out effect for smooth removal
            setTimeout(() => popup.remove(), 300); // Removes the popup after the fade-out effect
        }
    }
}
