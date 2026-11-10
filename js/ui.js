// Shared UI helpers: toast notifications and the global modal
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');

    const icons = {
        success: 'fa-circle-check text-emerald-500',
        error: 'fa-triangle-exclamation text-rose-500',
        info: 'fa-circle-info text-tasma-orange'
    };

    toast.className = "pointer-events-auto flex items-center gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg text-xs text-slate-800 dark:text-slate-200 animate-fade-in";
    toast.innerHTML = `
        <i class="fa-solid ${icons[type] || icons.info} text-base"></i>
        <span class="flex-1 font-semibold">${message}</span>
        <button onclick="this.parentElement.remove()" class="text-slate-400 hover:text-slate-600">
            <i class="fa-solid fa-xmark"></i>
        </button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        if (toast.parentElement) toast.remove();
    }, 4000);
}

function closeModal() {
    document.getElementById('globalModal').classList.add('hidden');
}