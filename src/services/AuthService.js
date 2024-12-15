class AuthService {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
    }

    static getInstance() {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    async authenticateUser(address) {
        try {
            console.log('Attempting to authenticate address:', address);
            const response = await fetch(`/api/auth?address=${address}`, {
                headers: {
                    'x-user-address': address
                }
            });
            const data = await response.json();
            console.log('Auth response:', data);
            
            if (data.authorized) {
                this.currentUser = {
                    address: address,
                    role: data.role
                };
                this.isAuthenticated = true;
                return { success: true, role: data.role };
            }
            return { success: false, message: "Address not authorized" };
        } catch (error) {
            console.error("Authentication error:", error);
            return { success: false, message: "Authentication failed" };
        }
    }

    isAdmin() {
        return this.isAuthenticated && this.currentUser?.role === 'admin';
    }

    isStudent() {
        return this.isAuthenticated && this.currentUser?.role === 'student';
    }

    logout() {
        this.currentUser = null;
        this.isAuthenticated = false;
    }
} 