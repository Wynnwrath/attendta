# Work Breakdown Structure (WBS) & Functional Decomposition
## AttendTa v2 &bull; Student Organization Event Registration & Attendance System

- **Document Version:** 2.00 (Final Delivered Release &bull; Pure V2 Architecture)
- **Organization / Client:** Alliance Software Inc. / USTP Student Organization Council
- **Project Group:** Group 7
- **Prepared Date:** 2026-10-09
- **Platform Architecture:** AttendTa v2 Enterprise Web Application (`/v2/`)
- **Technology Stack:** HTML5 Semantic Structure, Tailwind CSS Design System, Modern ES6+ JavaScript, Responsive Desktop/Mobile Layouts

---

## 1. Project Overview & Scope Alignment

AttendTa v2 is a modular web-based event registration, real-time attendance verification, certificate issuance, and reporting system for student organizations. It provides dedicated, role-tailored workspaces for Students, Organization Officers, and System Administrators under the unified `/v2/` directory.

This document serves as the **definitive Work Breakdown Structure (WBS)** replacing the preliminary draft in `WBS_Account_Name_Application_Name_yyyymmdd.pdf`. It reflects the concise action-oriented style of the original WBS while strictly mapping every requirement to the **active `v2/` pages**.

---

## 2. Complete Master WBS Table (AttendTa v2 Architecture)

| MODULE | SCREEN / PAGE | FUNCTION / DESCRIPTION / ASSUMPTIONS | Type | FUNCTIONAL CATEGORY (SCREEN / REPORT / BATCH / OTHERS) | Estimate (MD) | V2 CODEBASE PAGE / ROUTE |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Authentication** | (Students) Account Registration Page | • Student Account Request for Membership (student number, fullname, institutional email, course and year, section, contact)<br>• Validate institutional email format and student number<br>• Prevent duplicate registration submissions | Web | SCREEN | 1.5 | `v2/account/register.html` |
| **Authentication** | (Public) Login Page | • Member Login (student number and password)<br>• Officer Login (email and password)<br>• Admin Login (email and password)<br>• Quick 1-click evaluator demo personas (Student / Officer / Admin)<br>• Role-based automatic redirection to dedicated v2 portal | Web | SCREEN | 1.5 | `v2/account/login.html` |
| **Authentication** | (Admin & Officer) Account Approval Page | • List Account Requests<br>• Filter requests by status (pending / accepted / rejected)<br>• Edit Request Status (pending / accepted / rejected)<br>• Auto add Member after approving account request | Web | SCREEN | 2.0 | `v2/account/approvals.html` |
| **Master Data** | (Admin & Officer) Member Management Page | • Member (student number, full name, course/year, section, contact details, membership type, Member Status (active / inactive))<br>• List Members<br>• Auto add Member after approving account request<br>• Edit Member<br>• Toggle Member Status (active / inactive) | Web | SCREEN | 2.0 | `v2/masterdata/members.html` |
| **Master Data** | (Admin & Officer) Event Type Management Page | • Event Type (seminar / outreach / meeting / competition / general assembly / training / workshop)<br>• List Event Types<br>• Add Event Type (with custom color badge tag)<br>• Edit Event Type | Web | SCREEN | 1.5 | `v2/masterdata/eventtypes.html` |
| **Master Data** | (Admin & Officer) Venue Management Page | • Venue (room name, capacity, location, availability notes, and contact person for event coordination)<br>• List Venues<br>• Add Venue (dedicated facility entry form)<br>• Edit Venue | Web | SCREEN | 2.0 | `v2/masterdata/venues.html`<br>`v2/masterdata/venue-create.html` |
| **Transaction** | (Admin & Officer) Event Management Page | • Event (title, type, venue, schedule, participant limit, description, and registration deadline)<br>• List Events (Active / Archived tabs)<br>• Add Event (dedicated creation form with cover image upload, presets, or URL)<br>• Edit Event<br>• Archive and Unarchive Event | Web | SCREEN | 2.5 | `v2/events/index.html`<br>`v2/events/create.html` |
| **Transaction** | (Member) Event Feed Page | • List Events<br>• Filter events by classification / type<br>• View real-time seating availability and deadline<br>• Register to an Event / Link to Event Dossier | Web | SCREEN | 1.5 | `v2/student/events.html` |
| **Transaction** | (Member & Public) Event Details & Dossier Page | • Event Details (agenda, speakers, schedule, venue location, seating capacity)<br>• View real-time seat availability gauge<br>• Register to an Event / Direct Door Pass access | Web | SCREEN | 1.5 | `v2/student/details.html` |
| **Transaction** | (Admin & Officer) Online Registration Management Page | • Auto add Registration after adding an Event / reserving seat<br>• Edit Registration Status (pending / confirmed / waitlisted / cancelled)<br>• Auto waitlist participants when event capacity is reached<br>• Promote waitlisted participant to confirmed<br>• Export Attendee Roster to CSV | Web | SCREEN | 2.0 | `v2/events/details.html` |
| **Transaction** | (Admin & Officer) Attendance Check-In Page | • Scan Member QR Code with camera scanner (check member to Registration)<br>• Manual check-in search (by student number or name)<br>• Live Session Switcher to change active event<br>• Log timestamped check-in records | Web | SCREEN | 2.5 | `v2/kiosk/index.html` |
| **Transaction** | (Member) QR Code Generator Page | • Generate QR Code after confirming Registration of Member<br>• Display digital door pass with student and event details<br>• Download / Save QR Pass image to device<br>• (note: consider sending via email) | Web | SCREEN | 1.5 | `v2/student/passes.html` |
| **Transaction** | (Member) Student Attendance History & Vault Page | • List attended events for student x<br>• Display total attendance rate (%) and verified badges<br>• List and access issued certificates | Web | SCREEN | 1.5 | `v2/student/history.html` |
| **Transaction** | (Admin & Officer) Certificate Management Page | • List Members who attended Event x<br>• Mark Member based on Attendance<br>• Batch issue certificates to all eligible attendees<br>• Send Auto Populated Certificate to eligible Members (note: consider sending via email) | Web | SCREEN | 2.0 | `v2/certificates/index.html` |
| **Transaction** | (Public & Member) Digital Certificate View Page | • Certificate (participant name, event title, date, unique credential ID, USTP official seals)<br>• View auto-populated participation certificate<br>• Print / Export certificate to PDF | Web | SCREEN / REPORT | 1.0 | `v2/certificates/view.html` |
| **Reports** | (Admin & Officer) Event Participation Reports Page | • List Members who attended Event x<br>• List No-Show Members (Attendees / Registered)<br>• List course/year distribution for officer evaluation (with interactive bar charts)<br>• Calculate attendance turnout rate (%)<br>• Export report to CSV / Print format | Web | REPORT | 2.5 | `v2/reports/participation.html` |
| **Administration** | (Admin) Officer and Permission Management Page | • List all Accounts (Officers / Members / Admins)<br>• Search and filter accounts by name, student number, or role<br>• View current Role & Permission Level badges (L1–L4)<br>• Deactivate / Reactivate account access status | Web | SCREEN | 1.5 | `v2/admin/users.html` |
| **Administration** | (Admin) Appoint / Promote Officer & Role Permissions Page | • Select registered member account to promote<br>• Assign Role Authority Preset (Admin, Officer, Staff, Member)<br>• Granular permission checkmarks (10 operational capability scopes)<br>• Specify Executive Title / Chapter Designation (e.g. VP, Secretary) | Web | SCREEN | 1.5 | `v2/admin/user-create.html` |
| **Administration** | (Admin) System Security Activity Audit Logs Page | • List User Activity Logs (timestamp, actor, IP address, category, action description)<br>• Filter logs by action type (auth / event / member / role)<br>• Export / print audit trail | Web | SCREEN / REPORT | 1.5 | `v2/admin/auditlogs.html` |
| **Portal / Gateway** | (Public) Central Directory & Showcase Page | • List upcoming events on campus<br>• Showcase platform features and institutional system status<br>• Direct gateway navigation to Student, Officer, and Admin portals | Web | SCREEN | 2.0 | `v2/index.html` |
| **TOTAL** | **Overall Project Delivery** | **20 Fully Operational Modules & Workstations** | | | **36.0 MD**<br>*(~1.80 MM)* | **100% Implemented in `v2/`** |

---

## 3. Team Effort Distribution (5 Members &bull; Pure V2 Architecture)

- **Total Man-Days (MD):** 36.0 MD
- **Total Man-Months (MM):** 1.80 MM *(based on 20 MD/MM standard)*
- **Team Breakdown (Average ~7.2 MD per member):**
  - **Member 1 (Authentication & Approvals):** 5.0 MD &bull; `v2/account/`
  - **Member 2 (Master Data Registers):** 5.5 MD &bull; `v2/masterdata/`
  - **Member 3 (Event Management & Registration):** 7.5 MD &bull; `v2/events/`, `v2/student/`
  - **Member 4 (Attendance Kiosk & Certificates):** 7.0 MD &bull; `v2/kiosk/`, `v2/certificates/`
  - **Member 5 (Reporting & System Administration):** 7.0 MD &bull; `v2/reports/`, `v2/admin/`
  - **Common / Gateway:** 2.0 MD &bull; `v2/index.html`
- **Verification Status:** All 20 `v2/` HTML pages exist, with 100% of internal routes validated.

---

## 4. Traceability Matrix to UC-Project-FL.pdf (12 Functional Specifications)

| # | UC-Project-FL Module | Screen Type | Function Name | Detailed Specification Description | Suggested Owner | Implemented V2 Page & Verification |
| :- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Authentication | Login | User Login | Allows organization officers, members, and administrators to sign in securely using email or student number and password. | Member 1 | `v2/account/login.html` (Supports Student No. + Email with 1-click persona quick fills) |
| 2 | Authentication | Login | Role-Based Access | Controls access so officers can manage events, members can register and view attendance, and administrators can maintain system-wide records. | Member 1 | `v2/account/login.html` & `v2/admin/users.html` (Automated redirection to student/officer/admin portals) |
| 3 | Authentication | Login | Account Registration Approval | Lets students submit an account request and allows officers or administrators to approve valid organization members before account activation. | Member 1 | `v2/account/register.html` & `v2/account/approvals.html` (Request queue, approval actions, auto-sync) |
| 4 | Master Data | Master | Organization Member Management | Maintains member records including student number, full name, course/year, section, contact details, membership type, and active/inactive status. | Member 2 | `v2/masterdata/members.html` (Complete directory with search, filtering, and status toggle) |
| 5 | Master Data | Master | Event Type Management | Creates standard event classifications such as seminar, outreach, meeting, competition, general assembly, or training. | Member 2 | `v2/masterdata/eventtypes.html` (Custom event classifications with color tags) |
| 6 | Master Data | Master | Venue Management | Maintains venue records with room name, capacity, location, availability notes, and contact person for event coordination. | Member 2 | `v2/masterdata/venues.html` & `v2/masterdata/venue-create.html` (Facilities directory + add venue form) |
| 7 | Transactions | Transaction | Event Creation and Posting | Allows officers to create an event with title, type, venue, schedule, participant limit, description, and registration deadline, then publish it to members. | Member 3 | `v2/events/index.html` & `v2/events/create.html` (Publishing, banners, and lifecycle archiving) |
| 8 | Transactions | Transaction | Online Event Registration | Allows members to register for an event, validates capacity limits and deadlines, and stores the registration status as pending, confirmed, waitlisted, or cancelled. | Member 3 | `v2/student/events.html`, `v2/student/details.html`, `v2/events/details.html` (Seat limits, waitlisting, CSV) |
| 9 | Transactions | Transaction | Attendance Check-In | Records attendance through manual search, QR code entry, or student number input and timestamps each participant check-in. | Member 4 | `v2/kiosk/index.html` (Camera QR scanning, manual student no. search, session switcher) |
| 10 | Transactions | Transaction | Certificate Eligibility Tracking | Marks participants as eligible for certificates based on attendance, event completion, or officer approval. | Member 4 | `v2/certificates/index.html` & `v2/certificates/view.html` (Eligibility marking, batch issue, printable PDF view) |
| 11 | Reports | Transaction | Event Participation Report | Shows participants per event, attendance rate, no-show list, and course/year distribution for officer evaluation. | Member 5 | `v2/reports/participation.html` (Turnout KPIs, no-show audit, interactive bar charts, CSV export) |
| 12 | Administration | Master | Officer and Permission Management | Allows the administrator to assign officer roles, set permission levels, deactivate accounts, and review user activity logs. | Member 5 | `v2/admin/users.html`, `v2/admin/user-create.html`, `v2/admin/auditlogs.html` (Role matrix, lockout, audit trail) |

