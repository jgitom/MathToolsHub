/* NexCompany AI — V2 configuration */

/* ------------------------------------------------------------------
   SUPABASE CONFIG
   Paste your Supabase project URL + anon key to use real authentication
   and a real Postgres backend. When left blank (or offline) the app
   automatically runs in Demo/Local mode using localStorage so you can
   explore everything without a backend.
   ------------------------------------------------------------------ */
window.CONFIG = {
  /* Deployment environment. Set to "production" (or pass ?env=production) to lock the
     app to Supabase — the demo storage drivers (localStorage / SQLite / REST) are disabled. */
  env: "development",
  /* Which storage backend to use. "auto" = Supabase when configured, else localStorage.
     Options: "auto" | "local" | "supabase" | "sqlite" (in-browser SQLite) | "rest" (any DB via API).
     You can also switch at runtime from the sidebar's Storage picker. */
  dbDriver: "auto",
  /* Base URL of the generic storage API used by the "rest" driver (see /server).
     e.g. "http://localhost:8091" */
  apiBaseUrl: "",
  supabaseUrl: "",      // e.g. "https://abcdefgh.supabase.co"
  supabaseAnonKey: "",  // anon/public key from Project Settings > API
  appName: "NexCompany AI",
  /* Who built/distributes this product — shown as a credit on the login
     screen and in the sidebar footer. Change to your own brand. */
  builder: {
    name: "Juil Gitom", // ← your company / builder name
    website: "",                 // optional link (e.g. "https://yourco.com")
    email: "",                   // optional support email
  },
  currency: "RM",
  workStart: "09:00",   // standard work start time
  workEnd: "18:00",
  graceMinutes: 15,     // late after start + grace
  annualLeaveDays: 14,  // per employee per year
  sickLeaveDays: 14,
  /* ------------------- Plans & billing -------------------
     The tenant plan (company.plan overrides this). "trial" unlocks everything
     for planTrialDays. In production the company's plan is set by billing. */
  plan: "trial",
  planTrialDays: 14,
  billing: {
    checkout: null, // stub — wire to Stripe/Paddle: checkout(planId) => Promise<url>
  },
};

/* ------------------- Plans (SaaS tiers) -------------------
   `features` = module ids the plan unlocks ("*" = all). The same keys are used
   by the nav gating (App.planAllows) and shown on the Plans & Pricing page. */
window.PLANS = [
  {
    id: "starter", name: "Starter", price: 149, tagline: "Core HR & operations",
    blurb: ["Employees, leave & attendance", "Projects, finance & CRM", "Company, branches & departments", "Up to 10 users"],
    features: ["company", "branches", "departments", "team", "employees", "leave", "attendance", "projects", "finance", "crm", "customers"],
  },
  {
    id: "standard", name: "Standard", price: 299, tagline: "Full operations + payroll",
    blurb: ["Everything in Starter", "Payroll & payslips", "Internal memos (email template)", "Audit log", "Up to 30 users"],
    features: ["company", "branches", "departments", "team", "employees", "leave", "attendance", "projects", "finance", "crm", "customers", "payroll", "memos", "audit"],
  },
  {
    id: "business", name: "Business", price: 799, tagline: "Multi-company + priority",
    blurb: ["Everything in Standard", "Unlimited companies", "Priority support & SLA", "API access & backups"],
    features: ["company", "branches", "departments", "team", "employees", "leave", "attendance", "projects", "finance", "crm", "customers", "payroll", "memos", "audit", "multi-company"],
  },
];
window.TRIAL_PLAN = {
  id: "trial", name: "Trial", price: 0, tagline: "Everything free for 14 days",
  blurb: ["All features unlocked", "14-day evaluation", "No card required"],
  features: ["*"],
};

/* ------------------- Roles & RBAC permissions -------------------
   role hierarchy: owner > admin > manager > staff
   Permissions are enforced on the UI (nav + actions + row filters).
   In Supabase mode the same rules must be mirrored by PostgreSQL RLS. */
window.ROLES = ["owner", "admin", "manager", "staff"];
window.ROLE_LABEL = {
  owner: "Owner",
  admin: "Administrator",
  manager: "Manager",
  staff: "Staff",
};

window.PERMS = {
  company: {
    owner: ["view", "edit"],
    admin: ["view", "edit"],
    manager: ["view"],
    staff: ["view"],
  },
  branches: {
    owner: ["view", "create", "edit", "delete"],
    admin: ["view", "create", "edit", "delete"],
    manager: ["view"],
    staff: [],
  },
  departments: {
    owner: ["view", "create", "edit", "delete"],
    admin: ["view", "create", "edit", "delete"],
    manager: ["view"],
    staff: [],
  },
  team: {
    owner: ["view", "create", "edit", "delete"],
    admin: ["view", "create", "edit"],
    manager: [],
    staff: [],
  },
  employees: {
    owner: ["view", "create", "edit", "delete"],
    admin: ["view", "create", "edit", "delete"],
    manager: ["view", "create", "edit"],
    staff: ["view:self"],
  },
  leave: {
    owner: ["view", "create", "approve"],
    admin: ["view", "create", "approve"],
    manager: ["view", "create", "approve"],
    staff: ["view:self", "create"],
  },
  attendance: {
    owner: ["view", "edit", "clock"],
    admin: ["view", "edit", "clock"],
    manager: ["view", "edit", "clock"],
    staff: ["view:self", "clock"],
  },
  payroll: {
    owner: ["view", "run", "edit"],
    admin: ["view", "run", "edit"],
    manager: ["view", "run"],
    staff: ["view:self"],
  },
  projects: {
    owner: ["view", "create", "edit", "delete"],
    admin: ["view", "create", "edit", "delete"],
    manager: ["view", "create", "edit"],
    staff: ["view"],
  },
  finance: {
    owner: ["view", "create", "edit", "delete"],
    admin: ["view", "create", "edit", "delete"],
    manager: ["view", "create", "edit"],
    staff: ["view"],
  },
  crm: {
    owner: ["view", "create", "edit", "delete"],
    admin: ["view", "create", "edit", "delete"],
    manager: ["view", "create", "edit"],
    staff: ["view"],
  },
  memos: {
    owner: ["view", "create", "edit", "delete"],
    admin: ["view", "create", "edit", "delete"],
    manager: ["view", "create", "edit"],
    staff: ["view"],
  },
  audit: {
    owner: ["view"],
    admin: ["view"],
    manager: [],
    staff: [],
  },
};
