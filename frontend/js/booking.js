// Booking flow: boardroom selection, time slots, confirmation, My Bookings table
function selectBoardroom(name) {
    selectedBoardroom = name;
    selectedTimeSlots = [];
    selectedTimeSlot = null;

    const cardMain = document.getElementById('card-main-boardroom');
    const cardGlobal = document.getElementById('card-global-boardroom');

    if (name === 'Main Boardroom') {
        cardMain.className = "solid-card rounded-2xl p-5 border-2 transition-all duration-300 cursor-pointer relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 border-tasma-navy ring-2 ring-tasma-navy/10 bg-white dark:bg-slate-900";
        cardGlobal.className = "solid-card rounded-2xl p-5 border-2 border-transparent transition-all duration-300 cursor-pointer relative overflow-hidden group hover:shadow-lg hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-slate-700";
    } else {
        cardGlobal.className = "solid-card rounded-2xl p-5 border-2 transition-all duration-300 cursor-pointer relative overflow-hidden group hover:shadow-xl hover:-translate-y-1 border-tasma-orange ring-2 ring-tasma-orange/10 bg-white dark:bg-slate-900";
        cardMain.className = "solid-card rounded-2xl p-5 border-2 border-transparent transition-all duration-300 cursor-pointer relative overflow-hidden group hover:shadow-lg hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-slate-700";
    }

    document.getElementById('activeBoardroomTag').innerText = name;
    renderTimeSlots();
    updateSummaryDisplay();
}

function isFullDaySelected() {
    return Array.isArray(selectedTimeSlots) && selectedTimeSlots.some(s => s && s.fullDay);
}

function isSlotSelected(slot) {
    if (isFullDaySelected()) return true;
    return Array.isArray(selectedTimeSlots) && selectedTimeSlots.some(s => s && s.start === slot.start);
}

function sortSelectedSlots() {
    selectedTimeSlots.sort((a, b) => {
        const aIndex = timeSlotsList.findIndex(s => s.start === a.start);
        const bIndex = timeSlotsList.findIndex(s => s.start === b.start);
        return aIndex - bIndex;
    });
}

function isSlotBooked(slot, activeBookings) {
    return activeBookings.some(b => {
        if (b.fullDay) return true;
        if (Array.isArray(b.slots) && b.slots.length > 0) {
            return b.slots.some(s => {
                const sStart = typeof s === 'string' ? s.split('–')[0].split('-')[0].trim() : s.start;
                return sStart === slot.start;
            });
        }
        return b.startTime === slot.start;
    });
}

function getSelectedSlotsInfo() {
    if (!Array.isArray(selectedTimeSlots) || selectedTimeSlots.length === 0) {
        return {
            count: 0,
            label: 'None Selected',
            detailedLabel: 'None Selected',
            startTime: '',
            endTime: '',
            fullDay: false
        };
    }

    if (isFullDaySelected()) {
        return {
            count: 10,
            label: 'Full Day · 8:00 AM – 6:00 PM (10 hrs)',
            detailedLabel: 'Full Day Reservation (8:00 AM – 6:00 PM)',
            startTime: '08:00 AM',
            endTime: '06:00 PM',
            fullDay: true
        };
    }

    sortSelectedSlots();

    const count = selectedTimeSlots.length;
    const firstSlot = selectedTimeSlots[0];
    const lastSlot = selectedTimeSlots[selectedTimeSlots.length - 1];

    let isConsecutive = true;
    for (let i = 0; i < selectedTimeSlots.length - 1; i++) {
        const currIndex = timeSlotsList.findIndex(s => s.start === selectedTimeSlots[i].start);
        const nextIndex = timeSlotsList.findIndex(s => s.start === selectedTimeSlots[i + 1].start);
        if (nextIndex !== currIndex + 1) {
            isConsecutive = false;
            break;
        }
    }

    const durationText = `${count} ${count === 1 ? 'Hour' : 'Hours'}`;
    let label = '';
    if (count === 1) {
        label = `${firstSlot.label} (${durationText})`;
    } else if (isConsecutive) {
        label = `${firstSlot.start} – ${lastSlot.end} (${count} slots · ${durationText})`;
    } else {
        label = `${count} Slots (${durationText}): ` + selectedTimeSlots.map(s => s.start).join(', ');
    }

    const detailedLabel = selectedTimeSlots.map(s => s.label).join(' | ');

    return {
        count,
        label,
        detailedLabel,
        startTime: firstSlot.start,
        endTime: lastSlot.end,
        isConsecutive,
        fullDay: count === 10
    };
}

function toggleTimeSlot(slot) {
    if (isFullDaySelected()) {
        selectedTimeSlots = [slot];
    } else {
        const index = selectedTimeSlots.findIndex(s => s.start === slot.start);
        if (index >= 0) {
            selectedTimeSlots.splice(index, 1);
        } else {
            selectedTimeSlots.push(slot);
            sortSelectedSlots();
        }
    }
    selectedTimeSlot = selectedTimeSlots[0] || null;
    renderTimeSlots();
    updateSummaryDisplay();
}

function chooseTimeSlot(slot) {
    if (slot && slot.fullDay) {
        toggleFullDay();
    } else {
        toggleTimeSlot(slot);
    }
}

function toggleFullDay() {
    if (isFullDaySelected()) {
        selectedTimeSlots = [];
        selectedTimeSlot = null;
    } else {
        selectedTimeSlots = [FULL_DAY_SLOT];
        selectedTimeSlot = FULL_DAY_SLOT;
    }
    renderTimeSlots();
    updateSummaryDisplay();
}

function clearSelectedSlots() {
    selectedTimeSlots = [];
    selectedTimeSlot = null;
    renderTimeSlots();
    updateSummaryDisplay();
}

function selectAllAvailableSlots() {
    const allBookings = getBookings();
    const activeBookings = allBookings.filter(b =>
        b.date === selectedDate &&
        b.boardroom === selectedBoardroom &&
        b.status === 'Confirmed'
    );
    const availableSlots = timeSlotsList.filter(slot => !isSlotBooked(slot, activeBookings));
    if (availableSlots.length === 0) {
        showToast('No available slots for this date.', 'warning');
        return;
    }
    selectedTimeSlots = [...availableSlots];
    selectedTimeSlot = selectedTimeSlots[0] || null;
    renderTimeSlots();
    updateSummaryDisplay();
    showToast(`Selected ${availableSlots.length} available slot(s).`, 'info');
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

    // Full-day option: unavailable once any slot that day is reserved
    const fullDaySelected = isFullDaySelected();
    const fullDayBtn = document.createElement('button');
    fullDayBtn.type = 'button';

    if (activeBookings.length > 0) {
        fullDayBtn.className = "col-span-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/40 text-slate-400 flex items-center justify-between gap-3 opacity-70 cursor-not-allowed";
        fullDayBtn.disabled = true;
        fullDayBtn.innerHTML = `
            <span class="flex items-center gap-3">
                <span class="w-9 h-9 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-400 flex items-center justify-center"><i class="fa-solid fa-sun"></i></span>
                <span class="text-left">
                    <span class="text-xs font-bold block">Full Day Reservation</span>
                    <span class="text-[10px] font-mono">8:00 AM – 6:00 PM · existing reservations on this date</span>
                </span>
            </span>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-600 flex items-center gap-1">
                <i class="fa-solid fa-lock text-[9px]"></i> Not Available
            </span>
        `;
    } else if (fullDaySelected) {
        fullDayBtn.className = "col-span-full p-3 rounded-xl border-2 border-tasma-orange bg-tasma-orange text-white shadow-md flex items-center justify-between gap-3 cursor-pointer transition-all duration-200 scale-[1.01]";
        fullDayBtn.onclick = () => toggleFullDay();
        fullDayBtn.innerHTML = `
            <span class="flex items-center gap-3">
                <span class="w-9 h-9 rounded-lg bg-white/20 text-white flex items-center justify-center"><i class="fa-solid fa-sun"></i></span>
                <span class="text-left">
                    <span class="text-xs font-bold block">Full Day Reservation</span>
                    <span class="text-[10px] font-mono text-white/80">8:00 AM – 6:00 PM · all 10 slots</span>
                </span>
            </span>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-white/20 text-white flex items-center gap-1">
                <i class="fa-solid fa-check text-[9px]"></i> Selected (Click to Deselect)
            </span>
        `;
    } else {
        fullDayBtn.className = "col-span-full p-3 rounded-xl border-2 border-dashed border-tasma-navy/40 bg-white dark:bg-slate-900 hover:border-tasma-orange text-slate-800 dark:text-slate-100 flex items-center justify-between gap-3 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-98";
        fullDayBtn.onclick = () => toggleFullDay();
        fullDayBtn.innerHTML = `
            <span class="flex items-center gap-3">
                <span class="w-9 h-9 rounded-lg bg-tasma-navy text-white flex items-center justify-center"><i class="fa-solid fa-sun"></i></span>
                <span class="text-left">
                    <span class="text-xs font-bold block">Full Day Reservation</span>
                    <span class="text-[10px] text-slate-500 dark:text-slate-400 font-mono">8:00 AM – 6:00 PM · all 10 slots</span>
                </span>
            </span>
            <span class="text-[10px] font-bold text-tasma-orange flex items-center gap-1">
                Select Full Day <i class="fa-solid fa-chevron-right text-[9px]"></i>
            </span>
        `;
    }
    grid.appendChild(fullDayBtn);

    timeSlotsList.forEach(slot => {
        const isBooked = isSlotBooked(slot, activeBookings);
        const isSelected = isSlotSelected(slot);

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
            const selectionOrder = selectedTimeSlots.findIndex(s => s.start === slot.start) + 1;
            const badgeText = isFullDaySelected() ? 'Full Day' : (selectedTimeSlots.length > 1 ? `#${selectionOrder} Selected` : 'Selected');
            slotBtn.className = "p-3 rounded-xl border-2 border-tasma-orange bg-tasma-orange text-white shadow-md scale-[1.02] flex flex-col items-center justify-center gap-1 cursor-pointer transition-all duration-200 ring-2 ring-tasma-orange/20";
            slotBtn.onclick = () => toggleTimeSlot(slot);
            slotBtn.innerHTML = `
                <span class="text-xs font-bold font-mono">${slot.label}</span>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-white/20 text-white flex items-center gap-1">
                    <i class="fa-solid fa-circle-check text-[9px]"></i> ${badgeText}
                </span>
            `;
        } else {
            slotBtn.className = "p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-tasma-orange text-slate-700 dark:text-slate-200 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-95";
            slotBtn.onclick = () => toggleTimeSlot(slot);
            slotBtn.innerHTML = `
                <span class="text-xs font-semibold font-mono">${slot.label}</span>
                <span class="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <i class="fa-regular fa-square text-[9px]"></i> Available
                </span>
            `;
        }

        grid.appendChild(slotBtn);
    });
}

function updateSummaryDisplay() {
    const label = document.getElementById('selectedSlotSummary');
    const proceedBtn = document.getElementById('btnProceedBooking');
    const info = getSelectedSlotsInfo();

    if (info.count > 0) {
        label.innerHTML = `<span class="text-tasma-orange font-bold">${info.label}</span>`;
        proceedBtn.disabled = false;
        if (proceedBtn.querySelector('span')) {
            proceedBtn.querySelector('span').innerText = `Proceed (${info.count} ${info.count === 1 ? 'Slot' : 'Slots'})`;
        }
    } else {
        label.innerText = 'None Selected';
        proceedBtn.disabled = true;
        if (proceedBtn.querySelector('span')) {
            proceedBtn.querySelector('span').innerText = 'Proceed to Confirmation';
        }
    }
}

function generateUniqueToken(dateStr, boardroom) {
    const cleanDate = dateStr.replace(/-/g, '');
    const boardroomCode = boardroom.includes('Main') ? 'MB' : 'GB';
    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `BR-${cleanDate}-${boardroomCode}-${randomCode}`;
}

function openBookingConfirmationModal() {
    const info = getSelectedSlotsInfo();
    if (info.count === 0) {
        showToast('Please select at least one time slot.', 'error');
        return;
    }

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
                <div class="flex justify-between items-start">
                    <span class="text-slate-500 pt-0.5">Time Slot(s):</span>
                    <div class="text-right">
                        <span class="font-bold text-tasma-orange font-mono text-xs block">${info.label}</span>
                        ${!info.fullDay ? `
                            <div class="flex flex-wrap justify-end gap-1 mt-1.5 max-w-[280px]">
                                ${selectedTimeSlots.map(s => `<span class="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-mono font-medium">${s.label}</span>`).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
                <div class="pt-2 border-t border-slate-200 dark:border-slate-800">
                    <label for="bookingPurposeInput" class="block text-slate-600 dark:text-slate-300 font-semibold mb-1.5 flex items-center justify-between">
                        <span class="flex items-center gap-1.5">
                            <i class="fa-solid fa-clipboard-list text-tasma-orange text-xs"></i>
                            <span>Meeting Purpose <span class="text-rose-500 font-bold">*</span></span>
                        </span>
                        <span class="text-[10px] text-rose-500 font-bold uppercase tracking-wider">Required</span>
                    </label>
                    <input type="text" id="bookingPurposeInput" required class="w-full bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-tasma-orange focus:ring-2 focus:ring-tasma-orange/20 transition-all font-medium" placeholder="Enter meeting purpose (e.g. Project Discussion, Client Review)..." autocomplete="off" oninput="this.classList.remove('ring-2', 'ring-rose-500', 'border-rose-500')" />
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
                    <span>Confirm (${info.count} ${info.count === 1 ? 'Slot' : 'Slots'})</span>
                </button>
            </div>
        </div>
    `;

    modal.classList.remove('hidden');
}

function confirmAndCreateBooking() {
    const info = getSelectedSlotsInfo();
    if (info.count === 0) {
        showToast('Please select at least one time slot.', 'error');
        return;
    }

    const purposeInput = document.getElementById('bookingPurposeInput');
    const purpose = purposeInput ? purposeInput.value.trim() : '';

    if (!purpose) {
        showToast('Please enter the meeting purpose.', 'error');
        if (purposeInput) {
            purposeInput.focus();
            purposeInput.classList.add('ring-2', 'ring-rose-500', 'border-rose-500');
        }
        return;
    }

    const token = generateUniqueToken(selectedDate, selectedBoardroom);
    const now = new Date();
    const createdAtFormatted = now.toISOString().replace('T', ' ').substring(0, 16);

    const slotStarts = info.fullDay ? timeSlotsList.map(s => s.start) : selectedTimeSlots.map(s => s.start);
    const slotLabels = info.fullDay ? ['Full Day (8:00 AM – 6:00 PM)'] : selectedTimeSlots.map(s => s.label);

    const newBooking = {
        id: 'BK-' + Date.now(),
        token: token,
        userId: currentUser.id,
        userName: currentUser.fullName,
        empId: currentUser.empId,
        email: currentUser.email,
        boardroom: selectedBoardroom,
        date: selectedDate,
        startTime: info.startTime,
        endTime: info.endTime,
        slots: slotStarts,
        slotLabels: slotLabels,
        timeLabel: info.label,
        purpose: purpose,
        createdAt: createdAtFormatted,
        status: 'Confirmed',
        fullDay: !!info.fullDay
    };

    const bookings = getBookings();
    const doubleBooking = bookings.find(b => {
        if (b.date !== selectedDate || b.boardroom !== selectedBoardroom || b.status !== 'Confirmed') {
            return false;
        }
        if (info.fullDay || b.fullDay) return true;
        const bSlots = Array.isArray(b.slots) && b.slots.length > 0
            ? b.slots.map(s => typeof s === 'string' ? s.split('–')[0].split('-')[0].trim() : s.start)
            : [b.startTime];
        return slotStarts.some(s => bSlots.includes(s));
    });

    if (doubleBooking) {
        showToast('One or more selected slots are already booked! Please select available slots.', 'error');
        closeModal();
        renderTimeSlots();
        return;
    }

    bookings.push(newBooking);
    saveBookings(bookings);

    if (typeof api !== 'undefined') {
        api.createBooking(newBooking);
    }

    showToast(`Reservation confirmed for ${info.count} slot(s)!`, 'success');
    showSuccessPassModal(newBooking);

    selectedTimeSlots = [];
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
                <div class="font-semibold text-slate-800 dark:text-slate-200">${b.date}${b.fullDay ? ' <span class="ml-1 px-1.5 py-0.5 rounded bg-tasma-orange/10 text-tasma-orange text-[9px] font-bold uppercase align-middle">Full Day</span>' : ''}</div>
                <div class="text-[10px] text-slate-400 font-mono">${b.timeLabel || (b.startTime + ' - ' + b.endTime)}</div>
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
        if (typeof api !== 'undefined') {
            api.cancelBooking(bookingId);
        }
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