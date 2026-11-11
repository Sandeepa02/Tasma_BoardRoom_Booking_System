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

    // Sync users from MongoDB to frontend localStorage
    async syncUsers() {
        try {
            const res = await fetch(`${API_BASE}/users`);
            if (res.ok) {
                const users = await res.json();
                if (Array.isArray(users) && users.length > 0) {
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
            return { success: false, error: err.message };
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
            return { success: false, error: err.message };
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
            return { success: false, error: err.message };
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
            return { success: false, error: err.message };
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
            return { success: false, error: err.message };
        }
    }
};
