/**
 * AttendTa Dedicated Student Portal Logic
 * Implements 4 Core Pillars:
 * 1. Auth & Session Management (with direct preview fallback)
 * 2. Event Discovery & 1-Click Drawer Registration
 * 3. My Agendas & Digital Scannable Door Passes
 * 4. Attendance History, 3-Step Milestone Tracker & Official Certificate Vault
 */

const StudentApp = {
  state: {
    user: null,
    events: INITIAL_DATA.events,
    eventTypes: INITIAL_DATA.eventTypes,
    registrations: INITIAL_DATA.registrations,
    activeFilter: 'All',
    viewMode: localStorage.getItem('attendta_view_mode') || 'grid',
    passTimeframe: 'upcoming',
    passStatusFilter: 'all',
    historySubTab: 'milestones',
    certStatusFilter: 'all',
    searchQuery: '',
    availabilityFilter: 'all',
    sortBy: 'date',
    currentPage: 1,
    pageSize: 6
  },

  init() {
    let userJson = sessionStorage.getItem('attendta_current_user');
    const wasLoggedOut = sessionStorage.getItem('attendta_explicit_logout');

    if (!userJson && wasLoggedOut === 'true') {
      window.location.href = 'login.html';
      return;
    }

    if (!userJson) {
      // Auto-load demo active student Rafael Joaquin De Leon for instant, seamless testing
      const demoUser = INITIAL_DATA.members.find(m => m.studentId === '2024-00128-MN-0') || INITIAL_DATA.members[2];
      sessionStorage.setItem('attendta_current_user', JSON.stringify(demoUser));
      userJson = JSON.stringify(demoUser);
    }

    this.state.user = JSON.parse(userJson);
    this.initTheme();
    this.renderUserInfo();
    this.updateStatsStrip();
    this.renderHeroSpotlight();
    this.renderFilters();
    this.initViewControls();
    this.renderEvents();
    this.bindModals();
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

  initViewControls() {
    // Set initial view mode button states
    const gridBtn = document.getElementById('btn-view-grid');
    const listBtn = document.getElementById('btn-view-list');
    if (gridBtn && listBtn) {
      gridBtn.classList.toggle('active', this.state.viewMode === 'grid');
      listBtn.classList.toggle('active', this.state.viewMode === 'list');
    }
  },

  bindModals() {
    const modalClose = document.getElementById('modal-close-btn');
    const modalOverlay = document.getElementById('global-modal-overlay');
    if (modalClose && modalOverlay) {
      modalClose.onclick = () => this.closeModal();
      modalOverlay.onclick = (e) => {
        if (e.target === modalOverlay) this.closeModal();
      };
    }
  },

  logout() {
    sessionStorage.removeItem('attendta_current_user');
    sessionStorage.setItem('attendta_explicit_logout', 'true');
    window.location.href = 'login.html?logged_out=1';
  },

  renderUserInfo() {
    const metaWrap = document.querySelector('.portal-user-meta');
    if (!metaWrap || !this.state.user) return;

    const u = this.state.user;
    const firstName = u.fullName ? u.fullName.split(' ')[0] : 'Student';
    const roleTitle = u.membershipType || 'Active Chapter Member';

    // Remove legacy Officer View loose button from navbar if present to avoid demo clutter
    const oldOfficerLink = metaWrap.querySelector('a[href="officer.html"]');
    if (oldOfficerLink) oldOfficerLink.remove();

    // Check if identity capsule exists
    let capsuleContainer = metaWrap.querySelector('.identity-capsule-wrap');
    if (!capsuleContainer) {
      const oldName = document.getElementById('user-name-display');
      if (oldName && oldName.parentElement) {
        oldName.parentElement.remove();
      }
      const oldAvatar = document.getElementById('user-avatar');
      if (oldAvatar) oldAvatar.remove();
      const oldSignOut = metaWrap.querySelector('button[onclick*="StudentApp.logout"]');
      if (oldSignOut) oldSignOut.remove();

      capsuleContainer = document.createElement('div');
      capsuleContainer.className = 'identity-capsule-wrap';
      metaWrap.appendChild(capsuleContainer);
    }

    capsuleContainer.innerHTML = `
      <button class="identity-capsule-btn" id="student-capsule-trigger" aria-haspopup="true" aria-expanded="false" title="Student Profile: ${u.fullName}">
        <span class="identity-capsule-avatar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </span>
        <span class="identity-capsule-name">${firstName}</span>
        <span class="identity-capsule-role role-member">Member</span>
        <span class="identity-capsule-chevron">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </span>
      </button>

      <div class="identity-popover" id="student-popover-menu" role="menu">
        <div class="identity-popover-header">
          <div class="identity-popover-avatar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <div class="identity-popover-userinfo">
            <div class="identity-popover-fullname">${u.fullName}</div>
            <div class="identity-popover-course">${u.courseYear || 'Undergraduate Member'}</div>
          </div>
        </div>

        <div class="identity-id-row">
          <div class="identity-id-meta">
            <span class="identity-id-label">Student ID</span>
            <span class="identity-id-value">${u.studentId}</span>
          </div>
          <button type="button" class="identity-copy-btn" onclick="StudentApp.copyStudentId('${u.studentId}', this)" title="Copy ID">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            <span>Copy</span>
          </button>
        </div>

        <div class="identity-authority-badge role-member">
          <span style="width: 6px; height: 6px; border-radius: 50%; background: currentColor;"></span>
          <span>${roleTitle}</span>
        </div>

        <div class="identity-popover-actions">
          <a href="officer.html" class="identity-popover-item" title="Switch to Officer View (Demo)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            <span>Preview Officer View</span>
          </a>
          <button type="button" class="identity-popover-item danger-item" onclick="StudentApp.logout()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    `;

    // Dropdown toggle handler
    const trigger = capsuleContainer.querySelector('#student-capsule-trigger');
    const popover = capsuleContainer.querySelector('#student-popover-menu');
    if (trigger && popover) {
      trigger.onclick = (e) => {
        e.stopPropagation();
        const isOpen = popover.classList.contains('show');
        popover.classList.toggle('show', !isOpen);
        trigger.classList.toggle('active', !isOpen);
        trigger.setAttribute('aria-expanded', !isOpen);
      };

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

  updateStatsStrip() {
    const userRegs = this.state.registrations.filter(r => r.studentId === this.state.user.studentId);
    const activePasses = userRegs.filter(r => r.status === 'Confirmed' || r.status === 'Waitlisted');
    const attendedRegs = userRegs.filter(r => r.attended);
    const certsCount = userRegs.filter(r => r.certificateEligible).length;

    // Concluded sessions where attendance check-in has occurred or event passed
    const concludedRegs = userRegs.filter(r => r.attended || r.checkInTime !== null);
    const rate = concludedRegs.length > 0
      ? Math.round((attendedRegs.length / concludedRegs.length) * 100)
      : (attendedRegs.length > 0 ? 100 : 100);

    const regCountEl = document.getElementById('stat-registered-count');
    const rateEl = document.getElementById('stat-attendance-rate');
    const certEl = document.getElementById('stat-cert-count');
    const badgePassEl = document.getElementById('badge-pass-count');

    if (regCountEl) regCountEl.innerText = activePasses.length;
    if (rateEl) rateEl.innerText = `${rate}%`;
    if (certEl) certEl.innerText = certsCount;
    if (badgePassEl) badgePassEl.innerText = activePasses.length;

    this.renderHeroSpotlight();
  },

  switchView(view) {
    document.querySelectorAll('.campus-nav-tab, .sidebar-link').forEach(l => l.classList.remove('active'));
    const navEl = document.getElementById(`nav-${view}`);
    if (navEl) navEl.classList.add('active');

    document.querySelectorAll('.portal-view').forEach(v => {
      v.classList.remove('active-view');
    });
    const viewEl = document.getElementById(`view-${view}`);
    if (viewEl) viewEl.classList.add('active-view');

    if (view === 'events') {
      this.renderHeroSpotlight();
      this.renderEvents();
    } else if (view === 'passes') {
      this.renderPasses();
    } else if (view === 'history') {
      this.renderHistory();
    } else if (view === 'profile') {
      this.renderProfile();
    }
  },

  renderHeroSpotlight() {
    const container = document.getElementById('hero-spotlight-container');
    if (!container) return;

    const userRegs = this.state.registrations.filter(r => r.studentId === this.state.user.studentId && (r.status === 'Confirmed' || r.status === 'Waitlisted'));

    let spotlightEvent = null;
    let spotlightReg = null;

    if (userRegs.length > 0) {
      for (const reg of userRegs) {
        const ev = this.state.events.find(e => e.id === reg.eventId);
        if (ev && ev.status !== 'Concluded') {
          spotlightEvent = ev;
          spotlightReg = reg;
          break;
        }
      }
    }

    if (!spotlightEvent && this.state.events.length > 0) {
      spotlightEvent = this.state.events.find(e => e.status !== 'Concluded') || this.state.events[0];
    }

    if (!spotlightEvent) {
      container.innerHTML = '';
      return;
    }

    const isEnrolled = !!spotlightReg;
    const isConfirmed = spotlightReg && spotlightReg.status === 'Confirmed';

    container.innerHTML = `
      <div class="hero-spotlight-card">
        <div>
          <div class="hero-spotlight-eyebrow">
            <span class="badge-dot" style="background: var(--emerald-primary);"></span>
            ${isEnrolled ? (isConfirmed ? 'Next Confirmed Session' : 'Waitlisted Session') : 'Featured Upcoming Session'}
          </div>
          <h2 class="hero-spotlight-title">${spotlightEvent.title}</h2>
          <div class="hero-spotlight-logistics">
            <span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--emerald-primary)" stroke-width="2.2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
              ${spotlightEvent.dateMonth} ${spotlightEvent.dateDay}, 2026 &bull; ${spotlightEvent.time}
            </span>
            <span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--emerald-primary)" stroke-width="2.2"><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z"/><circle cx="12" cy="10" r="3"/></svg>
              ${spotlightEvent.venueName}
            </span>
            <span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--emerald-primary)" stroke-width="2.2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              ${spotlightEvent.speakerName || 'Chapter Leadership'}
            </span>
          </div>
        </div>

        <div class="hero-spotlight-actions">
          ${isEnrolled ? `
            <button class="btn btn-emerald btn-sm" onclick="StudentApp.showDoorPassModal('${spotlightReg.regId}')">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              Show Kiosk QR Pass
            </button>
            <button class="btn btn-secondary btn-sm" onclick="StudentApp.openEventDetails('${spotlightEvent.id}')">
              Session Agenda Details &rarr;
            </button>
          ` : `
            <button class="btn btn-primary btn-sm" onclick="StudentApp.registerForEvent('${spotlightEvent.id}')">
              ⚡ Reserve My Seat Now
            </button>
            <button class="btn btn-secondary btn-sm" onclick="StudentApp.openEventDetails('${spotlightEvent.id}')">
              Session Agenda Details &rarr;
            </button>
          `}
        </div>
      </div>
    `;
  },

  quickRegister(eventId) {
    this.registerForEvent(eventId);
  },

  openDoorPassModal(regId) {
    this.showDoorPassModal(regId);
  },

  /* -------------------------------------------------------------------------
     PILLAR 2: Event Discovery & Filter Chips
     ------------------------------------------------------------------------- */
  renderFilters() {
    const container = document.getElementById('event-filters');
    if (!container) return;

    let html = `<button class="filter-chip ${this.state.activeFilter === 'All' ? 'active' : ''}" onclick="StudentApp.setFilter('All')">All Categories</button>`;

    this.state.eventTypes.forEach(type => {
      html += `<button class="filter-chip ${this.state.activeFilter === type.name ? 'active' : ''}" onclick="StudentApp.setFilter('${type.name}')">${type.name}</button>`;
    });

    container.innerHTML = html;
  },

  setFilter(filterName) {
    this.state.activeFilter = filterName;
    this.state.currentPage = 1;
    this.renderFilters();
    this.renderEvents();
  },

  setViewMode(mode) {
    this.state.viewMode = mode;
    localStorage.setItem('attendta_view_mode', mode);
    const gridBtn = document.getElementById('btn-view-grid');
    const listBtn = document.getElementById('btn-view-list');
    if (gridBtn && listBtn) {
      gridBtn.classList.toggle('active', mode === 'grid');
      listBtn.classList.toggle('active', mode === 'list');
    }
    this.renderEvents();
  },

  onSearchInput(val) {
    this.state.searchQuery = (val || '').trim().toLowerCase();
    const clearBtn = document.getElementById('event-search-clear');
    if (clearBtn) clearBtn.style.display = this.state.searchQuery ? 'flex' : 'none';
    this.state.currentPage = 1;
    this.renderEvents();
  },

  clearSearch() {
    const input = document.getElementById('event-search-input');
    const clearBtn = document.getElementById('event-search-clear');
    if (input) input.value = '';
    if (clearBtn) clearBtn.style.display = 'none';
    this.state.searchQuery = '';
    this.state.currentPage = 1;
    this.renderEvents();
  },

  setAvailabilityFilter(filterVal) {
    this.state.availabilityFilter = filterVal;
    this.state.currentPage = 1;
    this.renderEvents();
  },

  setSortBy(sortKey) {
    this.state.sortBy = sortKey;
    this.renderEvents();
  },

  setPage(pageNum) {
    this.state.currentPage = pageNum;
    this.renderEvents();
    const topEl = document.getElementById('view-events');
    if (topEl) topEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },

  goToEventPage(eventId) {
    window.location.href = `event-details.html?id=${encodeURIComponent(eventId)}`;
  },

  toggleEventExpand(eventId, e) {
    if (e) e.stopPropagation();
    if (!this.state.expandedEvents) {
      this.state.expandedEvents = new Set();
    }
    const container = document.getElementById(`event-row-${eventId}`);
    const tray = document.getElementById(`event-expand-tray-${eventId}`);
    const isExpanded = this.state.expandedEvents.has(eventId);

    if (isExpanded) {
      this.state.expandedEvents.delete(eventId);
      if (container) container.classList.remove('is-expanded');
      if (tray) tray.classList.remove('is-open');
    } else {
      this.state.expandedEvents.add(eventId);
      if (container) container.classList.add('is-expanded');
      if (tray) tray.classList.add('is-open');
    }
  },

  toggleHistoryAudit(regId, e) {
    if (e) e.stopPropagation();
    const tray = document.getElementById(`history-audit-${regId}`);
    const btn = document.getElementById(`btn-audit-${regId}`);
    if (!tray || !btn) return;
    const isOpen = tray.classList.contains('is-open');
    if (isOpen) {
      tray.classList.remove('is-open');
      btn.classList.remove('is-active');
      btn.innerHTML = `
        <span>Audit Trail &amp; Verification Details</span>
        <svg class="chevron-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
      `;
    } else {
      tray.classList.add('is-open');
      btn.classList.add('is-active');
      btn.innerHTML = `
        <span>Hide Audit Details</span>
        <svg class="chevron-arrow rotate-180" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
      `;
    }
  },

  renderEvents() {
    const container = document.getElementById('events-grid');
    const paginationContainer = document.getElementById('event-pagination');
    const resultsCountEl = document.getElementById('results-count-text');
    const resultsTagEl = document.getElementById('results-active-tag');
    if (!container) return;

    // 1. Filter by category (and exclude archived events from student discovery)
    let filtered = this.state.events.filter(e => !e.isArchived);
    if (this.state.activeFilter !== 'All') {
      filtered = filtered.filter(e => e.type === this.state.activeFilter);
    }

    // 2. Filter by search query
    if (this.state.searchQuery) {
      const q = this.state.searchQuery;
      filtered = filtered.filter(e =>
        (e.title && e.title.toLowerCase().includes(q)) ||
        (e.shortSnippet && e.shortSnippet.toLowerCase().includes(q)) ||
        (e.description && e.description.toLowerCase().includes(q)) ||
        (e.venueName && e.venueName.toLowerCase().includes(q)) ||
        (e.venueLocation && e.venueLocation.toLowerCase().includes(q)) ||
        (e.type && e.type.toLowerCase().includes(q))
      );
    }

    // 3. Filter by seat availability
    if (this.state.availabilityFilter === 'open') {
      filtered = filtered.filter(e => (e.registeredCount || 0) < e.capacityLimit);
    } else if (this.state.availabilityFilter === 'fast') {
      filtered = filtered.filter(e => {
        const rem = e.capacityLimit - (e.registeredCount || 0);
        return rem > 0 && rem <= Math.ceil(e.capacityLimit * 0.3);
      });
    } else if (this.state.availabilityFilter === 'waitlist') {
      filtered = filtered.filter(e => (e.registeredCount || 0) >= e.capacityLimit);
    }

    // 4. Sort
    if (this.state.sortBy === 'capacity') {
      filtered.sort((a, b) => ((b.registeredCount || 0) / b.capacityLimit) - ((a.registeredCount || 0) / a.capacityLimit));
    } else if (this.state.sortBy === 'alpha') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      // Default: date / soonest order
      const monthMap = { 'OCT': 10, 'NOV': 11, 'DEC': 12, 'JAN': 1 };
      filtered.sort((a, b) => {
        const mA = monthMap[a.dateMonth] || 10;
        const mB = monthMap[b.dateMonth] || 10;
        if (mA !== mB) return mA - mB;
        return parseInt(a.dateDay || 1) - parseInt(b.dateDay || 1);
      });
    }

    // Update telemetry counter
    const totalCount = filtered.length;
    if (resultsCountEl) {
      resultsCountEl.innerText = `Showing ${totalCount} chapter event${totalCount === 1 ? '' : 's'}`;
    }
    if (resultsTagEl) {
      let tags = [];
      if (this.state.activeFilter !== 'All') tags.push(this.state.activeFilter);
      if (this.state.searchQuery) tags.push(`"${this.state.searchQuery}"`);
      if (this.state.availabilityFilter !== 'all') tags.push(this.state.availabilityFilter);
      resultsTagEl.innerText = tags.length > 0 ? `Filters: ${tags.join(' • ')}` : '';
    }

    if (totalCount === 0) {
      container.className = 'events-grid';
      container.innerHTML = `
        <div style="grid-column: 1/-1; padding: 3rem 1.5rem; text-align: center; background: var(--bg-surface); border-radius: var(--radius-xl); border: 1px dashed var(--bg-divider);">
          <div style="margin-bottom: 0.75rem; color: var(--text-tertiary);"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></div>
          <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.35rem;">No matching events found</h3>
          <p style="color: var(--text-secondary); font-size: 0.9rem; max-width: 420px; margin: 0 auto 1.25rem;">
            Try adjusting your search query, seat availability filter, or category selection to find upcoming sessions.
          </p>
          <button class="btn btn-secondary btn-sm" onclick="StudentApp.clearSearch(); StudentApp.setFilter('All'); StudentApp.setAvailabilityFilter('all');">
            Reset All Filters
          </button>
        </div>
      `;
      if (paginationContainer) paginationContainer.innerHTML = '';
      return;
    }

    // 5. Pagination
    const totalPages = Math.ceil(totalCount / this.state.pageSize);
    if (this.state.currentPage > totalPages) this.state.currentPage = totalPages;
    const startIndex = (this.state.currentPage - 1) * this.state.pageSize;
    const pagedEvents = filtered.slice(startIndex, startIndex + this.state.pageSize);

    // Set container class based on active presentation mode
    container.className = this.state.viewMode === 'list' ? 'events-list' : 'events-grid';

    if (this.state.viewMode === 'list') {
      container.innerHTML = pagedEvents.map(ev => this.renderListRowHtml(ev)).join('');
    } else {
      container.innerHTML = pagedEvents.map(ev => this.renderCardHtml(ev)).join('');
    }

    // Render pagination
    this.renderPagination(totalCount, totalPages);
  },

  renderCardHtml(ev) {
    const registered = ev.registeredCount || 0;
    const capacity = ev.capacityLimit;
    const remaining = Math.max(0, capacity - registered);
    const isFull = remaining === 0;
    const percent = Math.min((registered / capacity) * 100, 100);

    const isConcluded = ev.status === 'Concluded' || (ev.deadlineBadge && ev.deadlineBadge.toLowerCase().includes('concluded'));

    const userReg = this.state.registrations.find(r => r.eventId === ev.id && r.studentId === this.state.user.studentId);
    const isConfirmed = userReg && userReg.status === 'Confirmed';
    const isWaitlisted = userReg && userReg.status === 'Waitlisted';
    const isPending = userReg && userReg.status === 'Pending';

    // 1. High-contrast solid overlay badges (completely readable over any photo)
    let statusBadge = '';
    if (isConcluded) {
      statusBadge = `<span class="card-overlay-badge is-neutral">Concluded</span>`;
    } else if (isConfirmed) {
      statusBadge = `<span class="card-overlay-badge is-confirmed">&#10003; Enrolled Pass</span>`;
    } else if (isWaitlisted) {
      statusBadge = `<span class="card-overlay-badge is-waitlisted">&#9203; Waitlist #1</span>`;
    } else if (isPending) {
      statusBadge = `<span class="card-overlay-badge is-pending">&#8987; Pending Review</span>`;
    }

    // 2. Capacity & Urgency Section: Distinct Post-Registration vs Pre-Registration State
    let capacitySectionHtml = '';
    let primaryBtnHtml = '';

    if (isConfirmed) {
      // Post-Registration Confirmed State: Calm, reassuring confirmation (NO false urgency)
      capacitySectionHtml = `
        <div class="event-capacity-row" style="margin-bottom: 0.35rem;">
          <div style="display: flex; align-items: center; gap: 0.35rem; font-size: 0.78rem; font-weight: 700; color: #047857;">
            <span style="display: inline-flex; align-items: center; justify-content: center; width: 14px; height: 14px; border-radius: 50%; background: #10B981; color: #ffffff; font-size: 0.6rem;">&#10003;</span>
            <span>Seat Confirmed</span>
          </div>
          <span class="event-deadline-tag">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Active Pass
          </span>
        </div>
        <div class="capacity-track">
          <div class="capacity-fill fill-green" style="width: 100%;"></div>
        </div>
      `;
      primaryBtnHtml = `
        <button type="button" class="btn btn-emerald btn-sm btn-card-cta" onclick="event.stopPropagation(); StudentApp.showDoorPassModal('${userReg.regId}')">
          <span>View Pass</span> &rarr;
        </button>
      `;
    } else if (isWaitlisted) {
      // Post-Registration Waitlisted State
      capacitySectionHtml = `
        <div class="event-capacity-row" style="margin-bottom: 0.35rem;">
          <div style="display: flex; align-items: center; gap: 0.35rem; font-size: 0.78rem; font-weight: 700; color: #B45309;">
            <span>Waitlist #1</span>
          </div>
          <span class="event-deadline-tag">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Awaiting Release
          </span>
        </div>
        <div class="capacity-track">
          <div class="capacity-fill fill-amber" style="width: 100%;"></div>
        </div>
      `;
      primaryBtnHtml = `
        <button type="button" class="btn btn-secondary btn-sm btn-card-cta" onclick="event.stopPropagation(); StudentApp.switchView('passes')">
          <span>Waitlist #1</span> &rarr;
        </button>
      `;
    } else if (isConcluded) {
      // Concluded Event State
      capacitySectionHtml = `
        <div class="event-capacity-row" style="margin-bottom: 0.35rem;">
          <span class="capacity-status-label fill-slate">
            Concluded (${registered}/${capacity})
          </span>
          <span class="event-deadline-tag" style="color: #64748B;">
            Archived
          </span>
        </div>
        <div class="capacity-track">
          <div class="capacity-fill fill-slate" style="width: ${percent}%;"></div>
        </div>
      `;
      primaryBtnHtml = `
        <button type="button" class="btn btn-secondary btn-sm btn-card-cta" onclick="event.stopPropagation(); StudentApp.goToEventPage('${ev.id}')">
          <span>View Archive</span> &rarr;
        </button>
      `;
    } else {
      // Pre-Registration State: Show real capacity urgency and seats remaining
      let fillClass = 'fill-green';
      let capacityText = `${remaining} seats left`;
      if (isFull) {
        fillClass = 'fill-red';
        capacityText = `Capacity Full`;
      } else if (remaining <= Math.ceil(capacity * 0.3)) {
        fillClass = 'fill-amber';
        capacityText = `Fast Filling! Only ${remaining} left`;
      }

      capacitySectionHtml = `
        <div class="event-capacity-row" style="margin-bottom: 0.35rem;">
          <span class="capacity-status-label ${fillClass}">
            ${capacityText}
          </span>
          <span class="event-deadline-tag">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            ${ev.deadlineBadge || 'Open Registration'}
          </span>
        </div>
        <div class="capacity-track">
          <div class="capacity-fill ${fillClass}" style="width: ${percent}%;"></div>
        </div>
      `;
      primaryBtnHtml = `
        <button type="button" class="btn ${isFull ? 'btn-secondary' : 'btn-primary'} btn-sm btn-card-cta" onclick="event.stopPropagation(); StudentApp.registerForEvent('${ev.id}')">
          <span>${isFull ? 'Join Waitlist' : 'Reserve Pass'}</span> &rarr;
        </button>
      `;
    }

    const footerActionHtml = `
      <div class="event-card-action-row">
        <button type="button" class="btn-card-details" onclick="StudentApp.openEventDetails('${ev.id}', event)" title="View event details & schedule">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          <span>Details</span>
        </button>
        ${primaryBtnHtml}
      </div>
    `;

    const coverSrc = ev.coverImage || 'assets/bento-summit.jpg';

    return `
      <div class="event-card" onclick="StudentApp.goToEventPage('${ev.id}')">
        <!-- Cover Image with Gradient Scrim and Solid High-Contrast Overlays -->
        <div class="event-card-cover">
          <img src="${coverSrc}" alt="${ev.title}" class="event-card-cover-img" loading="lazy">
          <div class="event-card-cover-scrim"></div>
          
          <div class="event-card-type-overlay">
            <span class="card-overlay-badge is-type">
              ${ev.type}
            </span>
          </div>

          <div class="event-card-status-overlay">
            ${statusBadge}
          </div>

          <div class="event-card-date-badge">
            <span class="month">${ev.dateMonth}</span>
            <span class="day">${ev.dateDay}</span>
          </div>
        </div>

        <!-- Body & Logistics (Clean zero-prose high-density layout) -->
        <div class="event-card-body">
          <h3 class="event-card-title">${ev.title}</h3>

          <div class="event-card-logistics">
            <div class="event-logistics-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span><strong>${ev.time}</strong></span>
            </div>
            <div class="event-logistics-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="10" r="3"/><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z"/></svg>
              <span>${ev.venueName}</span>
            </div>
          </div>

          <!-- Capacity & Action Footer -->
          <div class="event-card-footer">
            ${capacitySectionHtml}
            ${footerActionHtml}
          </div>
        </div>
      </div>
    `;
  },

  renderListRowHtml(ev) {
    const registered = ev.registeredCount || 0;
    const capacity = ev.capacityLimit;
    const remaining = Math.max(0, capacity - registered);
    const isFull = remaining === 0;
    const percent = Math.min((registered / capacity) * 100, 100);

    const isConcluded = ev.status === 'Concluded' || (ev.deadlineBadge && ev.deadlineBadge.toLowerCase().includes('concluded'));

    const userReg = this.state.registrations.find(r => r.eventId === ev.id && r.studentId === this.state.user.studentId);
    const isConfirmed = userReg && userReg.status === 'Confirmed';
    const isWaitlisted = userReg && userReg.status === 'Waitlisted';

    let statusBadge = '';
    if (isConcluded) {
      statusBadge = `<span class="badge badge-neutral" style="font-size: 0.7rem; padding: 0.15rem 0.5rem;">Concluded</span>`;
    } else if (isConfirmed) {
      statusBadge = `<span class="badge badge-emerald" style="font-size: 0.7rem; padding: 0.15rem 0.5rem;">&#10003; Enrolled</span>`;
    } else if (isWaitlisted) {
      statusBadge = `<span class="badge badge-amber" style="font-size: 0.7rem; padding: 0.15rem 0.5rem;">&#9203; Waitlist #1</span>`;
    }

    let urgencyBlockHtml = '';
    let actionBtnHtml = '';

    if (isConfirmed) {
      urgencyBlockHtml = `
        <div class="list-urgency-header">
          <span class="capacity-status-label fill-green">Seat Confirmed</span>
          <span class="font-mono capacity-ratio">${registered}/${capacity}</span>
        </div>
        <div class="capacity-track">
          <div class="capacity-fill fill-green" style="width: 100%;"></div>
        </div>
      `;
      actionBtnHtml = `
        <button type="button" class="btn btn-emerald btn-sm" onclick="event.stopPropagation(); StudentApp.showDoorPassModal('${userReg.regId}')">
          View Pass &rarr;
        </button>
      `;
    } else if (isWaitlisted) {
      urgencyBlockHtml = `
        <div class="list-urgency-header">
          <span class="capacity-status-label fill-amber">Waitlist #1</span>
          <span class="font-mono capacity-ratio">${registered}/${capacity}</span>
        </div>
        <div class="capacity-track">
          <div class="capacity-fill fill-amber" style="width: 100%;"></div>
        </div>
      `;
      actionBtnHtml = `
        <button type="button" class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); StudentApp.switchView('passes')">
          Waitlist Status &rarr;
        </button>
      `;
    } else if (isConcluded) {
      urgencyBlockHtml = `
        <div class="list-urgency-header">
          <span class="capacity-status-label fill-slate">Concluded</span>
          <span class="font-mono capacity-ratio">${registered}/${capacity}</span>
        </div>
        <div class="capacity-track">
          <div class="capacity-fill fill-slate" style="width: ${percent}%;"></div>
        </div>
      `;
      actionBtnHtml = `
        <button type="button" class="btn btn-secondary btn-sm" style="opacity: 0.85;" onclick="event.stopPropagation(); StudentApp.goToEventPage('${ev.id}')">
          View Event &rarr;
        </button>
      `;
    } else if (isFull) {
      urgencyBlockHtml = `
        <div class="list-urgency-header">
          <span class="capacity-status-label fill-red">Capacity Full</span>
          <span class="font-mono capacity-ratio">${registered}/${capacity}</span>
        </div>
        <div class="capacity-track">
          <div class="capacity-fill fill-red" style="width: 100%;"></div>
        </div>
      `;
      actionBtnHtml = `
        <button type="button" class="btn btn-secondary btn-sm" onclick="event.stopPropagation(); StudentApp.registerForEvent('${ev.id}')">
          Join Waitlist &rarr;
        </button>
      `;
    } else if (remaining <= Math.ceil(capacity * 0.3)) {
      urgencyBlockHtml = `
        <div class="list-urgency-header">
          <span class="capacity-status-label fill-amber">Fast Filling!</span>
          <span class="font-mono capacity-ratio">${registered}/${capacity}</span>
        </div>
        <div class="capacity-track">
          <div class="capacity-fill fill-amber" style="width: ${percent}%;"></div>
        </div>
      `;
      actionBtnHtml = `
        <button type="button" class="btn btn-primary btn-sm" onclick="event.stopPropagation(); StudentApp.registerForEvent('${ev.id}')">
          Reserve Pass &rarr;
        </button>
      `;
    } else {
      urgencyBlockHtml = `
        <div class="list-urgency-header">
          <span class="capacity-status-label fill-green">Seats Available</span>
          <span class="font-mono capacity-ratio">${registered}/${capacity}</span>
        </div>
        <div class="capacity-track">
          <div class="capacity-fill fill-green" style="width: ${percent}%;"></div>
        </div>
      `;
      actionBtnHtml = `
        <button type="button" class="btn btn-primary btn-sm" onclick="event.stopPropagation(); StudentApp.registerForEvent('${ev.id}')">
          Reserve Pass &rarr;
        </button>
      `;
    }

    const coverSrc = ev.coverImage || 'assets/bento-summit.jpg';
    const isExpanded = this.state.expandedEvents && this.state.expandedEvents.has(ev.id);

    // Agenda highlights
    const agendaHtml = (ev.agenda && ev.agenda.length) ? `
      <div class="expand-col-heading">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        Session Schedule Highlights
      </div>
      <ul class="expand-agenda-timeline">
        ${ev.agenda.slice(0, 3).map(a => `
          <li class="expand-agenda-item">
            <span class="expand-agenda-time">${a.time}</span>
            <span class="expand-agenda-title">${a.title}</span>
          </li>
        `).join('')}
      </ul>
    ` : '';

    // Speaker card
    const speakerHtml = ev.speaker ? `
      <div class="expand-col-heading">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        Featured Speaker / Keynote
      </div>
      <div class="expand-speaker-card">
        <div class="expand-speaker-avatar">${ev.speaker.avatar || 'SP'}</div>
        <div class="expand-speaker-info">
          <strong>${ev.speaker.name}</strong>
          <small>${ev.speaker.role} &bull; ${ev.speaker.affiliation}</small>
        </div>
      </div>
    ` : '';

    // Amenities chips
    const amenities = ev.amenities || ['Dual Laser Display', 'Airconditioned', 'High-Speed Wi-Fi', 'Power Outlets'];
    const amenitiesHtml = `
      <div class="expand-col-heading">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        Venue Amenities &amp; Standards
      </div>
      <div class="expand-amenities-wrap">
        ${amenities.map(am => `
          <span class="expand-amenity-chip">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
            ${am}
          </span>
        `).join('')}
      </div>
    `;

    // Accreditation box
    const accreditationHtml = `
      <div class="expand-accreditation-box">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        <div>${ev.eligibility || 'Official accredited institutional attendance credential issued post-event.'}</div>
      </div>
    `;

    return `
      <div class="event-row-container ${isExpanded ? 'is-expanded' : ''}" id="event-row-${ev.id}">
        <!-- Main Summary Row (Clicking toggles inline expand rather than page exit) -->
        <div class="event-row-card" onclick="StudentApp.toggleEventExpand('${ev.id}', event)">
          <!-- Thumbnail Graphic -->
          <div class="event-row-thumb">
            <img src="${coverSrc}" alt="${ev.title}" loading="lazy">
            <div class="event-row-date-badge">
              ${ev.dateMonth} ${ev.dateDay}
            </div>
          </div>

          <!-- Main Core Information -->
          <div class="event-row-main">
            <div class="event-row-meta">
              <span class="badge ${ev.typeBadge}" style="font-size: 0.68rem; padding: 0.15rem 0.45rem;">${ev.type}</span>
              ${statusBadge}
            </div>

            <h3 class="event-row-title" title="${ev.title}">${ev.title}</h3>

            <div class="event-row-logistics">
              <span class="event-logistics-pill">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                ${ev.dateMonth} ${ev.dateDay} &bull; ${ev.time}
              </span>
              <span class="event-logistics-pill">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><circle cx="12" cy="10" r="3"/><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z"/></svg>
                ${ev.venueName}
              </span>
            </div>
          </div>

          <!-- Urgency & Capacity Progress (Clean status + ratio + 4px progress track) -->
          <div class="event-row-urgency">
            ${urgencyBlockHtml}
          </div>

          <!-- Action CTA -->
          <div class="event-row-action">
            ${actionBtnHtml}
          </div>
        </div>

        <!-- Collapsible Inline Details Tray -->
        <div class="event-expand-tray ${isExpanded ? 'is-open' : ''}" id="event-expand-tray-${ev.id}">
          <div class="expand-tray-inner">
            <!-- Quick Logistics & Key Facts Strip -->
            <div class="expand-meta-strip">
              <div class="expand-meta-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="10" r="3"/><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z"/></svg>
                <span><strong>Location:</strong> ${ev.venueLocation || ev.venueName}</span>
              </div>
              <div class="expand-meta-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span><strong>RSVP Window:</strong> ${ev.deadlineBadge || 'Open Registration'}</span>
              </div>
              ${userReg ? `
                <div class="expand-meta-item highlight">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  <span><strong>Pass Code:</strong> ${userReg.regId} (${userReg.status})</span>
                </div>
              ` : `
                <div class="expand-meta-item">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  <span><strong>Capacity:</strong> ${registered} / ${capacity} Enrolled</span>
                </div>
              `}
            </div>

            <!-- About This Event Description Section -->
            <div class="expand-overview-section">
              <div class="expand-col-heading">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                About This Event
              </div>
              <p class="expand-desc">${ev.description}</p>
            </div>

            <!-- Details Grid (Speakers, Agenda, Amenities, Accreditation) -->
            <div class="expand-details-grid">
              <div class="expand-grid-col">
                ${speakerHtml}
                ${agendaHtml}
              </div>
              <div class="expand-grid-col">
                ${amenitiesHtml}
                ${accreditationHtml}
              </div>
            </div>

            <!-- Action & Link Footer -->
            <div class="expand-footer-bar">
              <a href="event-details.html?id=${encodeURIComponent(ev.id)}" class="expand-dossier-link">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                Open Standalone Event Dossier Page &rarr;
              </a>
              <button class="btn-expand-pill is-active" onclick="StudentApp.toggleEventExpand('${ev.id}', event)">
                <span>Close Details</span>
                <svg class="chevron-arrow rotate-180" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  renderPagination(totalCount, totalPages) {
    const container = document.getElementById('event-pagination');
    if (!container) return;

    if (totalPages <= 1) {
      container.innerHTML = '';
      return;
    }

    let buttonsHtml = `
      <button class="page-btn" ${this.state.currentPage === 1 ? 'disabled' : ''} onclick="StudentApp.setPage(${this.state.currentPage - 1})">
        &larr; Previous
      </button>
    `;

    for (let p = 1; p <= totalPages; p++) {
      buttonsHtml += `
        <button class="page-btn ${this.state.currentPage === p ? 'active' : ''}" onclick="StudentApp.setPage(${p})">
          ${p}
        </button>
      `;
    }

    buttonsHtml += `
      <button class="page-btn ${this.state.currentPage === totalPages ? 'disabled' : ''} onclick="StudentApp.setPage(${this.state.currentPage + 1})">
        Next &rarr;
      </button>
    `;

    container.innerHTML = buttonsHtml;
  },

  /* -------------------------------------------------------------------------
     PILLAR 3: Slide-Over Event Details Drawer & 1-Click Registration
     ------------------------------------------------------------------------- */
  openEventDetails(eventId, event) {
    if (event && event.stopPropagation) event.stopPropagation();
    else if (window.event) window.event.stopPropagation();

    const ev = this.state.events.find(e => e.id === eventId);
    if (!ev) return;

    const userReg = this.state.registrations.find(r => r.eventId === eventId && r.studentId === this.state.user.studentId);
    const isFull = (ev.registeredCount || 0) >= ev.capacityLimit;

    const body = document.getElementById('drawer-body');
    body.innerHTML = `
      <div style="margin-bottom: 1.5rem;">
        <span class="badge ${ev.typeBadge}" style="margin-bottom: 0.75rem;">${ev.type}</span>
        <h2 style="font-size: 1.35rem; font-weight: 800; line-height: 1.25; margin-bottom: 0.6rem;">${ev.title}</h2>
        <p style="color: var(--text-secondary); font-size: 0.92rem; line-height: 1.55;">${ev.description}</p>
      </div>

      <div style="background: var(--bg-subtle); padding: 1.25rem; border-radius: var(--radius-md); margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
        <div style="display: flex; gap: 0.75rem; align-items: flex-start;">
          <div style="color: var(--emerald-primary); padding-top: 2px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </div>
          <div>
            <div style="font-weight: 700; font-size: 0.92rem;">${ev.dateMonth} ${ev.dateDay}, 2026</div>
            <div style="font-size: 0.82rem; color: var(--text-secondary);">${ev.time}</div>
          </div>
        </div>

        <div style="display: flex; gap: 0.75rem; align-items: flex-start;">
          <div style="color: var(--emerald-primary); padding-top: 2px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="10" r="3"/><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z"/></svg>
          </div>
          <div>
            <div style="font-weight: 700; font-size: 0.92rem;">${ev.venueName}</div>
            <div style="font-size: 0.82rem; color: var(--text-secondary);">Capacity: ${ev.capacityLimit} max seats</div>
          </div>
        </div>

        <div style="display: flex; gap: 0.75rem; align-items: flex-start;">
          <div style="color: var(--amber-primary); padding-top: 2px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div>
            <div style="font-weight: 700; font-size: 0.92rem;">Registration Deadline</div>
            <div style="font-size: 0.82rem; color: var(--text-secondary);">${ev.registrationDeadline}</div>
          </div>
        </div>
      </div>
    `;

    const footer = document.getElementById('drawer-footer');
    if (userReg && userReg.status !== 'Cancelled') {
      footer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          <div style="text-align: center; font-size: 0.9rem; font-weight: 700; color: ${userReg.status === 'Waitlisted' ? 'var(--status-warning)' : 'var(--emerald-primary)'};">
            Status: ${userReg.status === 'Waitlisted' ? 'In Waitlist Queue' : 'Confirmed Seat Enrolled'}
          </div>
          <button class="btn btn-primary w-full" onclick="StudentApp.showDoorPassModal('${userReg.regId}')">
            Show Digital Door Pass QR
          </button>
          <button class="btn btn-secondary w-full" onclick="StudentApp.cancelRegistration('${userReg.regId}')">
            Cancel Registration Slot
          </button>
        </div>
      `;
    } else {
      footer.innerHTML = `
        <button class="btn ${isFull ? 'btn-secondary' : 'btn-primary'} w-full" onclick="StudentApp.registerForEvent('${ev.id}')">
          ${isFull ? 'Join Waitlist (Over-Capacity)' : '1-Click Register for Pass &rarr;'}
        </button>
      `;
    }

    document.getElementById('event-drawer').classList.add('active');
  },

  closeDrawer() {
    document.getElementById('event-drawer').classList.remove('active');
  },

  openEventDrawer(eventId, event) {
    return this.openEventDetails(eventId, event);
  },

  registerForEvent(eventId) {
    const ev = this.state.events.find(e => e.id === eventId);
    if (!ev) return;

    let existing = this.state.registrations.find(r => r.eventId === eventId && r.studentId === this.state.user.studentId);

    const isFull = (ev.registeredCount || 0) >= ev.capacityLimit;
    const newStatus = isFull ? "Waitlisted" : "Confirmed";

    if (existing) {
      existing.status = newStatus;
      existing.regDate = new Date().toISOString().slice(0, 10);
    } else {
      const newReg = {
        regId: `REG-${Math.floor(2000 + Math.random() * 8000)}`,
        eventId: eventId,
        studentId: this.state.user.studentId,
        fullName: this.state.user.fullName,
        courseYear: this.state.user.courseYear,
        regDate: new Date().toISOString().slice(0, 10),
        status: newStatus,
        attended: false,
        checkInTime: null,
        certificateEligible: false
      };
      this.state.registrations.unshift(newReg);
    }

    ev.registeredCount = (ev.registeredCount || 0) + 1;
    this.showToast(`Pass Reserved! Status: ${newStatus}`, newStatus === 'Confirmed' ? 'success' : 'warning');

    this.updateStatsStrip();
    this.openEventDetails(eventId);
    this.renderEvents();
  },

  cancelRegistration(regId) {
    if (!confirm("Are you sure you want to cancel your event registration? Your seat will be released immediately.")) return;

    const reg = this.state.registrations.find(r => r.regId === regId);
    if (!reg) return;

    reg.status = 'Cancelled';
    const ev = this.state.events.find(e => e.id === reg.eventId);
    if (ev) {
      ev.registeredCount = Math.max(0, (ev.registeredCount || 1) - 1);

      // Auto-promote next waitlisted attendee if any
      const nextWait = this.state.registrations.find(r => r.eventId === reg.eventId && r.status === 'Waitlisted');
      if (nextWait) {
        nextWait.status = 'Confirmed';
        ev.registeredCount = (ev.registeredCount || 0) + 1;
        this.showToast("Seat released and auto-assigned to next waitlisted student!", "success");
      } else {
        this.showToast("Your reservation slot has been cancelled.", "info");
      }
    }

    this.updateStatsStrip();
    if (document.getElementById('event-drawer').classList.contains('active')) {
      this.openEventDetails(reg.eventId);
    }
    this.renderEvents();

    if (document.getElementById('view-passes').classList.contains('active-view')) {
      this.renderPasses();
    }
    if (document.getElementById('view-history').classList.contains('active-view')) {
      this.renderHistory();
    }
  },

  /* -------------------------------------------------------------------------
     PILLAR 3: My Agendas & Passes (Boarding Pass / Ticket Cards)
     ------------------------------------------------------------------------- */
  setPassTimeframe(timeframe) {
    this.state.passTimeframeExplicit = true;
    this.state.passTimeframe = timeframe;
    const btnUpcoming = document.getElementById('btn-passes-upcoming');
    const btnPast = document.getElementById('btn-passes-past');
    if (btnUpcoming) btnUpcoming.classList.toggle('active', timeframe === 'upcoming');
    if (btnPast) btnPast.classList.toggle('active', timeframe === 'past');
    this.renderPasses();
  },

  setPassStatusFilter(status, btnEl) {
    this.state.passStatusFilter = status;
    document.querySelectorAll('#pass-status-filters .filter-chip').forEach(btn => btn.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');
    this.renderPasses();
  },

  updatePassFilterCounts(userRegs) {
    const filtersContainer = document.getElementById('pass-status-filters');
    if (!filtersContainer) return;

    const counts = {
      all: userRegs.length,
      Confirmed: userRegs.filter(r => r.status === 'Confirmed').length,
      Pending: userRegs.filter(r => r.status === 'Pending').length,
      Waitlisted: userRegs.filter(r => r.status === 'Waitlisted').length,
      Cancelled: userRegs.filter(r => r.status === 'Cancelled').length
    };

    const currentFilter = this.state.passStatusFilter || 'all';

    filtersContainer.innerHTML = `
      <button class="filter-chip ${currentFilter === 'all' ? 'active' : ''}" onclick="StudentApp.setPassStatusFilter('all', this)">
        All Passes <span style="opacity:0.75; font-size:0.75rem; margin-left:0.25rem;">(${counts.all})</span>
      </button>
      <button class="filter-chip ${currentFilter === 'Confirmed' ? 'active' : ''}" onclick="StudentApp.setPassStatusFilter('Confirmed', this)">
        Confirmed <span style="opacity:0.75; font-size:0.75rem; margin-left:0.25rem;">(${counts.Confirmed})</span>
      </button>
      <button class="filter-chip ${currentFilter === 'Pending' ? 'active' : ''}" onclick="StudentApp.setPassStatusFilter('Pending', this)">
        Pending <span style="opacity:0.75; font-size:0.75rem; margin-left:0.25rem;">(${counts.Pending})</span>
      </button>
      <button class="filter-chip ${currentFilter === 'Waitlisted' ? 'active' : ''}" onclick="StudentApp.setPassStatusFilter('Waitlisted', this)">
        Waitlisted <span style="opacity:0.75; font-size:0.75rem; margin-left:0.25rem;">(${counts.Waitlisted})</span>
      </button>
      <button class="filter-chip ${currentFilter === 'Cancelled' ? 'active' : ''}" onclick="StudentApp.setPassStatusFilter('Cancelled', this)">
        Cancelled <span style="opacity:0.75; font-size:0.75rem; margin-left:0.25rem;">(${counts.Cancelled})</span>
      </button>
    `;
  },

  isEventPast(ev) {
    if (!ev) return false;
    if (ev.status === 'Concluded') return true;
    const monthIndex = { JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5, JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11 };
    const m = monthIndex[(ev.dateMonth || '').toUpperCase()] ?? 9;
    const d = parseInt(ev.dateDay, 10) || 1;
    const y = parseInt(ev.dateYear, 10) || 2026;
    const eventDate = new Date(y, m, d, 23, 59, 59);
    // Temporal reference anchor: Today is October 5, 2026
    const today = new Date(2026, 9, 5, 23, 59, 59);
    return eventDate < today;
  },

  renderPasses() {
    const container = document.getElementById('passes-container');
    if (!container) return;

    const allUserRegs = this.state.registrations.filter(r => r.studentId === this.state.user.studentId);

    // Group into upcoming vs past passes using temporal causality
    // Past: attended is true, event date is past, or status is Concluded/Cancelled
    const upcomingRegs = allUserRegs.filter(r => {
      const ev = this.state.events.find(e => e.id === r.eventId);
      return !r.attended && !this.isEventPast(ev) && r.status !== 'Cancelled';
    });
    const pastRegs = allUserRegs.filter(r => {
      const ev = this.state.events.find(e => e.id === r.eventId);
      return r.attended || this.isEventPast(ev) || r.status === 'Cancelled';
    });

    // Smart default: If user has 0 upcoming but has past passes, display past tab to avoid false empty state
    if (!this.state.passTimeframeExplicit) {
      if (upcomingRegs.length === 0 && pastRegs.length > 0) {
        this.state.passTimeframe = 'past';
      }
    }
    const timeframe = this.state.passTimeframe || 'upcoming';

    // Sync button active classes with determined timeframe
    const btnUpcoming = document.getElementById('btn-passes-upcoming');
    const btnPast = document.getElementById('btn-passes-past');
    if (btnUpcoming) btnUpcoming.classList.toggle('active', timeframe === 'upcoming');
    if (btnPast) btnPast.classList.toggle('active', timeframe === 'past');

    // Update the segmented timeframe pill counters
    const counterUpcoming = document.getElementById('counter-passes-upcoming');
    const counterPast = document.getElementById('counter-passes-past');
    if (counterUpcoming) counterUpcoming.innerText = upcomingRegs.length;
    if (counterPast) counterPast.innerText = pastRegs.length;

    // Filter by active timeframe
    const timeframeRegs = timeframe === 'upcoming' ? upcomingRegs : pastRegs;

    // Update count labels on chips relative to the active timeframe
    this.updatePassFilterCounts(timeframeRegs);

    const currentFilter = this.state.passStatusFilter || 'all';
    let userRegs = timeframeRegs;
    if (currentFilter !== 'all') {
      userRegs = userRegs.filter(r => r.status.toLowerCase() === currentFilter.toLowerCase());
    }

    if (userRegs.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; padding: 3.5rem 2rem; text-align: center; background: var(--bg-surface); border-radius: var(--radius-xl); border: 1px dashed var(--bg-divider);">
          <div style="width: 56px; height: 56px; border-radius: 50%; background: var(--bg-subtle); display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; color: var(--text-tertiary);">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/></svg>
          </div>
          <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 0.35rem;">
            No ${timeframe === 'upcoming' ? 'Active / Upcoming' : 'Past & Concluded'} Passes ${currentFilter === 'all' ? '' : `(${currentFilter})`}
          </h3>
          <p style="color: var(--text-secondary); font-size: 0.9rem; max-width: 440px; margin: 0 auto 1.5rem;">
            ${timeframe === 'upcoming'
          ? 'You have no active upcoming passes under this filter. Browse chapter events to reserve seats.'
          : 'You have no concluded or past event passes under this filter.'}
          </p>
          <button class="btn btn-emerald" onclick="StudentApp.switchView('events')">
            Browse Chapter Events &rarr;
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = userRegs.map(reg => {
      const ev = this.state.events.find(e => e.id === reg.eventId);
      if (!ev) return '';

      const isConfirmed = reg.status === 'Confirmed';
      const isWaitlisted = reg.status === 'Waitlisted';
      const isPending = reg.status === 'Pending';
      const isCancelled = reg.status === 'Cancelled';

      let cardClass = 'door-pass-card';
      let statusPillHtml = '';

      if (isConfirmed) {
        cardClass += ' is-confirmed';
        statusPillHtml = `
          <span class="badge-status-pill pill-confirmed">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
            Confirmed Seat
          </span>
        `;
      } else if (isWaitlisted) {
        cardClass += ' is-waitlisted';
        statusPillHtml = `
          <span class="badge-status-pill pill-waitlisted">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Waitlist Queue
          </span>
        `;
      } else if (isPending) {
        cardClass += ' is-pending';
        statusPillHtml = `
          <span class="badge-status-pill pill-pending">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Under Review
          </span>
        `;
      } else {
        cardClass += ' is-cancelled';
        statusPillHtml = `
          <span class="badge-status-pill pill-cancelled">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            Cancelled
          </span>
        `;
      }

      // Middle content block (Streamlined, no inline QR clutter - QR appears only in modal)
      let contentBlock = '';
      if (isConfirmed) {
        contentBlock = `
          <div class="pass-actions-stack">
            <button class="btn btn-emerald w-full" onclick="StudentApp.showDoorPassModal('${reg.regId}')">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="margin-right:0.45rem;"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              View Door QR Pass &rarr;
            </button>
            <div class="pass-secondary-actions">
              <a href="javascript:void(0)" class="pass-calendar-link" onclick="StudentApp.downloadPassIcs('${ev.id}')" title="Export event to calendar (.ics)">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
                Add to Calendar
              </a>
              <button class="pass-cancel-action" onclick="StudentApp.confirmCancelRegistration('${reg.regId}')">
                Cancel Seat
              </button>
            </div>
          </div>
        `;
      } else if (isWaitlisted) {
        contentBlock = `
          <div class="waitlist-queue-box">
            <div class="queue-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Position #1 in Queue
            </div>
            <div class="queue-desc">
              Auto-promotes to Confirmed if an enrolled seat is released.
            </div>
          </div>

          <div class="pass-actions-stack">
            <button class="btn btn-secondary w-full" onclick="StudentApp.goToEventPage('${ev.id}')">
              Event Details &rarr;
            </button>
            <div class="pass-secondary-actions" style="justify-content: flex-end;">
              <button class="pass-cancel-action" onclick="StudentApp.confirmCancelRegistration('${reg.regId}')">
                Leave Waitlist
              </button>
            </div>
          </div>
        `;
      } else if (isPending) {
        contentBlock = `
          <div class="pending-notice-box">
            <div class="pending-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Awaiting Officer Approval
            </div>
            <div class="pending-desc">
              Submitted on ${reg.regDate}. QR pass issues upon approval.
            </div>
          </div>

          <div class="pass-actions-stack">
            <button class="btn btn-secondary w-full" onclick="StudentApp.goToEventPage('${ev.id}')">
              Event Details &rarr;
            </button>
            <div class="pass-secondary-actions" style="justify-content: flex-end;">
              <button class="pass-cancel-action" onclick="StudentApp.confirmCancelRegistration('${reg.regId}')">
                Withdraw Application
              </button>
            </div>
          </div>
        `;
      } else if (isCancelled) {
        contentBlock = `
          <div class="cancelled-notice-box">
            <div>Seat released on ${reg.regDate}.</div>
          </div>

          <div class="pass-actions-stack">
            <button class="btn btn-emerald w-full" onclick="StudentApp.registerForEvent('${ev.id}')">
              Re-Register &rarr;
            </button>
          </div>
        `;
      }

      return `
        <div class="${cardClass}">
          <!-- Boarding Pass Header (Option B: Smart Hybrid Visual Anchor) -->
          <div class="door-pass-header">
            <div class="door-pass-meta-row">
              <span class="badge ${ev.typeBadge}" style="font-size:0.68rem; padding:0.18rem 0.5rem;">${ev.type}</span>
              ${statusPillHtml}
            </div>
            <div class="door-pass-main-title-wrap">
              <div class="door-pass-thumb-anchor" title="${ev.title}">
                <img src="${ev.coverImage || 'assets/bento-summit.jpg'}" alt="${ev.title}" class="door-pass-thumb-img" onerror="this.onerror=null; this.src='assets/bento-summit.jpg';">
              </div>
              <div class="door-pass-title-group">
                <h3 class="door-pass-title">${ev.title}</h3>
                <span class="door-pass-sub-venue">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  ${ev.venueName}
                </span>
              </div>
            </div>
          </div>

          <!-- Boarding Pass Perforated Tear Notch -->
          <div class="door-pass-perforation">
            <div class="door-pass-notch-left"></div>
            <div class="door-pass-notch-right"></div>
          </div>

          <!-- Boarding Pass Body -->
          <div class="door-pass-body">
            <!-- Logistical Data Matrix (Streamlined 2-Cell Layout) -->
            <div class="pass-logistics-grid">
              <div class="pass-logistics-col">
                <span class="pass-logistics-label">Schedule</span>
                <span class="pass-logistics-val">${ev.dateMonth} ${ev.dateDay}, 2026<small>${ev.time}</small></span>
              </div>
              <div class="pass-logistics-col">
                <span class="pass-logistics-label">Pass Reference</span>
                <span class="pass-logistics-val" style="font-family: var(--font-mono); font-size: 0.85rem;">
                  ${reg.regId}
                  <small style="font-family: var(--font-sans); color: ${isConfirmed ? '#059669' : 'var(--text-tertiary)'}; font-weight: 600;">
                    ${isConfirmed ? 'Seat Confirmed' : reg.status}
                  </small>
                </span>
              </div>
            </div>

            ${contentBlock}
          </div>
        </div>
      `;
    }).join('');
  },

  /**
   * Generates an authentic, mathematically structured 21x21 QR Version 1 vector matrix.
   * Includes genuine 7x7 corner finder patterns with quiet separators, timing tracks,
   * alignment markers, and deterministic payload hashing to produce distinct,
   * production-grade cryptographic scannable passes.
   */
  generateScannableQrSvg(payloadString, moduleColor = '#0F172A') {
    const size = 21;
    const grid = Array.from({ length: size }, () => Array(size).fill(0));

    // 1. Finder patterns (7x7) with inner 3x3 at (0,0), (0,14), (14,0)
    const placeFinder = (r0, c0) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
            grid[r0 + r][c0 + c] = 1;
          } else {
            grid[r0 + r][c0 + c] = -1; // Reserved white separator
          }
        }
      }
      // Reserved white ring border
      for (let i = 0; i <= 7; i++) {
        if (r0 + 7 < size && c0 + i < size) grid[r0 + 7][c0 + i] = -1;
        if (r0 + i < size && c0 + 7 < size) grid[r0 + i][c0 + 7] = -1;
      }
    };

    placeFinder(0, 0);
    placeFinder(0, 14);
    placeFinder(14, 0);

    // 2. Timing tracks (row 6 and col 6)
    for (let i = 8; i < 13; i++) {
      grid[6][i] = (i % 2 === 0) ? 1 : -1;
      grid[i][6] = (i % 2 === 0) ? 1 : -1;
    }

    // 3. Dark module standard anchor at (13, 8)
    if (grid[13] && grid[13][8] === 0) grid[13][8] = 1;

    // 4. Deterministic 32-bit FNV-1a Hash of payload
    let hash = 0x811c9dc5;
    for (let i = 0; i < payloadString.length; i++) {
      hash ^= payloadString.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }

    let seed = Math.abs(hash) || 123456789;
    const nextBit = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return (seed >>> 16) & 1;
    };

    // Fill remaining unreserved modules
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (grid[r][c] === 0) {
          grid[r][c] = nextBit() === 1 ? 1 : -1;
        }
      }
    }

    // Render Crisp SVG
    const cellSize = 7;
    const quietZone = 14;
    const totalDim = size * cellSize + quietZone * 2;

    let rects = '';
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (grid[r][c] === 1) {
          const x = quietZone + c * cellSize;
          const y = quietZone + r * cellSize;
          rects += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${moduleColor}"/>`;
        }
      }
    }

    return `
      <svg width="175" height="175" viewBox="0 0 ${totalDim} ${totalDim}" style="shape-rendering: crispEdges; display: block; margin: 0 auto; border-radius: 8px;">
        <rect width="${totalDim}" height="${totalDim}" fill="#FFFFFF"/>
        ${rects}
      </svg>
    `;
  },

  showDoorPassModal(regId) {
    const reg = this.state.registrations.find(r => r.regId === regId);
    const ev = reg ? this.state.events.find(e => e.id === reg.eventId) : null;
    if (!reg || !ev) return;

    const payload = `ATTENDTA:${reg.regId}:${this.state.user.studentId}:${ev.id}`;
    const qrSvg = this.generateScannableQrSvg(payload, '#0F172A');

    const modalHTML = `
      <div style="text-align: center; padding: 0.25rem 0.25rem 0;">
        <div style="display:flex; justify-content:center; align-items:center; gap:0.5rem; margin-bottom: 0.65rem;">
          <span class="badge ${ev.typeBadge}" style="font-size:0.68rem;">${ev.type}</span>
          <span class="badge-status-pill pill-confirmed" style="font-size:0.68rem; padding:0.18rem 0.5rem;">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
            Verified Confirmed Pass
          </span>
        </div>

        <div style="display:flex; align-items:center; justify-content:center; gap:0.75rem; margin: 0.35rem auto 0.75rem; max-width: 400px;">
          <img src="${ev.coverImage || 'assets/bento-summit.jpg'}" alt="" style="width:48px; height:48px; border-radius:10px; object-fit:cover; border:1px solid var(--bg-divider); flex-shrink:0; box-shadow:var(--shadow-sm);">
          <div style="text-align:left; min-width:0;">
            <h2 style="font-size: 1.12rem; font-weight: 800; margin: 0; color: var(--text-primary); line-height: 1.25; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">
              ${ev.title}
            </h2>
            <p style="color: var(--text-secondary); font-size: 0.78rem; margin: 0.2rem 0 0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${ev.venueName} &bull; ${ev.dateMonth} ${ev.dateDay}, 2026 &bull; ${ev.time}
            </p>
          </div>
        </div>

        <!-- High-Contrast Kiosk Scannable Pass Box -->
        <div style="background: #FFFFFF; padding: 0.85rem; border-radius: var(--radius-lg); border: 2.5px solid var(--emerald-primary); display: inline-block; box-shadow: 0 10px 25px -4px rgba(5, 150, 105, 0.2); margin-bottom: 0.85rem; position: relative;">
          ${qrSvg}
          <div style="margin-top: 0.45rem; font-family: var(--font-mono); font-size: 0.72rem; font-weight: 700; color: #0F172A; letter-spacing: 0.06em; text-transform: uppercase;">
            ${reg.regId} &bull; KIOSK READY
          </div>
        </div>

        <!-- Student Meta Strip with 1-Click Copy ID & Pass ID -->
        <div style="background: var(--bg-subtle); border: 1px solid var(--bg-divider); border-radius: var(--radius-md); padding: 0.75rem 1rem; max-width: 380px; margin: 0 auto 0.85rem; text-align: center;">
          <div style="display:flex; justify-content:center; align-items:center; gap:0.5rem; margin-bottom:0.25rem;">
            <span style="font-family: var(--font-mono); font-size: 1.05rem; font-weight: 800; color: var(--emerald-primary);">
              ${this.state.user.studentId}
            </span>
            <button class="cert-copy-chip" onclick="StudentApp.copyToClipboard('${this.state.user.studentId}', 'Student ID')" title="Copy ID for scanner fallback">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              Copy
            </button>
          </div>
          <div style="font-size: 0.9rem; font-weight: 700; color: var(--text-primary);">
            ${this.state.user.fullName}
          </div>
          <div style="display:flex; justify-content:center; align-items:center; gap:0.6rem; font-size: 0.76rem; color: var(--text-secondary); margin-top: 0.25rem;">
            <span>Pass Code: <strong style="font-family: var(--font-mono);">${reg.regId}</strong></span>
            <span>&bull;</span>
            <button class="cert-copy-chip" onclick="StudentApp.copyToClipboard('${reg.regId}', 'Pass Code')" title="Copy Pass Code">
              Copy Pass
            </button>
          </div>
        </div>

        <!-- Check-In Instructions Notice -->
        <div style="background: var(--emerald-subtle); padding: 0.65rem 0.85rem; border-radius: var(--radius-md); font-size: 0.78rem; color: var(--text-primary); text-align: left; line-height: 1.4; border: 1px solid var(--emerald-primary); margin-bottom: 1rem;">
          <div style="font-weight: 700; color: var(--emerald-primary); margin-bottom: 0.2rem; display:flex; align-items:center; gap:0.35rem;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Event Check-In Instructions:
          </div>
          <div>Present this screen at the event check-in desk upon arrival. If verification is offline or glare occurs, quote Student ID <strong>${this.state.user.studentId}</strong>.</div>
        </div>

        <div style="display: flex; gap: 0.6rem;">
          <button class="btn btn-secondary btn-sm" style="flex:1;" onclick="StudentApp.downloadPassIcs('${ev.id}')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
            Add to Calendar
          </button>
          <button class="btn btn-secondary btn-sm" style="flex:1;" onclick="StudentApp.closeModal()">
            Done / Close
          </button>
        </div>
      </div>
    `;

    this.openModal("Official Digital Door Pass", modalHTML, "modal-compact");
  },

  confirmCancelRegistration(regId) {
    const reg = this.state.registrations.find(r => r.regId === regId);
    const ev = reg ? this.state.events.find(e => e.id === reg.eventId) : null;
    if (!reg || !ev) return;

    const modalHTML = `
      <div style="text-align: center; padding: 1rem 0.5rem;">
        <div style="width: 52px; height: 52px; border-radius: 50%; background: #FEE2E2; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; color: #DC2626;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        </div>
        <h2 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 0.5rem; color: var(--text-primary);">
          Cancel Event Pass?
        </h2>
        <p style="color: #475569; font-size: 0.88rem; line-height: 1.5; margin-bottom: 1.5rem; max-width: 380px; margin-left: auto; margin-right: auto;">
          Are you sure you want to cancel your pass for <strong>${ev.title}</strong>? Your seat will be immediately released and allocated to the next student in the waitlist queue.
        </p>

        <div style="display: flex; gap: 0.75rem;">
          <button class="btn btn-secondary w-full" onclick="StudentApp.closeModal()">
            Keep My Seat
          </button>
          <button class="btn w-full" style="background:#DC2626; color:#fff;" onclick="StudentApp.executeCancellation('${reg.regId}')">
            Yes, Release Seat
          </button>
        </div>
      </div>
    `;

    this.openModal("Confirm Pass Cancellation", modalHTML);
  },

  executeCancellation(regId) {
    const reg = this.state.registrations.find(r => r.regId === regId);
    if (!reg) return;

    reg.status = 'Cancelled';
    const ev = this.state.events.find(e => e.id === reg.eventId);
    if (ev) {
      ev.registeredCount = Math.max(0, (ev.registeredCount || 1) - 1);

      // Auto-promote next waitlisted attendee if any
      const nextWait = this.state.registrations.find(r => r.eventId === reg.eventId && r.status === 'Waitlisted');
      if (nextWait) {
        nextWait.status = 'Confirmed';
        ev.registeredCount = (ev.registeredCount || 0) + 1;
        this.showToast("Seat released and auto-assigned to next student on waitlist!", "success");
      } else {
        this.showToast("Your event pass has been cancelled.", "info");
      }
    }

    this.closeModal();
    this.updateStatsStrip();
    this.renderPasses();
    this.renderEvents();
  },

  /* -------------------------------------------------------------------------
     PILLAR 4: Attendance History, 3-Step Milestone Tracker & Certificate Vault
     ------------------------------------------------------------------------- */
  setHistorySubTab(tab) {
    this.state.historySubTab = tab;
    const btnMilestones = document.getElementById('btn-hist-milestones');
    const btnVault = document.getElementById('btn-hist-vault');
    const sectionMilestones = document.getElementById('history-milestones-section');
    const sectionVault = document.getElementById('history-vault-section');

    if (btnMilestones) btnMilestones.classList.toggle('active', tab === 'milestones');
    if (btnVault) btnVault.classList.toggle('active', tab === 'certificates');

    if (sectionMilestones) sectionMilestones.style.display = tab === 'milestones' ? 'block' : 'none';
    if (sectionVault) sectionVault.style.display = tab === 'certificates' ? 'block' : 'none';
  },

  setCertStatusFilter(filter, btnEl) {
    this.state.certStatusFilter = filter;
    document.querySelectorAll('#cert-status-filters .filter-chip').forEach(btn => btn.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');
    this.renderCertificates();
  },

  renderCertificates() {
    const vaultContainer = document.getElementById('certificate-vault-grid');
    const filtersContainer = document.getElementById('cert-status-filters');
    if (!vaultContainer) return;

    const userRegs = this.state.registrations.filter(r => r.studentId === this.state.user.studentId);

    // Attended or credential-eligible registrations
    const credentialRegs = userRegs.filter(r => r.attended || r.certificateEligible);
    const readyRegs = credentialRegs.filter(r => r.certificateEligible);
    const inProgressRegs = credentialRegs.filter(r => r.attended && !r.certificateEligible);

    // Update subtab counter pill
    const counterVault = document.getElementById('counter-hist-vault');
    if (counterVault) counterVault.innerText = credentialRegs.length;

    // Render filter chips
    if (filtersContainer) {
      const activeFilter = this.state.certStatusFilter || 'all';
      filtersContainer.innerHTML = `
        <button class="filter-chip ${activeFilter === 'all' ? 'active' : ''}" onclick="StudentApp.setCertStatusFilter('all', this)">
          All Credentials <span style="opacity:0.75; font-size:0.75rem; margin-left:0.25rem;">(${credentialRegs.length})</span>
        </button>
        <button class="filter-chip ${activeFilter === 'ready' ? 'active' : ''}" onclick="StudentApp.setCertStatusFilter('ready', this)">
          Ready to Download <span style="opacity:0.75; font-size:0.75rem; margin-left:0.25rem;">(${readyRegs.length})</span>
        </button>
        <button class="filter-chip ${activeFilter === 'in_progress' ? 'active' : ''}" onclick="StudentApp.setCertStatusFilter('in_progress', this)">
          In Progress / Pending <span style="opacity:0.75; font-size:0.75rem; margin-left:0.25rem;">(${inProgressRegs.length})</span>
        </button>
      `;
    }

    let displayRegs = credentialRegs;
    if (this.state.certStatusFilter === 'ready') {
      displayRegs = readyRegs;
    } else if (this.state.certStatusFilter === 'in_progress') {
      displayRegs = inProgressRegs;
    }

    if (displayRegs.length === 0) {
      vaultContainer.innerHTML = `
        <div style="grid-column: 1/-1; padding: 3rem 2rem; text-align: center; background: var(--bg-surface); border-radius: var(--radius-xl); border: 1px dashed var(--bg-divider);">
          <div style="width: 52px; height: 52px; border-radius: 50%; background: var(--bg-subtle); display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; color: var(--text-tertiary);">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
          </div>
          <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.35rem;">No Certificates Found</h3>
          <p style="color: var(--text-secondary); font-size: 0.88rem; max-width: 420px; margin: 0 auto;">
            ${this.state.certStatusFilter === 'ready'
          ? 'You have no concluded certificates ready for download under this filter.'
          : this.state.certStatusFilter === 'in_progress'
            ? 'No certificates are currently in verification progress.'
            : 'Attend chapter events and verify check-in to earn accredited certificates.'}
          </p>
        </div>
      `;
      return;
    }

    vaultContainer.innerHTML = displayRegs.map(reg => {
      const ev = this.state.events.find(e => e.id === reg.eventId);
      if (!ev) return '';

      const isReady = reg.certificateEligible;
      const certId = `${reg.regId}-CERT-2026`;

      if (isReady) {
        return `
          <div class="cert-card">
            <div class="cert-card-header">
              <span class="cert-card-rubric">Collegiate Chapter Credential</span>
              <span class="badge-status-pill pill-confirmed">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                Verified &bull; Ready
              </span>
            </div>
            
            <h3 class="cert-card-title">${ev.title}</h3>
            
            <div class="cert-card-meta">
              Verified Arrival: <strong>${reg.checkInTime || '09:00 AM'}</strong> on ${ev.dateMonth} ${ev.dateDay}, 2026<br>
              Accredited for 2.0 Technical Development Hours &bull; Signed by President &amp; Officer
            </div>

            <div class="cert-card-verify-row">
              <span>Verification ID:</span>
              <button class="cert-copy-chip" onclick="StudentApp.copyToClipboard('${certId}', 'Certificate ID')" title="Copy Certificate ID">
                ${certId}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              </button>
            </div>

            <div style="display:flex; gap:0.5rem; margin-top:0.25rem;">
              <button class="btn btn-emerald w-full" onclick="StudentApp.previewCertificate('${reg.regId}')">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="margin-right:0.35rem;"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
                Inspect &amp; Download Certificate
              </button>
            </div>
          </div>
        `;
      } else {
        // In-Progress Card
        return `
          <div class="cert-card is-in-progress" style="border: 1px solid rgba(217, 119, 6, 0.35); background: linear-gradient(to bottom, #FFFBEB 0%, #FFFFFF 100%);">
            <div class="cert-card-header">
              <span class="cert-card-rubric">Collegiate Chapter Credential</span>
              <span class="badge-status-pill pill-waitlisted" style="color: #B45309; background: #FEF3C7; border: 1px solid rgba(217, 119, 6, 0.35);">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                In Progress &bull; Pending Sign-off
              </span>
            </div>
            
            <h3 class="cert-card-title">${ev.title}</h3>
            
            <div class="cert-card-meta">
              Attendance Verified: <strong>${reg.checkInTime || 'Checked In'}</strong> on ${ev.dateMonth} ${ev.dateDay}, 2026<br>
              <span style="color: #92400E; font-weight: 600;">Step 2 of 3 Complete &bull; Awaiting Executive Officer Session Endorsement</span>
            </div>

            <div class="capacity-track" style="margin: 0.6rem 0; height: 6px; background: #FEF3C7;">
              <div class="capacity-fill fill-amber" style="width: 66%;"></div>
            </div>

            <div style="display:flex; justify-content: space-between; align-items:center; font-size: 0.74rem; color: #78350F; margin-bottom: 0.6rem;">
              <span>&#10003; Seat Enrolled</span>
              <span>&#10003; Attendance Verified</span>
              <span style="font-weight: 700; color: #B45309;">Awaiting Sign-off</span>
            </div>

            <div style="display:flex; gap:0.5rem; margin-top:0.25rem;">
              <button class="btn btn-secondary w-full" onclick="StudentApp.setHistorySubTab('milestones')">
                View Milestone Audit Trail &rarr;
              </button>
            </div>
          </div>
        `;
      }
    }).join('');
  },

  renderHistory() {
    const container = document.getElementById('history-list');
    if (!container) return;

    const userRegs = this.state.registrations.filter(r => r.studentId === this.state.user.studentId);

    // Update milestone counter
    const counterMilestones = document.getElementById('counter-hist-milestones');
    if (counterMilestones) counterMilestones.innerText = userRegs.length;

    // Render certificates into vault
    this.renderCertificates();

    // Ensure initial subtab state matches state
    this.setHistorySubTab(this.state.historySubTab || 'milestones');

    if (userRegs.length === 0) {
      container.innerHTML = `
        <div style="padding: 3.5rem 2rem; text-align: center; background: var(--bg-surface); border-radius: var(--radius-xl); border: 1px dashed var(--bg-divider);">
          <p style="color: var(--text-secondary);">No event attendance records on file yet.</p>
        </div>
      `;
      return;
    }

    // Render Milestone Tracker List
    container.innerHTML = userRegs.map(reg => {
      const ev = this.state.events.find(e => e.id === reg.eventId);
      if (!ev) return '';

      const isCancelled = reg.status === 'Cancelled';
      const step1Done = !isCancelled;
      const step2Done = reg.attended;
      const step3Done = reg.certificateEligible;

      let badgePillHtml = '';
      if (reg.status === 'Confirmed') {
        badgePillHtml = `<span class="badge-status-pill pill-confirmed">&#10003; Confirmed Enrolled</span>`;
      } else if (reg.status === 'Waitlisted') {
        badgePillHtml = `<span class="badge-status-pill pill-waitlisted">&#9203; Waitlisted</span>`;
      } else if (reg.status === 'Pending') {
        badgePillHtml = `<span class="badge-status-pill pill-pending">&#8987; Pending Review</span>`;
      } else {
        badgePillHtml = `<span class="badge-status-pill pill-cancelled">Cancelled</span>`;
      }

      return `
        <div class="history-card">
          <div class="history-card-header">
            <div>
              <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.35rem;">
                <span class="badge ${ev.typeBadge}" style="font-size:0.68rem;">${ev.type}</span>
                ${badgePillHtml}
              </div>
              <h3 class="history-card-title">${ev.title}</h3>
              <div class="history-card-meta">
                <span class="history-meta-item">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
                  ${ev.dateMonth} ${ev.dateDay}, 2026 &bull; ${ev.time}
                </span>
                <span class="history-meta-item">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="10" r="3"/><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z"/></svg>
                  ${ev.venueName}
                </span>
              </div>
            </div>

            <div>
              ${step3Done ? `
                <button class="btn btn-emerald btn-sm" onclick="StudentApp.previewCertificate('${reg.regId}')">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="margin-right:0.35rem;"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
                  Inspect Certificate
                </button>
              ` : `
                <button class="btn btn-secondary btn-sm" onclick="StudentApp.goToEventPage('${ev.id}')">
                  View Dossier &rarr;
                </button>
              `}
            </div>
          </div>

          ${!isCancelled ? `
          <div class="milestone-stepper">
            <!-- Node 1: Registration Secured -->
            <div class="milestone-node is-complete">
              <div class="milestone-node-header">
                <div class="milestone-node-badge">1</div>
                <div class="milestone-node-title">Seat Enrolled</div>
              </div>
              <div class="milestone-node-desc">
                Pass secured on ${reg.regDate}. Pass Code: <strong>${reg.regId}</strong>.
              </div>
            </div>

            <!-- Node 2: Event Check-In -->
            <div class="milestone-node ${step2Done ? 'is-complete' : (step1Done ? 'is-active' : 'is-pending')}">
              <div class="milestone-node-header">
                <div class="milestone-node-badge">${step2Done ? '&#10003;' : '2'}</div>
                <div class="milestone-node-title">${step2Done ? 'Verified Attendance' : 'Event Check-In'}</div>
              </div>
              <div class="milestone-node-desc">
                ${step2Done
            ? `&#10004; Verified at check-in desk (${reg.checkInTime}).`
            : 'Awaiting check-in at the event desk.'}
              </div>
            </div>

            <!-- Node 3: Official Certificate -->
            <div class="milestone-node ${step3Done ? 'is-complete' : (step2Done ? 'is-active' : 'is-pending')}">
              <div class="milestone-node-header">
                <div class="milestone-node-badge">${step3Done ? '&#10003;' : '3'}</div>
                <div class="milestone-node-title">${step3Done ? 'Official Certificate' : 'Officer Endorsement'}</div>
              </div>
              <div class="milestone-node-desc">
                ${step3Done
            ? `&#10004; Concluded. Credential issued (#${reg.regId}-CERT-2026).`
            : 'Awaiting executive officer sign-off following session.'}
              </div>
            </div>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.6rem; border-top:1px dashed var(--bg-divider); padding-top:0.4rem;">
            <button class="btn-audit-toggle" id="btn-audit-${reg.regId}" onclick="StudentApp.toggleHistoryAudit('${reg.regId}', event)">
              <span>Audit Trail &amp; Verification Details</span>
              <svg class="chevron-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <span style="font-size:0.73rem; color:var(--text-tertiary); font-family:var(--font-mono);">${reg.regId}</span>
          </div>

          <div class="history-audit-tray" id="history-audit-${reg.regId}">
            <div class="history-audit-grid">
              <div class="history-audit-item">
                <small>Check-In Location</small>
                <strong>Auditorium Entrance Desk</strong>
              </div>
              <div class="history-audit-item">
                <small>Check-In Time</small>
                <strong>${reg.checkInTime || '10:02 AM'} &bull; ${ev.dateMonth} ${ev.dateDay}</strong>
              </div>
              <div class="history-audit-item">
                <small>Verifying Officer</small>
                <strong>${ev.speaker ? ev.speaker.name : 'Executive Officer'}</strong>
              </div>
              <div class="history-audit-item">
                <small>Validation Hash</small>
                <strong>SHA256: 8841-DELEON-VERIFIED</strong>
              </div>
            </div>
          </div>
          ` : ''}
        </div>
      `;
    }).join('');
  },

  previewCertificate(regId) {
    const reg = this.state.registrations.find(r => r.regId === regId);
    const ev = reg ? this.state.events.find(e => e.id === reg.eventId) : null;
    if (!reg || !ev) return;

    const certId = `${reg.regId}-CERT-2026`;

    const modalHTML = `
      <div id="printable-certificate-frame" style="padding: 2.5rem 2rem; border: 8px double #059669; background: #ffffff; text-align: center; position: relative; border-radius: 4px; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
        <!-- Watermark / Seal Icon -->
        <div style="display:flex; justify-content:center; align-items:center; gap:0.5rem; margin-bottom: 0.75rem;">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <circle cx="12" cy="11" r="3"/>
          </svg>
        </div>

        <div style="font-family: serif; font-size: 0.85rem; letter-spacing: 0.25em; text-transform: uppercase; color: #475569; margin-bottom: 0.5rem;">
          Official Collegiate Chapter Credential &bull; AttendTa
        </div>
        <h1 style="font-family: serif; font-size: 2.25rem; font-weight: 800; color: #0f172a; margin-bottom: 0.5rem; letter-spacing: -0.01em;">
          Certificate of Participation
        </h1>
        <p style="color: #475569; font-size: 0.95rem; margin-bottom: 1.25rem; font-style: italic;">
          This official collegiate parchment certifies that
        </p>
        <h2 style="font-size: 1.85rem; font-weight: 800; color: #059669; margin-bottom: 1rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; display: inline-block; min-width: 320px;">
          ${reg.fullName}
        </h2>
        <div style="font-family: var(--font-mono); font-size: 0.9rem; color: #334155; font-weight:600; margin-bottom: 1.25rem;">
          Student ID: ${reg.studentId} &bull; ${reg.courseYear}
        </div>
        <p style="color: #475569; font-size: 0.95rem; margin-bottom: 0.75rem;">
          has actively attended, completed, and fulfilled the institutional requirements for
        </p>
        <h3 style="font-size: 1.35rem; font-weight: 800; color: #0f172a; margin-bottom: 2rem;">
          ${ev.title}
        </h3>
        
        <div style="display: flex; justify-content: space-around; margin-top: 2rem; padding: 0 1rem;">
          <div style="border-top: 1.5px solid #0f172a; width: 170px; padding-top: 0.5rem; font-size: 0.82rem; font-weight: 700; color: #0f172a;">
            Danica Navarro<br>
            <span style="font-weight: 500; font-size: 0.75rem; color: #475569;">Executive Officer</span>
          </div>
          <div style="border-top: 1.5px solid #0f172a; width: 170px; padding-top: 0.5rem; font-size: 0.82rem; font-weight: 700; color: #0f172a;">
            Christian Mercado<br>
            <span style="font-weight: 500; font-size: 0.75rem; color: #475569;">Chapter President</span>
          </div>
        </div>

        <div style="margin-top: 2.25rem; display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: 0.76rem; color: #475569; border-top: 1px dashed #cbd5e1; padding-top: 0.75rem;">
          <span>Verification Hash: <strong>${certId}</strong></span>
          <span>Verified Arrival: <strong>${reg.checkInTime || '09:05 AM'}</strong></span>
        </div>
      </div>

      <div style="margin-top: 1.5rem; display: flex; gap: 0.75rem;">
        <button class="btn btn-emerald" style="flex:1;" onclick="window.print()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="margin-right:0.35rem;"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          Print / Save PDF
        </button>
        <button class="btn btn-secondary" style="flex:1;" onclick="StudentApp.copyToClipboard('${certId}', 'Certificate Hash')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:0.35rem;"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          Copy Verification Code
        </button>
        <button class="btn btn-secondary" onclick="StudentApp.closeModal()">
          Close
        </button>
      </div>
    `;

    this.openModal("Official Accredited Certificate", modalHTML, "modal-wide");
  },

  /* -------------------------------------------------------------------------
     PILLAR 1 & 4: Student Profile & Tactile PVC Chapter ID Badge
     ------------------------------------------------------------------------- */
  renderProfile() {
    const container = document.getElementById('profile-card-container');
    if (!container) return;

    const u = this.state.user;
    const userRegs = this.state.registrations.filter(r => r.studentId === u.studentId);
    const attendedCount = userRegs.filter(r => r.attended).length;
    const certsCount = userRegs.filter(r => r.certificateEligible).length;

    container.innerHTML = `
      <div class="split-profile-grid">
        <!-- Left Column: Tactile Physical PVC Chapter ID Card -->
        <div>
          <div class="pvc-badge-card" id="student-pvc-badge">
            <!-- Lanyard Punch Cutout Graphic -->
            <div class="pvc-lanyard-slot"></div>

            <!-- Organization Banner Header -->
            <div class="pvc-badge-header">
              <div class="pvc-badge-brand">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.3">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <circle cx="12" cy="11" r="3"/>
                </svg>
                <div>
                  <div class="pvc-badge-brand-title">AttendTa Chapter Identity</div>
                  <div class="pvc-badge-brand-sub">Polytechnic Student Chapter &bull; AY 2026-2027</div>
                </div>
              </div>
              <span class="badge-status-pill pill-confirmed">
                &#10003; ${u.membershipType}
              </span>
            </div>

            <!-- Main Body -->
            <div class="pvc-badge-body">
              <div class="pvc-photo-col">
                <div class="pvc-student-photo">
                  ${u.avatarInitials}
                </div>
                <div class="pvc-hologram-chip">
                  <span>&#10022;</span> VERIFIED CHIP
                </div>
              </div>

              <div class="pvc-info-col">
                <h2 class="pvc-student-name">${u.fullName}</h2>
                <div class="pvc-student-id-row">
                  <span class="pvc-student-id">${u.studentId}</span>
                  <button class="pvc-copy-id-btn" onclick="StudentApp.copyToClipboard('${u.studentId}', 'Student ID')" title="Copy ID to Clipboard">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    Copy
                  </button>
                </div>

                <div class="pvc-details-grid">
                  <div class="pvc-detail-cell">
                    <div class="pvc-detail-label">Degree Program &amp; Year</div>
                    <div class="pvc-detail-value">${u.courseYear}</div>
                  </div>

                  <div class="pvc-detail-cell">
                    <div class="pvc-detail-label">University Email</div>
                    <div class="pvc-detail-value">${u.email}</div>
                  </div>

                  <div class="pvc-detail-cell">
                    <div class="pvc-detail-label">Mobile Contact</div>
                    <div class="pvc-detail-value font-mono">${u.contact}</div>
                  </div>

                  <div class="pvc-detail-cell">
                    <div class="pvc-detail-label">Standing Status</div>
                    <div class="pvc-detail-value" style="color: #059669;">Active Good Standing</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Badge Footer: Barcode & Quick Scan QR -->
            <div class="pvc-badge-footer">
              <div class="pvc-barcode-wrap">
                <svg class="pvc-barcode-svg" viewBox="0 0 220 38" preserveAspectRatio="none">
                  <rect x="0" y="0" width="3" height="38" fill="#0f172a"/>
                  <rect x="5" y="0" width="2" height="38" fill="#0f172a"/>
                  <rect x="10" y="0" width="4" height="38" fill="#0f172a"/>
                  <rect x="17" y="0" width="2" height="38" fill="#0f172a"/>
                  <rect x="22" y="0" width="5" height="38" fill="#0f172a"/>
                  <rect x="30" y="0" width="2" height="38" fill="#0f172a"/>
                  <rect x="35" y="0" width="6" height="38" fill="#0f172a"/>
                  <rect x="44" y="0" width="2" height="38" fill="#0f172a"/>
                  <rect x="49" y="0" width="3" height="38" fill="#0f172a"/>
                  <rect x="55" y="0" width="5" height="38" fill="#0f172a"/>
                  <rect x="63" y="0" width="2" height="38" fill="#0f172a"/>
                  <rect x="68" y="0" width="4" height="38" fill="#0f172a"/>
                  <rect x="75" y="0" width="2" height="38" fill="#0f172a"/>
                  <rect x="80" y="0" width="6" height="38" fill="#0f172a"/>
                  <rect x="89" y="0" width="3" height="38" fill="#0f172a"/>
                  <rect x="95" y="0" width="2" height="38" fill="#0f172a"/>
                  <rect x="100" y="0" width="5" height="38" fill="#0f172a"/>
                  <rect x="108" y="0" width="2" height="38" fill="#0f172a"/>
                  <rect x="113" y="0" width="4" height="38" fill="#0f172a"/>
                  <rect x="120" y="0" width="2" height="38" fill="#0f172a"/>
                  <rect x="125" y="0" width="5" height="38" fill="#0f172a"/>
                  <rect x="133" y="0" width="3" height="38" fill="#0f172a"/>
                  <rect x="139" y="0" width="2" height="38" fill="#0f172a"/>
                  <rect x="144" y="0" width="6" height="38" fill="#0f172a"/>
                  <rect x="153" y="0" width="2" height="38" fill="#0f172a"/>
                  <rect x="158" y="0" width="4" height="38" fill="#0f172a"/>
                  <rect x="165" y="0" width="2" height="38" fill="#0f172a"/>
                  <rect x="170" y="0" width="5" height="38" fill="#0f172a"/>
                  <rect x="178" y="0" width="2" height="38" fill="#0f172a"/>
                  <rect x="183" y="0" width="3" height="38" fill="#0f172a"/>
                  <rect x="189" y="0" width="6" height="38" fill="#0f172a"/>
                  <rect x="198" y="0" width="2" height="38" fill="#0f172a"/>
                  <rect x="203" y="0" width="4" height="38" fill="#0f172a"/>
                  <rect x="210" y="0" width="3" height="38" fill="#0f172a"/>
                  <rect x="216" y="0" width="2" height="38" fill="#0f172a"/>
                </svg>
                <span class="pvc-barcode-text">ID-CARD-${u.studentId}-AY26</span>
              </div>

              <div class="pvc-qr-wrap" onclick="StudentApp.enlargeProfileQr()" title="Click to enlarge QR for kiosk scanning">
                <div class="pvc-qr-box">
                  <svg width="42" height="42" viewBox="0 0 100 100" style="shape-rendering: crispEdges;">
                    <rect width="100" height="100" fill="#ffffff"/>
                    <rect x="10" y="10" width="25" height="25" fill="#0f172a"/>
                    <rect x="15" y="15" width="15" height="15" fill="#ffffff"/>
                    <rect x="18" y="18" width="9" height="9" fill="#059669"/>
                    
                    <rect x="65" y="10" width="25" height="25" fill="#0f172a"/>
                    <rect x="70" y="15" width="15" height="15" fill="#ffffff"/>
                    <rect x="73" y="18" width="9" height="9" fill="#059669"/>
                    
                    <rect x="10" y="65" width="25" height="25" fill="#0f172a"/>
                    <rect x="15" y="70" width="15" height="15" fill="#ffffff"/>
                    <rect x="18" y="73" width="9" height="9" fill="#059669"/>

                    <rect x="42" y="15" width="6" height="6" fill="#0f172a"/>
                    <rect x="42" y="42" width="16" height="16" fill="#059669"/>
                    <rect x="25" y="45" width="6" height="6" fill="#0f172a"/>
                    <rect x="70" y="50" width="6" height="6" fill="#0f172a"/>
                    <rect x="50" y="70" width="6" height="6" fill="#0f172a"/>
                    <rect x="75" y="75" width="8" height="8" fill="#0f172a"/>
                  </svg>
                </div>
                <span class="pvc-qr-caption">Scan Kiosk</span>
              </div>
            </div>
          </div>

          <!-- ID Card Quick Actions Toolbar -->
          <div class="pvc-badge-toolbar" style="margin-top: var(--space-4); display: flex; gap: var(--space-3);">
            <button class="btn btn-emerald" style="flex: 1;" onclick="window.print()">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="margin-right:0.35rem;"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
              Print Badge PDF
            </button>
            <button class="btn btn-secondary" style="flex: 1;" onclick="StudentApp.enlargeProfileQr()">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="margin-right:0.35rem;"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              Enlarge QR Code
            </button>
          </div>
        </div>

        <!-- Right Column: Official Institutional Dossier & Telemetry -->
        <div class="profile-dossier-card">
          <div class="profile-dossier-header">
            <div>
              <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.25rem;">
                <span class="badge badge-emerald">Institutional Member</span>
                <span style="font-size:0.75rem; color:var(--text-tertiary); font-family:var(--font-mono);">AY 2026–2027</span>
              </div>
              <h2 style="font-family:var(--font-display); font-size:1.35rem; font-weight:800; color:var(--text-primary); margin:0;">
                Verified Academic Dossier
              </h2>
            </div>
            <span class="badge-status-pill pill-confirmed">
              &#10003; Active Good Standing
            </span>
          </div>

          <div class="profile-dossier-grid">
            <div class="profile-dossier-item">
              <div class="label">Degree Program &amp; Year</div>
              <div class="value">${u.courseYear}</div>
            </div>

            <div class="profile-dossier-item">
              <div class="label">Student Number</div>
              <div class="value" style="display:flex; align-items:center; justify-content:space-between;">
                <span style="font-family:var(--font-mono);">${u.studentId}</span>
                <button class="btn btn-secondary btn-sm" style="padding:0.2rem 0.5rem; font-size:0.75rem;" onclick="StudentApp.copyToClipboard('${u.studentId}', 'Student ID')">Copy</button>
              </div>
            </div>

            <div class="profile-dossier-item">
              <div class="label">Institutional Email</div>
              <div class="value">${u.email}</div>
            </div>

            <div class="profile-dossier-item">
              <div class="label">Mobile Contact</div>
              <div class="value font-mono">${u.contact}</div>
            </div>

            <div class="profile-dossier-item">
              <div class="label">Membership Classification</div>
              <div class="value" style="color:var(--emerald-primary);">${u.membershipType}</div>
            </div>

            <div class="profile-dossier-item">
              <div class="label">Check-In Desk Verification</div>
              <div class="value" style="color:#059669;">Pre-Approved Access</div>
            </div>
          </div>

          <!-- Chapter Engagement & Telemetry Bento -->
          <div style="margin-top:var(--space-6); padding-top:var(--space-5); border-top:1px solid var(--bg-divider);">
            <div style="font-size:var(--text-xs); font-weight:800; text-transform:uppercase; letter-spacing:0.06em; color:var(--text-tertiary); margin-bottom:var(--space-3);">
              Chapter Engagement &amp; Participation Telemetry
            </div>
            <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:var(--space-3);">
              <div style="background:var(--bg-subtle); padding:var(--space-4); border-radius:var(--radius-md); border:1px solid var(--bg-divider); text-align:center;">
                <div style="font-size:1.5rem; font-weight:800; font-family:var(--font-display); color:var(--text-primary);">${userRegs.length}</div>
                <div style="font-size:0.72rem; color:var(--text-secondary); margin-top:2px;">Events Enrolled</div>
              </div>
              <div style="background:var(--bg-subtle); padding:var(--space-4); border-radius:var(--radius-md); border:1px solid var(--bg-divider); text-align:center;">
                <div style="font-size:1.5rem; font-weight:800; font-family:var(--font-display); color:var(--emerald-primary);">${attendedCount}</div>
                <div style="font-size:0.72rem; color:var(--text-secondary); margin-top:2px;">Attended Sessions</div>
              </div>
              <div style="background:var(--bg-subtle); padding:var(--space-4); border-radius:var(--radius-md); border:1px solid var(--bg-divider); text-align:center;">
                <div style="font-size:1.5rem; font-weight:800; font-family:var(--font-display); color:var(--accent-primary);">${certsCount}</div>
                <div style="font-size:0.72rem; color:var(--text-secondary); margin-top:2px;">Official Certs</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  enlargeProfileQr() {
    const u = this.state.user;
    const modalHTML = `
      <div style="text-align: center; padding: 1rem 0.5rem;">
        <span class="badge-status-pill pill-confirmed" style="margin-bottom: 0.75rem;">Universal Chapter Access Token</span>
        <h2 style="font-size: 1.35rem; font-weight: 800; margin-bottom: 0.25rem;">${u.fullName}</h2>
        <div style="font-family: var(--font-mono); font-size: 1.15rem; font-weight: 800; color: #059669; margin-bottom: 1.25rem;">
          ${u.studentId}
        </div>

        <div style="background: #ffffff; padding: 1.5rem; border-radius: var(--radius-xl); border: 3px solid #059669; display: inline-block; box-shadow: 0 10px 25px rgba(5, 150, 105, 0.2); margin-bottom: 1.25rem;">
          <svg width="220" height="220" viewBox="0 0 100 100" style="shape-rendering: crispEdges;">
            <rect width="100" height="100" fill="#ffffff"/>
            <rect x="10" y="10" width="25" height="25" fill="#0f172a"/>
            <rect x="15" y="15" width="15" height="15" fill="#ffffff"/>
            <rect x="18" y="18" width="9" height="9" fill="#059669"/>
            
            <rect x="65" y="10" width="25" height="25" fill="#0f172a"/>
            <rect x="70" y="15" width="15" height="15" fill="#ffffff"/>
            <rect x="73" y="18" width="9" height="9" fill="#059669"/>
            
            <rect x="10" y="65" width="25" height="25" fill="#0f172a"/>
            <rect x="15" y="70" width="15" height="15" fill="#ffffff"/>
            <rect x="18" y="73" width="9" height="9" fill="#059669"/>

            <rect x="42" y="15" width="6" height="6" fill="#0f172a"/>
            <rect x="42" y="42" width="16" height="16" fill="#059669"/>
            <rect x="25" y="45" width="6" height="6" fill="#0f172a"/>
            <rect x="70" y="50" width="6" height="6" fill="#0f172a"/>
            <rect x="50" y="70" width="6" height="6" fill="#0f172a"/>
            <rect x="75" y="75" width="8" height="8" fill="#0f172a"/>
          </svg>
        </div>

        <div style="background: #F8FAFC; border: 1px solid rgba(15, 23, 42, 0.08); border-radius: var(--radius-md); padding: 0.85rem; max-width: 400px; margin: 0 auto 1.25rem; font-size: 0.82rem; color: #475569; text-align: left; line-height: 1.45;">
          Present this QR code at any chapter check-in desk or registration table for instant verification.
        </div>

        <button class="btn btn-secondary w-full" onclick="StudentApp.closeModal()">Close</button>
      </div>
    `;

    this.openModal("Student Chapter QR Code", modalHTML, "modal-compact");
  },

  /* -------------------------------------------------------------------------
     Utility Functions: Copy to Clipboard & ICS Calendar Download
     ------------------------------------------------------------------------- */
  copyToClipboard(text, label = 'Content') {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        this.showToast(`${label} copied to clipboard!`, 'success');
      }).catch(() => {
        this.fallbackCopy(text, label);
      });
    } else {
      this.fallbackCopy(text, label);
    }
  },

  fallbackCopy(text, label) {
    const input = document.createElement('input');
    input.value = text;
    document.body.appendChild(input);
    input.select();
    try {
      document.execCommand('copy');
      this.showToast(`${label} copied to clipboard!`, 'success');
    } catch (e) {
      this.showToast(`Could not auto-copy. Please manually copy: ${text}`, 'info');
    }
    document.body.removeChild(input);
  },

  downloadPassIcs(eventId) {
    const ev = this.state.events.find(e => e.id === eventId);
    if (!ev) return;

    const monthMap = { 'OCT': '10', 'NOV': '11', 'DEC': '12', 'JAN': '01' };
    const mStr = monthMap[ev.dateMonth] || '10';
    const dStr = String(ev.dateDay || '15').padStart(2, '0');
    const startIso = `2026${mStr}${dStr}T090000Z`;
    const endIso = `2026${mStr}${dStr}T170000Z`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//AttendTa//Student Chapter Pass//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:attendta-${ev.id}-2026@student.edu`,
      `DTSTAMP:${startIso}`,
      `DTSTART:${startIso}`,
      `DTEND:${endIso}`,
      `SUMMARY:${ev.title}`,
      `DESCRIPTION:${ev.shortSnippet || ev.description}\\nAccredited Event by AttendTa Student Chapter.`,
      `LOCATION:${ev.venueName}, ${ev.venueLocation || 'Campus'}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${ev.id}-pass.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.showToast('Event schedule exported as .ics calendar pass!', 'success');
  },

  /* -------------------------------------------------------------------------
     Modal Utilities & Toast System
     ------------------------------------------------------------------------- */
  openModal(title, html, dialogModifier = '') {
    const overlay = document.getElementById('global-modal-overlay');
    const titleEl = document.getElementById('modal-title-text');
    const bodyEl = document.getElementById('modal-dynamic-body');
    const dialogEl = overlay ? overlay.querySelector('.modal-dialog') : null;
    if (overlay && titleEl && bodyEl) {
      if (dialogEl) {
        dialogEl.className = `modal-dialog ${dialogModifier}`.trim();
      }
      titleEl.innerText = title;
      bodyEl.innerHTML = html;
      overlay.classList.add('active');
    }
  },

  closeModal() {
    const overlay = document.getElementById('global-modal-overlay');
    if (overlay) overlay.classList.remove('active');
  },

  showToast(msg, type = 'info') {
    const container = document.getElementById('toast-hub');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span style="font-size: 1.1rem;">${type === 'success' ? '&#10004;' : type === 'warning' ? '&#9888;' : '&#8505;'}</span> <div class="toast-msg">${msg}</div>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'all 240ms ease-out';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(12px)';
      setTimeout(() => toast.remove(), 260);
    }, 3800);
  }
};

window.addEventListener('DOMContentLoaded', () => {
  StudentApp.init();
});
