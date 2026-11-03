# AttendTa - Event Registration & Live Gate Verification Prototype

An interactive, high-fidelity visual prototype for the AttendTa Student Organization Event Registration and Live Gate Verification system. Built with vanilla HTML5, CSS3, and JavaScript, featuring built-in seeded mock data and local storage simulation.

---

## 🚀 Quick Start (Run Locally)

### Prerequisites
- **Python 3.x** installed on your system.

### Steps to Run

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd AttendTa
   ```

2. **Start the local server:**
   ```bash
   python server.py
   ```
   *(By default, this serves the application at `http://localhost:3000`)*

3. **Open the prototype in your browser:**
   - **Main Entry / Dashboard:** [http://localhost:3000](http://localhost:3000)
   - **Prototype Navigator:** [http://localhost:3000/prototype-navigator.html](http://localhost:3000/prototype-navigator.html) *(Quick access to all user roles and flow routes)*

> **Note:** For the best experience and to ensure clean seed data, open the site in a fresh browser tab or private/incognito window. Existing local storage will be automatically populated with default mock data on first load.

---

## 📂 Project Structure

```text
AttendTa/
├── account/             # Authentication & account management (Login, Register, Profile, Approvals)
├── admin/               # Administration portal (User management, Role assignments, Audit logs)
├── assets/              # Core stylesheets, component CSS, SVG icon sprites, and app.js (mock data store)
├── certificates/        # Certificate generation and view interfaces
├── events/              # Event management (Create event, Details, Roster, Schedules)
├── images/              # Prototype image assets
├── js/                  # Helper engines (e.g. QR generator)
├── kiosk/               # Live gate check-in and QR verification kiosk
├── masterdata/          # Organization master data (Members, Venues, Event Types)
├── reports/             # Participation & attendance reporting dashboards
├── student/             # Student portal (Browse events, Digital passes, Event history)
├── index.html           # Main landing entry
├── prototype-navigator.html # Interactive role & screen navigation switcher
└── server.py            # Local HTTP development server
```

---

## 👥 Available User Roles & Test Flows

You can switch roles via the navigation bar or use `prototype-navigator.html`:

- **Member / Student:**
  - Browse campus events (`student/events.html`)
  - View event details & register (`student/details.html`)
  - Digital Event Pass with dynamic QR code (`student/passes.html`)
  - Attendance history (`student/history.html`)

- **Officer / Organizer:**
  - Create & manage events (`events/create.html`, `events/index.html`)
  - Run gate check-in & scan passes (`kiosk/index.html`)
  - View attendee check-in rosters (`events/details.html`)
  - Generate & issue event certificates (`certificates/index.html`)

- **Administrator:**
  - Manage users & assign roles (`admin/users.html`, `admin/user-create.html`)
  - Inspect audit logs (`admin/auditlogs.html`)
  - Configure venues & event types (`masterdata/venues.html`, `masterdata/eventtypes.html`)
