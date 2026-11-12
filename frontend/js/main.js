// Entry point: seed storage on first run, sync with MongoDB backend, and restore an existing session
window.onload = async function() {
    initStorage();
    if (typeof api !== 'undefined') {
        try {
            await api.syncAll();
        } catch (err) {
            console.warn('API sync deferred:', err);
        }
    }
    const sessionData = localStorage.getItem(STORAGE_SESSION_KEY);
    if (sessionData) {
        try {
            currentUser = JSON.parse(sessionData);
            launchApp();
        } catch (e) {
            localStorage.removeItem(STORAGE_SESSION_KEY);
        }
    }
};