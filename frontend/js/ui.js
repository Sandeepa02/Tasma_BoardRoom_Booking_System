// Shared UI helpers: toast notifications and the global modal
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');

    const icons = {
        success: 'fa-circle-check text-emerald-500',
        error: 'fa-triangle-exclamation text-rose-500',
        info: 'fa-circle-info text-tasma-orange'
    };

    toast.className = "pointer-events-auto flex items-center gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl text-xs text-slate-800 dark:text-slate-200 toast-enter backdrop-blur-sm transition-all";
    toast.innerHTML = `
        <i class="fa-solid ${icons[type] || icons.info} text-base"></i>
        <span class="flex-1 font-semibold">${message}</span>
        <button onclick="dismissToast(this.parentElement)" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1">
            <i class="fa-solid fa-xmark"></i>
        </button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        dismissToast(toast);
    }, 4000);
}

function dismissToast(toast) {
    if (!toast || !toast.parentElement) return;
    toast.classList.remove('toast-enter');
    toast.classList.add('toast-exit');
    setTimeout(() => {
        if (toast.parentElement) toast.remove();
    }, 250);
}

function closeModal() {
    const modal = document.getElementById('globalModal');
    if (!modal) return;
    const content = document.getElementById('modalContent');
    if (content) {
        content.classList.add('opacity-0', 'scale-95');
        setTimeout(() => {
            modal.classList.add('hidden');
            content.classList.remove('opacity-0', 'scale-95');
        }, 150);
    } else {
        modal.classList.add('hidden');
    }
}

// Toggle password visibility (show / hide password)
function togglePasswordVisibility(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;

    const icon = btn.querySelector('i');
    if (input.type === 'password') {
        input.type = 'text';
        if (icon) {
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        }
        btn.setAttribute('aria-label', 'Hide password');
    } else {
        input.type = 'password';
        if (icon) {
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
        btn.setAttribute('aria-label', 'Show password');
    }
}
