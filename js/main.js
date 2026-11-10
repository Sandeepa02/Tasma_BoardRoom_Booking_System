// Entry point: seed storage on first run and restore an existing session
window.onload = function() {
    initStorage();
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