// Admin portal: account creation, approvals and department quota monitoring
const ALL_DEPTS = ["Co-operate", "Admin Department", "Marketing Department", "Credit Department", "HR Department", "Operations Department","IT Department", "Finance Department", "Procurement Department","Global Department","Audit Department", "Temporary Poll"];

async function adminCreateUser(e) {
    e.preventDefault();
    if (!currentUser || currentUser.role !== 'admin') return;

    const fullName = document.getElementById('regFullName').value.trim();
    const empId = document.getElementById('regEmpId').value.trim();
    const email = document.getElementById('regEmail').value.trim().toLowerCase();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    const department = document.getElementById('regDept').value;
    const role = document.getElementById('regRole') ? document.getElementById('regRole').value : 'employee';

    if (password !== confirmPassword) {
        showToast('Passwords do not match.', 'error');
        return;
    }

    const users = getUsers();
    if (users.some(u => u.email.toLowerCase() === email)) {
        showToast('Email address is already registered.', 'error');
        return;
    }

    if (role === 'employee' && getDeptUserCount(department) >= 3) {
        showToast(`Department '${department}' has reached maximum 3 members.`, 'error');
        return;
    }

    const newUser = {
        id: 'USR-' + Date.now(),
        fullName,
        empId,
        email,
        password,
        department,
        role,
        status: 'approved'
    };

    if (typeof api !== 'undefined') {
        const res = await api.createUser(newUser);
        if (!res.success) {
            showToast(res.error || 'Failed to create user in database.', 'error');
            return;
        }
    } else {
        users.push(newUser);
        saveUsers(users);
    }

    document.getElementById('adminCreateUserForm').reset();
    showToast(`${role === 'admin' ? 'Admin' : 'Employee'} account created for ${fullName}.`, 'success');
    renderAdminPanel();
}

function renderAdminPanel() {
    if (currentUser.role !== 'admin') return;

    const statsContainer = document.getElementById('departmentStatsContainer');
    statsContainer.innerHTML = '';

    ALL_DEPTS.forEach(dept => {
        const count = getDeptUserCount(dept);
        const isFull = count >= 3;

        const card = document.createElement('div');
        card.className = `p-3 rounded-xl border ${isFull ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800' : 'solid-card'} text-xs`;
        card.innerHTML = `
            <span class="text-slate-400 block text-[10px] uppercase font-bold truncate">${dept}</span>
            <div class="flex items-center justify-between mt-1">
                <span class="font-extrabold text-sm ${isFull ? 'text-amber-600' : 'text-tasma-navy dark:text-white'}">${count} / 3 Members</span>
                <span class="text-[9px] font-bold px-1.5 py-0.5 rounded ${isFull ? 'bg-amber-200 text-amber-900' : 'bg-emerald-100 text-emerald-800'}">${isFull ? 'FULL' : 'SLOTS OPEN'}</span>
            </div>
        `;
        statsContainer.appendChild(card);
    });

    const tbody = document.getElementById('adminUsersTableBody');
    tbody.innerHTML = '';

    const users = getUsers().filter(u => u.role !== 'admin');

    users.forEach(u => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-100/50 dark:hover:bg-slate-900/40 transition-colors";

        const deptCount = getDeptUserCount(u.department);
        const canApprove = deptCount < 3 || u.status === 'approved';

        let statusBadge = '';
        if (u.status === 'approved') {
            statusBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Approved</span>`;
        } else if (u.status === 'pending') {
            statusBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">Pending</span>`;
        } else {
            statusBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">Rejected</span>`;
        }

        tr.innerHTML = `
            <td class="px-5 py-3 font-bold text-slate-800 dark:text-slate-200">${u.fullName}</td>
            <td class="px-5 py-3 text-slate-500 font-mono text-[11px]">${u.empId}<br>${u.email}</td>
            <td class="px-5 py-3 font-semibold text-slate-700 dark:text-slate-300">${u.department}</td>
            <td class="px-5 py-3 text-[11px]">
                <span class="font-bold ${deptCount >= 3 ? 'text-amber-600' : 'text-emerald-600'}">${deptCount}/3 Users</span>
            </td>
            <td class="px-5 py-3">${statusBadge}</td>
            <td class="px-5 py-3 text-right space-x-1">
                ${u.status !== 'approved' ? `
                    <button onclick="adminApproveUser('${u.id}')" ${!canApprove ? 'disabled' : ''} title="${!canApprove ? 'Department Max (3) Reached' : 'Approve User'}" class="px-2.5 py-1 rounded-lg bg-emerald-600 disabled:opacity-30 text-white font-bold text-[11px] hover:bg-emerald-700">
                        Approve
                    </button>
                ` : ''}
                ${u.status !== 'rejected' ? `
                    <button onclick="adminRejectUser('${u.id}')" class="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-[11px] hover:bg-rose-700">
                        ${u.status === 'approved' ? 'Revoke' : 'Reject'}
                    </button>
                ` : ''}
            </td>
        `;

        tbody.appendChild(tr);
    });

    updateAdminBadge();
}

function adminApproveUser(userId) {
    const users = getUsers();
    const u = users.find(x => x.id === userId);
    if (!u) return;

    const deptCount = getDeptUserCount(u.department);
    if (deptCount >= 3) {
        showToast(`Cannot approve. ${u.department} has already reached the maximum of 3 members.`, 'error');
        return;
    }

    u.status = 'approved';
    saveUsers(users);
    if (typeof api !== 'undefined') {
        api.updateUserStatus(userId, 'approved');
    }
    showToast(`Account approved for ${u.fullName}`, 'success');
    renderAdminPanel();
}

function adminRejectUser(userId) {
    const users = getUsers();
    const u = users.find(x => x.id === userId);
    if (!u) return;

    u.status = 'rejected';
    saveUsers(users);
    if (typeof api !== 'undefined') {
        api.updateUserStatus(userId, 'rejected');
    }
    showToast(`Account rejected for ${u.fullName}`, 'info');
    renderAdminPanel();
}

function updateAdminBadge() {
    const pending = getUsers().filter(u => u.status === 'pending').length;
    document.getElementById('navPendingCount').innerText = pending;
}