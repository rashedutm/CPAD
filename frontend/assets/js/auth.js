/* ============================================================
   NomNom — Auth Helper
   File: F:\NomNom\frontend\assets\js\auth.js
   Requires: jQuery, config/api.js
   ============================================================ */

const Auth = {

  /* ── STORE TOKEN & USER AFTER LOGIN ── */
  login: function (token, user) {
    localStorage.setItem('nomnom_token', token);
    localStorage.setItem('nomnom_user', JSON.stringify(user));
  },

  /* ── GET TOKEN ── */
  getToken: function () {
    return localStorage.getItem('nomnom_token') || null;
  },

  /* ── GET USER OBJECT ── */
  getUser: function () {
    const raw = localStorage.getItem('nomnom_user');
    try { return raw ? JSON.parse(raw) : null; }
    catch (e) { return null; }
  },

  /* ── GET SPECIFIC FIELD ── */
  getUserId:   function () { const u = Auth.getUser(); return u ? u.user_id : null; },
  getUserRole: function () { const u = Auth.getUser(); return u ? u.role   : null; },
  getUserName: function () { const u = Auth.getUser(); return u ? u.name   : null; },

  /* ── CHECK IF LOGGED IN ── */
  isLoggedIn: function () {
    return !!Auth.getToken() && !!Auth.getUser();
  },

  /* ── LOGOUT ── */
  logout: function () {
    localStorage.removeItem('nomnom_token');
    localStorage.removeItem('nomnom_user');
    window.location.href = '/login.html';
  },

  /* ── ROLE GUARD ── */
  // Call this at the top of each dashboard page
  // e.g. Auth.requireRole('customer') — redirects if wrong role
  requireRole: function (allowedRole) {
    if (!Auth.isLoggedIn()) {
      window.location.href = '/login.html';
      return false;
    }
    const role = Auth.getUserRole();
    if (Array.isArray(allowedRole)) {
      if (!allowedRole.includes(role)) {
        Auth.redirectByRole(role);
        return false;
      }
    } else {
      if (role !== allowedRole) {
        Auth.redirectByRole(role);
        return false;
      }
    }
    return true;
  },

  /* ── REDIRECT TO CORRECT DASHBOARD BY ROLE ── */
  redirectByRole: function (role) {
    const map = {
      admin:    '/admin/dashboard.html',
      vendor:   '/vendor/dashboard.html',
      staff:    '/staff/dashboard.html',
      customer: '/customer/home.html',
    };
    window.location.href = map[role] || '/login.html';
  },

  /* ── REDIRECT IF ALREADY LOGGED IN (for login/register pages) ── */
  redirectIfLoggedIn: function () {
    if (Auth.isLoggedIn()) {
      Auth.redirectByRole(Auth.getUserRole());
    }
  },

  /* ── VERIFY TOKEN WITH BACKEND (optional, call on page load) ── */
  verify: function (onValid, onInvalid) {
    const token = Auth.getToken();
    if (!token) {
      if (typeof onInvalid === 'function') onInvalid();
      return;
    }

    $.ajax({
      url: API_BASE_URL + '/auth/verify.php',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      dataType: 'json',
      success: function (res) {
        if (res.success) {
          // Refresh user data from server
          localStorage.setItem('nomnom_user', JSON.stringify(res.user));
          if (typeof onValid === 'function') onValid(res.user);
        } else {
          Auth.logout();
          if (typeof onInvalid === 'function') onInvalid();
        }
      },
      error: function () {
        Auth.logout();
        if (typeof onInvalid === 'function') onInvalid();
      }
    });
  }
};