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

async function handleLogin(e) {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalContent = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Signing In...';
    }

    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        showToast('Please enter both email and password.', 'error');
        if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = originalContent; }
        return;
    }

    try {
        if (typeof api !== 'undefined') {
            const result = await api.login(email, password, 'employee');
            if (result.success) {
                currentUser = result.user;
                localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(result.user));
                await api.syncAll();
                showToast(`Welcome back, ${result.user.fullName}!`, 'success');
                launchApp();
                return;
            } else {
                showToast(result.error || 'Invalid email or password.', 'error');
                return;
            }
        }

        // Offline fallback to local cache
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
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalContent;
        }
    }
}

async function handleAdminLogin(e) {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalContent = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Verifying...';
    }

    const email = document.getElementById('adminEmail').value.trim().toLowerCase();
    const password = document.getElementById('adminPassword').value;

    if (!email || !password) {
        showToast('Please enter admin email and password.', 'error');
        if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = originalContent; }
        return;
    }

    try {
        if (typeof api !== 'undefined') {
            const result = await api.login(email, password, 'admin');
            if (result.success) {
                currentUser = result.user;
                localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(result.user));
                await api.syncAll();
                showToast('Admin Portal Access Granted', 'success');
                launchApp();
                switchNav('admin-panel');
                return;
            } else {
                showToast(result.error || 'Invalid Admin Credentials.', 'error');
                return;
            }
        }

        // Offline fallback
        const users = getUsers();
        const admin = users.find(u => u.email.toLowerCase() === email && u.password === password && u.role === 'admin');

        if (admin) {
            currentUser = admin;
            localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(admin));
            showToast('Admin Portal Access Granted', 'success');
            launchApp();
            switchNav('admin-panel');
        } else {
            showToast('Invalid Admin Credentials.', 'error');
        }
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalContent;
        }
    }
}

function logout() {
    localStorage.removeItem(STORAGE_SESSION_KEY);
    currentUser = null;
    document.getElementById('appSection').classList.add('hidden');
    document.getElementById('authSection').classList.remove('hidden');
    showToast('Logged out of TASMA Portal.', 'info');
}