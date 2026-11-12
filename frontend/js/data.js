// Seed data, localStorage access and shared app state
const STORAGE_USERS_KEY = 'tasma_br_users_v5';
const STORAGE_BOOKINGS_KEY = 'tasma_br_bookings_v5';
const STORAGE_SESSION_KEY = 'tasma_br_session_v5';

// Real database mode - no hardcoded demo accounts or dummy bookings
const defaultUsers = [];
const defaultBookings = [];

const _now = new Date();
const _todayStr = `${_now.getFullYear()}-${String(_now.getMonth() + 1).padStart(2, '0')}-${String(_now.getDate()).padStart(2, '0')}`;

let currentUser = null;
let selectedBoardroom = 'Main Boardroom';
let selectedDate = _todayStr;
let selectedTimeSlot = null;
let currentCalendarDate = new Date();

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
    // Clear legacy storage versions with demo data
    try {
        localStorage.removeItem('tasma_br_users_v4');
        localStorage.removeItem('tasma_br_bookings_v4');
        localStorage.removeItem('tasma_br_session_v4');
    } catch (e) {}

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