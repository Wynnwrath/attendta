/**
 * Rapid Attendance Check-In Kiosk Engine
 * High-speed ID processing, simulated camera viewfinder scanner, audio feedback cue,
 * and live streaming attendee verification ledger.
 */

const AttendanceKiosk = {
  activeEvent: null,

  init(event) {
    this.activeEvent = event;
    this.renderLiveFeed();
    this.bindEvents();
  },

  bindEvents() {
    const idInput = document.getElementById('kiosk-manual-id');
    const submitBtn = document.getElementById('btn-kiosk-submit-id');
    const simulateCamBtn = document.getElementById('btn-simulate-qr-trigger');

    if (idInput && submitBtn) {
      submitBtn.onclick = () => {
        const idVal = idInput.value.trim();
        if (idVal) {
          this.processCheckIn(idVal);
          idInput.value = '';
        } else {
          App.showToast("Please enter a valid Student ID or scan badge", "warning");
        }
      };

      idInput.onkeydown = (e) => {
        if (e.key === 'Enter') {
          submitBtn.click();
        }
      };
    }

    if (simulateCamBtn) {
      simulateCamBtn.onclick = () => {
        this.simulateOpticalBadgeScan();
      };
    }
  },

  // Optical scan simulation: flashes the reticle, plays tone, checks in student
  simulateOpticalBadgeScan() {
    const laser = document.querySelector('.scanner-laser-line');
    const viewfinder = document.querySelector('.scanner-viewfinder-box');
    
    if (laser) {
      laser.style.background = '#F59E0B';
      laser.style.boxShadow = '0 0 20px #F59E0B';
    }

    // Pick a student from roster who hasn't checked in yet or simulate check-in
    const eligibleStudents = App.state.members.filter(m => m.status === 'Active');
    const randomStudent = eligibleStudents[Math.floor(Math.random() * eligibleStudents.length)];

    App.showToast(`Optical QR Captured: ${randomStudent.studentId}`, "info");

    setTimeout(() => {
      if (laser) {
        laser.style.background = '#10B981';
        laser.style.boxShadow = '0 0 14px #10B981';
      }
      this.processCheckIn(randomStudent.studentId);
    }, 600);
  },

  processCheckIn(studentId) {
    // 1. Look up student in members database
    const student = App.state.members.find(m => m.studentId.toLowerCase() === studentId.toLowerCase() || m.fullName.toLowerCase().includes(studentId.toLowerCase()));

    if (!student) {
      App.showToast(`Record not found for "${studentId}". Verify student registration.`, "error");
      this.playAudioCue(false);
      return;
    }

    // 2. Check if already checked in
    const existingCheckIn = App.state.registrations.find(
      r => r.eventId === this.activeEvent.id && r.studentId === student.studentId && r.attended
    );

    if (existingCheckIn) {
      App.showToast(`Already checked in at ${existingCheckIn.checkInTime} (${student.fullName})`, "warning");
      this.playAudioCue(false);
      return;
    }

    // 3. Register or mark attended
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let reg = App.state.registrations.find(r => r.eventId === this.activeEvent.id && r.studentId === student.studentId);
    if (!reg) {
      // Walk-in / on-the-spot registration
      reg = {
        regId: `REG-${Math.floor(1000 + Math.random() * 9000)}`,
        eventId: this.activeEvent.id,
        studentId: student.studentId,
        fullName: student.fullName,
        courseYear: student.courseYear,
        regDate: now.toISOString().slice(0, 10),
        status: "Confirmed",
        attended: true,
        checkInTime: timeStr,
        certificateEligible: true
      };
      App.state.registrations.unshift(reg);
    } else {
      reg.attended = true;
      reg.checkInTime = timeStr;
      reg.certificateEligible = true;
    }

    // Update active event check-in count
    this.activeEvent.checkedInCount = (this.activeEvent.checkedInCount || 0) + 1;

    // Add activity log
    App.state.activityLogs.unshift({
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: `Today, ${timeStr}`,
      actor: "Kiosk Terminal #1",
      action: `Check-in recorded: ${student.fullName} [${student.studentId}]`,
      type: "attendance"
    });

    this.playAudioCue(true);
    App.showToast(`Verified: ${student.fullName} (${student.courseYear})`, "success");
    
    this.renderLiveFeed();
    App.renderHeroStats();
  },

  playAudioCue(isSuccess) {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (isSuccess) {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else {
        osc.frequency.setValueAtTime(261.63, ctx.currentTime); // C4
        osc.frequency.setValueAtTime(220, ctx.currentTime + 0.1); // A3
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.32);
      }
    } catch (e) {
      // AudioContext unavailable or blocked by autoplay
    }
  },

  renderLiveFeed() {
    const feedContainer = document.getElementById('kiosk-live-feed');
    if (!feedContainer) return;

    const checkedInList = App.state.registrations.filter(r => r.eventId === this.activeEvent.id && r.attended);

    if (checkedInList.length === 0) {
      feedContainer.innerHTML = `
        <div style="text-align: center; padding: 2.5rem; color: var(--text-tertiary);">
          <p style="font-weight: 600;">No attendance records clocked in yet.</p>
          <span style="font-size: 0.8rem;">Scan badge or input student number on the left panel to begin.</span>
        </div>
      `;
      return;
    }

    feedContainer.innerHTML = checkedInList.map(item => `
      <div class="feed-card-item">
        <div style="display: flex; align-items: center; gap: 0.85rem;">
          <div class="student-avatar-circle">
            ${item.fullName.split(' ').map(n => n[0]).slice(0, 2).join('')}
          </div>
          <div>
            <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-primary);">${item.fullName}</div>
            <div style="font-size: 0.78rem; color: var(--text-secondary);">
              <span class="font-mono">${item.studentId}</span> &bull; ${item.courseYear}
            </div>
          </div>
        </div>
        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 0.25rem;">
          <span class="badge badge-success"><span class="badge-dot"></span> Checked-in ${item.checkInTime}</span>
          <span style="font-size: 0.72rem; color: var(--pine-primary); font-weight: 600;">Certificate Eligible</span>
        </div>
      </div>
    `).join('');

    // Update checked in counter
    const counterBadge = document.getElementById('kiosk-checked-in-counter');
    if (counterBadge) {
      counterBadge.innerText = `${checkedInList.length} Attendees Clocked In`;
    }
  }
};
