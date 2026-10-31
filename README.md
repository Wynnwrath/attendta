# AttendTa v2 &bull; Student Organization Event & Attendance System

AttendTa v2 is a web-based event registration, real-time camera QR attendance verification, digital pass generator, and certificate issuance platform for university student organizations.

---

## 🚀 Quick Start (Run Locally in 5 Seconds)

No complex installations or Node.js required. Runs with standard **Python 3**.

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/AttendTa.git
cd AttendTa
```

### 2. Start the Local Server
```bash
python server.py
```
*(Or `python3 server.py` on macOS / Linux)*

### 3. Open in Your Browser
Visit [**http://localhost:3000**](http://localhost:3000)

The server will automatically load the **AttendTa v2 Portal**.

---

## 🧭 Live Pages & Route Directory

| Role / Feature | Page Description | Localhost Route |
| :--- | :--- | :--- |
| **Gateway** | Institutional Portal Directory | [`/v2/index.html`](http://localhost:3000/v2/index.html) |
| **Authentication** | Student & Officer Sign In | [`/v2/account/login.html`](http://localhost:3000/v2/account/login.html) |
| **Registration** | Student Membership Request | [`/v2/account/register.html`](http://localhost:3000/v2/account/register.html) |
| **Approvals** | Officer Account Approval Queue | [`/v2/account/approvals.html`](http://localhost:3000/v2/account/approvals.html) |
| **Student** | Browse Event Sessions & RSVP | [`/v2/student/events.html`](http://localhost:3000/v2/student/events.html) |
| **Student** | Event Details & Dossier | [`/v2/student/details.html?eventId=1`](http://localhost:3000/v2/student/details.html?eventId=1) |
| **Student** | **QR Pass Generator (with Emblem)** | [`/v2/student/passes.html`](http://localhost:3000/v2/student/passes.html) |
| **Student** | Attendance History & Academic Vault | [`/v2/student/history.html`](http://localhost:3000/v2/student/history.html) |
| **Officer** | **Live Attendance Camera Kiosk** | [`/v2/kiosk/index.html`](http://localhost:3000/v2/kiosk/index.html) |
| **Officer** | Event Operations & Publishing Hub | [`/v2/events/index.html`](http://localhost:3000/v2/events/index.html) |
| **Officer** | Create Event Dedicated Form | [`/v2/events/create.html`](http://localhost:3000/v2/events/create.html) |
| **Officer** | Attendee Rosters & Waitlist Overrides | [`/v2/events/details.html`](http://localhost:3000/v2/events/details.html) |
| **Officer** | Master Member Records Directory | [`/v2/masterdata/members.html`](http://localhost:3000/v2/masterdata/members.html) |
| **Officer** | Venue & Facilities Management | [`/v2/masterdata/venues.html`](http://localhost:3000/v2/masterdata/venues.html) |
| **Officer** | Batch Certificate Issuance | [`/v2/certificates/index.html`](http://localhost:3000/v2/certificates/index.html) |
| **Public** | Official Academic Certificate (Print PDF) | [`/v2/certificates/view.html`](http://localhost:3000/v2/certificates/view.html) |
| **Officer** | Turnout Demographics & CSV Reports | [`/v2/reports/participation.html`](http://localhost:3000/v2/reports/participation.html) |
| **Admin** | Officer & Role Management | [`/v2/admin/users.html`](http://localhost:3000/v2/admin/users.html) |
| **Admin** | Appoint Officer & 10 Scope Checkmarks | [`/v2/admin/user-create.html`](http://localhost:3000/v2/admin/user-create.html) |
| **Admin** | System Security Activity Audit Logs | [`/v2/admin/auditlogs.html`](http://localhost:3000/v2/admin/auditlogs.html) |

---

## 🛠 Features & Architecture

- **Dual-Mode Camera Attendance Scanner (`/v2/kiosk/`):**
  - Uses the smartphone's camera (Safari on iOS / Chrome on Android) with corner reticles, laser scanning line, and instant success audio chime.
  - Includes manual student ID fallback for cracked screens or dead batteries.
- **Pass QR Code Generator (`/v2/student/passes.html`):**
  - Generates scannable QR passes with the **AttendTa emblem** embedded at the center.
- **Role Authority & Granular Permissions (`/v2/admin/`):**
  - 4 Role presets (`Admin`, `Officer`, `Staff`, `Member`) and 10 capability checkmarks.
- **ASP.NET Core Razor Pages Viability:**
  - Designed specifically for 1:1 migration to `.cshtml` Razor Pages with standard semantic POST forms, model binding, and anti-forgery tokens.
- **Offline & Zero Dependencies:**
  - Uses client-side libraries via CDN (`tailwindcss`, `jsQR`, `qrcodejs`).

---

## 💻 Tech Stack
- **Frontend:** Semantic HTML5, Vanilla CSS / Tailwind CSS, Modern ES6+ JavaScript.
- **Backend Compatibility:** ASP.NET Core Razor Pages (`.NET 8/9`).
- **Dev Server:** Python 3 Standard Library (`http.server.ThreadingHTTPServer`).
- **Database Simulation:** Client-side reactive `localStorage` synchronization across tabs.

---

&copy; 2026 USTP Student Organization Council &bull; AttendTa Event Management System.
