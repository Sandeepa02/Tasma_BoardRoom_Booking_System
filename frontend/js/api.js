// API bridge connecting frontend to the Express + MongoDB backend
const API_BASE = window.location.port === '5000'
    ? '/api'
    : 'http://localhost:5000/api';

const api = {
    // Check if the backend server is reachable
    async checkHealth() {
        try {
            const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(2000) });
            return res.ok;
        } catch {
            return false;
        }
    },

    // Authenticate user/admin via MongoDB backend
    async login(email, password, role) {
        try {
            const payload = { email, password };
            if (role) payload.role = role;

            const res = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Invalid credentials.');
            }
            return { success: true, user: data.user };
        } catch (err) {
            const isConnectionError = err.name === 'TypeError' || (err.message && err.message.toLowerCase().includes('fetch'));
            const errorMsg = isConnectionError
                ? 'Backend server is not reachable. Please start the server using "npm start" on port 5000.'
                : err.message;
            return { success: false, error: errorMsg };
        }
    },

    // Sync users from MongoDB to frontend localStorage
    async syncUsers() {
        try {
            const res = await fetch(`${API_BASE}/users`);
            if (res.ok) {
                const users = await res.json();
                if (Array.isArray(users)) {
                    saveUsers(users);
                }
                return users;
            }
        } catch (err) {
            console.warn('Backend not reached, using localStorage cache for users.');
        }
        return getUsers();
    },

    // Sync bookings from MongoDB to frontend localStorage
    async syncBookings() {
        try {
            const res = await fetch(`${API_BASE}/bookings`);
            if (res.ok) {
                const bookings = await res.json();
                if (Array.isArray(bookings)) {
                    saveBookings(bookings);
                }
                return bookings;
            }
        } catch (err) {
            console.warn('Backend not reached, using localStorage cache for bookings.');
        }
        return getBookings();
    },

    // Full sync on startup
    async syncAll() {
        await Promise.allSettled([this.syncUsers(), this.syncBookings()]);
    },

    // Create user in MongoDB
    async createUser(userData) {
        try {
            const res = await fetch(`${API_BASE}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to create user');
            await this.syncUsers();
            return { success: true, data };
        } catch (err) {
            const isConnectionError = err.name === 'TypeError' || (err.message && err.message.toLowerCase().includes('fetch'));
            const errorMsg = isConnectionError
                ? 'Backend server is not reachable. Please start the server using "npm start" on port 5000.'
                : err.message;
            return { success: false, error: errorMsg };
        }
    },

    // Update user approval status in MongoDB
    async updateUserStatus(userId, status) {
        try {
            const res = await fetch(`${API_BASE}/users/${userId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to update user status');
            await this.syncUsers();
            return { success: true, data };
        } catch (err) {
            const isConnectionError = err.name === 'TypeError' || (err.message && err.message.toLowerCase().includes('fetch'));
            const errorMsg = isConnectionError
                ? 'Backend server is not reachable. Please start the server using "npm start" on port 5000.'
                : err.message;
            return { success: false, error: errorMsg };
        }
    },

    // Update profile in MongoDB
    async updateProfile(userId, profileData) {
        try {
            const res = await fetch(`${API_BASE}/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profileData)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to update profile');
            await this.syncUsers();
            return { success: true, data };
        } catch (err) {
            const isConnectionError = err.name === 'TypeError' || (err.message && err.message.toLowerCase().includes('fetch'));
            const errorMsg = isConnectionError
                ? 'Backend server is not reachable. Please start the server using "npm start" on port 5000.'
                : err.message;
            return { success: false, error: errorMsg };
        }
    },

    // Create booking in MongoDB
    async createBooking(bookingData) {
        try {
            const res = await fetch(`${API_BASE}/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingData)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to create booking');
            await this.syncBookings();
            return { success: true, data };
        } catch (err) {
            const isConnectionError = err.name === 'TypeError' || (err.message && err.message.toLowerCase().includes('fetch'));
            const errorMsg = isConnectionError
                ? 'Backend server is not reachable. Please start the server using "npm start" on port 5000.'
                : err.message;
            return { success: false, error: errorMsg };
        }
    },

    // Cancel booking in MongoDB
    async cancelBooking(bookingId) {
        try {
            const res = await fetch(`${API_BASE}/bookings/${bookingId}/cancel`, {
                method: 'PATCH'
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to cancel booking');
            await this.syncBookings();
            return { success: true, data };
        } catch (err) {
            const isConnectionError = err.name === 'TypeError' || (err.message && err.message.toLowerCase().includes('fetch'));
            const errorMsg = isConnectionError
                ? 'Backend server is not reachable. Please start the server using "npm start" on port 5000.'
                : err.message;
            return { success: false, error: errorMsg };
        }
    }
};
