// Seed data, localStorage access and shared app state
const STORAGE_USERS_KEY = 'tasma_br_users_v4';
const STORAGE_BOOKINGS_KEY = 'tasma_br_bookings_v4';
const STORAGE_SESSION_KEY = 'tasma_br_session_v4';

const defaultUsers = [
    {
        id: 'USR-001',
        email: 'john@company.com',
        password: 'password123',
        fullName: 'John Silva',
        empId: 'EMP001',
        department: 'Executive',
        role: 'employee',
        status: 'approved'
    },
    {
        id: 'USR-002',
        email: 'sarah@company.com',
        password: 'password123',
        fullName: 'Sarah Jenkins',
        empId: 'EMP002',
        department: 'Engineering',
        role: 'employee',
        status: 'pending'
    },
    {
        id: 'USR-ADMIN',
        email: 'admin@tasmagroup.com',
        password: 'admin123',
        fullName: 'System Administrator',
        empId: 'ADM-001',
        department: 'IT Department',
        role: 'admin',
        status: 'approved'
    }
];

const defaultBookings = [
    {
        id: 'BK-1001',
        token: 'BR-20260925-MB-A7F92K',
        userId: 'USR-001',
        userName: 'John Silva',
        empId: 'EMP001',
        email: 'john@company.com',
        boardroom: 'Main Boardroom',
        date: '2026-09-25',
        startTime: '09:00 AM',
        endTime: '10:00 AM',
        createdAt: '2026-09-20 10:15 AM',
        status: 'Confirmed'
    }
];

let currentUser = null;
let selectedBoardroom = 'Main Boardroom';
let selectedDate = '2026-09-25';
let selectedTimeSlot = null;
let currentCalendarDate = new Date(2026, 8, 1);

const timeSlotsList = [
    { start: '08:00 AM', end: '09:00 AM', label: '8:00 AM – 9:00 AM' },
    { start: '09:00 AM', end: '10:00 AM', label: '9:00 AM – 10:00 AM' },
    { start: '10:00 AM', end: '11:00 AM', label: '10:00 AM – 11:00 AM' },
    { start: '11:00 AM', end: '12:00 PM', label: '11:00 AM – 12:00 PM' },
    { start: '12:00 PM', end: '01:00 PM', label: '12:00 PM – 1:00 PM' },
    { start: '01:00 PM', end: '02:00 PM', label: '1:00 PM – 2:00 PM' },
    { start: '02:00 PM', end: '03:00 PM', label: '2:00 PM – 3:00 PM' },
    { start: '03:00 PM', end: '04:00 PM', label: '3:00 PM – 4:00 PM' },
    { start: '04:00 PM', end: '05:00 PM', label: '4:00 PM – 5:00 PM' },
    { start: '05:00 PM', end: '06:00 PM', label: '5:00 PM – 6:00 PM' }
];

const FULL_DAY_SLOT = { start: '08:00 AM', end: '06:00 PM', label: 'Full Day · 8:00 AM – 6:00 PM', fullDay: true };

function initStorage() {
    if (!localStorage.getItem(STORAGE_USERS_KEY)) {
        localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(defaultUsers));
    }
    if (!localStorage.getItem(STORAGE_BOOKINGS_KEY)) {
        localStorage.setItem(STORAGE_BOOKINGS_KEY, JSON.stringify(defaultBookings));
    }
}

function getUsers() {
    return JSON.parse(localStorage.getItem(STORAGE_USERS_KEY) || '[]');
}

function saveUsers(users) {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
}

function getBookings() {
    return JSON.parse(localStorage.getItem(STORAGE_BOOKINGS_KEY) || '[]');
}

function saveBookings(bookings) {
    localStorage.setItem(STORAGE_BOOKINGS_KEY, JSON.stringify(bookings));
}

/* Check count of approved users per dept */
function getDeptUserCount(deptName) {
    const users = getUsers();
    return users.filter(u => u.department === deptName && u.status === 'approved').length;
}