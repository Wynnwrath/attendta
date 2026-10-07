/**
 * App Controller & Public Landing Page Logic
 * Handles public event browsing, membership request submission (single database transaction),
 * unified login modal with role routing, and event pass reservations.
 */

const App = {
  state: {
    members: INITIAL_DATA.members,
    events: INITIAL_DATA.events,
    venues: INITIAL_DATA.venues,
    eventTypes: INITIAL_DATA.eventTypes,
    registrations: INITIAL_DATA.registrations,
    activityLogs: INITIAL_DATA.activityLogs,
    currentRole: 'guest',
    showAllEvents: false
  },

  filters: {
    venue: 'all',
    category: 'all',
    date: 'all',
    status: 'all'
  },

  init() {
    this.initTheme();
    this.renderPublicEvents();
    this.bindModals();
    this.bindHeroInteractions();
    this.bindHeaderScroll();
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

  toggleShowAllEvents() {
    this.state.showAllEvents = !this.state.showAllEvents;
    this.renderPublicEvents();
    if (this.state.showAllEvents) {
      const container = document.getElementById('public-events-container');
      if (container) {
        container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  },

  bindHeaderScroll() {
    const header = document.getElementById('main-header');
    if (!header) return;
    const onScroll = () => {
      if (window.scrollY > 30) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  },

  bindHeroInteractions() {
    // Close dock popovers on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.dock-segment')) {
        this.closeAllPopovers();
      }
    });

    // Wire up directory links to set category filter
    const dirLinks = document.querySelectorAll('.dir-item[data-category], .directory-link[data-category]');
    dirLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const cat = link.getAttribute('data-category');
        if (cat) {
          this.filters.category = cat;
          this.renderPublicEvents();
          const eventsSec = document.getElementById('events');
          if (eventsSec) {
            eventsSec.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });
  },

  toggleDrawer() {
    const overlay = document.getElementById('editorial-drawer-overlay');
    if (overlay) {
      overlay.classList.toggle('open');
    }
  },

  closeDrawer() {
    const overlay = document.getElementById('editorial-drawer-overlay');
    if (overlay) {
      overlay.classList.remove('open');
    }
  },

  toggleDockPopover(segment, event) {
    if (event) event.stopPropagation();
    const popover = document.getElementById(`popover-${segment}`);
    const segEl = document.getElementById(`dock-seg-${segment}`);
    if (!popover || !segEl) return;

    const isOpen = popover.classList.contains('show');
    this.closeAllPopovers();

    if (!isOpen) {
      popover.classList.add('show');
      segEl.classList.add('popover-open');
    }
  },

  closeAllPopovers() {
    document.querySelectorAll('.dock-popover').forEach(p => p.classList.remove('show'));
    document.querySelectorAll('.dock-segment').forEach(s => s.classList.remove('popover-open'));
  },

  setCategoryFilter(category, buttonEl) {
    this.filters.category = category;

    // Update active class on chips
    document.querySelectorAll('.event-filter-chip').forEach(chip => {
      chip.classList.remove('active');
    });
    if (buttonEl) {
      buttonEl.classList.add('active');
    }

    this.renderPublicEvents();
  },

  setAdmissionsStatus(isOpen) {
    const pill = document.getElementById('hero-status-pill');
    const text = document.getElementById('hero-status-text');
    if (!pill || !text) return;
    if (isOpen) {
      pill.style.opacity = '1';
      text.textContent = 'AY 2026–2027 Chapter Registration Open';
      const dot = pill.querySelector('.badge-dot-live');
      if (dot) {
        dot.style.background = '#10B981';
        dot.style.animation = 'pulseDot 2s ease-in-out infinite';
      }
    } else {
      text.textContent = 'AY 2026–2027 Registration Closed';
      const dot = pill.querySelector('.badge-dot-live');
      if (dot) {
        dot.style.background = '#94A3B8';
        dot.style.animation = 'none';
      }
    }
  },

  setDockFilter(type, value, displayLabel, event) {
    if (event) event.stopPropagation();
    this.filters[type] = value;

    // Update label text
    const labelEl = document.getElementById(`dock-label-${type}`);
    if (labelEl) {
      labelEl.textContent = displayLabel;
    }

    // Update popover active option
    const popover = document.getElementById(`popover-${type}`);
    if (popover) {
      popover.querySelectorAll('.popover-opt').forEach(btn => {
        if (btn.getAttribute('data-val') === value) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }

    this.closeAllPopovers();
    this.renderPublicEvents();

    // Smooth scroll down to events if filtering from hero
    const eventsSec = document.getElementById('events');
    if (eventsSec && event && event.isTrusted) {
      eventsSec.scrollIntoView({ behavior: 'smooth' });
    }
  },

  resetFilters() {
    this.filters = { venue: 'all', category: 'all', date: 'all', status: 'all' };
    const venueLabel = document.getElementById('dock-label-venue');
    const catLabel = document.getElementById('dock-label-category');
    const dateLabel = document.getElementById('dock-label-date');
    const statusLabel = document.getElementById('dock-label-status');

    if (venueLabel) venueLabel.textContent = 'Campus Hall';
    if (catLabel) catLabel.textContent = 'Event Category';
    if (dateLabel) dateLabel.textContent = '12/10 – 30/10';
    if (statusLabel) statusLabel.textContent = '1 Attendee Pass';

    document.querySelectorAll('.dock-popover').forEach(pop => {
      pop.querySelectorAll('.popover-opt').forEach(opt => {
        if (opt.getAttribute('data-val') === 'all') opt.classList.add('active');
        else opt.classList.remove('active');
      });
    });

    this.renderPublicEvents();
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

  closeModal() {
    const modalOverlay = document.getElementById('global-modal-overlay');
    if (modalOverlay) {
      modalOverlay.classList.remove('active');
    }
  },

  showInfoModal(type) {
    let title = 'Information';
    let body = '';

    if (type === 'certificate') {
      title = 'Accredited Chapter Credentials';
      body = `
        <div style="padding: 0.5rem 0.25rem; text-align: center;">
          <div style="width: 56px; height: 56px; border-radius: 50%; background: var(--emerald-subtle); display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem; color: var(--emerald-primary);">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
          </div>
          <h4 style="font-family: 'Outfit', sans-serif; font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--text-primary);">Verifiable Participation Credentials</h4>
          <p style="font-size: 0.92rem; color: var(--text-secondary); line-height: 1.55; margin-bottom: 1.25rem; max-width: 440px; margin-left: auto; margin-right: auto;">
            Every AttendTa event attendance is verified at the event check-in desk and endorsed by chapter executive officers to mint an official Certificate of Participation.
          </p>

          <div style="background: var(--bg-subtle); border: 1px solid var(--bg-divider); border-radius: var(--radius-md); padding: 1rem 1.2rem; margin-bottom: 1.5rem; text-align: left; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.6;">
            <div style="font-weight: 700; color: var(--text-primary); margin-bottom: 0.4rem; display:flex; align-items:center; gap:0.4rem;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--emerald-primary)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Chapter Accreditation Standards:
            </div>
            <div>&bull; Accredited 1.5 &ndash; 3.0 Technical Development Units (PDU)</div>
            <div>&bull; Cryptographic SHA-256 Verification Signature &amp; Serial ID</div>
            <div>&bull; Instant High-Res Print &amp; PDF Export from Student Vault</div>
          </div>

          <div style="display:flex; gap:0.75rem;">
            <a href="student.html" class="btn btn-primary" style="flex:1.2; text-decoration:none; text-align:center; justify-content:center;">
              Open Student Vault &rarr;
            </a>
            <button class="btn btn-secondary" style="flex:1;" onclick="App.closeModal()">
              Done
            </button>
          </div>
        </div>
      `;
    } else if (type === 'checkin') {
      title = 'Event Check-In Process';
      body = `
        <div style="padding: 0.5rem 0.25rem; text-align: center;">
          <div style="width: 56px; height: 56px; border-radius: 50%; background: var(--accent-subtle); display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem; color: var(--accent-primary);">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="3" width="18" height="18" rx="2"/><rect x="7" y="7" width="3" height="3"/><rect x="14" y="7" width="3" height="3"/><rect x="7" y="14" width="3" height="3"/><rect x="14" y="14" width="3" height="3"/></svg>
          </div>
          <h4 style="font-family: 'Outfit', sans-serif; font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--text-primary);">Touchless Verification</h4>
          <p style="font-size: 0.92rem; color: var(--text-secondary); line-height: 1.55; margin-bottom: 1.25rem; max-width: 440px; margin-left: auto; margin-right: auto;">
            Enrolled event seats generate a digital QR pass on your mobile device. Present your QR code at the event check-in desk upon arrival for fast touchless validation.
          </p>

          <div style="background: var(--bg-subtle); border: 1px solid var(--bg-divider); border-radius: var(--radius-md); padding: 1rem 1.2rem; margin-bottom: 1.5rem; text-align: left; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.6;">
            <div style="font-weight: 700; color: var(--text-primary); margin-bottom: 0.4rem; display:flex; align-items:center; gap:0.4rem;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Event Arrival Check-In Flow:
            </div>
            <div>&bull; <strong>Step 1:</strong> Claim event seat in Student Portal</div>
            <div>&bull; <strong>Step 2:</strong> Present Digital QR Pass at Check-In Desk upon arrival</div>
            <div>&bull; <strong>Step 3:</strong> If camera scanning is unavailable, quote your Student ID for manual validation</div>
          </div>

          <div style="display:flex; gap:0.75rem;">
            <a href="student.html" class="btn btn-primary" style="flex:1.2; text-decoration:none; text-align:center; justify-content:center;">
              View My Passes &rarr;
            </a>
            <button class="btn btn-secondary" style="flex:1;" onclick="App.closeModal()">
              Done
            </button>
          </div>
        </div>
      `;
    }

    const titleEl = document.getElementById('modal-title-text');
    const bodyEl = document.getElementById('modal-dynamic-body');
    const overlay = document.getElementById('global-modal-overlay');
    if (titleEl) titleEl.textContent = title;
    if (bodyEl) bodyEl.innerHTML = body;
    if (overlay) overlay.classList.add('active');
  },

  renderPublicEvents() {
    const list = document.getElementById('public-events-container');
    if (!list) return;

    let events = this.state.events;

    // Filter by Venue
    if (this.filters.venue !== 'all') {
      events = events.filter(ev => ev.venueName.toLowerCase().includes(this.filters.venue.toLowerCase()));
    }

    // Filter by Category
    if (this.filters.category !== 'all') {
      events = events.filter(ev => ev.type.toLowerCase().includes(this.filters.category.toLowerCase()));
    }

    // Filter by Status
    if (this.filters.status === 'open') {
      events = events.filter(ev => (ev.capacityLimit - ev.registeredCount) > 0);
    } else if (this.filters.status === 'waitlist') {
      events = events.filter(ev => (ev.capacityLimit - ev.registeredCount) <= 0);
    }

    // Filter by Date
    if (this.filters.date === 'oct') {
      events = events.filter(ev => ev.dateMonth.toLowerCase() === 'oct');
    }

    if (events.length === 0) {
      list.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3.5rem 1.5rem; background: var(--bg-surface); border-radius: var(--radius-lg); border: 1px dashed var(--bg-divider); box-shadow: var(--shadow-sm);">
          <div style="margin-bottom: 0.75rem; color: var(--text-tertiary);"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></div>
          <h3 style="font-family: 'Outfit', sans-serif; font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--text-primary);">No matching campus events found</h3>
          <p style="font-size: 0.92rem; color: var(--text-secondary); margin-bottom: 1.25rem;">Try adjusting or clearing your filter criteria.</p>
          <button class="btn btn-secondary" onclick="App.resetFilters()">Clear Filters &amp; Show All Events</button>
        </div>
      `;
      return;
    }

    // Render only top 3 events on the public landing page dynamic events section
    const displayedEvents = events.slice(0, 3);

    const html = displayedEvents.map(ev => {
      const remainingSlots = ev.capacityLimit - ev.registeredCount;
      const isFull = remainingSlots <= 0;
      const fillPercent = Math.min(100, Math.round((ev.registeredCount / ev.capacityLimit) * 100));

      let fillClass = 'fill-green';
      let badgeText = `${remainingSlots} passes remaining`;
      let badgeClass = 'open';

      if (isFull) {
        fillClass = 'fill-red';
        badgeText = 'Waitlist Only';
        badgeClass = 'full';
      } else if (fillPercent >= 80 || remainingSlots <= 10) {
        fillClass = 'fill-amber';
        badgeText = `Only ${remainingSlots} seats left!`;
        badgeClass = 'limited';
      }

      return `
        <div class="public-event-row">
          <div class="event-calendar-stamp">
            <span class="event-cal-month">${ev.dateMonth}</span>
            <span class="event-cal-day">${ev.dateDay}</span>
          </div>

          <div class="event-info-cluster">
            <div style="display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap;">
              <span class="badge ${ev.typeBadge}"><span class="badge-dot"></span> ${ev.type}</span>
              <span style="font-size: 0.78rem; color: var(--text-tertiary); display: inline-flex; align-items: center; gap: 0.25rem;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                ${ev.venueName}
              </span>
            </div>
            <h3 class="event-title-link" onclick="window.location.href='event-details.html?id=${ev.id}'" style="cursor: pointer;">${ev.title}</h3>
            <p style="font-size: 0.92rem; color: var(--text-secondary); line-height: 1.45; margin: 0.25rem 0 0.5rem;">${ev.shortSnippet || ev.description}</p>
            
            <div class="event-meta-tags">
              <span style="display: inline-flex; align-items: center; gap: 0.3rem;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                ${ev.time}
              </span>
              ${ev.speaker ? `<span>&bull; Lead: ${ev.speaker}</span>` : ''}
            </div>

            <!-- Real-Time Capacity Scarcity Gauge Bar -->
            <div class="capacity-gauge-wrap">
              <div class="capacity-meta-row">
                <span class="capacity-count">${ev.registeredCount} / ${ev.capacityLimit} Registered (${fillPercent}%)</span>
                <span class="capacity-scarcity-badge ${badgeClass}">${badgeText}</span>
              </div>
              <div class="capacity-track" title="${fillPercent}% seat capacity filled">
                <div class="capacity-fill ${fillClass}" style="width: ${fillPercent}%;"></div>
              </div>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.45rem; align-items: flex-end; justify-content: center;">
            <a href="event-details.html?id=${ev.id}" class="btn ${isFull ? 'btn-secondary' : 'btn-primary'}" style="text-decoration: none; white-space: nowrap;">
              ${isFull ? 'Join Waitlist &rarr;' : 'Reserve Seat &rarr;'}
            </a>
            <span style="font-size: 0.72rem; color: var(--text-tertiary); font-family: var(--font-mono);">
              Accredited Chapter Pass
            </span>
          </div>
        </div>
      `;
    }).join('');

    list.innerHTML = html;
  },


  /* -----------------------------------------------------------------------
     Unified Login Gateway (Directs user based on verified credentials)
     ----------------------------------------------------------------------- */
  openLoginModal() {
    const modalHTML = `
      <div>
        <p style="font-size: 0.92rem; color: var(--text-secondary); margin-bottom: 1.25rem;">
          Sign in with your student number or institutional email to access chapter tools.
        </p>

        <form onsubmit="event.preventDefault(); App.handleLoginSubmit();">
          <div class="form-group">
            <label class="form-label">Student ID or University Email</label>
            <input type="text" id="login-identifier" class="form-input font-mono" placeholder="e.g. 2024-00128-MN-0" value="2024-00128-MN-0" required>
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" id="login-password" class="form-input" value="••••••••••••" required>
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; font-size: 0.85rem;">
            <label style="display: flex; align-items: center; gap: 0.4rem; cursor: pointer;">
              <input type="checkbox" checked> Remember session
            </label>
            <a href="login.html?tab=request" style="color: var(--accent-hover); font-weight: 700;">
              No account? Request membership &#8599;
            </a>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            <button type="submit" class="btn btn-primary" style="width: 100%;">
              Enter Student Portal &rarr;
            </button>
            <a href="login.html" class="btn btn-secondary" style="width: 100%; text-align: center; text-decoration: none;">
              Go to Full Login &amp; Request Screen &rarr;
            </a>
          </div>

          <div style="margin-top: 1.25rem; padding-top: 1rem; border-top: 1px dashed var(--bg-divider);">
            <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-tertiary); margin-bottom: 0.6rem; font-weight: 700;">
              1-Click Demo Profiles:
            </div>
            <div style="display: flex; flex-direction: column; gap: 0.4rem;">
              <button type="button" class="btn btn-ghost btn-sm" style="justify-content: flex-start; text-align: left; font-size: 0.82rem; padding: 0.5rem 0.75rem; border: 1px solid var(--bg-divider);" onclick="App.fillLoginDemo('2024-00128-MN-0')">
                <span class="badge badge-success" style="padding: 0.1rem 0.35rem; font-size: 0.68rem; margin-right: 0.4rem;">Active</span>
                Rafael Joaquin (Student Member)
              </button>
              <button type="button" class="btn btn-ghost btn-sm" style="justify-content: flex-start; text-align: left; font-size: 0.82rem; padding: 0.5rem 0.75rem; border: 1px solid var(--bg-divider);" onclick="App.fillLoginDemo('2025-09120-MN-0')">
                <span class="badge badge-amber" style="padding: 0.1rem 0.35rem; font-size: 0.68rem; margin-right: 0.4rem;">Pending</span>
                Alfonso Miguel (Under Review)
              </button>
            </div>
          </div>
        </form>
      </div>
    `;
    this.openModal("AttendTa Sign-In", modalHTML);
  },

  fillLoginDemo(studentId) {
    const input = document.getElementById('login-identifier');
    if (input) {
      input.value = studentId;
      this.handleLoginSubmit();
    }
  },

  handleLoginSubmit() {
    const identifier = document.getElementById('login-identifier').value.trim();
    // Verify in mock members database
    const user = this.state.members.find(m =>
      m.studentId.toLowerCase() === identifier.toLowerCase() ||
      m.email.toLowerCase() === identifier.toLowerCase()
    );

    if (!user) {
      this.showToast(`No account found for "${identifier}". You can request an account.`, "error");
      return;
    }

    if (user.status === 'Pending Approval') {
      this.showToast(`Your account application is still pending officer approval.`, "warning");
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 700);
      return;
    }

    // Set authenticated session and transition straight to student pages
    sessionStorage.removeItem('attendta_explicit_logout');
    sessionStorage.setItem('attendta_current_user', JSON.stringify(user));
    this.closeModal();
    this.showToast(`Welcome back, ${user.fullName}! Entering student portal...`, "success");

    setTimeout(() => {
      window.location.href = 'student.html';
    }, 400);
  },

  /* -----------------------------------------------------------------------
     Account Registration Request (Single Database Transaction)
     Maps directly to core requirement: Account Registration Approval
     ----------------------------------------------------------------------- */
  openRequestAccountModal() {
    const modalHTML = `
      <div>
        <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 1.5rem;">
          Submit your student credentials. An organization officer will review and activate your account before door access is granted.
        </p>

        <form onsubmit="event.preventDefault(); App.submitAccountRequest();">
          <div class="form-group">
            <label class="form-label">Student ID Number</label>
            <input type="text" id="req-id" class="form-input font-mono" placeholder="2025-XXXXX-MN-0" value="2025-18290-MN-0" required>
          </div>

          <div class="form-group">
            <label class="form-label">Full Name (Legal Academic)</label>
            <input type="text" id="req-name" class="form-input" placeholder="e.g. Katrina Denise Ramos" value="Katrina Denise Ramos" required>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="form-label">Course &amp; Year Level</label>
              <input type="text" id="req-course" class="form-input" value="BS Computer Science 2-A" required>
            </div>
            <div class="form-group">
              <label class="form-label">Mobile Contact</label>
              <input type="text" id="req-contact" class="form-input" value="+63 917 482 1092" required>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">University Email Address</label>
            <input type="email" id="req-email" class="form-input" value="kdenise.ramos@student.edu" required>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem;">
            <button type="button" class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>
            <button type="submit" class="btn btn-primary">Submit Account Request</button>
          </div>
        </form>
      </div>
    `;
    this.openModal("Request Student Organization Account", modalHTML);
  },

  submitAccountRequest() {
    const studentId = document.getElementById('req-id').value.trim();
    const fullName = document.getElementById('req-name').value.trim();
    const courseYear = document.getElementById('req-course').value.trim();
    const contact = document.getElementById('req-contact').value.trim();
    const email = document.getElementById('req-email').value.trim();

    // Check duplicate
    if (this.state.members.some(m => m.studentId === studentId)) {
      this.showToast(`An account record with ID ${studentId} already exists.`, "warning");
      return;
    }

    // Insert as pending member in the core master database
    const newRecord = {
      studentId,
      fullName,
      courseYear,
      email,
      contact,
      membershipType: "Applicant",
      role: "member",
      status: "Pending Approval",
      avatarInitials: fullName.split(' ').map(n => n[0]).slice(0, 2).join('')
    };

    this.state.members.unshift(newRecord);
    this.state.activityLogs.unshift({
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: "Just now",
      actor: `${fullName} [Applicant]`,
      action: "Submitted account registration request for officer review",
      type: "auth"
    });

    this.closeModal();
    this.showToast("Account request submitted! An officer will verify and approve your record.", "success");
  },

  /* -----------------------------------------------------------------------
     Check Application Status Tool (Real-Time Member Review Lookup)
     ----------------------------------------------------------------------- */
  checkApplicationStatus(identifier) {
    if (!identifier) {
      const input = document.getElementById('status-id-input');
      identifier = input ? input.value.trim() : '';
    }
    if (!identifier) {
      this.showToast("Please enter your Student ID or University Email.", "warning");
      return;
    }

    const member = this.state.members.find(m =>
      m.studentId.toLowerCase() === identifier.toLowerCase() ||
      m.email.toLowerCase() === identifier.toLowerCase()
    );

    if (!member) {
      const modalHTML = `
        <div style="text-align: center; padding: 0.5rem 0.25rem;">
          <div style="width: 52px; height: 52px; border-radius: 50%; background: var(--status-warning-bg); color: var(--accent-primary); display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem;">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h4 style="font-family: 'Outfit', sans-serif; font-size: 1.25rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.5rem;">No Application Record Found</h4>
          <p style="font-size: 0.92rem; color: var(--text-secondary); line-height: 1.55; margin-bottom: 1.5rem; max-width: 440px; margin-left: auto; margin-right: auto;">
            We couldn't locate an account request or membership entry for <code class="font-mono">${identifier}</code>. Non-members must submit their credentials for officer verification.
          </p>
          <div style="display: flex; gap: 0.75rem; justify-content: center;">
            <button class="btn btn-primary" onclick="App.closeModal(); App.openRequestAccountModal();">
              Submit Account Request Now &rarr;
            </button>
            <button class="btn btn-secondary" onclick="App.closeModal()">
              Close
            </button>
          </div>
        </div>
      `;
      this.openModal("Application Status Check", modalHTML);
      return;
    }

    if (member.status === 'Pending Approval') {
      const modalHTML = `
        <div style="text-align: center; padding: 0.5rem 0.25rem;">
          <div style="width: 52px; height: 52px; border-radius: 50%; background: var(--accent-subtle); color: var(--accent-primary); display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem;">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <h4 style="font-family: 'Outfit', sans-serif; font-size: 1.25rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.5rem;">Application Under Officer Review</h4>
          <p style="font-size: 0.92rem; color: var(--text-secondary); line-height: 1.55; margin-bottom: 1.25rem; max-width: 460px; margin-left: auto; margin-right: auto;">
            Your account application is currently queued in the <strong>Account Registration Approval</strong> pipeline. An authorized executive officer is cross-referencing your credentials with the university student roster.
          </p>
          <div style="background: var(--bg-subtle); border: 1px solid var(--bg-divider); border-radius: var(--radius-md); padding: 1rem 1.25rem; text-align: left; font-size: 0.85rem; margin-bottom: 1.5rem; line-height: 1.6;">
            <div><strong>Student ID:</strong> <span class="font-mono">${member.studentId}</span></div>
            <div><strong>Full Name:</strong> ${member.fullName}</div>
            <div><strong>Course &amp; Year:</strong> ${member.courseYear}</div>
            <div><strong>University Email:</strong> ${member.email}</div>
            <div style="margin-top: 0.5rem; display: flex; align-items: center; gap: 0.4rem;">
              <span class="badge badge-amber" style="font-weight: 700;">Status: Pending Officer Review (24h SLA)</span>
            </div>
          </div>
          <button class="btn btn-secondary w-full" onclick="App.closeModal()">
            Acknowledge &amp; Close
          </button>
        </div>
      `;
      this.openModal("Application Status Check", modalHTML);
    } else {
      const modalHTML = `
        <div style="text-align: center; padding: 0.5rem 0.25rem;">
          <div style="width: 52px; height: 52px; border-radius: 50%; background: var(--emerald-subtle); color: var(--emerald-primary); display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem;">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h4 style="font-family: 'Outfit', sans-serif; font-size: 1.25rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.5rem;">Account Approved &amp; Active!</h4>
          <p style="font-size: 0.92rem; color: var(--text-secondary); line-height: 1.55; margin-bottom: 1.25rem; max-width: 440px; margin-left: auto; margin-right: auto;">
            Welcome, <strong>${member.fullName}</strong>! Your account has been verified by chapter officers. You can log in immediately to reserve seats and generate your door pass.
          </p>
          <div style="display: flex; gap: 0.75rem;">
            <button class="btn btn-primary" style="flex: 1.2;" onclick="App.closeModal(); App.openLoginModal(); App.fillLoginDemo('${member.studentId}');">
              Sign In Now &rarr;
            </button>
            <button class="btn btn-secondary" style="flex: 1;" onclick="App.closeModal()">
              Close
            </button>
          </div>
        </div>
      `;
      this.openModal("Application Status Check", modalHTML);
    }
  },

  testStatusLookup(studentId) {
    const input = document.getElementById('status-id-input');
    if (input) input.value = studentId;
    this.checkApplicationStatus(studentId);
  },

  /* -----------------------------------------------------------------------
     Public Event Pass Reservation
     ----------------------------------------------------------------------- */
  openEventPassModal(eventId) {
    const ev = this.state.events.find(e => e.id === eventId);
    if (!ev) return;

    const modalHTML = `
      <div>
        <p style="font-size: 0.92rem; color: var(--text-secondary); margin-bottom: 1.25rem;">
          You are reserving an attendance pass for <strong>${ev.title}</strong> at <em>${ev.venueName}</em>.
        </p>

        <form onsubmit="event.preventDefault(); App.submitEventPass('${ev.id}');">
          <div class="form-group">
            <label class="form-label">Student ID Number</label>
            <input type="text" id="pass-student-id" class="form-input font-mono" placeholder="2024-XXXXX-MN-0" value="2024-00128-MN-0" required>
          </div>

          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input type="text" id="pass-student-name" class="form-input" value="Rafael Joaquin De Leon" required>
          </div>

          <div class="form-group">
            <label class="form-label">Course &amp; Year</label>
            <input type="text" id="pass-course" class="form-input" value="BS Computer Engineering 2-B" required>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem;">
            <button type="button" class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>
            <button type="submit" class="btn btn-primary">Confirm Reservation</button>
          </div>
        </form>
      </div>
    `;
    this.openModal(`Reserve Event Pass — ${ev.title}`, modalHTML);
  },

  submitEventPass(eventId) {
    const studentId = document.getElementById('pass-student-id').value.trim();
    const fullName = document.getElementById('pass-student-name').value.trim();
    const courseYear = document.getElementById('pass-course').value.trim();
    const event = this.state.events.find(e => e.id === eventId);

    const alreadyRegistered = this.state.registrations.some(r => r.eventId === eventId && r.studentId === studentId);
    if (alreadyRegistered) {
      this.showToast("You are already registered for this event.", "warning");
      this.closeModal();
      return;
    }

    this.state.registrations.push({
      regId: `REG-${Math.floor(1000 + Math.random() * 9000)}`,
      eventId: eventId,
      studentId: studentId,
      fullName: fullName,
      courseYear: courseYear,
      regDate: new Date().toISOString().slice(0, 10),
      status: "Confirmed",
      attended: false,
      checkInTime: null,
      certificateEligible: false
    });

    event.registeredCount = (event.registeredCount || 0) + 1;
    this.closeModal();
    this.showToast(`Pass confirmed for ${fullName}! Your QR will be scanned at the door.`, "success");
    this.renderPublicEvents();
  },

  /* -----------------------------------------------------------------------
     Internal Portal Cockpit Preview Modal (Officers / Admins)
     ----------------------------------------------------------------------- */
  openPortalCockpit(user) {
    const isOfficer = user.role === 'admin' || user.role === 'officer';
    const pendingApplicants = this.state.members.filter(m => m.status === 'Pending Approval');

    const modalHTML = `
      <div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--bg-divider);">
          <div>
            <h4 style="font-size: 1.15rem; font-weight: 800;">${user.fullName}</h4>
            <span style="font-size: 0.8rem; color: var(--text-secondary);">${user.membershipType} &bull; ${user.courseYear}</span>
          </div>
          <span class="badge ${isOfficer ? 'badge-amber' : 'badge-emerald'}">${user.role.toUpperCase()} SESSION</span>
        </div>

        ${isOfficer ? `
          <div style="background: var(--bg-subtle); padding: 1.25rem; border-radius: var(--radius-md); margin-bottom: 1.5rem;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
              <strong style="font-size: 0.9rem;">Pending Account Approvals (${pendingApplicants.length})</strong>
              <span class="badge badge-amber">Core Requirement</span>
            </div>
            ${pendingApplicants.length === 0 ? '<p style="font-size: 0.82rem; color: var(--text-tertiary);">No pending requests awaiting approval.</p>' : `
              <div style="display: flex; flex-direction: column; gap: 0.65rem;">
                ${pendingApplicants.map(p => `
                  <div style="display: flex; align-items: center; justify-content: space-between; background: #FFF; padding: 0.75rem 1rem; border-radius: var(--radius-sm); border: 1px solid var(--bg-divider);">
                    <div>
                      <strong style="font-size: 0.85rem;">${p.fullName}</strong>
                      <div style="font-size: 0.74rem; color: var(--text-tertiary);">${p.studentId} &bull; ${p.courseYear}</div>
                    </div>
                    <button class="btn btn-sm btn-emerald" onclick="App.approveAccount('${p.studentId}')">Approve &amp; Activate</button>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        ` : ''}

        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          <button class="btn btn-primary" onclick="alert('Launching Live Kiosk Station Scanner...'); App.closeModal();">
            Open Kiosk Check-In Station
          </button>
          <button class="btn btn-secondary" onclick="App.closeModal()">
            Return to Public Page
          </button>
        </div>
      </div>
    `;
    this.openModal(`Chapter Portal &bull; ${user.membershipType}`, modalHTML);
  },

  approveAccount(studentId) {
    const member = this.state.members.find(m => m.studentId === studentId);
    if (member) {
      member.status = 'Active';
      member.membershipType = 'Regular Member';
      this.showToast(`Approved & activated account for ${member.fullName}!`, "success");
      this.closeModal();
    }
  },

  /* Modal Mechanics */
  openModal(title, html) {
    const overlay = document.getElementById('global-modal-overlay');
    const titleEl = document.getElementById('modal-title-text');
    const bodyEl = document.getElementById('modal-dynamic-body');
    if (overlay && titleEl && bodyEl) {
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
  App.init();
});
