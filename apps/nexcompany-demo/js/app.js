/* NexCompany AI — V2 application: router, navigation, views and workflows.
   Flow: Login/Supabase auth -> Company profile -> Branches -> Departments ->
   Employees -> RBAC -> Leave -> Attendance -> Payroll -> Projects/Finance/CRM -> Audit. */
(function () {
  "use strict";
  var U = window.U, DB = window.DB, Auth = window.Auth, Audit = window.Audit, Seed = window.Seed;
  var cfg = window.CONFIG;

  var NAV = [
    { section: "Overview", pages: [{ id: "dashboard", icon: "🏠", label: "Dashboard", module: null }] },
    { section: "Company Setup", pages: [
      { id: "company", icon: "🏢", label: "Company Profile", module: "company" },
      { id: "branches", icon: "📍", label: "Branches", module: "branches" },
      { id: "departments", icon: "🗂️", label: "Departments", module: "departments" },
      { id: "team", icon: "🛡️", label: "Team & Roles", module: "team" },
    ]},
    { section: "People & Operations", pages: [
      { id: "employees", icon: "👥", label: "Employees", module: "employees" },
      { id: "leave", icon: "🏖️", label: "Leave", module: "leave" },
      { id: "attendance", icon: "⏱️", label: "Attendance", module: "attendance" },
      { id: "payroll", icon: "💵", label: "Payroll", module: "payroll" },
    ]},
    { section: "Business", pages: [
      { id: "projects", icon: "🏗️", label: "Projects", module: "projects" },
      { id: "finance", icon: "💰", label: "Finance", module: "finance" },
      { id: "crm", icon: "🤝", label: "CRM & Sales", module: "crm" },
    ]},
    { section: "Communication", pages: [
      { id: "memos", icon: "📝", label: "Memos", module: "memos" },
    ]},
    { section: "Governance", pages: [
      { id: "audit", icon: "📜", label: "Audit Log", module: "audit" },
    ]},
    { section: "Account", pages: [
      { id: "pricing", icon: "💳", label: "Plans & Pricing", module: null },
    ]},
  ];

  var TITLES = {
    dashboard: "Executive Dashboard", company: "Company Profile", branches: "Branches",
    departments: "Departments", team: "Team & Roles", employees: "Employees",
    leave: "Leave Management", attendance: "Attendance", payroll: "Payroll",
    projects: "Projects", finance: "Finance & Accounting", crm: "CRM & Sales",
    memos: "Internal Memos", audit: "Audit Log", pricing: "Plans & Pricing",
  };
  var SUBS = {
    dashboard: "Live operational picture from your persisted company data",
    company: "Legal profile, contact and fiscal configuration",
    branches: "Physical locations and branch managers",
    departments: "Organisation structure across branches",
    team: "Application users and their RBAC roles",
    employees: "Full employee directory and records",
    leave: "Requests, approvals and balances",
    attendance: "Daily clock-in/out and register",
    payroll: "Periodic payroll computation and payslips",
    projects: "Persistent project register",
    finance: "Persistent income/expense ledger",
    crm: "Sales pipeline with scoring",
    memos: "Standard internal memo template, sent via email",
    pricing: "Choose the plan that fits your company",
    audit: "Immutable trail of every meaningful action",
  };

  /* ============================ helpers ============================ */
  function toast(msg) {
    var t = document.getElementById("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { t.classList.remove("show"); }, 2800);
  }
  function badge(s) {
    s = String(s || "");
    var m = { "On Track": "bgreen", "Active": "bgreen", "present": "bgreen", "approved": "bgreen", "Paid": "bgreen", "Won": "bgreen", "Income": "bgreen", "active": "bgreen", "create": "bgreen", "sent": "bgreen" };
    var cls = m[s] || (["At Risk", "On Leave", "pending", "late", "draft", "Probation", "Lead", "Qualified", "update", "login"].indexOf(s) !== -1 ? "byellow"
      : (["Delayed", "Expense", "rejected", "absent", "Unpaid", "Lost", "terminated", "delete", "reject"].indexOf(s) !== -1 ? "bred"
        : "bblue"));
    return '<span class="badge ' + cls + '">' + U.esc(s) + "</span>";
  }
  function roleChip(r) { return '<span class="role-chip role-' + U.esc(r) + '">' + U.esc(window.ROLE_LABEL[r] || r) + "</span>"; }
  function openModal(title, body, onSubmit, btnLabel) {
    var m = document.getElementById("modal");
    m.innerHTML = '<div class="modal-card"><button class="modal-close" onclick="App.closeModal()">×</button><h2>' + title + "</h2>" + body +
      '<div class="modal-actions"><button class="btn secondary" onclick="App.closeModal()">Cancel</button><button class="btn primary" id="modalSubmit">' + (btnLabel || "Save") + "</button></div></div>";
    m.hidden = false;
    document.getElementById("modalSubmit").onclick = function (e) {
      e.target.disabled = true;
      Promise.resolve(onSubmit()).then(function () {
        if (e.target.isConnected) App.closeModal();
      }).catch(function (err) {
        toast(err.message || String(err));
        e.target.disabled = false;
      });
    };
  }
  function openConfirm(title, body, onOk) {
    var m = document.getElementById("modal");
    m.innerHTML = '<div class="modal-card"><button class="modal-close" onclick="App.closeModal()">×</button><h2>' + title + "</h2><p>" + body +
      '</p><div class="modal-actions"><button class="btn secondary" onclick="App.closeModal()">Cancel</button><button class="btn danger" id="modalSubmit">Confirm</button></div></div>';
    m.hidden = false;
    document.getElementById("modalSubmit").onclick = function () { App.closeModal(); onOk(); };
  }
  function fld(f, values) {
    var v = values ? (values[f.key] !== undefined ? values[f.key] : f.default || "") : (f.default || "");
    var inner;
    if (f.type === "select") {
      inner = '<select id="f_' + f.key + '">' + (f.options || []).map(function (o) {
        var val = typeof o === "object" ? o.value : o;
        var lab = typeof o === "object" ? o.label : o;
        return '<option value="' + U.esc(val) + '"' + (String(v) === String(val) ? " selected" : "") + ">" + U.esc(lab) + "</option>";
      }).join("") + "</select>";
    } else if (f.type === "textarea") {
      inner = '<textarea id="f_' + f.key + '" rows="3">' + U.esc(v) + "</textarea>";
    } else {
      inner = '<input id="f_' + f.key + '" type="' + (f.type || "text") + '" value="' + U.esc(v) + '"' + (f.required ? " required" : "") + (f.step ? ' step="' + f.step + '"' : "") + '>';
    }
    return '<div class="field"><label>' + f.label + (f.required ? " *" : "") + "</label>" + inner + "</div>";
  }
  function collect(keys) {
    var o = {};
    keys.forEach(function (k) { var el = document.getElementById("f_" + k); if (el) o[k] = el.value; });
    return o;
  }
  function empOptions(emps) {
    return emps.map(function (e) { return { value: e.id, label: e.employee_no + " — " + e.full_name }; });
  }
  function lookup(rows, id) { var r = (rows || []).find(function (x) { return x.id === id; }); return r ? r : null; }

  /* ============================ App ============================ */
  var App = (window.App = {
    page: "dashboard",
    onboardStep: 1,

    /* ---------- boot / routing ---------- */
    boot: async function () {
      document.getElementById("authNote").textContent = cfg.supabaseUrl && cfg.supabaseAnonKey
        ? "Supabase backend configured ✔ (real auth + Postgres when a session exists)"
        : "Supabase not configured — running in Demo/Local mode. Paste your project URL + anon key in js/config.js to switch to a real backend.";
      App.setBuilder();
      await Auth.init();
      App.route();
    },

    /* Builder credit (login screen + sidebar footer) */
    setBuilder: function () {
      var b = cfg.builder || {};
      var ab = document.getElementById("authBuiltBy");
      if (ab) {
        var html = "Built by <b>" + U.esc(b.name || "") + "</b>";
        if (b.website) html += ' · <a href="' + U.esc(b.website) + '" target="_blank" rel="noopener">' + U.esc(b.website.replace(/^https?:\/\//, "")) + "</a>";
        if (b.email) html += ' · <a href="mailto:' + U.esc(b.email) + '">' + U.esc(b.email) + "</a>";
        ab.innerHTML = html;
      }
      var fb = document.getElementById("footBuiltBy");
      if (fb) fb.textContent = "Built by " + (b.name || "");
    },

    route: function () {
      var pn = document.getElementById("prodNotice"), lv = document.getElementById("loginView"), ov = document.getElementById("onboardView"), av = document.getElementById("appView");
      if (DB.production && !DB.productionReady) {
        pn.hidden = false; lv.hidden = true; ov.hidden = true; av.hidden = true; return;
      }
      if (!Auth.session) { lv.hidden = false; ov.hidden = true; av.hidden = true; return; }
      if (!Auth.company()) { App.renderOnboard(1); lv.hidden = true; ov.hidden = false; av.hidden = true; return; }
      lv.hidden = true; ov.hidden = true; av.hidden = false;
      App.showApp();
    },

    /* ---------- auth UI ---------- */
    showTab: function (tab) {
      document.querySelectorAll(".auth-tabs button").forEach(function (b) { b.classList.toggle("active", b.dataset.atab === tab); });
      document.getElementById("formSignin").classList.toggle("active", tab === "signin");
      document.getElementById("formSignup").classList.toggle("active", tab === "signup");
      document.getElementById("formDemo").classList.toggle("active", tab === "demo");
    },
    doSignin: async function (e) {
      e.preventDefault();
      var msg = document.getElementById("siMsg"); msg.textContent = "Signing in…";
      try {
        await Auth.signIn(document.getElementById("siEmail").value, document.getElementById("siPassword").value);
        await Audit.log("login", "session", Auth.user().email, { role: Auth.role() });
        App.route();
      } catch (err) { msg.textContent = err.message; msg.style.color = "#c63b3b"; }
    },
    doSignup: async function (e) {
      e.preventDefault();
      var msg = document.getElementById("suMsg"); msg.textContent = "Creating account…";
      try {
        await Auth.signUp(document.getElementById("suName").value, document.getElementById("suEmail").value, document.getElementById("suPassword").value);
        await Audit.log("signup", "session", Auth.user().email, {});
        App.route(); // leads to onboarding when no company exists
      } catch (err) { msg.textContent = err.message; msg.style.color = "#c63b3b"; }
    },
    doDemo: async function (persona) {
      await Auth.demoLogin(persona);
      App.route();
    },
    signOut: async function () {
      await Auth.signOut();
      App.route();
    },

    /* ---------- app shell ---------- */
    showApp: function () {
      var c = Auth.company();
      document.getElementById("brandCompany").textContent = c.name + " · " + (c.city || "");
      var lg = document.getElementById("sidebarLogo");
      if (lg) { if (c.logo) { lg.src = c.logo; lg.hidden = false; } else { lg.hidden = true; } }
      document.getElementById("footWho").textContent = Auth.user().name;
      document.getElementById("footRole").textContent = window.ROLE_LABEL[Auth.role()] + " (" + Auth.role() + ")";
      App.setBuilder();
      App.buildNav();
      App.buildCompanySwitch();
      App.buildStoragePicker();
      App.buildTopActions();
      App.go("dashboard");
    },

    buildStoragePicker: function () {
      var wrap = document.getElementById("storagePickerWrap");
      if (!wrap) return;
      if (DB.production) { wrap.innerHTML = ""; return; } // demo storage drivers are disabled in production
      var opts = [
        { value: "auto", label: "auto (recommended)" },
        { value: "local", label: "localStorage (demo)" },
        { value: "supabase", label: "Supabase / Postgres" },
        { value: "sqlite", label: "SQLite (in-browser)" },
        { value: "rest", label: "REST — any DB (needs API)" },
      ];
      wrap.innerHTML = '<div class="role" style="margin-bottom:4px">Storage driver</div>' +
        '<select id="storageDriver" style="width:100%">' + opts.map(function (o) {
          return '<option value="' + o.value + '"' + (DB.driverName === o.value ? " selected" : "") + ">" + o.label + "</option>";
        }).join("") + "</select>";
      document.getElementById("storageDriver").onchange = function () {
        localStorage.setItem("nx2_driver", this.value);
        location.reload();
      };
    },

    buildTopActions: function () {
      var html = '<span class="who-chip">' + U.esc(Auth.user().email) + "</span>";
      if (DB.production) html = '<span class="who-chip">🔒 PRODUCTION</span>' + html;
      if (!DB.production && Plans.isTrial(Auth.company())) {
        var dl = Plans.daysLeft(Auth.company());
        var label = Plans.trialExpired(Auth.company()) ? "Trial expired" : (dl >= 0 ? ("Trial · " + dl + "d left") : "Trial");
        html += '<button class="btn secondary" onclick="App.go(\'pricing\')">⏳ ' + label + " · Upgrade</button>";
      }
      if (!DB.production && Auth.company() && Auth.company().id === "demo-company") {
        html += '<button class="btn secondary" onclick="App.resetDemo()">↺ Reset Demo Data</button>';
      }
      document.getElementById("topActions").innerHTML = html;
    },

    buildCompanySwitch: function () {
      var wrap = document.getElementById("companySwitchWrap");
      var mems = (window.LS.get("nx2_memberships", [])).filter(function (m) { return m.user_id === Auth.user().id; });
      if (mems.length > 1) {
        var opts = mems.map(function (m) { var cc = window.LS.get("nx2_companies", []).find(function (x) { return x.id === m.company_id; }); return '<option value="' + U.esc(m.company_id) + '"' + (m.company_id === Auth.company().id ? " selected" : "") + ">" + U.esc(cc ? cc.name : m.company_id) + "</option>"; }).join("");
        wrap.innerHTML = '<select id="companySwitch" style="width:100%">' + opts + "</select>";
        document.getElementById("companySwitch").onchange = async function () {
          await Auth.switchCompany(this.value);
          await Audit.log("switch", "company", Auth.company().name, {});
          App.showApp();
        };
      } else { wrap.innerHTML = ""; }
    },

    buildNav: function () {
      var html = "";
      NAV.forEach(function (g) {
        var pages = g.pages.filter(function (p) { return p.id === "dashboard" || p.id === "pricing" || (Auth.canView(p.module) && App.planAllows(p.module)); });
        if (!pages.length) return;
        html += '<div class="section">' + g.section + "</div>";
        pages.forEach(function (p) {
          html += '<button data-page="' + p.id + '" class="' + (App.page === p.id ? "active" : "") + '">' + p.icon + ' <span>' + p.label + "</span></button>";
        });
      });
      document.getElementById("nav").innerHTML = html;
    },

    /* ---- plan helpers ---- */
    planTier: function () { return Plans.tierOf(Auth.company()); },
    planAllows: function (feature) { return Plans.allows(Auth.company(), feature); },
    pageModule: function (page) {
      for (var i = 0; i < NAV.length; i++) {
        for (var j = 0; j < NAV[i].pages.length; j++) {
          if (NAV[i].pages[j].id === page) return NAV[i].pages[j].module;
        }
      }
      return null;
    },

    go: function (page) {
      if (!document.getElementById(page)) return;
      if (page !== "dashboard" && page !== "pricing") {
        var mod = App.pageModule(page);
        if (mod && !App.planAllows(mod)) {
          App.go("pricing");
          toast("Upgrade to unlock " + (TITLES[page] || page) + ".");
          return;
        }
      }
      App.page = page;
      document.querySelectorAll(".page").forEach(function (x) { x.classList.remove("active"); });
      document.getElementById(page).classList.add("active");
      document.getElementById("pageTitle").textContent = TITLES[page] || page;
      document.getElementById("pageSub").textContent = SUBS[page] || "";
      App.buildNav();
      App.refresh();
    },

    refresh: function () {
      var r = { dashboard: App.renderDashboard, company: App.renderCompany, branches: App.renderBranches,
        departments: App.renderDepartments, team: App.renderTeam, employees: App.renderEmployees,
        leave: App.renderLeave, attendance: App.renderAttendance, payroll: App.renderPayroll,
        projects: App.renderProjects, finance: App.renderFinance, crm: App.renderCrm, memos: App.renderMemos, audit: App.renderAudit, pricing: App.renderPricing }[App.page];
      if (r) Promise.resolve(r()).catch(function (err) { console.error(err); toast(err.message || "Render error"); });
    },

    closeModal: function () {
      var m = document.getElementById("modal");
      m.hidden = true; m.innerHTML = "";
    },

    resetDemo: async function () {
      // wipe demo-company scoped data tables
      var keys = [];
      for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k && k.indexOf("nx2_c_demo-company_") === 0) keys.push(k); }
      keys.forEach(function (k) { localStorage.removeItem(k); });
      // drop demo company + its memberships so the seed rebuilds them
      var cs = window.LS.get("nx2_companies", []).filter(function (c) { return c.id !== "demo-company"; });
      window.LS.set("nx2_companies", cs);
      var ms = window.LS.get("nx2_memberships", []).filter(function (m) { return m.company_id !== "demo-company"; });
      window.LS.set("nx2_memberships", ms);
      await Seed.ensureDemo();
      if (DB.mode !== "local") { await DB.clearDemoCompany(); await DB.migrateFromLocal(); }
      // re-link the current user as owner so the session keeps working
      var user = Auth.user();
      var mem = { id: U.id(), user_id: user.id, company_id: "demo-company", role: "owner", employee_id: null, name: user.name, email: user.email, created_at: U.nowISO() };
      window.LS.set("nx2_memberships", window.LS.get("nx2_memberships", []).concat([mem]));
      Auth.session.membership = mem;
      // reseeding reset the company (plan back to trial) — refresh the session copy
      Auth.session.company = (window.LS.get("nx2_companies", []) || []).find(function (c) { return c.id === "demo-company"; }) || null;
      toast("Demo data reset.");
      App.showApp();
      App.refresh();
    },

    /* ================================================================
       DASHBOARD
       ================================================================ */
    renderDashboard: async function () {
      var emps = await DB.list("employees"), tx = await DB.list("finance_transactions"),
        proj = await DB.list("projects"), att = await DB.list("attendance"),
        leaves = await DB.list("leave_requests"), custs = await DB.list("customers"), leads = await DB.list("crm_leads");
      var ym = U.monthKey();
      var rev = U.sum(tx.filter(function (t) { return t.transaction_type === "income" && U.monthKey(t.transaction_date) === ym; }), "amount");
      var exp = U.sum(tx.filter(function (t) { return t.transaction_type === "expense" && U.monthKey(t.transaction_date) === ym; }), "amount");
      var profit = rev - exp;
      var cash = U.sum(tx.filter(function (t) { return t.transaction_type === "income"; }), "amount") - U.sum(tx.filter(function (t) { return t.transaction_type === "expense"; }), "amount");
      var today = U.today();
      var present = att.filter(function (a) { return a.date === today && a.check_in; }).length;
      var onLeave = leaves.filter(function (l) { return l.status === "approved" && l.start_date <= today && l.end_date >= today; }).length;
      var active = proj.filter(function (p) { return p.status !== "Completed"; });
      var atRisk = proj.filter(function (p) { return p.status === "At Risk" || p.status === "Delayed"; });

      document.getElementById("dashKpis").innerHTML =
        kpi("Revenue MTD", U.money(rev), "good", "▲ MTD income") +
        kpi("Expenses MTD", U.money(exp), "warn", "▼ MTD spend") +
        kpi("Net Profit MTD", U.money(profit), profit >= 0 ? "good" : "bad", profit >= 0 ? "Margin " + (rev ? ((profit / rev) * 100).toFixed(1) : "0") + "%" : "Loss-making") +
        kpi("Cash Position", U.money(cash), cash >= 0 ? "good" : "bad", cash >= 0 ? "Healthy" : "Negative");

      document.getElementById("dashHealth").innerHTML =
        '<h2>Company Health</h2><div class="grid three">' +
        '<div><h3>Projects</h3>' + stat("Active", active.length) + stat("At Risk", '<b class="warn">' + atRisk.length + "</b>") + stat("Total Value", U.money(U.sum(active, "contract_value"))) + "</div>" +
        '<div><h3>People</h3>' + stat("Employees", emps.length) + stat("Present Today", present) + stat("On Leave", onLeave) + "</div>" +
        '<div><h3>Commercial</h3>' + stat("Customers", custs.length) + stat("Pipeline Value", U.money(U.sum(leads, "value"))) + stat("Open Leads", leads.length) + "</div></div>";

      var alerts = "";
      atRisk.forEach(function (p) { alerts += '<div class="statline"><span>⚠ ' + U.esc(p.name) + "</span><b class=\"warn\">" + U.esc(p.status) + "</b></div>"; });
      if (leaves.filter(function (l) { return l.status === "pending"; }).length) alerts += '<div class="statline"><span>⏳ Leave awaiting approval</span><b class="byellow">' + leaves.filter(function (l) { return l.status === "pending"; }).length + " requests</b></div>";
      if (!alerts) alerts = '<div class="statline"><span>✅ No priority alerts</span><b class="good">All clear</b></div>';
      document.getElementById("dashAlerts").innerHTML = "<h2>Priority Alerts</h2>" + alerts;

      var recent = tx.slice().sort(function (a, b) { return (b.transaction_date || "").localeCompare(a.transaction_date || ""); }).slice(0, 6);
      document.getElementById("dashTx").innerHTML = "<h2>Recent Transactions</h2>" + (recent.length
        ? '<div class="table-wrap"><table><thead><tr><th>Date</th><th>Description</th><th>Type</th><th>Amount</th></tr></thead><tbody>' +
          recent.map(function (t) { return "<tr><td>" + U.date(t.transaction_date) + "</td><td>" + U.esc(t.description) + "</td><td>" + badge(t.transaction_type) + "</td><td><b>" + U.money(t.amount) + "</b></td></tr>"; }).join("") + "</tbody></table></div>"
        : '<div class="empty">No transactions yet</div>');

      document.getElementById("dashProjects").innerHTML = "<h2>Projects Overview</h2>" + (active.length
        ? active.slice(0, 5).map(function (p) { return '<div class="statline"><span>' + U.esc(p.name) + "</span><b>" + U.pct(p.progress) + "</b></div><div class=\"progress mb\"><span style=\"width:" + p.progress + "%\"></span></div>"; }).join("")
        : '<div class="empty">No projects yet</div>');
    },

    /* ================================================================
       COMPANY PROFILE
       ================================================================ */
    renderCompany: async function () {
      var c = Auth.company();
      var branches = await DB.list("branches"), depts = await DB.list("departments"), emps = await DB.list("employees");
      var canEdit = Auth.can("company", "edit");
      var html = '<div class="company-head">' +
        '<div class="company-logo">' + (c.logo ? '<img src="' + U.esc(c.logo) + '" alt="logo">' : (c.name || "NC").slice(0, 2).toUpperCase()) + "</div>" +
        '<div style="flex:1;min-width:240px"><h2>' + U.esc(c.name) + "</h2>" +
        '<div class="muted">' + U.esc(c.registration_no || "") + " · " + U.esc(c.industry || "") + "</div></div></div>";
      html += '<div class="grid three mt">' +
        infoCard("Contact", [["Phone", c.phone], ["Email", c.email], ["Website", c.website]]) +
        infoCard("Address", [["Street", c.address], ["City", c.city], ["State / Postcode", [c.state, c.postcode].filter(Boolean).join(" ")], ["Country", c.country]]) +
        infoCard("Fiscal", [["Currency", c.currency || "RM"], ["Fiscal year start", c.fiscal_start || "01-01"], ["Created", U.date(c.created_at)]]) +
        "</div>";
      html += '<div class="stepper-grid mt"><div class="card" style="box-shadow:none"><h3>Setup Checklist</h3>' +
        '<ul class="onboard-list">' + setupItem("Company profile", true, "") +
        setupItem("Branches", branches.length > 0, branches.length + " configured · <a href=\"javascript:App.go(\'branches\')\">manage</a>") +
        setupItem("Departments", depts.length > 0, depts.length + " configured · <a href=\"javascript:App.go(\'departments\')\">manage</a>") +
        setupItem("Employees", emps.length > 0, emps.length + " on record · <a href=\"javascript:App.go(\'employees\')\">manage</a>") +
        '</ul></div><div class="card" style="box-shadow:none"><h3>Rules</h3><p class="muted" style="font-size:13px">' +
        U.esc(cfg.workStart) + "–" + U.esc(cfg.workEnd) + " work hours, " + cfg.graceMinutes + " min grace before " + cfg.annualLeaveDays + " annual / " + cfg.sickLeaveDays + " sick leave days. Edit js/config.js to change.</p></div></div>";
      document.getElementById("companyView").innerHTML = html;
      var btn = document.getElementById("btnEditCompany");
      btn.hidden = !canEdit;
    },
    editCompany: function () {
      var c = Auth.company();
      var fields = [
        { key: "name", label: "Company name", required: true },
        { key: "registration_no", label: "Registration no." },
        { key: "industry", label: "Industry" },
        { key: "address", label: "Street address" },
        { key: "city", label: "City" },
        { key: "state", label: "State" },
        { key: "postcode", label: "Postcode" },
        { key: "country", label: "Country" },
        { key: "phone", label: "Phone" },
        { key: "email", label: "Email", type: "email" },
        { key: "website", label: "Website" },
        { key: "currency", label: "Currency code", default: "RM" },
        { key: "fiscal_start", label: "Fiscal year start (MM-DD)", default: "01-01" },
      ];
      App._logoDataUrl = c.logo || "";
      var logoBody =
        '<div class="field"><label>Company logo</label>' +
        '<div style="display:flex;align-items:center;gap:12px">' +
          '<div id="logoPreview" class="company-logo" style="width:58px;height:58px">' +
            (c.logo ? '<img src="' + U.esc(c.logo) + '" alt="logo">' : (c.name || "NC").slice(0, 2).toUpperCase()) +
          "</div>" +
          '<div style="flex:1">' +
            '<input type="file" id="f_logoFile" accept="image/*" style="display:none">' +
            '<button class="btn secondary" id="btnPickLogo" type="button">Choose image…</button> ' +
            '<button class="btn ghost" id="btnClearLogo" type="button"' + (c.logo ? "" : ' style="display:none"') + ">Remove</button>" +
            '<div class="muted" style="font-size:11px;margin-top:6px">PNG/JPG, max 2 MB — resized automatically. Stored as a data URL (for production, upload to Supabase Storage and paste the URL instead).</div>' +
          "</div>" +
        "</div></div>";
      var body = '<div class="grid2">' + fields.map(function (f) { return fld(f, c); }).join("") + "</div>" + logoBody;
      openModal("Edit Company Profile", body, async function () {
        var vals = collect(fields.map(function (f) { return f.key; }));
        if (!vals.name) throw new Error("Company name is required");
        vals.logo = App._logoDataUrl || "";
        if (DB.mode === "supabase") {
          await DB.update("companies", c.id, vals);
        } else {
          var companies = window.LS.get("nx2_companies", []);
          var i = companies.findIndex(function (x) { return x.id === c.id; });
          if (i >= 0) { companies[i] = Object.assign({}, companies[i], vals); window.LS.set("nx2_companies", companies); }
        }
        Auth.session.company = Object.assign({}, c, vals);
        var sl = document.getElementById("sidebarLogo");
        if (sl) { if (vals.logo) { sl.src = vals.logo; sl.hidden = false; } else { sl.hidden = true; } }
        document.getElementById("brandCompany").textContent = vals.name + " · " + (vals.city || "");
        await Audit.log("update", "company", vals.name, { id: c.id, has_logo: !!vals.logo });
        App.refresh();
        toast("Company profile updated.");
      });
      document.getElementById("btnPickLogo").addEventListener("click", function () { document.getElementById("f_logoFile").click(); });
      document.getElementById("f_logoFile").addEventListener("change", function (ev) { App.readLogo(ev.target); });
      var clearBtn = document.getElementById("btnClearLogo");
      if (clearBtn) clearBtn.addEventListener("click", function () {
        App._logoDataUrl = "";
        var prev = document.getElementById("logoPreview");
        if (prev) prev.innerHTML = (c.name || "NC").slice(0, 2).toUpperCase();
        clearBtn.style.display = "none";
        var fi = document.getElementById("f_logoFile"); if (fi) fi.value = "";
        toast("Logo removed — press Save to apply.");
      });
    },

    /* Read + downscale an uploaded image into a data URL stored on the company. */
    readLogo: function (input) {
      var file = input.files && input.files[0];
      if (!file) return;
      if (!/^image\//.test(file.type)) { toast("Please choose an image file."); input.value = ""; return; }
      if (file.size > 2 * 1024 * 1024) { toast("Image too large — max 2 MB."); input.value = ""; return; }
      var reader = new FileReader();
      reader.onload = function (e) {
        var img = new Image();
        img.onload = function () {
          var max = 256, w = img.width, h = img.height;
          var scale = Math.min(1, max / Math.max(w, h));
          var canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(w * scale));
          canvas.height = Math.max(1, Math.round(h * scale));
          canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
          App._logoDataUrl = canvas.toDataURL("image/png");
          var prev = document.getElementById("logoPreview");
          if (prev) prev.innerHTML = '<img src="' + App._logoDataUrl + '" alt="logo">';
          var cb = document.getElementById("btnClearLogo"); if (cb) cb.style.display = "";
          toast("Logo ready — press Save to apply.");
        };
        img.onerror = function () { toast("Could not read that image."); input.value = ""; };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    },

    /* ================================================================
       BRANCHES
       ================================================================ */
    renderBranches: async function () {
      var rows = await DB.list("branches");
      var canC = Auth.can("branches", "create"), canE = Auth.can("branches", "edit"), canD = Auth.can("branches", "delete");
      document.getElementById("btnAddBranch").hidden = !canC;
      var tb = document.getElementById("branchTable");
      if (!rows.length) { tb.innerHTML = '<tr><td colspan="6" class="empty">No branches yet — add your first branch.</td></tr>'; return; }
      tb.innerHTML = rows.map(function (b) {
        return "<tr><td><b>" + U.esc(b.name) + "</b></td><td>" + U.esc(b.city || "") + "<br><span class=\"muted\">" + U.esc(b.address || "") + "</span></td><td>" + U.esc(b.phone || "") + "</td><td>" + U.esc(b.manager || "—") + "</td><td>" + badge(b.status || "active") + "</td><td>" +
          (canE ? '<button class="btn sm secondary" onclick="App.editBranch(\'' + b.id + '\')">Edit</button> ' : "") +
          (canD ? '<button class="btn sm danger" onclick="App.delBranch(\'' + b.id + '\')">Delete</button>' : "") + "</td></tr>";
      }).join("");
    },
    branchForm: function (b) {
      var fields = [
        { key: "name", label: "Branch name", required: true },
        { key: "city", label: "City" },
        { key: "address", label: "Address" },
        { key: "phone", label: "Phone" },
        { key: "manager", label: "Branch manager" },
        { key: "status", label: "Status", type: "select", options: ["active", "inactive"] },
      ];
      openModal(b ? "Edit Branch" : "Add Branch", '<div class="grid2">' + fields.map(function (f) { return fld(f, b); }).join("") + "</div>", async function () {
        var vals = collect(fields.map(function (f) { return f.key; }));
        if (!vals.name) throw new Error("Branch name is required");
        if (b) { await DB.update("branches", b.id, vals); await Audit.log("update", "branch", vals.name, { id: b.id }); }
        else { await DB.insert("branches", vals); await Audit.log("create", "branch", vals.name, {}); }
        App.refresh(); toast("Branch saved.");
      });
    },
    editBranch: function (id) { var self = this; DB.get("branches", id).then(function (b) { self.branchForm(b); }); },
    delBranch: function (id) {
      DB.get("branches", id).then(function (b) {
        openConfirm("Delete branch", "Delete <b>" + U.esc(b.name) + "</b>? This cannot be undone.", async function () {
          await DB.remove("branches", id); await Audit.log("delete", "branch", b.name, { id: id }); App.refresh(); toast("Branch deleted.");
        });
      });
    },

    /* ================================================================
       DEPARTMENTS
       ================================================================ */
    renderDepartments: async function () {
      var rows = await DB.list("departments"), branches = await DB.list("branches");
      var canC = Auth.can("departments", "create"), canE = Auth.can("departments", "edit"), canD = Auth.can("departments", "delete");
      document.getElementById("btnAddDept").hidden = !canC;
      var tb = document.getElementById("deptTable");
      if (!rows.length) { tb.innerHTML = '<tr><td colspan="5" class="empty">No departments yet.</td></tr>'; return; }
      tb.innerHTML = rows.map(function (d) {
        var br = lookup(branches, d.branch_id);
        return "<tr><td><b>" + U.esc(d.name) + "</b></td><td>" + U.esc(d.code || "—") + "</td><td>" + U.esc(br ? br.name : "—") + "</td><td>" + U.esc(d.head || "—") + "</td><td>" +
          (canE ? '<button class="btn sm secondary" onclick="App.editDept(\'' + d.id + '\')">Edit</button> ' : "") +
          (canD ? '<button class="btn sm danger" onclick="App.delDept(\'' + d.id + '\')">Delete</button>' : "") + "</td></tr>";
      }).join("");
    },
    deptForm: function (d, branchOpts) {
      var fields = [
        { key: "name", label: "Department name", required: true },
        { key: "code", label: "Code", default: "" },
        { key: "branch_id", label: "Branch", type: "select", options: branchOpts },
        { key: "head", label: "Head of department" },
      ];
      openModal(d ? "Edit Department" : "Add Department", fields.map(function (f) { return fld(f, d); }).join(""), async function () {
        var vals = collect(fields.map(function (f) { return f.key; }));
        if (!vals.name) throw new Error("Department name is required");
        if (d) { await DB.update("departments", d.id, vals); await Audit.log("update", "department", vals.name, { id: d.id }); }
        else { await DB.insert("departments", vals); await Audit.log("create", "department", vals.name, {}); }
        App.refresh(); toast("Department saved.");
      });
    },
    addDept: async function () { App.deptForm(null, (await DB.list("branches")).map(function (b) { return { value: b.id, label: b.name }; })); },
    editDept: function (id) {
      var self = this;
      Promise.all([DB.get("departments", id), DB.list("branches")]).then(function (r) {
        self.deptForm(r[0], r[1].map(function (b) { return { value: b.id, label: b.name }; }));
      });
    },
    delDept: function (id) {
      DB.get("departments", id).then(function (d) {
        openConfirm("Delete department", "Delete <b>" + U.esc(d.name) + "</b>? Employees keep their records.", async function () {
          await DB.remove("departments", id); await Audit.log("delete", "department", d.name, { id: id }); App.refresh(); toast("Department deleted.");
        });
      });
    },

    /* ================================================================
       TEAM & ROLES (RBAC management)
       ================================================================ */
    renderTeam: async function () {
      var mems = await DB.list("memberships"), emps = await DB.list("employees");
      var canC = Auth.can("team", "create"), canE = Auth.can("team", "edit"), canD = Auth.can("team", "delete");
      document.getElementById("btnAddMember").hidden = !canC;
      document.getElementById("teamHint").innerHTML = "RBAC model: <b>Owner</b> &gt; <b>Admin</b> &gt; <b>Manager</b> &gt; <b>Staff</b>. Every page and action in this app is gated by the role selected here — the same rules are mirrored by PostgreSQL RLS policies in production (Supabase) mode.";
      var tb = document.getElementById("teamTable");
      if (!mems.length) { tb.innerHTML = '<tr><td colspan="5" class="empty">No team members yet.</td></tr>'; return; }
      tb.innerHTML = mems.map(function (m) {
        var emp = lookup(emps, m.employee_id);
        var roleSel = canE ? '<select onchange="App.changeRole(\'' + m.id + '\', this.value)">' + window.ROLES.map(function (r) { return '<option value="' + r + '"' + (m.role === r ? " selected" : "") + ">" + U.esc(window.ROLE_LABEL[r]) + "</option>"; }).join("") + "</select>" : roleChip(m.role);
        return "<tr><td><b>" + U.esc(m.name || (m.email || "—").split("@")[0]) + "</b><br><span class=\"muted\">" + U.esc(m.email || "") + "</span></td><td>" + U.esc(emp ? emp.employee_no + " · " + emp.full_name : "—") + "</td><td>" + roleSel + "</td><td>" + U.dt(m.created_at) + "</td><td>" +
          (canD ? '<button class="btn sm danger" onclick="App.delMember(\'' + m.id + '\')">Remove</button>' : "") + "</td></tr>";
      }).join("");
    },
    addMember: async function () {
      var emps = await DB.list("employees");
      var roleOpts = window.ROLES.map(function (r) { return { value: r, label: window.ROLE_LABEL[r] }; });
      if (Auth.role() !== "owner") roleOpts = roleOpts.filter(function (o) { return o.value !== "owner"; }); // only the owner can grant owner
      var fields = [
        { key: "name", label: "Display name" },
        { key: "email", label: "Email (login)", required: true, type: "email" },
        { key: "role", label: "Role", type: "select", options: roleOpts, default: "staff" },
        { key: "employee_id", label: "Link employee (optional)", type: "select", options: [{ value: "", label: "— none —" }].concat(empOptions(emps)) },
      ];
      var note = DB.mode === "supabase"
        ? '<div class="form-note">Supabase mode: the person must sign up first with this email. They are linked automatically on their first sign-in.</div>'
        : '<div class="form-note">Demo/Local mode: a login account is created. A temporary password is shown once after saving.</div>';
      openModal("Add Team Member", note + fields.map(function (f) { return fld(f, null); }).join(""), async function () {
        var vals = collect(fields.map(function (f) { return f.key; }));
        if (!vals.email) throw new Error("Email is required");
        var role = vals.role || "staff";
        if (DB.mode === "supabase") {
          var mem = await DB.insert("memberships", { user_id: null, email: vals.email.toLowerCase(), name: vals.name || "", role: role, employee_id: vals.employee_id || null });
        } else {
          var users = window.LS.get("nx2_users", []);
          var user = users.find(function (u) { return u.email.toLowerCase() === vals.email.toLowerCase(); });
          var tempPw = "demo" + Math.random().toString(36).slice(2, 8);
          if (!user) {
            user = { id: U.id(), name: vals.name || vals.email.split("@")[0], email: vals.email.toLowerCase(), password_hash: (function (pw) { var h = 5381, s = "nx2::" + pw; for (var i = 0; i < s.length; i++) h = ((h << 5) + h) ^ s.charCodeAt(i); return (h >>> 0).toString(16); })(tempPw), created_at: U.nowISO() };
            users.push(user); window.LS.set("nx2_users", users);
          }
          var mem = await DB.insert("memberships", { user_id: user.id, email: user.email, name: user.name, role: role, employee_id: vals.employee_id || null });
          await Audit.log("create", "team_member", vals.email, { role: role, temp_password: tempPw });
          App.closeModal();
          openConfirm("Member added", "Login for <b>" + U.esc(vals.email) + "</b> created.<br><br>Temporary password: <b>" + tempPw + "</b><br><small>(Change it after first sign-in.)</small>", function () { App.refresh(); });
          return;
        }
        await Audit.log("create", "team_member", vals.email, { role: role });
        App.refresh(); toast("Team member added.");
      });
    },
    changeRole: function (id, role) {
      DB.get("memberships", id).then(function (m) {
        var p = (DB.mode === "supabase" && DB.client)
          ? DB.client.rpc("nx_change_role", { target: id, new_role: role })
          : DB.update("memberships", id, { role: role });
        p.then(function () {
          Audit.log("update", "team_member", m.email || id, { role: role }); App.refresh(); toast("Role updated to " + role + ".");
        }).catch(function (err) { toast((err && err.message) || "Role update failed."); });
      });
    },
    delMember: function (id) {
      DB.get("memberships", id).then(function (m) {
        openConfirm("Remove member", "Remove <b>" + U.esc(m.email || id) + "</b> from this company?", async function () {
          if (DB.mode === "supabase" && DB.client) {
            await DB.client.rpc("nx_remove_member", { target: id });
          } else {
            await DB.remove("memberships", id);
          }
          await Audit.log("delete", "team_member", m.email || id, {}); App.refresh(); toast("Member removed.");
        });
      });
    },

    /* ================================================================
       EMPLOYEES (real employee database)
       ================================================================ */
    renderEmployees: async function () {
      var all = await DB.list("employees"), branches = await DB.list("branches"), depts = await DB.list("departments");
      var canCreate = Auth.can("employees", "create"), canEdit = Auth.can("employees", "edit"), canDel = Auth.can("employees", "delete");
      var viewSelf = Auth.can("employees", "view:self") && !Auth.can("employees", "view");
      var rows = all;
      if (viewSelf) {
        var emp = await Auth.employee();
        rows = emp ? all.filter(function (e) { return e.id === emp.id; }) : [];
      }
      // filters
      var q = (document.getElementById("employeeSearch").value || "").toLowerCase();
      var df = document.getElementById("deptFilter").value, bf = document.getElementById("branchFilter").value;
      rows = rows.filter(function (e) {
        var hay = (e.full_name + " " + e.employee_no + " " + e.position + " " + e.email).toLowerCase();
        return (!q || hay.indexOf(q) !== -1) && (!df || e.department_id === df) && (!bf || e.branch_id === bf);
      });
      // populate filter dropdowns once
      if (!document.getElementById("deptFilter").options.length) {
        document.getElementById("deptFilter").innerHTML = '<option value="">All Departments</option>' + depts.map(function (d) { return '<option value="' + d.id + '">' + U.esc(d.name) + "</option>"; }).join("");
        document.getElementById("branchFilter").innerHTML = '<option value="">All Branches</option>' + branches.map(function (b) { return '<option value="' + b.id + '">' + U.esc(b.name) + "</option>"; }).join("");
      }
      document.getElementById("btnAddEmployee").hidden = !canCreate;
      document.getElementById("employeeSearch").hidden = viewSelf;
      document.getElementById("deptFilter").hidden = viewSelf;
      document.getElementById("branchFilter").hidden = viewSelf;
      var tb = document.getElementById("employeeTable");
      if (!rows.length) { tb.innerHTML = '<tr><td colspan="8" class="empty">' + (viewSelf ? "You are not linked to an employee record yet." : "No employees match.") + "</td></tr>"; return; }
      tb.innerHTML = rows.map(function (e) {
        var br = lookup(branches, e.branch_id), dp = lookup(depts, e.department_id);
        return "<tr><td>" + U.esc(e.employee_no) + "</td><td><b>" + U.esc(e.full_name) + "</b><br><span class=\"muted\">" + U.esc(e.email || "") + "</span></td><td>" + U.esc(br ? br.name : "—") + "</td><td>" + U.esc(dp ? dp.name : "—") + "</td><td>" + U.esc(e.position || "—") + "</td><td>" + U.money(e.base_salary) + "</td><td>" + badge(e.employment_status || "active") + "</td><td>" +
          (canEdit ? '<button class="btn sm secondary" onclick="App.editEmployee(\'' + e.id + '\')">Edit</button> ' : "") +
          (canDel ? '<button class="btn sm danger" onclick="App.delEmployee(\'' + e.id + '\')">Delete</button>' : "") + "</td></tr>";
      }).join("");
    },
    employeeForm: async function (emp) {
      var branches = await DB.list("branches"), depts = await DB.list("departments");
      var fields = [
        { key: "employee_no", label: "Employee no.", required: true },
        { key: "full_name", label: "Full name", required: true },
        { key: "email", label: "Email", type: "email" },
        { key: "phone", label: "Phone" },
        { key: "branch_id", label: "Branch", type: "select", options: branches.map(function (b) { return { value: b.id, label: b.name }; }) },
        { key: "department_id", label: "Department", type: "select", options: depts.map(function (d) { return { value: d.id, label: d.name }; }) },
        { key: "position", label: "Position" },
        { key: "employment_status", label: "Employment status", type: "select", options: ["active", "probation", "on_leave", "terminated"] },
        { key: "join_date", label: "Join date", type: "date" },
        { key: "base_salary", label: "Base salary (monthly)", type: "number", step: "0.01" },
        { key: "allowance", label: "Fixed allowance", type: "number", step: "0.01", default: 0 },
        { key: "deduction", label: "Fixed deduction (EPF/SOCSO etc.)", type: "number", step: "0.01", default: 0 },
      ];
      openModal(emp ? "Edit Employee" : "Add Employee", '<div class="grid2">' + fields.map(function (f) { return fld(f, emp); }).join("") + "</div>", async function () {
        var vals = collect(fields.map(function (f) { return f.key; }));
        if (!vals.full_name || !vals.employee_no) throw new Error("Name and employee no. are required");
        vals.base_salary = Number(vals.base_salary) || 0; vals.allowance = Number(vals.allowance) || 0; vals.deduction = Number(vals.deduction) || 0;
        if (emp) { await DB.update("employees", emp.id, vals); await Audit.log("update", "employee", vals.full_name, { id: emp.id }); }
        else { await DB.insert("employees", vals); await Audit.log("create", "employee", vals.full_name, { employee_no: vals.employee_no }); }
        App.refresh(); toast("Employee saved.");
      });
    },
    addEmployee: function () { App.employeeForm(null); },
    editEmployee: function (id) { var self = this; DB.get("employees", id).then(function (e) { self.employeeForm(e); }); },
    delEmployee: function (id) {
      DB.get("employees", id).then(function (e) {
        openConfirm("Delete employee", "Delete <b>" + U.esc(e.full_name) + "</b>? Their attendance/leave/payroll records are removed.", async function () {
          await DB.remove("employees", id); await Audit.log("delete", "employee", e.full_name, { id: id }); App.refresh(); toast("Employee deleted.");
        });
      });
    },

    /* ================================================================
       LEAVE
       ================================================================ */
    renderLeave: async function () {
      var leaves = await DB.list("leave_requests"), emps = await DB.list("employees");
      var viewSelf = Auth.can("leave", "view:self") && !Auth.can("leave", "view");
      var rows = leaves;
      var myEmp = null;
      if (viewSelf) { myEmp = await Auth.employee(); rows = myEmp ? leaves.filter(function (l) { return l.employee_id === myEmp.id; }) : []; }
      var canApprove = Auth.can("leave", "approve"), canCreate = Auth.can("leave", "create");
      document.getElementById("btnAddLeave").hidden = !canCreate;
      var pending = leaves.filter(function (l) { return l.status === "pending"; }).length;
      var today = U.today();
      var onLeave = leaves.filter(function (l) { return l.status === "approved" && l.start_date <= today && l.end_date >= today; }).length;
      document.getElementById("leaveStats").innerHTML =
        statCard("Pending approval", pending, pending ? "warn" : "good") +
        statCard("On leave today", onLeave, "") + statCard("Approved (MTD)", leaves.filter(function (l) { return l.status === "approved" && l.start_date.indexOf(U.monthKey()) === 0; }).length, "") +
        statCard("Total requests", leaves.length, "");
      var tb = document.getElementById("leaveTable");
      if (!rows.length) { tb.innerHTML = '<tr><td colspan="8" class="empty">No leave requests.</td></tr>'; return; }
      tb.innerHTML = rows.map(function (l) {
        var e = lookup(emps, l.employee_id);
        var act = "";
        if (l.status === "pending" && canApprove) act = '<button class="btn sm bgreen" onclick="App.actLeave(\'' + l.id + '\',\'approved\')">Approve</button> <button class="btn sm danger" onclick="App.actLeave(\'' + l.id + '\',\'rejected\')">Reject</button>';
        return "<tr><td><b>" + U.esc(e ? e.full_name : "—") + "</b><br><span class=\"muted\">" + U.esc(e ? e.employee_no : "") + "</span></td><td>" + U.esc(l.leave_type) + "</td><td>" + U.date(l.start_date) + "</td><td>" + U.date(l.end_date) + "</td><td><b>" + (l.days || U.weekdayCount(l.start_date, l.end_date)) + "</b></td><td>" + U.esc(l.reason || "") + "</td><td>" + badge(l.status) + "</td><td>" + act + "</td></tr>";
      }).join("");
    },
    addLeave: async function () {
      var emps = await DB.list("employees"), myEmp = await Auth.employee();
      var viewSelf = Auth.can("leave", "view:self") && !Auth.can("leave", "view");
      var empField = viewSelf ? null : { key: "employee_id", label: "Employee", type: "select", options: empOptions(emps), required: true };
      var fields = [
        empField,
        { key: "leave_type", label: "Leave type", type: "select", options: ["Annual", "Sick", "Emergency", "Unpaid"], default: "Annual" },
        { key: "start_date", label: "Start date", type: "date", required: true },
        { key: "end_date", label: "End date", type: "date", required: true },
        { key: "reason", label: "Reason", type: "textarea" },
      ].filter(Boolean);
      var bal = "";
      if (myEmp) {
        var leaves = await DB.list("leave_requests");
        var used = leaves.filter(function (l) { return l.employee_id === myEmp.id && l.status === "approved" && l.leave_type === "Annual" && l.start_date.indexOf(new Date().getFullYear()) === 0; }).reduce(function (s, l) { return s + (+l.days || 0); }, 0);
        bal = '<div class="form-note">Annual leave balance: <b>' + Math.max(0, cfg.annualLeaveDays - used) + "</b> of " + cfg.annualLeaveDays + " days left this year.</div>";
      }
      openModal("Request Leave", bal + fields.map(function (f) { return fld(f, viewSelf ? { employee_id: myEmp ? myEmp.id : "" } : null); }).join(""), async function () {
        var vals = collect(fields.map(function (f) { return f.key; }));
        if (!vals.start_date || !vals.end_date) throw new Error("Dates are required");
        if (vals.end_date < vals.start_date) throw new Error("End date cannot be before start date");
        var days = U.weekdayCount(vals.start_date, vals.end_date) || 1;
        await DB.insert("leave_requests", { employee_id: viewSelf ? myEmp.id : vals.employee_id, leave_type: vals.leave_type, start_date: vals.start_date, end_date: vals.end_date, days: days, reason: vals.reason, status: viewSelf ? "pending" : (Auth.can("leave", "approve") && !viewSelf ? "pending" : "pending") });
        await Audit.log("create", "leave", vals.leave_type, { start: vals.start_date, end: vals.end_date, days: days });
        App.refresh(); toast("Leave request submitted.");
      });
    },
    actLeave: function (id, status) {
      DB.get("leave_requests", id).then(function (l) {
        var by = Auth.user() ? Auth.user().id : null;
        DB.update("leave_requests", id, { status: status, approved_by: by, decided_at: U.nowISO() }).then(function () {
          Audit.log(status === "approved" ? "approve" : "reject", "leave", l.leave_type, { id: id });
          App.refresh(); toast("Leave " + status + ".");
        });
      });
    },

    /* ================================================================
       ATTENDANCE
       ================================================================ */
    renderAttendance: async function () {
      var date = document.getElementById("attDate").value || U.today();
      var att = await DB.list("attendance"), emps = await DB.list("employees"), leaves = await DB.list("leave_requests");
      var viewSelf = Auth.can("attendance", "view:self") && !Auth.can("attendance", "view");
      var myEmp = Auth.can("attendance", "clock") ? await Auth.employee() : null;
      var canEdit = Auth.can("attendance", "edit");
      var today = U.today();
      var dayAtt = att.filter(function (a) { return a.date === date; });
      var present = dayAtt.filter(function (a) { return a.check_in; });
      var late = present.filter(function (a) { return a.status === "late"; }).length;
      var onLeave = leaves.filter(function (l) { return l.status === "approved" && l.start_date <= date && l.end_date >= date; }).length;
      document.getElementById("attStats").innerHTML =
        statCard("Present", present.length, "good") + statCard("Late", late, late ? "warn" : "good") +
        statCard("On leave", onLeave, "") + statCard("Not in", Math.max(0, emps.length - present.length - onLeave), "");
      // clock area (self service)
      var clockHtml = "";
      if (myEmp) {
        var rec = dayAtt.find(function (a) { return a.employee_id === myEmp.id; });
        clockHtml = '<div class="card" style="padding:14px"><b>Self service</b> — ' + U.esc(myEmp.full_name) + '<br><span class="muted">' + U.date(date) + "</span><br><br>" +
          (rec && rec.check_in ? '<span class="badge bgreen">In ' + U.esc(rec.check_in) + "</span> " : '<button class="btn primary" onclick="App.clock(\'in\')">⏱ Clock In</button> ') +
          (rec && rec.check_in && !rec.check_out ? '<button class="btn secondary" style="margin-left:6px" onclick="App.clock(\'out\')">Clock Out</button>' : "") + "</div>";
      }
      document.getElementById("attClockArea").innerHTML = clockHtml;
      var rows = emps;
      if (viewSelf) rows = myEmp ? [myEmp] : [];
      var tb = document.getElementById("attTable");
      if (!rows.length) { tb.innerHTML = '<tr><td colspan="6" class="empty">No employees to show.</td></tr>'; return; }
      tb.innerHTML = rows.map(function (e) {
        var r = dayAtt.find(function (a) { return a.employee_id === e.id; });
        var cl = r && r.check_in ? r.check_in : "—", co = r && r.check_out ? r.check_out : "—";
        var st = r ? r.status : (onLeave && leaves.some(function (l) { return l.employee_id === e.id; }) ? "on-leave" : "absent");
        var hrs = "—";
        if (cl !== "—" && co !== "—") { var a = cl.split(":"), b = co.split(":"); hrs = ((+b[0] * 60 + +b[1]) - (+a[0] * 60 + +a[1])) / 60; hrs = hrs.toFixed(1) + "h"; }
        return "<tr><td><b>" + U.esc(e.full_name) + "</b><br><span class=\"muted\">" + U.esc(e.employee_no) + "</span></td><td>" + cl + "</td><td>" + co + "</td><td>" + hrs + "</td><td>" + badge(st === "on-leave" ? "On Leave" : st) + "</td><td>" +
          (canEdit ? '<button class="btn sm secondary" onclick="App.editAtt(\'' + e.id + '\',\'' + date + '\')">Edit</button>' : "") + "</td></tr>";
      }).join("");
    },
    clock: async function (dir) {
      var date = document.getElementById("attDate").value || U.today();
      var myEmp = await Auth.employee();
      if (!myEmp) { toast("Your account is not linked to an employee record."); return; }
      var att = await DB.list("attendance");
      var rec = att.find(function (a) { return a.employee_id === myEmp.id && a.date === date; });
      var now = new Date();
      var t = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
      if (dir === "in") {
        var startMin = cfg.workStart.split(":").map(Number), curMin = now.getHours() * 60 + now.getMinutes();
        var status = curMin > startMin[0] * 60 + startMin[1] + (cfg.graceMinutes || 0) ? "late" : "present";
        if (rec) { await DB.update("attendance", rec.id, { check_in: t, status: status, check_out: null }); }
        else { await DB.insert("attendance", { employee_id: myEmp.id, date: date, check_in: t, check_out: null, status: status }); }
        await Audit.log("clock_in", "attendance", myEmp.full_name, { date: date, time: t });
        toast("Clocked in at " + t + " (" + status + ").");
      } else {
        if (!rec || !rec.check_in) { toast("No clock-in for this date."); return; }
        await DB.update("attendance", rec.id, { check_out: t });
        await Audit.log("clock_out", "attendance", myEmp.full_name, { date: date, time: t });
        toast("Clocked out at " + t + ".");
      }
      App.refresh();
    },
    editAtt: function (empId, date) {
      var self = this;
      Promise.all([DB.list("attendance"), DB.list("employees")]).then(function (r) {
        var att = r[0], emps = r[1];
        var emp = lookup(emps, empId);
        var rec = att.find(function (a) { return a.employee_id === empId && a.date === date; });
        var fields = [
          { key: "date", label: "Date", type: "date", default: date, required: true },
          { key: "check_in", label: "Check-in (HH:MM)", default: rec ? rec.check_in : "" },
          { key: "check_out", label: "Check-out (HH:MM)", default: rec ? rec.check_out : "" },
          { key: "status", label: "Status", type: "select", options: ["present", "late", "half-day", "absent"], default: rec ? rec.status : "present" },
        ];
        openModal("Edit attendance — " + U.esc(emp.full_name), fields.map(function (f) { return fld(f, null); }).join(""), async function () {
          var vals = collect(fields.map(function (f) { return f.key; }));
          if (rec) { await DB.update("attendance", rec.id, vals); }
          else { await DB.insert("attendance", Object.assign({ employee_id: empId }, vals)); }
          await Audit.log("update", "attendance", emp.full_name, { date: vals.date });
          App.refresh(); toast("Attendance updated.");
        });
      });
    },

    /* ================================================================
       PAYROLL
       ================================================================ */
    renderPayroll: async function () {
      var period = document.getElementById("payrollPeriod").value || U.monthKey();
      var runs = await DB.list("payroll_runs"), items = await DB.list("payroll_items"), emps = await DB.list("employees");
      var run = runs.find(function (r) { return r.period === period; });
      var myItems = items.filter(function (i) { return i.period === period && i.payroll_run_id === (run ? run.id : ""); });
      var viewSelf = Auth.can("payroll", "view:self") && !Auth.can("payroll", "view");
      var myEmp = viewSelf ? await Auth.employee() : null;
      var canRun = Auth.can("payroll", "run");
      document.getElementById("btnRunPayroll").hidden = !canRun;
      // stats
      var gross = U.sum(myItems, "gross"), ded = U.sum(myItems, "deduction"), net = U.sum(myItems, "net");
      document.getElementById("payrollStats").innerHTML =
        statCard("Period", period, "") + statCard("Employees", myItems.length, "") +
        statCard("Gross", U.money(gross), "") + statCard("Net payable", U.money(net), "good") +
        (run ? statCard("Status", run.status, run.status === "paid" ? "good" : "warn") : "");
      var rows = myItems;
      if (viewSelf) rows = myEmp ? myItems.filter(function (i) { return i.employee_id === myEmp.id; }) : [];
      var tb = document.getElementById("payrollTable");
      if (!run) {
        tb.innerHTML = '<tr><td colspan="8" class="empty">No payroll run for ' + period + ' yet. ' + (canRun ? "Click <b>Run Payroll</b> to compute from attendance + leave." : "Contact a manager to run payroll.") + "</td></tr>";
        return;
      }
      if (!rows.length) { tb.innerHTML = '<tr><td colspan="8" class="empty">No payroll items.</td></tr>'; return; }
      tb.innerHTML = rows.map(function (i) {
        var e = lookup(emps, i.employee_id);
        return "<tr><td><b>" + U.esc(e ? e.full_name : "—") + "</b><br><span class=\"muted\">" + U.esc(e ? e.employee_no : "") + "</span></td><td>" + U.money(i.base_salary) + "</td><td>" + (i.present_days || 0) + " / " + (i.work_days || 0) + "</td><td>" + (i.paid_leave_days || 0) + "</td><td>" + U.money(i.gross) + "</td><td>" + U.money(i.allowance) + "</td><td>" + U.money(i.deduction) + "</td><td><b>" + U.money(i.net) + "</b> <button class=\"btn sm ghost\" onclick=\"App.payslip('" + i.id + "')\">Slip</button></td></tr>";
      }).join("");
    },
    payslip: function (id) {
      var self = this;
      Promise.all([DB.get("payroll_items", id), DB.list("employees")]).then(function (r) {
        var i = r[0], e = lookup(r[1], i.employee_id);
        if (!i) { toast("Item not found."); return; }
        openModal("Payslip — " + U.esc(e ? e.full_name : "") + " · " + i.period,
          '<table><tbody>' +
          "<tr><td>Employee</td><td><b>" + U.esc(e ? e.full_name : "") + " (" + U.esc(e ? e.employee_no : "") + ")</b></td></tr>" +
          "<tr><td>Base salary</td><td>" + U.money(i.base_salary) + "</td></tr>" +
          "<tr><td>Work days / Present</td><td>" + (i.work_days || 0) + " / " + (i.present_days || 0) + " (+" + (i.paid_leave_days || 0) + " leave)</td></tr>" +
          "<tr><td>Gross (prorated)</td><td>" + U.money(i.gross) + "</td></tr>" +
          "<tr><td>Allowances</td><td>" + U.money(i.allowance) + "</td></tr>" +
          "<tr><td>Deductions</td><td>" + U.money(i.deduction) + "</td></tr>" +
          "<tr><td><b>Net pay</b></td><td><b>" + U.money(i.net) + "</b></td></tr>" +
          "</tbody></table>",
          function () { App.closeModal(); }, "Close");
      });
    },
    runPayroll: async function (confirm) {
      var period = document.getElementById("payrollPeriod").value || U.monthKey();
      var emps = await DB.list("employees"), att = await DB.list("attendance"), leaves = await DB.list("leave_requests");
      var active = emps.filter(function (e) { return e.employment_status !== "terminated"; });
      var runs = await DB.list("payroll_runs");
      var existing = runs.find(function (r) { return r.period === period; });
      if (existing && !confirm) {
        openConfirm("Replace payroll", "A payroll run for <b>" + period + "</b> already exists. Replace it with a fresh computation?", function () { App.runPayroll(true); });
        return;
      }
      if (existing) {
        var oldItems = (await DB.list("payroll_items")).filter(function (i) { return i.payroll_run_id === existing.id; });
        for (var oi = 0; oi < oldItems.length; oi++) await DB.remove("payroll_items", oldItems[oi].id);
        await DB.remove("payroll_runs", existing.id);
      }
      var start = period + "-01", end = period + "-" + String(U.monthDays(period)).padStart(2, "0");
      var workDays = U.weekdayCount(start, end);
      var run = await DB.insert("payroll_runs", { period: period, status: "draft", run_by: Auth.user() ? Auth.user().id : null });
      for (var i = 0; i < active.length; i++) {
        var e = active[i];
        var present = att.filter(function (a) { return a.employee_id === e.id && a.date >= start && a.date <= end && a.check_in; }).length;
        var paidLeave = leaves.filter(function (l) {
          return l.employee_id === e.id && l.status === "approved" && l.leave_type !== "Unpaid" && l.start_date <= end && l.end_date >= start;
        }).reduce(function (s, l) {
          var os = l.start_date > start ? l.start_date : start, oe = l.end_date < end ? l.end_date : end;
          return s + U.weekdayCount(os, oe);
        }, 0);
        var ratio = workDays > 0 ? Math.min(1, (present + paidLeave) / workDays) : 0;
        var gross = Math.round(e.base_salary * ratio * 100) / 100;
        var allow = Number(e.allowance || 0), ded = Number(e.deduction || 0);
        var net = Math.round((gross + allow - ded) * 100) / 100;
        await DB.insert("payroll_items", { payroll_run_id: run.id, period: period, employee_id: e.id, base_salary: e.base_salary, present_days: present, paid_leave_days: paidLeave, work_days: workDays, gross: gross, allowance: allow, deduction: ded, net: net });
      }
      await Audit.log("run", "payroll", period, { employees: active.length });
      App.refresh();
      toast("Payroll for " + period + " generated (" + active.length + " employees).");
    },

    /* ================================================================
       PROJECTS
       ================================================================ */
    renderProjects: async function () {
      var proj = await DB.list("projects"), custs = await DB.list("customers"), emps = await DB.list("employees");
      var canC = Auth.can("projects", "create"), canE = Auth.can("projects", "edit"), canD = Auth.can("projects", "delete");
      document.getElementById("btnAddProject").hidden = !canC;
      var active = proj.filter(function (p) { return p.status !== "Completed"; });
      var card = document.getElementById("projectCards");
      if (!proj.length) { card.innerHTML = '<div class="card"><div class="empty">No projects yet.</div></div>'; return; }
      var html = '<div class="card"><h3>Summary</h3>' +
        stat("Active projects", active.length) + stat("At risk / delayed", '<b class="warn">' + active.filter(function (p) { return p.status === "At Risk" || p.status === "Delayed"; }).length + "</b>") +
        stat("Open contract value", U.money(U.sum(active, "contract_value"))) + "</div>";
      proj.forEach(function (p) {
        var c = lookup(custs, p.customer_id), m = lookup(emps, p.manager_id);
        html += '<div class="card"><div style="display:flex;justify-content:space-between;align-items:flex-start"><h2 style="margin:0">' + U.esc(p.name) + "</h2>" + badge(p.status) + "</div>" +
          '<div class="muted">' + U.esc(c ? c.name : "—") + " · " + U.esc(m ? m.full_name : "") + "</div>" +
          '<div class="statline"><span>Contract</span><b>' + U.money(p.contract_value) + "</b></div>" +
          '<div class="statline"><span>Budget</span><b>' + U.money(p.budget) + "</b></div>" +
          '<div class="statline"><span>Dates</span><b>' + U.date(p.start_date) + " → " + U.date(p.end_date) + "</b></div>" +
          '<div style="margin-top:12px"><div class="progress"><span style="width:' + p.progress + '%"></span></div><div class="muted" style="font-size:12px;margin-top:6px">' + U.pct(p.progress) + " complete</div></div>" +
          '<div style="margin-top:10px">' + (canE ? '<button class="btn sm secondary" onclick="App.editProject(\'' + p.id + '\')">Edit</button> ' : "") +
          (canD ? '<button class="btn sm danger" onclick="App.delProject(\'' + p.id + '\')">Delete</button>' : "") + "</div></div>";
      });
      card.innerHTML = html;
    },
    projectForm: async function (p) {
      var custs = await DB.list("customers"), emps = await DB.list("employees");
      var fields = [
        { key: "name", label: "Project name", required: true },
        { key: "customer_id", label: "Customer", type: "select", options: [{ value: "", label: "— none —" }].concat(custs.map(function (c) { return { value: c.id, label: c.name }; })) },
        { key: "contract_value", label: "Contract value", type: "number", step: "0.01" },
        { key: "budget", label: "Budget", type: "number", step: "0.01" },
        { key: "progress", label: "Progress %", type: "number", step: "1", default: 0 },
        { key: "status", label: "Status", type: "select", options: ["Planned", "On Track", "At Risk", "Delayed", "Completed"] },
        { key: "start_date", label: "Start date", type: "date" },
        { key: "end_date", label: "End date", type: "date" },
        { key: "manager_id", label: "Manager", type: "select", options: [{ value: "", label: "— none —" }].concat(empOptions(emps)) },
      ];
      openModal(p ? "Edit Project" : "New Project", '<div class="grid2">' + fields.map(function (f) { return fld(f, p); }).join("") + "</div>", async function () {
        var vals = collect(fields.map(function (f) { return f.key; }));
        if (!vals.name) throw new Error("Project name is required");
        vals.contract_value = Number(vals.contract_value) || 0; vals.budget = Number(vals.budget) || 0; vals.progress = Math.min(100, Math.max(0, Number(vals.progress) || 0));
        if (p) { await DB.update("projects", p.id, vals); await Audit.log("update", "project", vals.name, { id: p.id }); }
        else { await DB.insert("projects", vals); await Audit.log("create", "project", vals.name, {}); }
        App.refresh(); toast("Project saved.");
      });
    },
    addProject: function () { App.projectForm(null); },
    editProject: function (id) { var self = this; DB.get("projects", id).then(function (p) { self.projectForm(p); }); },
    delProject: function (id) {
      DB.get("projects", id).then(function (p) {
        openConfirm("Delete project", "Delete <b>" + U.esc(p.name) + "</b>?", async function () {
          await DB.remove("projects", id); await Audit.log("delete", "project", p.name, { id: id }); App.refresh(); toast("Project deleted.");
        });
      });
    },

    /* ================================================================
       FINANCE
       ================================================================ */
    renderFinance: async function () {
      var tx = await DB.list("finance_transactions"), proj = await DB.list("projects");
      var ym = U.monthKey();
      var rev = U.sum(tx.filter(function (t) { return t.transaction_type === "income" && U.monthKey(t.transaction_date) === ym; }), "amount");
      var exp = U.sum(tx.filter(function (t) { return t.transaction_type === "expense" && U.monthKey(t.transaction_date) === ym; }), "amount");
      var cash = U.sum(tx.filter(function (t) { return t.transaction_type === "income"; }), "amount") - U.sum(tx.filter(function (t) { return t.transaction_type === "expense"; }), "amount");
      document.getElementById("financeKpis").innerHTML =
        kpi("Revenue MTD", U.money(rev), "good", "▲ income") + kpi("Expenses MTD", U.money(exp), "warn", "▼ spend") +
        kpi("Net MTD", U.money(rev - exp), (rev - exp) >= 0 ? "good" : "bad", "") + kpi("Cash Position", U.money(cash), cash >= 0 ? "good" : "bad", "");
      var canC = Auth.can("finance", "create"), canE = Auth.can("finance", "edit"), canD = Auth.can("finance", "delete");
      document.getElementById("btnAddTx").hidden = !canC;
      var rows = tx.slice().sort(function (a, b) { return (b.transaction_date || "").localeCompare(a.transaction_date || ""); });
      var tb = document.getElementById("txTable");
      if (!rows.length) { tb.innerHTML = '<tr><td colspan="6" class="empty">No transactions yet.</td></tr>'; return; }
      tb.innerHTML = rows.map(function (t) {
        var p = lookup(proj, t.project_id);
        return "<tr><td>" + U.date(t.transaction_date) + "</td><td>" + U.esc(t.description) + "</td><td>" + U.esc(t.category || "—") + "</td><td>" + U.esc(p ? p.name : "—") + "</td><td>" + badge(t.transaction_type) + "</td><td><b>" + U.money(t.amount) + "</b> " +
          (canE ? '<button class="btn sm ghost" onclick="App.editTx(\'' + t.id + '\')">Edit</button>' : "") +
          (canD ? '<button class="btn sm ghost" onclick="App.delTx(\'' + t.id + '\')">✕</button>' : "") + "</td></tr>";
      }).join("");
    },
    txForm: async function (t) {
      var proj = await DB.list("projects");
      var fields = [
        { key: "transaction_date", label: "Date", type: "date", default: U.today(), required: true },
        { key: "description", label: "Description", required: true },
        { key: "category", label: "Category", type: "select", options: ["Sales", "Services", "Payroll", "Equipment", "Software", "Infrastructure", "Facilities", "Operations", "Travel", "Other"] },
        { key: "transaction_type", label: "Type", type: "select", options: ["income", "expense"] },
        { key: "amount", label: "Amount", type: "number", step: "0.01", required: true },
        { key: "project_id", label: "Project (optional)", type: "select", options: [{ value: "", label: "— none —" }].concat(proj.map(function (p) { return { value: p.id, label: p.name }; })) },
      ];
      openModal(t ? "Edit Transaction" : "Record Transaction", fields.map(function (f) { return fld(f, t); }).join(""), async function () {
        var vals = collect(fields.map(function (f) { return f.key; }));
        if (!vals.description) throw new Error("Description is required");
        vals.amount = Number(vals.amount); if (isNaN(vals.amount) || vals.amount < 0) throw new Error("Valid amount required");
        if (t) { await DB.update("finance_transactions", t.id, vals); await Audit.log("update", "transaction", vals.description, { id: t.id, amount: vals.amount }); }
        else { await DB.insert("finance_transactions", vals); await Audit.log("create", "transaction", vals.description, { amount: vals.amount, type: vals.transaction_type }); }
        App.refresh(); toast("Transaction saved.");
      });
    },
    addTx: function () { App.txForm(null); },
    editTx: function (id) { var self = this; DB.get("finance_transactions", id).then(function (t) { self.txForm(t); }); },
    delTx: function (id) {
      DB.get("finance_transactions", id).then(function (t) {
        openConfirm("Delete transaction", "Delete <b>" + U.esc(t.description) + "</b> (" + U.money(t.amount) + ")?", async function () {
          await DB.remove("finance_transactions", id); await Audit.log("delete", "transaction", t.description, { id: id }); App.refresh(); toast("Transaction deleted.");
        });
      });
    },

    /* ================================================================
       CRM & SALES
       ================================================================ */
    renderCrm: async function () {
      var leads = await DB.list("crm_leads"), emps = await DB.list("employees");
      var canC = Auth.can("crm", "create"), canE = Auth.can("crm", "edit"), canD = Auth.can("crm", "delete");
      document.getElementById("btnAddLead").hidden = !canC;
      var tb = document.getElementById("crmTable");
      if (!leads.length) { tb.innerHTML = '<tr><td colspan="6" class="empty">No leads yet.</td></tr>'; return; }
      tb.innerHTML = leads.map(function (l) {
        var o = lookup(emps, l.owner_id);
        return "<tr><td><b>" + U.esc(l.name) + "</b></td><td>" + badge(l.stage) + "</td><td>" + U.money(l.value) + "</td><td><b>" + U.pct(l.score) + "</b><div class=\"progress\" style=\"max-width:90px;margin-top:4px\"><span style=\"width:" + l.score + "%\"></span></div></td><td>" + U.esc(o ? o.full_name : "—") + "</td><td>" + U.esc(l.next_action || "") + "</td><td>" +
          (canE ? '<button class="btn sm secondary" onclick="App.editLead(\'' + l.id + '\')">Edit</button> ' : "") +
          (canD ? '<button class="btn sm danger" onclick="App.delLead(\'' + l.id + '\')">Delete</button>' : "") + "</td></tr>";
      }).join("");
    },
    leadForm: async function (l) {
      var emps = await DB.list("employees");
      var fields = [
        { key: "name", label: "Lead / customer name", required: true },
        { key: "stage", label: "Stage", type: "select", options: ["New", "Lead", "Qualified", "Proposal", "Won", "Lost"], default: "New" },
        { key: "value", label: "Value", type: "number", step: "0.01" },
        { key: "score", label: "AI score (0-100)", type: "number", step: "1" },
        { key: "owner_id", label: "Owner", type: "select", options: [{ value: "", label: "— none —" }].concat(empOptions(emps)) },
        { key: "next_action", label: "Next action", type: "textarea" },
      ];
      openModal(l ? "Edit Lead" : "Add Lead", fields.map(function (f) { return fld(f, l); }).join(""), async function () {
        var vals = collect(fields.map(function (f) { return f.key; }));
        if (!vals.name) throw new Error("Lead name is required");
        vals.value = Number(vals.value) || 0; vals.score = Math.min(100, Math.max(0, Number(vals.score) || 0));
        if (l) { await DB.update("crm_leads", l.id, vals); await Audit.log("update", "lead", vals.name, { id: l.id }); }
        else { await DB.insert("crm_leads", vals); await Audit.log("create", "lead", vals.name, { value: vals.value }); }
        App.refresh(); toast("Lead saved.");
      });
    },
    addLead: function () { App.leadForm(null); },
    editLead: function (id) { var self = this; DB.get("crm_leads", id).then(function (l) { self.leadForm(l); }); },
    delLead: function (id) {
      DB.get("crm_leads", id).then(function (l) {
        openConfirm("Delete lead", "Delete <b>" + U.esc(l.name) + "</b>?", async function () {
          await DB.remove("crm_leads", id); await Audit.log("delete", "lead", l.name, { id: id }); App.refresh(); toast("Lead deleted.");
        });
      });
    },

    /* ================================================================
       INTERNAL MEMOS (template + email link)
       ================================================================ */
    renderMemos: async function () {
      var rows = (await DB.list("memos")).slice().sort(function (a, b) { return (b.date || "").localeCompare(a.date || ""); });
      var q = (document.getElementById("memoSearch").value || "").toLowerCase();
      if (q) rows = rows.filter(function (m) { return (m.subject + " " + (m.from || "") + " " + (m.to || "") + " " + (m.body || "")).toLowerCase().indexOf(q) !== -1; });
      var canC = Auth.can("memos", "create"), canE = Auth.can("memos", "edit"), canD = Auth.can("memos", "delete");
      document.getElementById("btnNewMemo").hidden = !canC;
      var sent = rows.filter(function (m) { return m.status === "sent"; }).length;
      document.getElementById("memoStats").innerHTML =
        statCard("Total memos", rows.length, "") + statCard("Sent via email", sent, sent ? "good" : "") + statCard("Latest", rows.length ? U.date(rows[0].date) : "—", "");
      var tb = document.getElementById("memoTable");
      if (!rows.length) { tb.innerHTML = '<tr><td colspan="7" class="empty">No memos yet. ' + (canC ? "Click <b>+ New Memo</b> to compose from the standard template." : "Check back later.") + "</td></tr>"; return; }
      tb.innerHTML = rows.map(function (m) {
        return "<tr><td>" + U.esc(m.reference) + "</td><td><b>" + U.esc(m.subject) + "</b></td><td>" + U.esc(m.from || "—") + "</td><td>" + U.esc(m.to || "—") + "</td><td>" + U.date(m.date) + "</td><td>" + badge(m.status || "draft") + "</td><td>" +
          '<button class="btn sm secondary" onclick="App.viewMemo(\'' + m.id + '\')">View</button> ' +
          '<button class="btn sm ghost" onclick="App.emailMemo(\'' + m.id + '\')">✉ Email</button> ' +
          (canE ? '<button class="btn sm ghost" onclick="App.editMemo(\'' + m.id + '\')">Edit</button> ' : "") +
          (canD ? '<button class="btn sm danger" onclick="App.delMemo(\'' + m.id + '\')">Delete</button>' : "") + "</td></tr>";
      }).join("");
    },
    memoForm: async function (memo) {
      var existing = await DB.list("memos");
      var ref = memo ? memo.reference : "MEMO-" + new Date().getFullYear() + "-" + String(existing.length + 1).padStart(3, "0");
      var today = U.today();
      var templateBody = "PURPOSE\n[State the purpose of this memo.]\n\nBACKGROUND\n[Provide relevant context or background.]\n\nDETAILS\n[Explain the details, changes or instructions.]\n\nACTION REQUIRED\n[ ] [Action item 1]\n[ ] [Action item 2]\n\nPlease reply by " + U.addDays(today, 7) + " if you have any questions.";
      var fields = [
        { key: "reference", label: "Reference", default: ref },
        { key: "date", label: "Date", type: "date", default: today },
        { key: "from", label: "From", default: Auth.user() ? Auth.user().name : "" },
        { key: "to", label: "To (audience)", required: true, default: "All Staff" },
        { key: "recipient_email", label: "Recipient email (optional — used by ✉ Email)", type: "email" },
        { key: "subject", label: "Subject", required: true },
        { key: "body", label: "Message", type: "textarea", default: templateBody },
      ];
      var body = '<div class="form-note">Standard internal memo template — edit the placeholders, then <b>✉ Email</b> to open your mail app pre-filled with the subject and body.</div>' +
        '<div class="grid2">' + fields.slice(0, 5).map(function (f) { return fld(f, memo); }).join("") + "</div>" +
        fld(fields[5], memo) + fld(fields[6], memo);
      openModal(memo ? "Edit Memo" : "New Internal Memo (Template)", body, async function () {
        var keys = fields.map(function (f) { return f.key; });
        var vals = collect(keys);
        if (!vals.subject || !vals.to) throw new Error("Subject and audience are required");
        vals.status = memo ? memo.status : "draft";
        if (memo) { await DB.update("memos", memo.id, vals); await Audit.log("update", "memo", vals.subject, { id: memo.id, ref: vals.reference }); }
        else { await DB.insert("memos", vals); await Audit.log("create", "memo", vals.subject, { ref: vals.reference }); }
        App.refresh(); toast("Memo saved.");
      });
    },
    viewMemo: function (id) {
      DB.get("memos", id).then(function (m) {
        if (!m) { toast("Memo not found."); return; }
        var html =
          '<div style="border:1px solid var(--line);border-radius:12px;padding:16px;background:#fafcff">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid var(--brand);padding-bottom:10px;margin-bottom:12px">' +
              '<div><b style="font-size:15px">INTERNAL MEMO</b><br><span class="muted">' + U.esc(m.reference) + "</span></div>" +
              '<div style="text-align:right"><span class="muted">Date</span><br><b>' + U.date(m.date) + "</b></div></div>" +
            '<div class="grid2" style="font-size:13px;margin-bottom:12px">' +
              '<div><span class="muted">To:</span> <b>' + U.esc(m.to || "—") + "</b></div>" +
              '<div><span class="muted">From:</span> <b>' + U.esc(m.from || "—") + "</b></div></div>" +
            '<div style="font-size:15px;font-weight:800;margin-bottom:10px">' + U.esc(m.subject) + "</div>" +
            '<div style="white-space:pre-wrap;line-height:1.55;font-size:13px">' + U.esc(m.body) + "</div>" +
            (m.recipient_email ? '<div class="muted" style="margin-top:12px;font-size:12px">Email: ' + U.esc(m.recipient_email) + "</div>" : "") +
          "</div>";
        openModal("Memo — " + m.reference, html, function () { App.emailMemo(id); }, "✉ Send by email");
      });
    },
    emailMemo: function (id) {
      DB.get("memos", id).then(function (m) {
        if (!m) return;
        var subject = "[Internal Memo] " + m.subject;
        var body = "MEMORANDUM\n\nReference: " + m.reference +
          "\nDate: " + (m.date || "") +
          "\nTo: " + (m.to || "") +
          "\nFrom: " + (m.from || "") +
          "\n\n" + (m.body || "");
        var href = "mailto:" + (m.recipient_email || "") +
          "?subject=" + encodeURIComponent(subject) +
          "&body=" + encodeURIComponent(body);
        window.location.href = href;
        if (m.status !== "sent") {
          DB.update("memos", id, { status: "sent" }).then(function () {
            Audit.log("send", "memo", m.subject, { ref: m.reference });
            App.refresh();
          });
        }
        toast("Opening email app with memo…");
      });
    },
    editMemo: function (id) { var self = this; DB.get("memos", id).then(function (m) { self.memoForm(m); }); },
    delMemo: function (id) {
      DB.get("memos", id).then(function (m) {
        openConfirm("Delete memo", "Delete <b>" + U.esc(m.reference) + "</b> — " + U.esc(m.subject) + "?", async function () {
          await DB.remove("memos", id); await Audit.log("delete", "memo", m.subject, { ref: m.reference }); App.refresh(); toast("Memo deleted.");
        });
      });
    },

    /* ================================================================
       AUDIT LOG
       ================================================================ */
    renderAudit: async function () {
      var rows = (await DB.list("audit_log")).slice().sort(function (a, b) { return (b.created_at || "").localeCompare(a.created_at || ""); });
      var q = (document.getElementById("auditSearch").value || "").toLowerCase();
      if (q) rows = rows.filter(function (r) { return JSON.stringify(r).toLowerCase().indexOf(q) !== -1; });
      var tb = document.getElementById("auditTable");
      if (!rows.length) { tb.innerHTML = '<tr><td colspan="6" class="empty">No audit events yet.</td></tr>'; return; }
      tb.innerHTML = rows.slice(0, 200).map(function (r) {
        return "<tr><td>" + U.dt(r.created_at) + "</td><td>" + U.esc(r.user_email || "system") + "<br><span class=\"muted\">" + roleChip(r.user_role || "—") + "</span></td><td>" + badge(r.action) + "</td><td>" + U.esc(r.entity) + "</td><td>" + U.esc(r.entity_name || "") + "</td><td style=\"max-width:260px;word-break:break-word\"><span class=\"muted\">" + U.esc(r.details || "") + "</span></td></tr>";
      }).join("");
    },

    /* ================================================================
       PLANS & PRICING
       ================================================================ */
    renderPricing: function () {
      var current = Plans.tierOf(Auth.company());
      var html = '<div class="grid three">' + planCard(Plans.trial, current) + window.PLANS.map(function (p) { return planCard(p, current); }).join("") + "</div>" +
        '<div class="card mt"><div class="hint">Demo: choosing a plan sets it on this company immediately. In production, wire a payment provider (Stripe/Paddle) in <code>js/config.js</code> → <code>billing.checkout</code>; the company plan is applied after a successful checkout.</div></div>';
      document.getElementById("pricingView").innerHTML = html;
    },
    choosePlan: function (id) {
      var c = Auth.company();
      if (!c) return;
      var vals = { plan: id, plan_expires_at: id === "trial" ? U.addDays(U.today(), cfg.planTrialDays || 14) : "" };
      var done = function () {
        App.buildNav(); App.buildTopActions(); App.refresh();
      };
      if (DB.mode === "supabase" && DB.client) {
        DB.update("companies", c.id, vals).then(function () {
          Auth.session.company = Object.assign({}, c, vals);
          Audit.log("update", "company_plan", id, {});
          toast("Plan updated to " + Plans.byId(id).name + "."); done();
        }).catch(function (err) { toast((err && err.message) || "Could not update plan."); });
      } else {
        var cs = window.LS.get("nx2_companies", []).map(function (x) { return x.id === c.id ? Object.assign({}, x, vals) : x; });
        window.LS.set("nx2_companies", cs);
        Auth.session.company = Object.assign({}, c, vals);
        Audit.log("update", "company_plan", id, {});
        toast("Plan set to " + Plans.byId(id).name + " (demo)."); done();
      }
    },

    /* ================================================================
       ONBOARDING WIZARD
       ================================================================ */
    renderOnboard: async function (step) {
      App.onboardStep = step;
      var steps = ["Company", "Branches", "Departments", "Done"];
      var html = "";
      steps.forEach(function (s, i) {
        var cls = i + 1 < step ? "done" : (i + 1 === step ? "now" : "");
        html += '<div class="step ' + cls + '"></div>';
      });
      document.getElementById("onSteps").innerHTML = html;
      var body = document.getElementById("onStepBody");
      if (step === 1) {
        body.innerHTML = '<div class="onboard-title">Welcome — set up your company</div><div class="onboard-sub">This is your tenant. Everything (branches, employees, payroll, projects) lives under it.</div>' +
          '<form id="onCompanyForm"><div class="grid2">' +
          fld({ key: "name", label: "Company name", required: true }) +
          fld({ key: "registration_no", label: "Registration no." }) +
          fld({ key: "industry", label: "Industry" }) +
          fld({ key: "city", label: "City" }) +
          fld({ key: "address", label: "Street address" }) +
          fld({ key: "phone", label: "Phone" }) +
          fld({ key: "email", label: "Work email", type: "email" }) +
          fld({ key: "website", label: "Website" }) +
          fld({ key: "currency", label: "Currency", default: "RM" }) +
          '</div><div class="onboard-actions"><span></span><button class="btn primary" type="submit">Continue →</button></div></form>';
        document.getElementById("onCompanyForm").onsubmit = async function (e) {
          e.preventDefault();
          var keys = ["name", "registration_no", "industry", "city", "address", "phone", "email", "website", "currency"];
          var vals = collect(keys);
          if (!vals.name) { toast("Company name is required."); return; }
          await Auth.createCompany(vals);
          App.renderOnboard(2);
        };
      } else if (step === 2) {
        body.innerHTML = '<div class="onboard-title">Add branches (optional)</div><div class="onboard-sub">Physical locations of your business. You can add more later.</div>' +
          '<div id="onBranchesList" class="mb"></div>' +
          '<form id="onBranchForm" class="grid2">' +
          fld({ key: "name", label: "Branch name" }) + fld({ key: "city", label: "City" }) +
          fld({ key: "phone", label: "Phone" }) + fld({ key: "manager", label: "Manager" }) +
          '</form><div class="onboard-actions"><button class="btn secondary" onclick="App.renderOnboard(3)">Skip →</button><button class="btn primary" id="onAddBranch">+ Add Branch</button></div>';
        document.getElementById("onAddBranch").onclick = async function () {
          var vals = collect(["name", "city", "phone", "manager"]);
          if (!vals.name) { toast("Enter a branch name."); return; }
          await DB.insert("branches", Object.assign({ status: "active" }, vals));
          toast("Branch added.");
          App.renderOnboard(2);
        };
        App._onboardList("branches", "onBranchesList");
      } else if (step === 3) {
        body.innerHTML = '<div class="onboard-title">Add departments (optional)</div><div class="onboard-sub">Organise your employees. You can add more later.</div>' +
          '<div id="onDeptsList" class="mb"></div>' +
          '<form id="onDeptForm" class="grid2">' +
          fld({ key: "name", label: "Department name" }) + fld({ key: "code", label: "Code" }) +
          '</form><div class="onboard-actions"><button class="btn secondary" onclick="App.renderOnboard(4)">Skip →</button><button class="btn primary" id="onAddDept">+ Add Department</button></div>';
        document.getElementById("onAddDept").onclick = async function () {
          var vals = collect(["name", "code"]);
          if (!vals.name) { toast("Enter a department name."); return; }
          await DB.insert("departments", vals);
          toast("Department added.");
          App.renderOnboard(3);
        };
        App._onboardList("departments", "onDeptsList");
      } else {
        var branches = await DB.list("branches"), depts = await DB.list("departments");
        body.innerHTML = '<div class="onboard-title">You\'re all set 🎉</div><div class="onboard-sub">' + U.esc(Auth.company().name) + " is ready. Here's what you configured:</div><ul class=\"onboard-list\">" +
          setupItem("Company profile", true, Auth.company().name) +
          setupItem("Branches", branches.length > 0, branches.length + " added") +
          setupItem("Departments", depts.length > 0, depts.length + " added") +
          '</ul><div class="onboard-actions"><span></span><button class="btn primary" onclick="App.finishOnboard()">Enter Dashboard →</button></div>';
      }
    },
    _onboardList: async function (table, id) {
      var rows = await DB.list(table);
      var el = document.getElementById(id);
      if (el) el.innerHTML = rows.length ? '<ul class="onboard-list">' + rows.map(function (r) { return "<li><span class=\"done-mark\">✔</span>" + U.esc(r.name) + "<span class=\"muted\" style=\"margin-left:auto\">" + U.esc(r.city || r.code || "") + "</span></li>"; }).join("") + "</ul>" : '<div class="hint">Nothing added yet.</div>';
    },
    finishOnboard: function () {
      document.getElementById("onboardView").hidden = true;
      document.getElementById("appView").hidden = false;
      App.showApp();
    },
  });

  /* ============================ stat/kpi builders ============================ */
  function kpi(label, value, cls, delta) {
    return '<div class="card kpi"><div class="label">' + label + '</div><div class="value">' + value + '</div><div class="delta ' + cls + '">' + delta + "</div></div>";
  }
  function stat(label, value) {
    return '<div class="statline"><span>' + label + "</span><b>" + value + "</b></div>";
  }
  function statCard(label, value, cls) {
    return '<div class="card kpi"><div class="label">' + label + '</div><div class="value ' + (cls || "") + '">' + value + "</div></div>";
  }
  function infoCard(title, rows) {
    return '<div class="card" style="box-shadow:none"><h3>' + title + "</h3>" + rows.map(function (r) { return stat(r[0], r[1] || "—"); }).join("") + "</div>";
  }
  function setupItem(label, done, extra) {
    return "<li>" + (done ? '<span class="done-mark">✔</span>' : '<span class="muted">○</span>') + " <b>" + label + "</b><span class=\"muted\" style=\"margin-left:auto\">" + (extra || "") + "</span></li>";
  }
  function planCard(plan, current) {
    var active = plan.id === current.id;
    return '<div class="card" style="display:flex;flex-direction:column">' +
      '<h2>' + plan.name + (active ? ' <span class="badge bgreen">Current</span>' : "") + "</h2>" +
      '<div class="muted" style="font-size:12px">' + plan.tagline + "</div>" +
      '<div style="font-size:28px;font-weight:800;margin:14px 0 4px">' + U.money(plan.price) + '<span class="muted" style="font-size:12px"> · one-time</span></div>' +
      '<ul class="onboard-list" style="flex:1">' + plan.blurb.map(function (b) { return "<li><span class=\"done-mark\">✔</span>" + b + "</li>"; }).join("") + "</ul>" +
      (active
        ? '<button class="btn secondary" disabled>Current plan</button>'
        : '<button class="btn primary" onclick="App.choosePlan(\'' + plan.id + '\')">Choose ' + plan.name + "</button>") +
      "</div>";
  }

  /* ============================ wiring ============================ */
  function wire() {
    document.querySelectorAll(".auth-tabs button").forEach(function (b) {
      b.addEventListener("click", function () { App.showTab(b.dataset.atab); });
    });
    document.getElementById("nav").addEventListener("click", function (e) {
      var b = e.target.closest("button[data-page]");
      if (b) App.go(b.dataset.page);
    });
    document.getElementById("btnSignOut").addEventListener("click", function () { App.signOut(); });
    document.getElementById("btnEditCompany").addEventListener("click", function () { App.editCompany(); });
    document.getElementById("btnAddBranch").addEventListener("click", function () { App.branchForm(null); });
    document.getElementById("btnAddDept").addEventListener("click", function () { App.addDept(); });
    document.getElementById("btnAddMember").addEventListener("click", function () { App.addMember(); });
    document.getElementById("btnAddEmployee").addEventListener("click", function () { App.addEmployee(); });
    document.getElementById("btnAddLeave").addEventListener("click", function () { App.addLeave(); });
    document.getElementById("btnRunPayroll").addEventListener("click", function () { App.runPayroll(false); });
    document.getElementById("btnAddProject").addEventListener("click", function () { App.addProject(); });
    document.getElementById("btnAddTx").addEventListener("click", function () { App.addTx(); });
    document.getElementById("btnAddLead").addEventListener("click", function () { App.addLead(); });
    document.getElementById("btnNewMemo").addEventListener("click", function () { App.memoForm(null); });
    document.getElementById("memoSearch").addEventListener("input", function () { App.renderMemos(); });
    var psel = document.getElementById("payrollPeriod");
    if (psel) {
      (function () {
        var opts = [], d = new Date();
        for (var i = 5; i >= 0; i--) { var x = new Date(d.getFullYear(), d.getMonth() - i, 1); opts.push(x.getFullYear() + "-" + String(x.getMonth() + 1).padStart(2, "0")); }
        psel.innerHTML = opts.map(function (k) { return '<option value="' + k + '"' + (k === U.monthKey() ? " selected" : "") + ">" + k + "</option>"; }).join("");
        psel.addEventListener("change", function () { App.refresh(); });
      })();
    }
    document.getElementById("employeeSearch").addEventListener("input", function () { App.renderEmployees(); });
    document.getElementById("deptFilter").addEventListener("change", function () { App.renderEmployees(); });
    document.getElementById("branchFilter").addEventListener("change", function () { App.renderEmployees(); });
    document.getElementById("auditSearch").addEventListener("input", function () { App.renderAudit(); });
    var attDate = document.getElementById("attDate");
    attDate.value = attDate.value || U.today();
    attDate.addEventListener("change", function () { App.refresh(); });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { wire(); App.boot(); });
  } else { wire(); App.boot(); }
})();
