// Employee profile editing
function handleSaveProfile(e) {
    e.preventDefault();
    const fullName = document.getElementById('profileFullName').value.trim();
    const email = document.getElementById('profileEmail').value.trim().toLowerCase();

    currentUser.fullName = fullName;
    currentUser.email = email;

    const users = getUsers();
    const idx = users.findIndex(u => u.id === currentUser.id);
    if (idx !== -1) {
        users[idx] = currentUser;
        saveUsers(users);
        if (typeof api !== 'undefined') {
            api.updateProfile(currentUser.id, { fullName, email, department: currentUser.department });
        }
    }

    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(currentUser));
    showToast('Profile updated!', 'success');
    launchApp();
}