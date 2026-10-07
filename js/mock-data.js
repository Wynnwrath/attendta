/**
 * Mock Data Engine for Student Organization Event & Attendance System
 * Realistic names, courses, student IDs, event records, and venues.
 */

const INITIAL_DATA = {
  // Master: Venues
  venues: [
    {
      id: "ven-01",
      name: "Engineering Amphitheater West",
      capacity: 180,
      location: "Tech Building 3rd Flr",
      contactPerson: "Engr. Dario Ramos",
      notes: "Dual 4K Laser Projectors, Lapel Mics, Airconditioned"
    },
    {
      id: "ven-02",
      name: "Innovation & Robotics Lab 4",
      capacity: 45,
      location: "Research Wing Rm 402",
      contactPerson: "Prof. Melinda Cruz",
      notes: "Soldering benches, high-power AC mains, Ethernet drops"
    },
    {
      id: "ven-03",
      name: "Student Activity Center Main Hall",
      capacity: 350,
      location: "Student Union Complex",
      contactPerson: "Dir. Arthur Valenzuela",
      notes: "Full sound system, bleacher seating, acoustic paneling"
    },
    {
      id: "ven-04",
      name: "Seminar Room B",
      capacity: 60,
      location: "Admin Hall 2nd Flr",
      contactPerson: "Ms. Clara Santos",
      notes: "Whiteboards, teleconferencing cam, modular tables"
    }
  ],

  // Master: Event Types
  eventTypes: [
    { id: "et-01", name: "Technical Seminar", color: "badge-amber", desc: "Expert talks, industry keynote lectures" },
    { id: "et-02", name: "Hackathon / Competition", color: "badge-pine", desc: "Coding, hardware design, and prototyping sprints" },
    { id: "et-03", name: "General Assembly", color: "badge-success", desc: "All-hands student chapter organizational meetings" },
    { id: "et-04", name: "Hands-on Workshop", color: "badge-neutral", desc: "Skill development labs and certification training" },
    { id: "et-05", name: "Community Outreach", color: "badge-amber", desc: "Tech literacy and extension services" }
  ],

  // Master: Organization Members (realistic, messy names & IDs)
  members: [
    {
      studentId: "2023-01492-MN-0",
      fullName: "Danica Ysabel Navarro",
      courseYear: "BS Computer Science 3-A",
      email: "danica.navarro@student.edu",
      contact: "+63 917 582 9104",
      membershipType: "Executive Officer",
      role: "officer",
      status: "Active",
      avatarInitials: "DN"
    },
    {
      studentId: "2023-08819-MN-0",
      fullName: "Christian Paolo Mercado",
      courseYear: "BS Computer Science 3-A",
      email: "cpaolo.mercado@student.edu",
      contact: "+63 928 411 7732",
      membershipType: "President / Admin",
      role: "admin",
      status: "Active",
      avatarInitials: "CM"
    },
    {
      studentId: "2024-00128-MN-0",
      fullName: "Rafael Joaquin De Leon",
      courseYear: "BS Computer Engineering 2-B",
      email: "r.deleon@student.edu",
      contact: "+63 905 319 8812",
      membershipType: "Regular Member",
      role: "member",
      status: "Active",
      avatarInitials: "RD"
    },
    {
      studentId: "2024-03914-MN-0",
      fullName: "Samantha Christine Tan",
      courseYear: "BS Information Technology 2-A",
      email: "sam.tan@student.edu",
      contact: "+63 919 722 5590",
      membershipType: "Regular Member",
      role: "member",
      status: "Active",
      avatarInitials: "ST"
    },
    {
      studentId: "2025-09120-MN-0",
      fullName: "Alfonso Miguel Soriano",
      courseYear: "BS Electrical Engineering 1-C",
      email: "am.soriano@student.edu",
      contact: "+63 927 601 2289",
      membershipType: "Probationary Member",
      role: "member",
      status: "Pending Approval",
      avatarInitials: "AS"
    },
    {
      studentId: "2024-04192-MN-0",
      fullName: "Bea Katrina Villanueva",
      courseYear: "BS Computer Science 2-B",
      email: "bea.villanueva@student.edu",
      contact: "+63 918 332 9410",
      membershipType: "Regular Member",
      role: "member",
      status: "Active",
      avatarInitials: "BV"
    },
    {
      studentId: "2025-10492-MN-0",
      fullName: "Justin Troy Alcantara",
      courseYear: "BS Information Systems 1-A",
      email: "jt.alcantara@student.edu",
      contact: "+63 939 120 7401",
      membershipType: "Applicant",
      role: "member",
      status: "Pending Approval",
      avatarInitials: "JA"
    }
  ],

  // Transactions: Events
  events: [
    {
      id: "ev-2026-01",
      title: "HDL & Modern Frontend Architecture Summit 2026",
      type: "Technical Seminar",
      typeBadge: "badge-amber",
      venueId: "ven-01",
      venueName: "Engineering Amphitheater West",
      venueLocation: "Tech Building 3rd Flr, Room 302",
      dateMonth: "OCT",
      dateDay: "14",
      dateYear: "2026",
      time: "09:00 AM - 04:30 PM",
      capacityLimit: 120,
      registeredCount: 84,
      checkedInCount: 68,
      coverImage: "assets/bento-summit.jpg",
      shortSnippet: "An intensive day-long summit exploring high-performance web frontends, design tokens, and deterministic state orchestration.",
      description: "An intensive day-long summit on High-Definition Layouts, state machine orchestration, and anti-cliché design systems. Learn production-grade architecture patterns directly from senior engineering leaders, complete with interactive architectural breakdowns and live debugging workflows.",
      registrationDeadline: "2026-10-12 23:59",
      deadlineBadge: "Closes in 2 Days",
      status: "Live & Accepting Registrations",
      activeKiosk: true,
      speaker: {
        name: "Engr. Dario Ramos",
        role: "Principal Frontend Architect",
        affiliation: "Veloce Systems & Tech Alumni Board",
        avatar: "DR"
      },
      agenda: [
        { time: "09:00 AM - 09:30 AM", title: "Registration & Badge Verification" },
        { time: "09:30 AM - 11:30 AM", title: "Keynote: Architectural Determinism in Web UIs" },
        { time: "11:30 AM - 01:00 PM", title: "Networking Lunch & Student Demos" },
        { time: "01:00 PM - 03:30 PM", title: "Deep Dive: State Machine Orchestration" },
        { time: "03:30 PM - 04:30 PM", title: "Executive Q&A & Certificate Endorsement" }
      ],
      amenities: ["Dual 4K Laser Projectors", "Lapel Mics", "Airconditioned", "Power Outlets at Every Seat"],
      eligibility: "Accredited for 1.5 Professional Development Units (PDU). Certificate issued post verified check-in."
    },
    {
      id: "ev-2026-02",
      title: "Autonomous Robotics & Edge AI Sprint",
      type: "Hackathon / Competition",
      typeBadge: "badge-pine",
      venueId: "ven-02",
      venueName: "Innovation & Robotics Lab 4",
      venueLocation: "Research Wing Rm 402",
      dateMonth: "OCT",
      dateDay: "22",
      dateYear: "2026",
      time: "01:00 PM - 07:00 PM",
      capacityLimit: 40,
      registeredCount: 38,
      checkedInCount: 0,
      coverImage: "assets/bento-lab.jpg",
      shortSnippet: "Rapid prototyping sprint programming computer vision neural nets directly onto edge microcontrollers and robotic chassis.",
      description: "48-hour hardware sprint focusing on embedded computer vision models on edge microcontrollers. Student teams will deploy real-time object detection models to autonomous rovers, competing on course traversal, obstacle classification, and power efficiency.",
      registrationDeadline: "2026-10-19 18:00",
      deadlineBadge: "Only 2 Seats Left",
      status: "Published",
      activeKiosk: false,
      speaker: {
        name: "Prof. Melinda Cruz",
        role: "Director of Embedded Robotics",
        affiliation: "Institute of Mechatronics & AI",
        avatar: "MC"
      },
      agenda: [
        { time: "01:00 PM - 01:45 PM", title: "Rover Hardware Kit Handout & Setup" },
        { time: "01:45 PM - 04:30 PM", title: "Hacking Sprint 1: Computer Vision Tuning" },
        { time: "04:30 PM - 06:15 PM", title: "Course Time Trials & Autonomous Lap Runs" },
        { time: "06:15 PM - 07:00 PM", title: "Awards Presentation & Hardware Return" }
      ],
      amenities: ["Soldering Benches", "High-power AC Mains", "Ethernet Drops", "Component Supply Bins"],
      eligibility: "Certificate of Technical Achievement awarded to participants completing at least 1 validated run."
    },
    {
      id: "ev-2026-03",
      title: "Semester Midterm General Assembly & Elections",
      type: "General Assembly",
      typeBadge: "badge-success",
      venueId: "ven-03",
      venueName: "Student Activity Center Main Hall",
      venueLocation: "Student Union Complex, Ground Floor",
      dateMonth: "NOV",
      dateDay: "06",
      dateYear: "2026",
      time: "10:00 AM - 01:00 PM",
      capacityLimit: 300,
      registeredCount: 142,
      checkedInCount: 0,
      coverImage: "assets/event-assembly.jpg",
      shortSnippet: "Constitutional updates, officer midterm accountability reports, and collegiate council voting sessions for all chapter members.",
      description: "Constitutional review, officer semester reports, and voting on collegiate student council resolutions. This mandatory all-hands assembly establishes organization initiatives for the upcoming semester and confirms executive officer appointments.",
      registrationDeadline: "2026-11-04 12:00",
      deadlineBadge: "Open until Nov 04",
      status: "Live & Accepting Registrations",
      activeKiosk: false,
      speaker: {
        name: "Christian Paolo Mercado",
        role: "Chapter President",
        affiliation: "Computer Society Executive Committee",
        avatar: "CM"
      },
      agenda: [
        { time: "10:00 AM - 10:30 AM", title: "Quorum Call & Opening Remarks" },
        { time: "10:30 AM - 11:30 AM", title: "Officer Financial & Activity Reports" },
        { time: "11:30 AM - 12:30 PM", title: "Floor Debate on Proposed Amendments" },
        { time: "12:30 PM - 01:00 PM", title: "Digital Ballot Voting & Adjournment" }
      ],
      amenities: ["Full Acoustic Panel Sound System", "Bleacher Seating", "Accessible Ramps", "Live Stream Kiosk"],
      eligibility: "Required for active collegiate standing and voting eligibility in annual chapter elections."
    },
    {
      id: "ev-2026-04",
      title: "Full-Stack Microservices & Cloud-Native Lab",
      type: "Hands-on Workshop",
      typeBadge: "badge-neutral",
      venueId: "ven-04",
      venueName: "Seminar Room B",
      venueLocation: "Admin Hall 2nd Flr, Rm 204",
      dateMonth: "NOV",
      dateDay: "12",
      dateYear: "2026",
      time: "02:00 PM - 06:00 PM",
      capacityLimit: 50,
      registeredCount: 50,
      checkedInCount: 0,
      coverImage: "assets/event-workshop.jpg",
      shortSnippet: "Construct containerized microservices, configure automated CI/CD pipelines, and deploy on Kubernetes clusters.",
      description: "Hands-on guided laboratory in designing resilient microservice topologies using Node.js, Go, Docker, and Kubernetes. Students will build event-driven message queues and monitor live telemetry with Grafana dashboards.",
      registrationDeadline: "2026-11-10 18:00",
      deadlineBadge: "Capacity Full (Waitlist Open)",
      status: "Live & Accepting Registrations",
      activeKiosk: false,
      speaker: {
        name: "Samantha Christine Tan",
        role: "DevOps Lead",
        affiliation: "Cloud Computing Guild",
        avatar: "ST"
      },
      agenda: [
        { time: "02:00 PM - 03:00 PM", title: "Microservice Topology Principles" },
        { time: "03:00 PM - 04:30 PM", title: "Live Lab: Dockerizing Stateful Services" },
        { time: "04:30 PM - 05:30 PM", title: "Kubernetes Cluster Ingress & Helm Deployments" },
        { time: "05:30 PM - 06:00 PM", title: "Telemetry Inspection & Wrap-up" }
      ],
      amenities: ["Modular Tables", "Dedicated Gigabit LAN", "Dual Monitors per Station", "AC Mains"],
      eligibility: "Accredited for 2.0 Technical Lab Hours. Certificate endorsed by Cloud Systems Institute."
    },
    {
      id: "ev-2026-05",
      title: "Youth STEM & Digital Inclusion Outreach",
      type: "Community Outreach",
      typeBadge: "badge-amber",
      venueId: "ven-03",
      venueName: "Student Activity Center Main Hall",
      venueLocation: "Student Union Complex, Ground Floor",
      dateMonth: "NOV",
      dateDay: "20",
      dateYear: "2026",
      time: "08:30 AM - 03:30 PM",
      capacityLimit: 60,
      registeredCount: 28,
      checkedInCount: 0,
      coverImage: "assets/event-outreach.jpg",
      shortSnippet: "Volunteer mentoring initiative introducing local public high school pupils to programming fundamentals and robotics kits.",
      description: "Join fellow chapter members in delivering hands-on programming and robotics workshops to 80 visiting high school students. Student volunteers facilitate team mentoring, logic puzzles, and basic electronics tutorials.",
      registrationDeadline: "2026-11-17 23:59",
      deadlineBadge: "Open (32 Seats Available)",
      status: "Published",
      activeKiosk: false,
      speaker: {
        name: "Danica Ysabel Navarro",
        role: "Outreach Chairperson",
        affiliation: "Community Extension Office",
        avatar: "DN"
      },
      agenda: [
        { time: "08:30 AM - 09:15 AM", title: "Volunteer Briefing & Room Setup" },
        { time: "09:15 AM - 12:00 PM", title: "Morning Block: Logic & Scratch Game Building" },
        { time: "12:00 PM - 01:00 PM", title: "Community Lunch with Mentees" },
        { time: "01:00 PM - 03:00 PM", title: "Afternoon Block: Micro:bit Robot Demos" },
        { time: "03:00 PM - 03:30 PM", title: "Certificate Distribution to Youths" }
      ],
      amenities: ["Interactive Whiteboards", "Modular Group Desks", "Child-safe Robotics Kits", "PA System"],
      eligibility: "Accredited for 6.0 Institutional Civic Action & Volunteer Community Hours."
    },
    {
      id: "ev-2026-06",
      title: "Zero-Trust Cybersecurity & Threat Telemetry",
      type: "Technical Seminar",
      typeBadge: "badge-amber",
      venueId: "ven-01",
      venueName: "Engineering Amphitheater West",
      venueLocation: "Tech Building 3rd Flr, Room 302",
      dateMonth: "NOV",
      dateDay: "27",
      dateYear: "2026",
      time: "01:30 PM - 05:30 PM",
      capacityLimit: 100,
      registeredCount: 92,
      checkedInCount: 0,
      coverImage: "assets/event-cyber.jpg",
      shortSnippet: "Industry deep-dive into SIEM event logs, zero-trust network perimeter architecture, and intrusion mitigation.",
      description: "Leading cyber defense professionals dissect real-world threat actors, supply chain vulnerabilities, and the principles of Zero-Trust Security. Includes live demonstrations of defensive packet analysis and honeypot monitoring.",
      registrationDeadline: "2026-11-25 18:00",
      deadlineBadge: "Only 8 Seats Left",
      status: "Live & Accepting Registrations",
      activeKiosk: false,
      speaker: {
        name: "Dir. Arthur Valenzuela",
        role: "Chief Information Security Advisor",
        affiliation: "National Cyber Defense Taskforce",
        avatar: "AV"
      },
      agenda: [
        { time: "01:30 PM - 02:00 PM", title: "Keynote: Anatomy of Modern Zero-Day Exploits" },
        { time: "02:00 PM - 03:30 PM", title: "Architecting Zero-Trust Identity Grids" },
        { time: "03:30 PM - 03:50 PM", title: "Break & Sponsor Booths" },
        { time: "03:50 PM - 05:00 PM", title: "Live Fire Threat Analysis & SIEM Parsing" },
        { time: "05:00 PM - 05:30 PM", title: "Career Pathways & Q&A" }
      ],
      amenities: ["Dual 4K Projectors", "High Security Air-gapped Demo Network", "Airconditioned"],
      eligibility: "Accredited for 1.5 Professional Development Units (PDU). Certificate issued post verified check-in."
    },
    {
      id: "ev-2026-07",
      title: "Embedded IoT Sensors & Smart Campus Hackathon",
      type: "Hackathon / Competition",
      typeBadge: "badge-pine",
      venueId: "ven-02",
      venueName: "Innovation & Robotics Lab 4",
      venueLocation: "Research Wing Rm 402",
      dateMonth: "DEC",
      dateDay: "04",
      dateYear: "2026",
      time: "09:00 AM - 06:00 PM",
      capacityLimit: 50,
      registeredCount: 45,
      checkedInCount: 0,
      coverImage: "assets/bento-lab.jpg",
      shortSnippet: "Design and deploy low-power wireless sensor nodes to monitor university campus energy consumption and indoor air quality.",
      description: "A fast-paced 1-day innovation hackathon where multidisciplinary teams engineer IoT sensor clusters using ESP32, LoRaWAN, and MQTT protocols. Prototypes will feed data into the university's experimental smart grid dashboard.",
      registrationDeadline: "2026-12-01 23:59",
      deadlineBadge: "Fast Filling (5 Seats Left)",
      status: "Published",
      activeKiosk: false,
      speaker: {
        name: "Prof. Melinda Cruz",
        role: "Head of IoT Research",
        affiliation: "Applied Electronics Laboratory",
        avatar: "MC"
      },
      agenda: [
        { time: "09:00 AM - 09:45 AM", title: "Challenge Briefing & Sensor Kit Allocation" },
        { time: "09:45 AM - 01:00 PM", title: "Build Session 1: Firmware & LoRa Telemetry" },
        { time: "01:00 PM - 02:00 PM", title: "Catered Lunch & Mentor Check-ins" },
        { time: "02:00 PM - 05:00 PM", title: "Build Session 2: Cloud Ingestion & Dashboard" },
        { time: "05:00 PM - 06:00 PM", title: "Live Demos, Judging & Cash Prizes" }
      ],
      amenities: ["Soldering Stations", "Oscilloscopes", "LoRa Gateway", "High-power AC Mains"],
      eligibility: "Hackathon Finalist Credential awarded to all qualifying teams."
    },
    {
      id: "ev-2026-08",
      title: "Production Docker & Kubernetes CI/CD Workshop",
      type: "Hands-on Workshop",
      typeBadge: "badge-neutral",
      venueId: "ven-04",
      venueName: "Seminar Room B",
      venueLocation: "Admin Hall 2nd Flr, Rm 204",
      dateMonth: "DEC",
      dateDay: "10",
      dateYear: "2026",
      time: "01:00 PM - 05:30 PM",
      capacityLimit: 45,
      registeredCount: 32,
      checkedInCount: 0,
      coverImage: "assets/event-workshop.jpg",
      shortSnippet: "Build production-grade GitHub Actions workflows that build multi-arch Docker images and deploy to staging clusters.",
      description: "Master automated continuous integration and delivery. Participants will learn automated unit testing in containers, secret management via HashiCorp Vault, canary deployments, and automated rollbacks on failure.",
      registrationDeadline: "2026-12-07 18:00",
      deadlineBadge: "Open (13 Seats Left)",
      status: "Published",
      activeKiosk: false,
      speaker: {
        name: "Rafael Joaquin De Leon",
        role: "Systems Automation Officer",
        affiliation: "ACM Chapter Infrastructure Team",
        avatar: "RD"
      },
      agenda: [
        { time: "01:00 PM - 01:45 PM", title: "CI/CD Antipatterns vs Modern GitOps" },
        { time: "01:45 PM - 03:15 PM", title: "Hands-on: GitHub Actions Matrix Builds" },
        { time: "03:15 PM - 03:30 PM", title: "Coffee Break" },
        { time: "03:30 PM - 05:00 PM", title: "Automated Canary Deployments with ArgoCD" },
        { time: "05:00 PM - 05:30 PM", title: "Production Checklist & Lab Verification" }
      ],
      amenities: ["Whiteboards", "High-speed WiFi", "Modular Tables", "Cloud Sandbox Accounts"],
      eligibility: "Accredited for 2.0 Technical Lab Hours. Certificate endorsed by Chapter Executive Board."
    },
    {
      id: "ev-2026-p01",
      title: "Chapter Orientation & General Assembly Induction 2026",
      type: "General Assembly",
      typeBadge: "badge-success",
      venueId: "ven-03",
      venueName: "Student Activity Center Main Hall",
      venueLocation: "Student Union Complex, Ground Floor",
      dateMonth: "SEP",
      dateDay: "18",
      dateYear: "2026",
      time: "09:00 AM - 12:30 PM",
      capacityLimit: 250,
      registeredCount: 220,
      checkedInCount: 198,
      coverImage: "assets/event-assembly.jpg",
      shortSnippet: "Annual semester welcome assembly, constitutional orientation, and executive cabinet presentation.",
      description: "Annual semester welcome assembly, constitutional orientation, and executive cabinet presentation for collegiate organization members.",
      registrationDeadline: "2026-09-16 23:59",
      deadlineBadge: "Concluded",
      status: "Concluded",
      activeKiosk: false,
      speaker: {
        name: "Christian Paolo Mercado",
        role: "Chapter President",
        affiliation: "Computer Society Executive Committee",
        avatar: "CM"
      },
      agenda: [
        { time: "09:00 AM - 09:30 AM", title: "Arrival Check-In & Badge Issue" },
        { time: "09:30 AM - 11:00 AM", title: "Presidential State of the Chapter Address" },
        { time: "11:00 AM - 12:30 PM", title: "Induction Ceremony & Credential Distribution" }
      ],
      amenities: ["PA System", "Airconditioned", "Bleacher Seating"],
      eligibility: "Accredited for 3.0 Organizational Governance Hours. Official certificate issued."
    },
    {
      id: "ev-2026-p02",
      title: "Web Standards & Responsive Accessibility Workshop",
      type: "Hands-on Workshop",
      typeBadge: "badge-blue",
      venueId: "ven-01",
      venueName: "Engineering Amphitheater West",
      venueLocation: "Tech Building 3rd Flr, Room 302",
      dateMonth: "SEP",
      dateDay: "26",
      dateYear: "2026",
      time: "01:00 PM - 05:00 PM",
      capacityLimit: 80,
      registeredCount: 76,
      checkedInCount: 65,
      coverImage: "assets/bento-summit.jpg",
      shortSnippet: "Hands-on clinic on semantic HTML5 structure, ARIA roles, and WCAG AAA automated audits.",
      description: "Hands-on clinic covering semantic HTML5 structure, ARIA accessibility trees, and WCAG AAA compliance testing using automated developer tooling.",
      registrationDeadline: "2026-09-24 18:00",
      deadlineBadge: "Concluded",
      status: "Concluded",
      activeKiosk: false,
      speaker: {
        name: "Engr. Dario Ramos",
        role: "Principal Frontend Architect",
        affiliation: "Veloce Systems",
        avatar: "DR"
      },
      agenda: [
        { time: "01:00 PM - 01:30 PM", title: "Kiosk Verification & Setup" },
        { time: "01:30 PM - 03:30 PM", title: "ARIA Testing & Screenreader Clinic" },
        { time: "03:30 PM - 05:00 PM", title: "Code Audit Submission & Review" }
      ],
      amenities: ["Dual 4K Laser Display", "High-Speed WiFi", "Power Outlets"],
      eligibility: "Accredited for 2.5 Technical Development Units. Subject to officer verification."
    }
  ],

  // Transactions: Event Registrations & Live Check-in ledger
  registrations: [
    {
      regId: "REG-9011",
      eventId: "ev-2026-01",
      studentId: "2023-01492-MN-0",
      fullName: "Danica Ysabel Navarro",
      courseYear: "BS Computer Science 3-A",
      regDate: "2026-10-01 10:14",
      status: "Confirmed",
      attended: true,
      checkInTime: "08:42 AM",
      certificateEligible: true
    },
    {
      regId: "REG-9012",
      eventId: "ev-2026-01",
      studentId: "2023-08819-MN-0",
      fullName: "Christian Paolo Mercado",
      courseYear: "BS Computer Science 3-A",
      regDate: "2026-10-01 11:20",
      status: "Confirmed",
      attended: true,
      checkInTime: "08:50 AM",
      certificateEligible: true
    },
    {
      regId: "REG-9008",
      eventId: "ev-2026-p01",
      studentId: "2024-00128-MN-0",
      fullName: "Rafael Joaquin De Leon",
      courseYear: "BS Computer Engineering 2-B",
      regDate: "2026-09-10 14:20",
      status: "Confirmed",
      attended: true,
      checkInTime: "09:15 AM",
      certificateEligible: true
    },
    {
      regId: "REG-9009",
      eventId: "ev-2026-p02",
      studentId: "2024-00128-MN-0",
      fullName: "Rafael Joaquin De Leon",
      courseYear: "BS Computer Engineering 2-B",
      regDate: "2026-09-20 11:00",
      status: "Confirmed",
      attended: true,
      checkInTime: "01:25 PM",
      certificateEligible: false
    },
    {
      regId: "REG-9013",
      eventId: "ev-2026-01",
      studentId: "2024-00128-MN-0",
      fullName: "Rafael Joaquin De Leon",
      courseYear: "BS Computer Engineering 2-B",
      regDate: "2026-10-02 09:30",
      status: "Confirmed",
      attended: false,
      checkInTime: null,
      certificateEligible: false
    },
    {
      regId: "REG-9021",
      eventId: "ev-2026-02",
      studentId: "2024-00128-MN-0",
      fullName: "Rafael Joaquin De Leon",
      courseYear: "BS Computer Engineering 2-B",
      regDate: "2026-10-03 14:10",
      status: "Confirmed",
      attended: false,
      checkInTime: null,
      certificateEligible: false
    },
    {
      regId: "REG-9022",
      eventId: "ev-2026-03",
      studentId: "2024-00128-MN-0",
      fullName: "Rafael Joaquin De Leon",
      courseYear: "BS Computer Engineering 2-B",
      regDate: "2026-10-04 11:25",
      status: "Pending",
      attended: false,
      checkInTime: null,
      certificateEligible: false
    },
    {
      regId: "REG-9023",
      eventId: "ev-2026-04",
      studentId: "2024-00128-MN-0",
      fullName: "Rafael Joaquin De Leon",
      courseYear: "BS Computer Engineering 2-B",
      regDate: "2026-10-03 16:45",
      status: "Waitlisted",
      attended: false,
      checkInTime: null,
      certificateEligible: false
    },
    {
      regId: "REG-9024",
      eventId: "ev-2026-06",
      studentId: "2024-00128-MN-0",
      fullName: "Rafael Joaquin De Leon",
      courseYear: "BS Computer Engineering 2-B",
      regDate: "2026-09-28 08:20",
      status: "Cancelled",
      attended: false,
      checkInTime: null,
      certificateEligible: false
    },
    {
      regId: "REG-9014",
      eventId: "ev-2026-01",
      studentId: "2024-04192-MN-0",
      fullName: "Bea Katrina Villanueva",
      courseYear: "BS Computer Science 2-B",
      regDate: "2026-10-02 14:15",
      status: "Confirmed",
      attended: false,
      checkInTime: null,
      certificateEligible: false
    }
  ],

  // System Activity Audit Logs
  activityLogs: [
    { id: "LOG-01", timestamp: "Today, 09:05 AM", actor: "Christian Mercado (Admin)", action: "System Check-in Station activated for Summit 2026", type: "system" },
    { id: "LOG-02", timestamp: "Today, 08:50 AM", actor: "Attendance Kiosk", action: "Check-in verified: Danica Ysabel Navarro [2023-01492-MN-0]", type: "attendance" },
    { id: "LOG-03", timestamp: "Yesterday, 04:12 PM", actor: "Danica Navarro (Officer)", action: "New Event created: Autonomous Robotics & Edge AI Sprint", type: "event" },
    { id: "LOG-04", timestamp: "Yesterday, 02:40 PM", actor: "Alfonso Miguel Soriano", action: "Account registration request submitted", type: "auth" }
  ]
};
