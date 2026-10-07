/**
 * AttendTa • Shared Officer State & Operations Controller
 * Manages synchronized data across all officer views via sessionStorage & INITIAL_DATA.
 * Adheres to @design-thinking, @design-taste-frontend, and @design-ux.
 */

const Officer = {
  state: {
    user: null,
    events: [],
    members: [],
    venues: [],
    eventTypes: [],
    registrations: [],
    activityLogs: [],
    notifications: [],
    cameraStream: null
  },

  init() {
    this.loadState();
    this.initTheme();
    this.renderHeaderUser();
    this.updateTelemetryStrip();
  },

  loadState() {
    // 1. Session user check
    const userJson = sessionStorage.getItem('attendta_current_user');
    if (userJson) {
      this.state.user = JSON.parse(userJson);
    } else {
      // Default to Executive Officer Danica Navarro for instant testing
      this.state.user = INITIAL_DATA.members.find(m => m.studentId === '2023-01492-MN-0') || INITIAL_DATA.members[0];
      sessionStorage.setItem('attendta_current_user', JSON.stringify(this.state.user));
    }

    // 2. Load mutable entities from sessionStorage or seed from INITIAL_DATA
    const getStored = (key, fallback) => {
      const data = sessionStorage.getItem(`attendta_${key}`);
      return data ? JSON.parse(data) : fallback;
    };

    this.state.members = getStored('members', [...INITIAL_DATA.members]);
    this.state.events = getStored('events', [...INITIAL_DATA.events]);
    this.state.venues = getStored('venues', [...INITIAL_DATA.venues]);
    this.state.eventTypes = getStored('eventTypes', [...INITIAL_DATA.eventTypes]);
    this.state.registrations = getStored('registrations', [...INITIAL_DATA.registrations]);
    this.state.activityLogs = getStored('activityLogs', [...INITIAL_DATA.activityLogs]);
  },

  saveState(key) {
    if (this.state[key]) {
      sessionStorage.setItem(`attendta_${key}`, JSON.stringify(this.state[key]));
    }
  },

  initTheme() {
    const savedTheme = localStorage.getItem('attendta_theme') ||
      (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', savedTheme);
  },

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('attendta_theme', next);
  },

  renderHeaderUser() {
    const nameEl = document.getElementById('officer-name-display');
    const roleEl = document.getElementById('officer-role-display');
    const avatarEl = document.getElementById('officer-avatar');

    if (nameEl && this.state.user) nameEl.textContent = this.state.user.fullName;
    if (roleEl && this.state.user) roleEl.textContent = `${this.state.user.membershipType} • ${this.state.user.studentId}`;
    if (avatarEl && this.state.user) avatarEl.textContent = this.state.user.avatarInitials;
  },

  updateTelemetryStrip() {
    const pendingApplicants = this.state.members.filter(m => m.status === 'Pending Approval');
    const activeEvents = this.state.events.filter(e => !e.isArchived && e.status !== 'Concluded');
    const todayCheckIns = this.state.registrations.filter(r => r.attended).length;

    const totalReg = this.state.registrations.length;
    const attendedCount = this.state.registrations.filter(r => r.attended).length;
    const rate = totalReg > 0 ? Math.round((attendedCount / totalReg) * 100) : 0;

    const elPending = document.getElementById('telemetry-pending-count');
    const elEvents = document.getElementById('telemetry-events-count');
    const elScans = document.getElementById('telemetry-scans-count');
    const elRate = document.getElementById('telemetry-rate-count');

    if (elPending) elPending.textContent = pendingApplicants.length;
    if (elEvents) elEvents.textContent = activeEvents.length;
    if (elScans) elScans.textContent = todayCheckIns;
    if (elRate) elRate.textContent = `${rate}%`;

    // Update sidebar badges if present
    const badgeApprovals = document.getElementById('badge-approvals-count');
    if (badgeApprovals) {
      badgeApprovals.textContent = pendingApplicants.length;
      badgeApprovals.style.display = pendingApplicants.length > 0 ? 'inline-block' : 'none';
    }
  },

  updateStatsStrip() {
    this.updateTelemetryStrip();
  },

  logActivity(action, type = 'system') {
    const log = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: 'Just now',
      actor: `${this.state.user.fullName} (${this.state.user.membershipType})`,
      action,
      type
    };
    this.state.activityLogs.unshift(log);
    this.saveState('activityLogs');
  },

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-hub');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <span style="font-size: 1.15rem; color: ${type === 'success' ? 'var(--emerald-primary)' : type === 'error' ? 'var(--status-error)' : 'var(--accent-primary)'};">
        ${type === 'success' ? '✔' : type === 'error' ? '✖' : 'ℹ'}
      </span>
      <div class="toast-msg">${message}</div>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'all 240ms ease-out';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(12px)';
      setTimeout(() => toast.remove(), 260);
    }, 3800);
  },

  showUndoToast(message, undoCallback, duration = 8000) {
    const container = document.getElementById('toast-hub');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.borderColor = 'var(--accent-primary)';
    toast.innerHTML = `
      <span style="font-size: 1.15rem; color: var(--accent-primary);">ℹ</span>
      <div class="toast-msg" style="flex: 1;">${message}</div>
      <button class="toast-undo-btn" id="btn-toast-undo">Undo</button>
    `;
    container.appendChild(toast);

    const btn = toast.querySelector('#btn-toast-undo');
    let undone = false;
    if (btn) {
      btn.onclick = () => {
        undone = true;
        toast.remove();
        if (undoCallback) undoCallback();
      };
    }

    setTimeout(() => {
      if (!undone && toast.parentNode) {
        toast.style.transition = 'all 240ms ease-out';
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(12px)';
        setTimeout(() => toast.remove(), 260);
      }
    }, duration);
  },

  logout() {
    sessionStorage.removeItem('attendta_current_user');
    sessionStorage.setItem('attendta_explicit_logout', 'true');
    window.location.href = 'login.html?logged_out=1';
  }
};
