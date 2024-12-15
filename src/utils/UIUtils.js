class UIUtils {
    static showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        notification.offsetHeight; // Trigger reflow
        notification.classList.add('show');

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    static formatTime(seconds) {
        if (seconds <= 0) return 'Ended';
        
        const days = Math.floor(seconds / (24 * 60 * 60));
        const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((seconds % (60 * 60)) / 60);
        
        let timeString = '';
        if (days > 0) timeString += `${days}d `;
        if (hours > 0) timeString += `${hours}h `;
        if (minutes > 0) timeString += `${minutes}m`;
        
        return timeString.trim() || '< 1m';
    }

    static renderSessionCard(session) {
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
                        `).join('')}
                    </ul>
                </div>
                <div class="vote-actions">
                    <button onclick="VotingApp.quickVote(${session.id})" class="vote-button">Vote in this Session</button>
                </div>
            </div>
        `;
    }
} 