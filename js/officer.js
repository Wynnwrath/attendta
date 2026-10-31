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

  getActiveEventId() {
    const fromSession = sessionStorage.getItem('attendta_active_event');
    if (fromSession && this.state.events.some(e => e.id === fromSession)) {
      return fromSession;
    }
    return this.state.events.length > 0 ? this.state.events[0].id : null;
  },

  setActiveEventId(id) {
    if (id) {
      sessionStorage.setItem('attendta_active_event', id);
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
    const metaWrap = document.querySelector('.portal-user-meta');
    if (!metaWrap || !this.state.user) return;

    const u = this.state.user;
    const roleClass = u.role === 'admin' ? 'role-admin' : u.role === 'officer' ? 'role-officer' : 'role-member';
    const roleLabel = u.role === 'admin' ? 'Admin' : u.role === 'officer' ? 'Officer' : 'Member';
    const roleTitle = u.role === 'admin' ? 'System Administrator' : u.role === 'officer' ? 'Chapter Executive Officer' : 'Active Member';
    const initials = u.avatarInitials || (u.fullName ? u.fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'U');
    const firstName = u.fullName ? u.fullName.split(' ')[0] : 'User';

    // Check if identity capsule already exists, else render
    let capsuleContainer = metaWrap.querySelector('.identity-capsule-wrap');
    if (!capsuleContainer) {
      // Remove old static text, avatar, and logout elements if present
      const oldName = document.getElementById('officer-name-display');
      if (oldName && oldName.parentElement) {
        oldName.parentElement.remove();
      }
      const oldAvatar = document.getElementById('officer-avatar');
      if (oldAvatar) oldAvatar.remove();
      const oldSignOut = metaWrap.querySelector('button[onclick*="Officer.logout"]');
      if (oldSignOut) oldSignOut.remove();

      capsuleContainer = document.createElement('div');
      capsuleContainer.className = 'identity-capsule-wrap';
      metaWrap.appendChild(capsuleContainer);
    }

    // Default blank SVG icon when no photo
    capsuleContainer.innerHTML = `
      <button class="identity-capsule-btn" id="identity-capsule-trigger" aria-haspopup="true" aria-expanded="false" title="Account & Authority: ${u.fullName}">
        <span class="identity-capsule-avatar" id="officer-avatar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </span>
        <span class="identity-capsule-name" id="officer-name-display">${firstName}</span>
        <span class="identity-capsule-role ${roleClass}" id="officer-role-display">${roleLabel}</span>
        <span class="identity-capsule-chevron">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </span>
      </button>

      <div class="identity-popover" id="identity-popover-menu" role="menu">
        <div class="identity-popover-header">
          <div class="identity-popover-avatar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <div class="identity-popover-userinfo">
            <div class="identity-popover-fullname">${u.fullName}</div>
            <div class="identity-popover-course">${u.courseYear || 'Academic Member'}</div>
          </div>
        </div>

        <div class="identity-id-row">
          <div class="identity-id-meta">
            <span class="identity-id-label">Institutional ID</span>
            <span class="identity-id-value">${u.studentId}</span>
          </div>
          <button type="button" class="identity-copy-btn" onclick="Officer.copyStudentId('${u.studentId}', this)" title="Copy ID">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            <span>Copy</span>
          </button>
        </div>

        <div class="identity-authority-badge ${roleClass}">
          <span style="width: 6px; height: 6px; border-radius: 50%; background: currentColor;"></span>
          <span>${roleTitle}</span>
        </div>

        <div class="identity-popover-actions">
          <a href="student.html" class="identity-popover-item" title="Switch to Student Experience (Demo)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>
            <span>Preview Student View</span>
          </a>
          ${u.role === 'admin' ? `
          <a href="officer.html" class="identity-popover-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            <span>Officer Operations</span>
          </a>
          ` : `
          <a href="admin.html" class="identity-popover-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span>Administrator Console</span>
          </a>
          `}
          <button type="button" class="identity-popover-item danger-item" onclick="Officer.logout()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    `;

    // Bind dropdown toggle
    const trigger = capsuleContainer.querySelector('#identity-capsule-trigger');
    const popover = capsuleContainer.querySelector('#identity-popover-menu');
    if (trigger && popover) {
      trigger.onclick = (e) => {
        e.stopPropagation();
        const isOpen = popover.classList.contains('show');
        popover.classList.toggle('show', !isOpen);
        trigger.classList.toggle('active', !isOpen);
        trigger.setAttribute('aria-expanded', !isOpen);
      };

      // Close on outside click
      if (!this._popoverCloseBound) {
        document.addEventListener('click', (e) => {
          if (!e.target.closest('.identity-capsule-wrap')) {
            document.querySelectorAll('.identity-popover').forEach(p => p.classList.remove('show'));
            document.querySelectorAll('.identity-capsule-btn').forEach(b => {
              b.classList.remove('active');
              b.setAttribute('aria-expanded', 'false');
            });
          }
        });
        this._popoverCloseBound = true;
      }
    }
  },

  copyStudentId(studentId, btnEl) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(studentId);
    }
    const oldText = btnEl.innerHTML;
    btnEl.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--emerald-primary)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span style="color:var(--emerald-primary);">Copied</span>`;
    setTimeout(() => {
      btnEl.innerHTML = oldText;
    }, 1800);
    this.showToast(`Copied Student ID [${studentId}] to clipboard!`, 'success');
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
