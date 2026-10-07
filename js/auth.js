/**
 * Auth Controller for the Mobile-First Portal Authentication
 */
const Auth = {
  state: {
    members: INITIAL_DATA.members
  },

  switchTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-view').forEach(v => {
      v.classList.remove('active-view');
      v.classList.add('hidden-view');
    });

    document.getElementById(`tab-${tab}`).classList.add('active');
    
    const view = document.getElementById(`view-${tab}`);
    view.classList.remove('hidden-view');
    view.classList.add('active-view');
  },

  fillDemo(studentId) {
    document.getElementById('login-id').value = studentId;
    document.getElementById('login-pass').value = 'password123';
    this.handleLogin();
  },

  fillRequestDemo() {
    document.getElementById('req-id').value = '2026-88192-MN-0';
    document.getElementById('req-name').value = 'Danielle Keith Alcantara';
    document.getElementById('req-course').value = 'BS Information Technology 1-B';
    document.getElementById('req-contact').value = '+63 918 392 0192';
    document.getElementById('req-email').value = 'd.alcantara@student.edu';
  },

  showPendingState() {
    document.querySelectorAll('.auth-tab-group').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.auth-view').forEach(v => {
      v.classList.remove('active-view');
      v.classList.add('hidden-view');
    });
    
    const pendingView = document.getElementById('view-pending');
    pendingView.classList.remove('hidden-view');
    pendingView.classList.add('active-view');
  },

  handleLogin() {
    const idVal = document.getElementById('login-id').value.trim().toLowerCase();
    
    const user = this.state.members.find(m => 
      m.studentId.toLowerCase() === idVal || 
      m.email.toLowerCase() === idVal
    );

    if (!user) {
      this.showToast("No account found. Please request an account.", "error");
      return;
    }

    if (user.status === 'Pending Approval') {
      this.showPendingState();
      return;
    }

    // Login successful
    this.showToast(`Welcome back, ${user.fullName}!`, "success");
    sessionStorage.removeItem('attendta_explicit_logout');
    sessionStorage.setItem('attendta_current_user', JSON.stringify(user));

    setTimeout(() => {
      if (user.role === 'admin') {
        window.location.href = 'admin.html';
      } else if (user.role === 'officer' || (user.membershipType && user.membershipType.includes('Officer'))) {
        window.location.href = 'officer.html';
      } else {
        window.location.href = 'student.html';
      }
    }, 450);
  },

  handleRequestAccount() {
    const studentId = document.getElementById('req-id').value.trim();
    const fullName = document.getElementById('req-name').value.trim();
    const courseYear = document.getElementById('req-course').value.trim();
    const contact = document.getElementById('req-contact').value.trim();
    const email = document.getElementById('req-email').value.trim();

    if (this.state.members.some(m => m.studentId === studentId)) {
      this.showToast(`ID ${studentId} is already in the system.`, "error");
      return;
    }

    // Persist mock data in session storage for this session
    const newRecord = {
      studentId, fullName, courseYear, email, contact,
      membershipType: "Applicant", role: "member", status: "Pending Approval",
      avatarInitials: fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    };
    
    this.state.members.unshift(newRecord);
    // In a real app we'd save to DB. We will just show the pending state.
    this.showPendingState();
    this.showToast("Account request submitted successfully.", "success");
  },

  showToast(msg, type = 'info') {
    const container = document.getElementById('toast-hub');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span style="font-size: 1.1rem;">${type === 'success' ? '&#10004;' : type === 'error' ? '&#10006;' : '&#9888;'}</span> <div class="toast-msg">${msg}</div>`;
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
  const savedTheme = localStorage.getItem('attendta_theme') || 
    (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', savedTheme);

  const params = new URLSearchParams(window.location.search);
  if (params.get('tab') === 'request') {
    Auth.switchTab('request');
  }
  if (params.get('logged_out') === '1') {
    Auth.showToast("You have been signed out.", "info");
  }
});
