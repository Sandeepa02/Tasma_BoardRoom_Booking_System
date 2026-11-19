// Calendar widget: month grid, date selection, booking indicators
function renderCalendar() {
    const grid = document.getElementById('calendarGrid');
    grid.innerHTML = '';

    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    document.getElementById('calendarMonthYear').innerText = `${monthNames[month]} ${year}`;

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const allBookings = getBookings().filter(b => b.status === 'Confirmed');

    for (let i = 0; i < firstDayIndex; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = "h-9";
        grid.appendChild(emptyCell);
    }

    for (let day = 1; day <= totalDays; day++) {
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayBtn = document.createElement('button');
        dayBtn.type = 'button';

        const dayBookings = allBookings.filter(b => b.date === dateString);
        const isSelected = selectedDate === dateString;

        let stateClasses = "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300";

        if (isSelected) {
            stateClasses = "bg-tasma-orange text-white font-bold shadow-sm rounded-xl";
        } else if (dayBookings.length > 0) {
            stateClasses = "bg-amber-100 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 font-bold rounded-xl";
        } else {
            stateClasses += " rounded-xl";
        }

        dayBtn.className = `h-9 flex flex-col items-center justify-center text-xs transition-all duration-200 active:scale-95 cursor-pointer relative ${stateClasses}`;
        dayBtn.onclick = () => selectCalendarDate(dateString);

        dayBtn.innerHTML = `
            <span>${day}</span>
            ${dayBookings.length > 0 && !isSelected ? `<span class="w-1.5 h-1.5 rounded-full bg-amber-500 absolute bottom-0.5"></span>` : ''}
        `;

        grid.appendChild(dayBtn);
    }
}

function selectCalendarDate(dateStr) {
    selectedDate = dateStr;
    selectedTimeSlots = [];
    selectedTimeSlot = null;

    const [y, m, d] = dateStr.split('-');
    const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    const formatted = dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    document.getElementById('selectedDateDisplayLabel').innerText = `Selected: ${formatted}`;

    renderCalendar();
    renderTimeSlots();
    updateSummaryDisplay();
}

function changeMonth(delta) {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + delta);
    renderCalendar();
}

function selectToday() {
    const today = new Date();
    currentCalendarDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    selectCalendarDate(dateStr);
}