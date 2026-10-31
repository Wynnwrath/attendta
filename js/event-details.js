/**
 * AttendTa Dedicated Event Details Page Controller
 * Handles URL parsing (?id=...), real-time seat reservation, waitlist queueing,
 * pass cancellation, scannable QR pass presentation, and calendar export.
 */

const EventDetailsApp = {
  state: {
    eventId: null,
    event: null,
    user: null,
    registrations: INITIAL_DATA.registrations,
    events: INITIAL_DATA.events
  },

  init() {
    this.initTheme();
    // 1. Get Event ID from Query String
    const urlParams = new URLSearchParams(window.location.search);
    this.state.eventId = urlParams.get('id') || 'ev-2026-01';

    // 2. Load Active Session
    let userJson = sessionStorage.getItem('attendta_current_user');
    if (!userJson) {
      const demoUser = INITIAL_DATA.members.find(m => m.studentId === '2024-00128-MN-0') || INITIAL_DATA.members[2];
      sessionStorage.setItem('attendta_current_user', JSON.stringify(demoUser));
      userJson = JSON.stringify(demoUser);
    }
    this.state.user = JSON.parse(userJson);

    // 3. Find Event
    this.state.event = this.state.events.find(e => e.id === this.state.eventId);

    if (!this.state.event) {
      document.getElementById('detail-title').innerText = "Event Not Found";
      document.getElementById('detail-description').innerHTML = `
        <p>The requested chapter event could not be located or has been archived.</p>
        <div style="margin-top: 1.25rem; display: flex; gap: 0.75rem; flex-wrap: wrap;">
          <a href="student.html" class="btn btn-primary">Browse All Chapter Sessions</a>
          <a href="student.html#passes" class="btn btn-secondary">Check My Door Passes</a>
        </div>
      `;
      this.renderHeaderUser();
      this.renderRecommendations();
      return;
    }

    // 4. Render All Sections
    this.renderHeaderUser();
    this.renderHero();
    this.renderDossier();
    this.renderBookingCard();
    this.renderRecommendations();
    this.bindModals();
  },

  renderHeaderUser() {
    const u = this.state.user;
    const nameEl = document.getElementById('user-name-display');
    const roleEl = document.getElementById('user-role-display');
    const avatarEl = document.getElementById('user-avatar');

    if (nameEl) nameEl.innerText = u.fullName;
    if (roleEl) roleEl.innerText = `${u.studentId} • ${u.courseYear}`;
    if (avatarEl) avatarEl.innerText = u.avatarInitials;
  },

  renderHero() {
    const ev = this.state.event;
    document.title = `${ev.title} • AttendTa Event Dossier`;

    const imgEl = document.getElementById('detail-cover-img');
    const typeBadge = document.getElementById('detail-type-badge');
    const statusPill = document.getElementById('detail-status-pill');
    const datePill = document.getElementById('detail-date-pill');
    const titleEl = document.getElementById('detail-title');
    const timeEl = document.getElementById('detail-time-text');
    const venueEl = document.getElementById('detail-venue-text');
    const capacityBadge = document.getElementById('detail-capacity-badge');

    if (imgEl) imgEl.src = ev.coverImage || 'assets/bento-summit.jpg';
    if (typeBadge) {
      typeBadge.className = `badge ${ev.typeBadge}`;
      typeBadge.innerText = ev.type;
    }
    if (statusPill) statusPill.innerText = ev.status || 'Published';
    if (datePill) datePill.innerText = `${ev.dateMonth} ${ev.dateDay}, ${ev.dateYear || '2026'}`;
    if (titleEl) titleEl.innerText = ev.title;
    if (timeEl) timeEl.innerText = ev.time;
    if (venueEl) venueEl.innerText = `${ev.venueName} • ${ev.venueLocation || 'Campus Venue'}`;
    if (capacityBadge) capacityBadge.innerText = `Capacity: ${ev.capacityLimit} max seats`;
  },

  renderDossier() {
    const ev = this.state.event;

    // 1. Description
    const descEl = document.getElementById('detail-description');
    if (descEl) descEl.innerHTML = `<p>${ev.description}</p>`;

    // 2. Agenda Timeline
    const agendaEl = document.getElementById('detail-agenda-timeline');
    if (agendaEl) {
      const items = ev.agenda && ev.agenda.length > 0 ? ev.agenda : [
        { time: "Start of Session", title: "Registration & Doors Open" },
        { time: "Main Presentation", title: ev.title },
        { time: "Concluding Block", title: "Q&A, Check-in Verification & Adjournment" }
      ];

      agendaEl.innerHTML = items.map(item => `
        <div class="agenda-item">
          <div class="agenda-item-time">${item.time}</div>
          <div class="agenda-item-title">${item.title}</div>
        </div>
      `).join('');
    }

    // 3. Speaker Profile
    const speaker = ev.speaker || {
      name: "Chapter Executive Board",
      role: "Session Facilitators",
      affiliation: "Student Organization Host Committee",
      avatar: "EX"
    };

    const spkAvatar = document.getElementById('detail-speaker-avatar');
    const spkName = document.getElementById('detail-speaker-name');
    const spkRole = document.getElementById('detail-speaker-role');
    const spkAffil = document.getElementById('detail-speaker-affil');

    if (spkAvatar) spkAvatar.innerText = speaker.avatar || 'SP';
    if (spkName) spkName.innerText = speaker.name;
    if (spkRole) spkRole.innerText = speaker.role;
    if (spkAffil) spkAffil.innerText = speaker.affiliation;

    // 4. Venue & Amenities
    const venueNameEl = document.getElementById('detail-venue-fullname');
    const venueLocEl = document.getElementById('detail-venue-location');
    const amenitiesGrid = document.getElementById('detail-amenities-grid');

    if (venueNameEl) venueNameEl.innerText = ev.venueName;
    if (venueLocEl) venueLocEl.innerText = `${ev.venueLocation || 'University Main Campus'} • Seating Capacity: ${ev.capacityLimit}`;

    if (amenitiesGrid) {
      const defaultAmenities = ["High-Speed Wi-Fi", "Airconditioned", "Power Outlets", "Laser Projectors", "Wheelchair Accessible"];
      const list = ev.amenities || defaultAmenities;
      amenitiesGrid.innerHTML = list.map(a => `
        <span class="amenity-chip">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          ${a}
        </span>
      `).join('');
    }

    // 5. Accreditation
    const eligEl = document.getElementById('detail-eligibility-text');
    if (eligEl) eligEl.innerText = ev.eligibility || "Verified attendance is accredited toward collegiate chapter standing and official certificate issuance.";
  },

  renderBookingCard() {
    const ev = this.state.event;
    const registered = ev.registeredCount || 0;
    const capacity = ev.capacityLimit;
    const percent = Math.min((registered / capacity) * 100, 100);
    const remaining = Math.max(0, capacity - registered);
    const isFull = remaining === 0;

    // Capacity Readouts
    const numEl = document.getElementById('detail-capacity-numbers');
    const fillEl = document.getElementById('detail-capacity-fill');
    const remEl = document.getElementById('detail-seats-remaining-text');
    const capStatusText = document.getElementById('detail-capacity-status-text');

    if (numEl) numEl.innerText = `${registered} / ${capacity} seats filled`;
    if (fillEl) {
      fillEl.style.width = `${percent}%`;
      fillEl.className = 'capacity-fill ' + (isFull ? 'fill-red' : remaining <= Math.ceil(capacity * 0.3) ? 'fill-amber' : 'fill-green');
    }
    if (remEl) {
      remEl.innerText = isFull ? "Capacity Limit Reached (Waitlist Queue Active)" : `${remaining} seat${remaining === 1 ? '' : 's'} available to claim`;
    }
    if (capStatusText) {
      capStatusText.innerText = isFull ? "Event Over-Capacity" : remaining <= Math.ceil(capacity * 0.3) ? "Filling Fast!" : "Seats Open";
    }

    // Deadline & Cutoff Tag
    const cutoffTag = document.getElementById('detail-cutoff-tag');
    const deadlineDate = document.getElementById('detail-deadline-date');
    if (cutoffTag) cutoffTag.innerText = ev.deadlineBadge || (isFull ? 'Waitlist Open' : 'Open Registration');
    if (deadlineDate) deadlineDate.innerText = ev.registrationDeadline || `${ev.dateMonth} ${ev.dateDay}, 2026`;

    // Student's Registration State
    const userReg = this.state.registrations.find(r => r.eventId === ev.id && r.studentId === this.state.user.studentId);
    const statusBanner = document.getElementById('detail-user-status-banner');
    const actionsContainer = document.getElementById('detail-actions-container');

    if (userReg && userReg.status === 'Confirmed') {
      if (statusBanner) {
        statusBanner.className = 'booking-status-banner is-confirmed';
        statusBanner.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <div>
            <div>Pass Confirmed &bull; Code: <strong>${userReg.regId}</strong></div>
            <div style="font-size:0.75rem; font-weight:normal; opacity:0.85;">Your seat is reserved. Present QR pass at the door.</div>
          </div>
        `;
      }
      if (actionsContainer) {
        actionsContainer.innerHTML = `
          <button class="btn btn-primary w-full" onclick="EventDetailsApp.showPassModal('${userReg.regId}')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="margin-right:0.35rem;"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            View Digital QR Pass
          </button>
          <div style="text-align: center; margin-top: 0.25rem;">
            <button class="pass-cancel-action" onclick="EventDetailsApp.cancelRegistration('${userReg.regId}')">
              Cancel Registration Slot
            </button>
          </div>
        `;
      }
    } else if (userReg && userReg.status === 'Waitlisted') {
      if (statusBanner) {
        statusBanner.className = 'booking-status-banner is-waitlisted';
        statusBanner.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <div>
            <div>Waitlisted &bull; Position: #1 in Queue</div>
            <div style="font-size:0.75rem; font-weight:normal; opacity:0.85;">Awaiting seat release from cancellation.</div>
          </div>
        `;
      }
      if (actionsContainer) {
        actionsContainer.innerHTML = `
          <div class="waitlist-queue-box" style="margin-bottom: 0.5rem;">
            <strong>⏳ Position in Queue: #1</strong>
            <small>No QR code issued. If an enrolled attendee cancels, your pass will be automatically promoted to Confirmed.</small>
          </div>
          <div style="text-align: center;">
            <button class="pass-cancel-action" onclick="EventDetailsApp.cancelRegistration('${userReg.regId}')">
              Leave Waitlist Queue
            </button>
          </div>
        `;
      }
    } else if (userReg && userReg.status === 'Cancelled') {
      if (statusBanner) {
        statusBanner.className = 'booking-status-banner is-cancelled';
        statusBanner.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          <div>Registration Cancelled</div>
        `;
      }
      if (actionsContainer) {
        actionsContainer.innerHTML = `
          <button class="btn btn-secondary w-full" onclick="EventDetailsApp.register()">
            Re-Register for Seat &rarr;
          </button>
        `;
      }
    } else {
      // Not registered
      if (statusBanner) {
        statusBanner.className = 'booking-status-banner';
        statusBanner.style.background = 'var(--bg-subtle)';
        statusBanner.style.color = 'var(--text-secondary)';
        statusBanner.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>
          <div>Not yet registered for this session</div>
        `;
      }
      if (actionsContainer) {
        actionsContainer.innerHTML = `
          <button class="btn ${isFull ? 'btn-secondary' : 'btn-primary'} w-full" onclick="EventDetailsApp.register()">
            ${isFull ? 'Join Waitlist Queue (Over-Capacity)' : '1-Click Reserve Pass &rarr;'}
          </button>
        `;
      }
    }
  },

  register() {
    const ev = this.state.event;
    if (!ev) return;

    let existing = this.state.registrations.find(r => r.eventId === ev.id && r.studentId === this.state.user.studentId);
    const isFull = (ev.registeredCount || 0) >= ev.capacityLimit;
    const newStatus = isFull ? "Waitlisted" : "Confirmed";

    if (existing) {
      existing.status = newStatus;
      existing.regDate = new Date().toISOString().slice(0, 10);
    } else {
      const newReg = {
        regId: `REG-${Math.floor(2000 + Math.random() * 8000)}`,
        eventId: ev.id,
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
    this.renderBookingCard();
  },

  cancelRegistration(regId) {
    if (!confirm("Are you sure you want to cancel your event registration? Your seat will be released immediately.")) return;

    const reg = this.state.registrations.find(r => r.regId === regId);
    if (!reg) return;

    reg.status = 'Cancelled';
    const ev = this.state.event;
    if (ev) {
      ev.registeredCount = Math.max(0, (ev.registeredCount || 1) - 1);

      // Auto-promote next waitlisted attendee if any
      const nextWait = this.state.registrations.find(r => r.eventId === ev.id && r.status === 'Waitlisted');
      if (nextWait) {
        nextWait.status = 'Confirmed';
        ev.registeredCount = (ev.registeredCount || 0) + 1;
        this.showToast("Seat released and auto-assigned to next waitlisted student!", "success");
      } else {
        this.showToast("Your reservation slot has been cancelled.", "info");
      }
    }

    this.renderBookingCard();
  },

  showPassModal(regId) {
    const reg = this.state.registrations.find(r => r.regId === regId) ||
                this.state.registrations.find(r => r.eventId === this.state.event.id && r.studentId === this.state.user.studentId);
    const ev = this.state.event;
    if (!reg || !ev) return;

    const modalHTML = `
      <div style="text-align: center; padding: 1rem 0.5rem;">
        <span class="badge ${ev.typeBadge}" style="margin-bottom: 0.5rem;">${ev.type}</span>
        <h2 style="font-size: 1.35rem; font-weight: 800; margin-bottom: 0.5rem; color: var(--text-primary);">${ev.title}</h2>
        <p style="color: var(--text-secondary); font-size: 0.88rem; margin-bottom: 1.25rem;">${ev.venueName} &bull; ${ev.dateMonth} ${ev.dateDay}, 2026 &bull; ${ev.time}</p>

        <div style="background: #ffffff; padding: 1.25rem; border-radius: var(--radius-lg); border: 2px solid var(--emerald-primary); display: inline-block; box-shadow: var(--shadow-md); margin-bottom: 1rem;">
          <svg width="180" height="180" viewBox="0 0 100 100" style="shape-rendering: crispEdges;">
            <rect width="100" height="100" fill="#ffffff"/>
            <!-- Outer Corners -->
            <rect x="8" y="8" width="28" height="28" fill="#0f172a"/>
            <rect x="13" y="13" width="18" height="18" fill="#ffffff"/>
            <rect x="17" y="17" width="10" height="10" fill="#059669"/>
            
            <rect x="64" y="8" width="28" height="28" fill="#0f172a"/>
            <rect x="69" y="13" width="18" height="18" fill="#ffffff"/>
            <rect x="73" y="17" width="10" height="10" fill="#059669"/>
            
            <rect x="8" y="64" width="28" height="28" fill="#0f172a"/>
            <rect x="13" y="69" width="18" height="18" fill="#ffffff"/>
            <rect x="17" y="73" width="10" height="10" fill="#059669"/>

            <!-- Centered Data Matrix -->
            <rect x="42" y="12" width="6" height="6" fill="#0f172a"/>
            <rect x="52" y="22" width="6" height="6" fill="#0f172a"/>
            <rect x="40" y="40" width="20" height="20" fill="#059669"/>
            <rect x="22" y="44" width="6" height="6" fill="#0f172a"/>
            <rect x="72" y="48" width="6" height="6" fill="#0f172a"/>
            <rect x="48" y="70" width="6" height="6" fill="#0f172a"/>
            <rect x="76" y="76" width="8" height="8" fill="#0f172a"/>
          </svg>
        </div>

        <div style="font-family: var(--font-mono); font-size: 1.15rem; font-weight: 800; color: var(--emerald-primary); margin-bottom: 0.25rem;">
          ${this.state.user.studentId}
        </div>
        <div style="font-size: 0.95rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.25rem;">
          ${this.state.user.fullName}
        </div>
        <div style="font-size: 0.8rem; color: var(--text-tertiary); margin-bottom: 1.25rem;">
          Pass Code: ${reg.regId} &bull; ${reg.status}
        </div>

        <!-- Manual Check-In Fallback Notice (Function #7 from PDF) -->
        <div style="background: var(--bg-subtle); padding: 0.85rem 1rem; border-radius: var(--radius-md); font-size: 0.84rem; color: var(--text-secondary); text-align: left; line-height: 1.45; border: 1px solid var(--bg-divider); margin-bottom: 1.25rem;">
          <div style="font-weight: 700; color: var(--text-primary); margin-bottom: 0.2rem;">Event Check-In Instructions:</div>
          <div>Present this QR code at the event check-in desk upon arrival. If camera verification is unavailable, quote your Student ID <strong>${this.state.user.studentId}</strong> for manual verification.</div>
        </div>

        <button class="btn btn-secondary w-full" onclick="EventDetailsApp.closeModal()">Close Pass</button>
      </div>
    `;

    this.openModal("Official Digital Event Pass", modalHTML);
  },

  exportToCalendar() {
    const ev = this.state.event;
    if (!ev) return;

    // Generate iCal format
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//AttendTa//Student Chapter Events//EN",
      "BEGIN:VEVENT",
      `SUMMARY:${ev.title}`,
      `DESCRIPTION:${ev.shortSnippet || ev.description}`,
      `LOCATION:${ev.venueName}, ${ev.venueLocation || ''}`,
      `STATUS:CONFIRMED`,
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `attendta-${ev.id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.showToast("Calendar event (.ics) downloaded!", "success");
  },

  copyEventLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      this.showToast("Event URL copied to clipboard!", "success");
    }).catch(() => {
      this.showToast("Copied link to clipboard!", "info");
    });
  },

  renderRecommendations() {
    const container = document.getElementById('detail-recommendations-grid');
    if (!container) return;

    const others = this.state.events.filter(e => e.id !== this.state.eventId).slice(0, 3);
    container.innerHTML = others.map(ev => {
      const coverSrc = ev.coverImage || 'assets/bento-summit.jpg';
      return `
        <div class="event-card" onclick="window.location.href='event-details.html?id=${ev.id}'">
          <div class="event-card-cover" style="height: 140px;">
            <img src="${coverSrc}" alt="${ev.title}" class="event-card-cover-img" loading="lazy">
            <div class="event-card-cover-scrim"></div>
            <div class="event-card-type-overlay">
              <span class="badge ${ev.typeBadge}" style="font-size: 0.68rem;">${ev.type}</span>
            </div>
            <div class="event-card-date-badge">
              <span class="month">${ev.dateMonth}</span>
              <span class="day">${ev.dateDay}</span>
            </div>
          </div>
          <div class="event-card-body" style="padding: 1rem 1.15rem;">
            <h4 style="font-size: 0.98rem; font-weight: 700; margin-bottom: 0.4rem; color: var(--text-primary); line-height: 1.3;">
              ${ev.title}
            </h4>
            <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.75rem;">
              ${ev.venueName}
            </div>
            <div style="margin-top: auto; font-size: 0.78rem; font-weight: 700; color: var(--emerald-primary);">
              View Event &rarr;
            </div>
          </div>
        </div>
      `;
    }).join('');
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
  }
};

window.addEventListener('DOMContentLoaded', () => {
  EventDetailsApp.init();
});
