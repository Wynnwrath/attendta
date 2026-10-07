/**
 * Reports and Participation Analytics Engine
 * Calculates attendance rates, renders cohort distributions, displays no-show audits,
 * and handles printable/CSV reports.
 */

const ReportsModule = {
  render() {
    this.renderMetrics();
    this.renderCohortChart();
    this.renderAttendanceTable();
  },

  renderMetrics() {
    const totalReg = App.state.registrations.length;
    const attended = App.state.registrations.filter(r => r.attended).length;
    const noShows = totalReg - attended;
    const rate = totalReg > 0 ? Math.round((attended / totalReg) * 100) : 0;

    const elTotal = document.getElementById('metric-total-reg');
    const elAttended = document.getElementById('metric-attended');
    const elRate = document.getElementById('metric-rate');
    const elNoShows = document.getElementById('metric-no-shows');

    if (elTotal) elTotal.innerText = totalReg;
    if (elAttended) elAttended.innerText = attended;
    if (elRate) elRate.innerText = `${rate}%`;
    if (elNoShows) elNoShows.innerText = noShows;
  },

  renderCohortChart() {
    const chartContainer = document.getElementById('cohort-chart-container');
    if (!chartContainer) return;

    // Aggregate registrations by course
    const cohorts = {};
    App.state.registrations.forEach(r => {
      const course = r.courseYear.split(' ')[0] + ' ' + (r.courseYear.split(' ')[1] || '');
      cohorts[course] = (cohorts[course] || 0) + 1;
    });

    const maxCount = Math.max(...Object.values(cohorts), 1);

    chartContainer.innerHTML = Object.entries(cohorts).map(([course, count]) => {
      const pct = Math.round((count / maxCount) * 100);
      return `
        <div class="chart-bar-row">
          <div style="font-weight: 600; color: var(--text-primary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${course}</div>
          <div class="bar-track">
            <div class="bar-fill" style="width: ${pct}%;"></div>
          </div>
          <div style="font-family: var(--font-mono); font-weight: 700; text-align: right; color: var(--text-secondary);">${count} reps</div>
        </div>
      `;
    }).join('');
  },

  renderAttendanceTable() {
    const tableBody = document.getElementById('reports-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = App.state.registrations.map(r => {
      const statusBadge = r.attended 
        ? `<span class="badge badge-success"><span class="badge-dot"></span> Present (${r.checkInTime})</span>`
        : `<span class="badge badge-neutral"><span class="badge-dot"></span> No-Show</span>`;
      
      const certBadge = r.certificateEligible
        ? `<button class="btn btn-sm btn-ghost" onclick="ReportsModule.previewCertificate('${r.studentId}')" style="color: var(--pine-primary); font-weight: 700;">View Cert &#8599;</button>`
        : `<span style="font-size: 0.78rem; color: var(--text-tertiary);">Ineligible</span>`;

      return `
        <tr>
          <td><span class="font-mono" style="font-weight: 600;">${r.studentId}</span></td>
          <td><strong>${r.fullName}</strong></td>
          <td>${r.courseYear}</td>
          <td>${r.regDate}</td>
          <td>${statusBadge}</td>
          <td>${certBadge}</td>
        </tr>
      `;
    }).join('');
  },

  previewCertificate(studentId) {
    const student = App.state.members.find(m => m.studentId === studentId);
    if (!student) return;

    const modalHTML = `
      <div style="text-align: center; padding: 1rem 0;">
        <div style="border: 4px double var(--accent-primary); padding: 2.5rem 1.5rem; background: #FFFDF9; border-radius: 8px;">
          <div style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.15em; color: var(--accent-hover); font-weight: 800; margin-bottom: 0.5rem;">
            Certificate of Participation & Completion
          </div>
          <h2 style="font-family: var(--font-display); font-size: 1.6rem; margin-bottom: 0.75rem; color: var(--text-primary);">
            ${student.fullName}
          </h2>
          <p style="font-size: 0.9rem; color: var(--text-secondary); max-width: 42ch; margin: 0 auto 1.5rem auto;">
            Has actively attended and satisfactorily satisfied all seminar requirements for the <strong>HDL & Modern Frontend Architecture Summit 2026</strong>.
          </p>
          <div style="display: flex; justify-content: space-around; margin-top: 2rem; border-top: 1px dashed var(--border-prominent); padding-top: 1rem; font-size: 0.78rem;">
            <div>
              <strong>Engr. Dario Ramos</strong><br>
              <span style="color: var(--text-tertiary);">Faculty Adviser</span>
            </div>
            <div>
              <strong>Christian Paolo Mercado</strong><br>
              <span style="color: var(--text-tertiary);">Student Chapter President</span>
            </div>
          </div>
        </div>
      </div>
    `;

    App.openModal(`Certificate Preview — ${student.studentId}`, modalHTML);
  },

  exportCSV() {
    const rows = [
      ["Student ID", "Full Name", "Course & Year", "Registration Date", "Status", "Attended", "Check-in Timestamp"],
      ...App.state.registrations.map(r => [
        `"${r.studentId}"`,
        `"${r.fullName}"`,
        `"${r.courseYear}"`,
        `"${r.regDate}"`,
        `"${r.status}"`,
        r.attended ? "YES" : "NO",
        `"${r.checkInTime || 'N/A'}"`
      ])
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Participation_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    App.showToast("Participation report downloaded as CSV", "success");
  }
};
