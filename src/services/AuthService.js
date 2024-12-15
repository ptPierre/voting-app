class AuthService {
    static getInstance() {
        // Implements a singleton pattern to ensure only one instance of AuthService exists
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    constructor() {
        // Initializes the AuthService class and checks the current user's session
        this.currentUser = null; // Holds the details of the currently authenticated user
        this.isAuthenticated = false; // Indicates whether a user is authenticated
        this.checkSession(); // Checks if there's an active session when the service is initialized
    }

    async checkSession() {
        // Checks if a session exists for the current user by making an API request
        try {
            const response = await fetch('/api/check-session'); // API call to check the session
            const data = await response.json(); // Parses the response data
            
            if (data.authenticated) {
                // If the user is authenticated, set currentUser and isAuthenticated
                this.currentUser = data.user;
                this.isAuthenticated = true;
            } else {
                // If not authenticated, reset currentUser and isAuthenticated
                this.currentUser = null;
                this.isAuthenticated = false;
            }
        } catch (error) {
            // Logs an error if the session check fails
            console.error('Error checking session:', error);
        }
    }

    async authenticateUser(address) {
        // Authenticates the user using their address and retrieves their role
        try {
            const response = await fetch(`/api/auth?address=${address}`, {
                headers: {
                    'x-user-address': address // Passes the user's address in the request headers
                }
            });
            const data = await response.json(); // Parses the response data
            
            if (data.authorized) {
                // If the user is authorized, set their details and authentication state
                this.currentUser = {
                    address: address,
                    role: data.role
                };
                this.isAuthenticated = true;
                return { success: true, role: data.role }; // Returns success with the user's role
            }
            return { success: false, message: "Address not authorized" }; // Returns failure if unauthorized
        } catch (error) {
            // Logs an error and returns a failure message if the authentication process fails
            console.error("Authentication error:", error);
            return { success: false, message: "Authentication failed" };
        }
    }

    logout() {
        // Logs out the user by resetting their state and notifying the server
        this.currentUser = null; // Clears the current user
        this.isAuthenticated = false; // Resets the authentication state
        fetch('/api/logout', { method: 'POST' }); // Sends a logout request to the server
    }

    isAdmin() {
        // Checks if the current user has the 'admin' role
        return this.isAuthenticated && this.currentUser?.role === 'admin';
    }

    isStudent() {
        // Checks if the current user has the 'student' role
        return this.isAuthenticated && this.currentUser?.role === 'student';
    }

    getCurrentUser() {
        // Retrieves the current user details from local storage
        const storedUser = localStorage.getItem('currentUser'); // Fetches user details from local storage
        console.log('Retrieved stored user:', storedUser);
        return storedUser ? JSON.parse(storedUser) : null; // Parses and returns the stored user or null if not found
    }
}
