// App shell: launching after login, sidebar navigation, theme toggle
function launchApp() {
    const authSec = document.getElementById('authSection');
    const appSec = document.getElementById('appSection');
    authSec.classList.add('hidden');
    appSec.classList.remove('hidden');
    appSec.classList.remove('animate-fade-in');
    void appSec.offsetWidth;
    appSec.classList.add('animate-fade-in');

    const initials = currentUser.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    document.getElementById('sidebarAvatar').innerText = initials;
    document.getElementById('sidebarUserName').innerText = currentUser.fullName;
    document.getElementById('sidebarUserDept').innerText = `${currentUser.empId} • ${currentUser.department}`;

    document.getElementById('profileBigAvatar').innerText = initials;
    document.getElementById('profileDisplayName').innerText = currentUser.fullName;
    document.getElementById('profileEmpTag').innerText = currentUser.empId;
    document.getElementById('profileEmpId').value = currentUser.empId;
    document.getElementById('profileDept').value = currentUser.department;
    document.getElementById('profileFullName').value = currentUser.fullName;
    document.getElementById('profileEmail').value = currentUser.email;

    const adminNavItem = document.getElementById('nav-admin-panel');
    if (currentUser.role === 'admin') {
        adminNavItem.classList.remove('hidden');
        adminNavItem.classList.add('flex');
        document.getElementById('portalRoleBadge').innerText = "Admin Portal";
    } else {
        adminNavItem.classList.add('hidden');
        adminNavItem.classList.remove('flex');
        document.getElementById('portalRoleBadge').innerText = "Boardroom Booking";
    }

    switchNav('dashboard');
    renderCalendar();
    renderTimeSlots();
    updateBookingBadge();
    updateAdminBadge();
}

function switchNav(viewId) {
    ['dashboard', 'my-bookings', 'profile', 'admin-panel'].forEach(v => {
        const elem = document.getElementById(`view-${v}`);
        if (elem) elem.classList.add('hidden');

        const navItem = document.getElementById(`nav-${v}`);
        if (navItem) {
            navItem.className = "nav-item flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all hover:text-white hover:bg-slate-800 text-slate-400";
            // className reset above wipes 'hidden', so re-hide the admin link for employees
            if (v === 'admin-panel' && currentUser.role !== 'admin') {
                navItem.classList.add('hidden');
            }
        }
    });

    const targetView = document.getElementById(`view-${viewId}`);
    if (targetView) {
        targetView.classList.remove('hidden');
        targetView.classList.remove('animate-fade-in-up');
        void targetView.offsetWidth; // re-trigger animation
        targetView.classList.add('animate-fade-in-up');
    }

    const activeNavItem = document.getElementById(`nav-${viewId}`);
    if (activeNavItem) {
        activeNavItem.className = "nav-item flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all text-white bg-tasma-navy shadow-sm";
    }

    const titles = {
        'dashboard': 'Boardroom Reservation',
        'my-bookings': 'My Bookings History',
        'profile': 'Employee Profile',
        'admin-panel': 'Admin Portal & Account Approvals'
    };
    document.getElementById('pageTitle').innerText = titles[viewId] || 'Dashboard';

    if (viewId === 'my-bookings') renderMyBookingsTable();
    if (viewId === 'admin-panel') renderAdminPanel();

    if (window.innerWidth < 768) {
        document.getElementById('sidebar').classList.add('-translate-x-full');
    }
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('-translate-x-full');
}

function toggleTheme() {
    document.documentElement.classList.toggle('dark');
}
