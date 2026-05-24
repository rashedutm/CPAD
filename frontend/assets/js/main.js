/* ============================================================
   NomNom — Global JS Utilities
   File: F:\NomNom\frontend\assets\js\main.js
   Requires: jQuery, config/api.js, assets/js/auth.js
   ============================================================ */

/* ── TOAST NOTIFICATIONS ── */
function showToast(message, type = 'success') {
  // type: 'success' | 'error' | 'info'
  if (!$('#toast-container').length) {
    $('body').append('<div id="toast-container"></div>');
  }

  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const toast = $(`
    <div class="toast toast-${type}">
      <span>${icons[type] || ''}</span>
      <span>${message}</span>
    </div>
  `);

  $('#toast-container').append(toast);
  setTimeout(() => toast.fadeOut(300, function () { $(this).remove(); }), 3000);
}

/* ── API HELPER ── */
// Centralized AJAX call with token auth
function apiCall(endpoint, method, data, onSuccess, onError) {
  const token = Auth.getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = 'Bearer ' + token;

  $.ajax({
    url: API_BASE_URL + endpoint,
    method: method || 'GET',
    headers: headers,
    data: data ? JSON.stringify(data) : null,
    dataType: 'json',
    success: function (res) {
      if (res.success === false && res.message === 'Unauthorized') {
        Auth.logout();
        return;
      }
      if (typeof onSuccess === 'function') onSuccess(res);
    },
    error: function (xhr) {
      const msg = (xhr.responseJSON && xhr.responseJSON.message) || 'Something went wrong.';
      if (typeof onError === 'function') onError(msg);
      else showToast(msg, 'error');
    }
  });
}

/* ── BADGE HELPER ── */
function statusBadge(status) {
  const map = {
    pending:    '<span class="badge badge-pending">⏳ Pending</span>',
    confirmed:  '<span class="badge badge-confirmed">✅ Confirmed</span>',
    preparing:  '<span class="badge badge-preparing">🍳 Preparing</span>',
    ready:      '<span class="badge badge-ready">🟢 Ready</span>',
    completed:  '<span class="badge badge-completed">☑️ Completed</span>',
    cancelled:  '<span class="badge badge-cancelled">❌ Cancelled</span>',
    open:       '<span class="badge badge-open">🟢 Open</span>',
    closed:     '<span class="badge badge-closed">🔴 Closed</span>',
    paid:       '<span class="badge badge-paid">💰 Paid</span>',
    unpaid:     '<span class="badge badge-unpaid">⏳ Unpaid</span>',
    Food:       '<span class="badge badge-food">🍔 Food</span>',
    Drink:      '<span class="badge badge-drink">🥤 Drink</span>',
  };
  return map[status] || `<span class="badge">${status}</span>`;
}

/* ── PRICE FORMAT ── */
function formatPrice(price) {
  return 'RM ' + parseFloat(price).toFixed(2);
}

/* ── DATE FORMAT ── */
function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleString('en-MY', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

/* ── SKELETON LOADER ── */
function skeletonCards(count, container) {
  let html = '';
  for (let i = 0; i < count; i++) {
    html += `
      <div class="card">
        <div class="skeleton skeleton-card mb-2"></div>
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text" style="width:60%"></div>
      </div>`;
  }
  $(container).html(html);
}

function skeletonRows(count, cols, container) {
  let rows = '';
  for (let i = 0; i < count; i++) {
    let cells = '';
    for (let j = 0; j < cols; j++) {
      cells += `<td><div class="skeleton skeleton-text"></div></td>`;
    }
    rows += `<tr>${cells}</tr>`;
  }
  $(container).html(rows);
}

/* ── EMPTY STATE ── */
function emptyState(icon, title, message, container) {
  $(container).html(`
    <div class="empty-state">
      <div class="empty-state-icon">${icon}</div>
      <h3>${title}</h3>
      <p>${message}</p>
    </div>
  `);
}

/* ── SIDEBAR ACTIVE LINK ── */
function setActiveLink() {
  const current = window.location.pathname.split('/').pop();
  $('.sidebar-link').each(function () {
    const href = $(this).attr('href');
    if (href && href.includes(current)) {
      $(this).addClass('active');
    }
  });
}

/* ── MOBILE SIDEBAR TOGGLE ── */
function initSidebar() {
  // Inject overlay if not present
  if (!$('.sidebar-overlay').length) {
    $('body').append('<div class="sidebar-overlay"></div>');
  }

  $(document).on('click', '.hamburger', function () {
    $('.sidebar').addClass('open');
    $('.sidebar-overlay').addClass('open');
  });

  $(document).on('click', '.sidebar-overlay', function () {
    $('.sidebar').removeClass('open');
    $(this).removeClass('open');
  });
}

/* ── POPULATE USER IN SIDEBAR ── */
function populateSidebarUser() {
  const user = Auth.getUser();
  if (!user) return;

  const initials = user.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '??';

  $('.user-avatar').text(initials);
  $('.user-name').text(user.name || 'User');
  $('.user-role').text(user.role || '');
}

/* ── LOAD UNREAD NOTIFICATIONS COUNT ── */
function loadNotifCount() {
  const token = Auth.getToken();
  if (!token) return;

  apiCall('/notification/index.php', 'GET', null, function (res) {
    if (res.success && res.data) {
      const unread = res.data.filter(n => n.is_read == 0).length;
      if (unread > 0) {
        $('.notif-dot').show();
        $('.notif-count').text(unread).show();
      } else {
        $('.notif-dot').hide();
      }
    }
  });
}

/* ── CONFIRM DIALOG ── */
function confirmAction(message, onConfirm) {
  // Simple confirm using browser dialog (can be upgraded to custom modal)
  if (window.confirm(message)) {
    onConfirm();
  }
}

/* ── SCROLL REVEAL ── */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 80);
      }
    });
  }, { threshold: 0.1 });

  reveals.forEach(r => observer.observe(r));
}

/* ── ON DOCUMENT READY ── */
$(document).ready(function () {
  initSidebar();
  setActiveLink();
  populateSidebarUser();
  loadNotifCount();
  initScrollReveal();
});