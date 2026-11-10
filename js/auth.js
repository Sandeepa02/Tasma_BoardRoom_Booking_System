// Authentication: login, admin sign-in, logout (account creation is admin-only, see admin.js)
function switchAuthTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const adminForm = document.getElementById('adminForm');

    const tabLoginBtn = document.getElementById('tabLoginBtn');
    const tabAdminBtn = document.getElementById('tabAdminBtn');

    loginForm.classList.add('hidden');
    adminForm.classList.add('hidden');

    tabLoginBtn.className = "flex-1 py-2 text-xs font-semibold rounded-lg transition-all text-slate-600 dark:text-slate-400 hover:text-slate-900";
    tabAdminBtn.className = "flex-1 py-2 text-xs font-semibold rounded-lg transition-all text-slate-600 dark:text-slate-400 hover:text-slate-900";

    if (tab === 'login') {
        loginForm.classList.remove('hidden');
        tabLoginBtn.className = "flex-1 py-2 text-xs font-semibold rounded-lg transition-all text-white bg-tasma-navy shadow-sm";
    } else if (tab === 'admin') {
        adminForm.classList.remove('hidden');
        tabAdminBtn.className = "flex-1 py-2 text-xs font-semibold rounded-lg transition-all text-white bg-tasma-orange shadow-sm";
    }
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value;

    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email && u.password === password);

    if (!user) {
        showToast('Invalid email or password.', 'error');
        return;
    }

    if (user.status === 'pending') {
        showToast('Account pending admin approval. Please contact system admin.', 'error');
        return;
    }

    if (user.status === 'rejected') {
        showToast('Account registration request was rejected by admin.', 'error');
        return;
    }

    currentUser = user;
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(user));
    showToast(`Welcome back, ${user.fullName}!`, 'success');
    launchApp();
}

function handleAdminLogin(e) {
    e.preventDefault();
    const email = document.getElementById('adminEmail').value.trim().toLowerCase();
    const password = document.getElementById('adminPassword').value;

    const users = getUsers();
    const admin = users.find(u => u.email.toLowerCase() === email && u.password === password && u.role === 'admin');

    if (admin) {
        currentUser = admin;
        localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(admin));
        showToast('Admin Portal Access Granted', 'success');
        launchApp();
    } else {
        showToast('Invalid Admin Credentials.', 'error');
    }
}

function logout() {
    localStorage.removeItem(STORAGE_SESSION_KEY);
    currentUser = null;
    document.getElementById('appSection').classList.add('hidden');
    document.getElementById('authSection').classList.remove('hidden');
    showToast('Logged out of TASMA Portal.', 'info');
}