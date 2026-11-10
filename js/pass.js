// Booking pass: QR code modal, PDF download, detail view
function showSuccessPassModal(booking) {
    const content = document.getElementById('modalContent');
    const timeLabel = booking.fullDay ? 'Full Day (8:00 AM – 6:00 PM)' : `${booking.startTime} - ${booking.endTime}`;

    content.innerHTML = `
        <div class="p-6 space-y-4 text-center">
            <div class="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto text-xl shadow-inner">
                <i class="fa-solid fa-circle-check"></i>
            </div>

            <div>
                <h3 class="text-base font-bold text-slate-900 dark:text-white">Boardroom Pass Generated</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400">TASMA Group Corporate Reservation</p>
            </div>

            <div id="printableConfirmation" class="bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-left space-y-3 relative overflow-hidden shadow-sm">
                <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                    <img src="assets/images/tasma-logo.png" class="h-8 object-contain" alt="Tasma Logo">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">Confirmed</span>
                </div>

                <div class="flex justify-between items-center">
                    <div>
                        <span class="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Token ID</span>
                        <span class="font-mono text-xs font-bold text-tasma-navy dark:text-tasma-orange">${booking.token}</span>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-2 text-xs">
                    <div>
                        <span class="text-slate-400 block text-[10px]">Boardroom</span>
                        <span class="font-bold text-slate-800 dark:text-slate-200">${booking.boardroom}</span>
                    </div>
                    <div>
                        <span class="text-slate-400 block text-[10px]">Date</span>
                        <span class="font-bold text-slate-800 dark:text-slate-200">${booking.date}</span>
                    </div>
                    <div>
                        <span class="text-slate-400 block text-[10px]">Time Slot</span>
                        <span class="font-bold text-slate-800 dark:text-slate-200">${timeLabel}</span>
                    </div>
                    <div>
                        <span class="text-slate-400 block text-[10px]">Employee Name</span>
                        <span class="font-bold text-slate-800 dark:text-slate-200">${booking.userName}</span>
                    </div>
                </div>

                <div class="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div class="text-[10px] text-slate-400">
                        <span>Emp ID: ${booking.empId}</span><br>
                        <span>Scan token for entrance access</span>
                    </div>
                    <div id="qrcode" class="bg-white p-1 rounded-lg border border-slate-200"></div>
                </div>
            </div>

            <div class="flex flex-col sm:flex-row gap-2 pt-1">
                <button onclick="downloadPDFPass('${booking.id}')" class="flex-1 py-2.5 rounded-xl bg-tasma-navy hover:bg-tasma-navyHover text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5">
                    <i class="fa-solid fa-file-pdf text-tasma-orange"></i>
                    <span>Download PDF Pass</span>
                </button>
                <button onclick="window.print()" class="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 flex items-center justify-center gap-1.5">
                    <i class="fa-solid fa-print"></i>
                    <span>Print</span>
                </button>
                <button onclick="closeModal()" class="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-500 font-bold text-xs hover:bg-slate-100">
                    Close
                </button>
            </div>
        </div>
    `;

    setTimeout(() => {
        const qrContainer = document.getElementById('qrcode');
        if (qrContainer) {
            qrContainer.innerHTML = '';
            new QRCode(qrContainer, {
                text: booking.token,
                width: 48,
                height: 48,
                colorDark : "#001C71",
                colorLight : "#ffffff",
                correctLevel : QRCode.CorrectLevel.H
            });
        }
    }, 100);
}

function downloadPDFPass(bookingId) {
    const booking = getBookings().find(b => b.id === bookingId);
    if (!booking) return;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFillColor(0, 28, 113);
    doc.rect(0, 0, 210, 35, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("TASMA GROUP - BOARDROOM PASS", 15, 18);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("TASMA Group Corporate Meeting Management", 15, 26);

    doc.setTextColor(0, 28, 113);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Booking Token: ${booking.token}`, 15, 50);

    doc.setLineWidth(0.5);
    doc.setDrawColor(245, 122, 0);
    doc.line(15, 54, 195, 54);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 41, 59);

    doc.text(`Employee Name: ${booking.userName}`, 15, 68);
    doc.text(`Employee ID: ${booking.empId}`, 15, 76);
    doc.text(`Work Email: ${booking.email}`, 15, 84);

    doc.text(`Boardroom: ${booking.boardroom}`, 110, 68);
    doc.text(`Date: ${booking.date}`, 110, 76);
    doc.text(`Time Slot: ${booking.fullDay ? 'Full Day (08:00 AM - 06:00 PM)' : booking.startTime + ' - ' + booking.endTime}`, 110, 84);

    doc.setFillColor(255, 244, 235);
    doc.rect(15, 95, 180, 24, 'F');
    doc.setTextColor(245, 122, 0);
    doc.setFont("helvetica", "bold");
    doc.text("Status: CONFIRMED RESERVATION", 25, 107);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Created Date: ${booking.createdAt}`, 25, 113);

    doc.text("Authorized by Tasma Group Portal. Please display token upon arrival.", 15, 138);

    doc.save(`Tasma_Booking_${booking.token}.pdf`);
    showToast('PDF confirmation downloaded!', 'info');
}

function viewBookingDetail(booking) {
    showSuccessPassModal(booking);
}