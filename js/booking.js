// Booking flow: boardroom selection, time slots, confirmation, My Bookings table
function selectBoardroom(name) {
    selectedBoardroom = name;
    selectedTimeSlot = null;

    const cardMain = document.getElementById('card-main-boardroom');
    const cardGlobal = document.getElementById('card-global-boardroom');

    if (name === 'Main Boardroom') {
        cardMain.className = "solid-card rounded-2xl p-5 border-2 transition-all cursor-pointer relative overflow-hidden group hover:shadow-md border-tasma-navy ring-2 ring-tasma-navy/10 bg-white dark:bg-slate-900";
        cardGlobal.className = "solid-card rounded-2xl p-5 border-2 border-transparent transition-all cursor-pointer relative overflow-hidden group hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700";
    } else {
        cardGlobal.className = "solid-card rounded-2xl p-5 border-2 transition-all cursor-pointer relative overflow-hidden group hover:shadow-md border-tasma-orange ring-2 ring-tasma-orange/10 bg-white dark:bg-slate-900";
        cardMain.className = "solid-card rounded-2xl p-5 border-2 border-transparent transition-all cursor-pointer relative overflow-hidden group hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700";
    }

    document.getElementById('activeBoardroomTag').innerText = name;
    renderTimeSlots();
    updateSummaryDisplay();
}

function renderTimeSlots() {
    const grid = document.getElementById('timeSlotsGrid');
    grid.innerHTML = '';

    const allBookings = getBookings();
    const activeBookings = allBookings.filter(b =>
        b.date === selectedDate &&
        b.boardroom === selectedBoardroom &&
        b.status === 'Confirmed'
    );

    timeSlotsList.forEach(slot => {
        const isBooked = activeBookings.some(b => b.startTime === slot.start);
        const isSelected = selectedTimeSlot && selectedTimeSlot.start === slot.start;

        const slotBtn = document.createElement('button');
        slotBtn.type = 'button';

        if (isBooked) {
            slotBtn.className = "p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/40 text-slate-400 cursor-not-allowed flex flex-col items-center justify-center gap-1 opacity-70";
            slotBtn.disabled = true;
            slotBtn.innerHTML = `
                <span class="text-xs font-semibold font-mono">${slot.label}</span>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-600 flex items-center gap-1">
                    <i class="fa-solid fa-lock text-[9px]"></i> Reserved
                </span>
            `;
        } else if (isSelected) {
            slotBtn.className = "p-3 rounded-xl border-2 border-tasma-orange bg-tasma-orange text-white shadow-sm flex flex-col items-center justify-center gap-1 cursor-pointer transition-all";
            slotBtn.onclick = () => chooseTimeSlot(slot);
            slotBtn.innerHTML = `
                <span class="text-xs font-bold font-mono">${slot.label}</span>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-white/20 text-white flex items-center gap-1">
                    <i class="fa-solid fa-check text-[9px]"></i> Selected
                </span>
            `;
        } else {
            slotBtn.className = "p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-tasma-orange text-slate-700 dark:text-slate-200 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all hover:shadow-sm";
            slotBtn.onclick = () => chooseTimeSlot(slot);
            slotBtn.innerHTML = `
                <span class="text-xs font-semibold font-mono">${slot.label}</span>
                <span class="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <i class="fa-solid fa-circle text-[6px]"></i> Available
                </span>
            `;
        }

        grid.appendChild(slotBtn);
    });
}

function chooseTimeSlot(slot) {
    selectedTimeSlot = slot;
    renderTimeSlots();
    updateSummaryDisplay();
}

function updateSummaryDisplay() {
    const label = document.getElementById('selectedSlotSummary');
    const proceedBtn = document.getElementById('btnProceedBooking');

    if (selectedTimeSlot) {
        label.innerText = `${selectedTimeSlot.label}`;
        proceedBtn.disabled = false;
    } else {
        label.innerText = 'None Selected';
        proceedBtn.disabled = true;
    }
}

function generateUniqueToken(dateStr, boardroom) {
    const cleanDate = dateStr.replace(/-/g, '');
    const boardroomCode = boardroom.includes('Main') ? 'MB' : 'GB';
    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `BR-${cleanDate}-${boardroomCode}-${randomCode}`;
}

function openBookingConfirmationModal() {
    if (!selectedTimeSlot) return;

    const modal = document.getElementById('globalModal');
    const content = document.getElementById('modalContent');

    const [y, m, d] = selectedDate.split('-');
    const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    const formattedDate = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });

    content.innerHTML = `
        <div class="p-6 space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div class="flex items-center gap-2">
                    <img src="assets/images/tasma-logo.png" class="h-6 object-contain" alt="Tasma Logo">
                    <h3 class="text-sm font-bold text-slate-900 dark:text-white">Confirm TASMA Booking</h3>
                </div>
                <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>

            <div class="bg-slate-50 dark:bg-slate-950 rounded-xl p-4 space-y-3 text-xs border border-slate-200 dark:border-slate-800">
                <div class="flex justify-between">
                    <span class="text-slate-500">Boardroom:</span>
                    <span class="font-bold text-slate-900 dark:text-slate-200">${selectedBoardroom}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-slate-500">Scheduled Date:</span>
                    <span class="font-bold text-slate-900 dark:text-slate-200">${formattedDate}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-slate-500">Time Slot:</span>
                    <span class="font-bold text-tasma-orange font-mono">${selectedTimeSlot.label}</span>
                </div>
                <div class="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
                    <span class="text-slate-500">Reserved By:</span>
                    <span class="font-bold text-slate-900 dark:text-slate-200">${currentUser.fullName} (${currentUser.empId})</span>
                </div>
            </div>

            <div class="flex gap-3 pt-2">
                <button onclick="closeModal()" class="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-100">
                    Cancel
                </button>
                <button onclick="confirmAndCreateBooking()" class="flex-1 py-2.5 rounded-xl bg-tasma-navy hover:bg-tasma-navyHover text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5">
                    <i class="fa-solid fa-check"></i>
                    <span>Confirm Reservation</span>
                </button>
            </div>
        </div>
    `;

    modal.classList.remove('hidden');
}

function confirmAndCreateBooking() {
    const token = generateUniqueToken(selectedDate, selectedBoardroom);
    const now = new Date();
    const createdAtFormatted = now.toISOString().replace('T', ' ').substring(0, 16);

    const newBooking = {
        id: 'BK-' + Date.now(),
        token: token,
        userId: currentUser.id,
        userName: currentUser.fullName,
        empId: currentUser.empId,
        email: currentUser.email,
        boardroom: selectedBoardroom,
        date: selectedDate,
        startTime: selectedTimeSlot.start,
        endTime: selectedTimeSlot.end,
        createdAt: createdAtFormatted,
        status: 'Confirmed'
    };

    const bookings = getBookings();
    const doubleBooking = bookings.find(b =>
        b.date === selectedDate &&
        b.boardroom === selectedBoardroom &&
        b.startTime === selectedTimeSlot.start &&
        b.status === 'Confirmed'
    );

    if (doubleBooking) {
        showToast('Slot already booked! Please select another time.', 'error');
        closeModal();
        renderTimeSlots();
        return;
    }

    bookings.push(newBooking);
    saveBookings(bookings);

    showToast('Reservation confirmed!', 'success');
    showSuccessPassModal(newBooking);

    selectedTimeSlot = null;
    renderTimeSlots();
    renderCalendar();
    updateSummaryDisplay();
    updateBookingBadge();
}

function renderMyBookingsTable() {
    const tbody = document.getElementById('myBookingsTableBody');
    const emptyState = document.getElementById('emptyBookingsState');
    const searchVal = document.getElementById('bookingSearchInput').value.toLowerCase();
    const statusFilter = document.getElementById('bookingStatusFilter').value;

    tbody.innerHTML = '';

    const allBookings = getBookings();
    let userBookings = allBookings.filter(b => b.userId === currentUser.id);

    if (statusFilter !== 'ALL') {
        userBookings = userBookings.filter(b => b.status === statusFilter);
    }
    if (searchVal) {
        userBookings = userBookings.filter(b =>
            b.token.toLowerCase().includes(searchVal) ||
            b.boardroom.toLowerCase().includes(searchVal)
        );
    }

    if (userBookings.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    } else {
        emptyState.classList.add('hidden');
    }

    userBookings.reverse().forEach(b => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-100/50 dark:hover:bg-slate-900/40 transition-colors";

        const isConfirmed = b.status === 'Confirmed';
        const statusBadge = isConfirmed
            ? `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Confirmed</span>`
            : `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">Cancelled</span>`;

        tr.innerHTML = `
            <td class="px-5 py-3.5 font-mono font-bold text-tasma-navy dark:text-tasma-orange">${b.token}</td>
            <td class="px-5 py-3.5 font-bold text-slate-800 dark:text-slate-200">${b.boardroom}</td>
            <td class="px-5 py-3.5">
                <div class="font-semibold text-slate-800 dark:text-slate-200">${b.date}</div>
                <div class="text-[10px] text-slate-400 font-mono">${b.startTime} - ${b.endTime}</div>
            </td>
            <td class="px-5 py-3.5 text-slate-400 text-[11px]">${b.createdAt}</td>
            <td class="px-5 py-3.5">${statusBadge}</td>
            <td class="px-5 py-3.5 text-right space-x-1">
                <button onclick='viewBookingDetail(${JSON.stringify(b)})' title="View Details" class="p-1.5 rounded-lg text-slate-500 hover:text-tasma-navy hover:bg-slate-100">
                    <i class="fa-solid fa-eye"></i>
                </button>
                ${isConfirmed ? `
                    <button onclick="downloadPDFPass('${b.id}')" title="Download PDF" class="p-1.5 rounded-lg text-slate-500 hover:text-tasma-orange hover:bg-slate-100">
                        <i class="fa-solid fa-download"></i>
                    </button>
                    <button onclick="cancelBooking('${b.id}')" title="Cancel Booking" class="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100">
                        <i class="fa-solid fa-ban"></i>
                    </button>
                ` : ''}
            </td>
        `;

        tbody.appendChild(tr);
    });
}

function cancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this boardroom reservation?')) return;

    const bookings = getBookings();
    const index = bookings.findIndex(b => b.id === bookingId);

    if (index !== -1) {
        bookings[index].status = 'Cancelled';
        saveBookings(bookings);
        showToast('Booking cancelled.', 'info');
        renderMyBookingsTable();
        renderTimeSlots();
        renderCalendar();
        updateBookingBadge();
    }
}

function updateBookingBadge() {
    const count = getBookings().filter(b => b.userId === currentUser.id && b.status === 'Confirmed').length;
    document.getElementById('navBookingCount').innerText = count;
}