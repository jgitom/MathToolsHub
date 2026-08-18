/* NexCompany AI — V2 core: utils, data layer (Supabase | LocalStorage),
   authentication, RBAC, audit logging and demo seed data. */
(function () {
  "use strict";
  var cfg = window.CONFIG || {};
  var NS = "nx2_";

  /* ============================ UTILS ============================ */
  var U = (window.U = {});
  U.id = function () {
    return (window.crypto && crypto.randomUUID) ? crypto.randomUUID()
      : "id_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);
  };
  U.nowISO = function () { return new Date().toISOString(); };
  U.today = function () { return new Date().toISOString().slice(0, 10); };
  U.monthKey = function (d) {
    var x = d ? new Date(d) : new Date();
    return x.getFullYear() + "-" + String(x.getMonth() + 1).padStart(2, "0");
  };
  U.esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  U.money = function (n) {
    return (cfg.currency || "RM") + " " + Number(n || 0).toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  U.num = function (n) { return Number(n || 0).toLocaleString("en-MY"); };
  U.pct = function (n) { return Number(n || 0).toFixed(0) + "%"; };
  U.date = function (s) {
    if (!s) return "—";
    var d = new Date(s.length <= 10 ? s + "T00:00:00" : s);
    if (isNaN(d)) return s;
    return d.toLocaleDateString("en-MY", { day: "2-digit", month: "short", year: "numeric" });
  };
  U.dt = function (s) {
    if (!s) return "—";
    var d = new Date(s);
    if (isNaN(d)) return s;
    return d.toLocaleString("en-MY", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  };
  U.weekdayCount = function (a, b) {
    var c = 0, d = new Date(a + "T00:00:00"), end = new Date(b + "T00:00:00");
    while (d <= end) { var w = d.getDay(); if (w >= 1 && w <= 5) c++; d.setDate(d.getDate() + 1); }
    return c;
  };
  U.addDays = function (d, n) { var x = new Date(d + "T00:00:00"); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10); };
  U.daysBetween = function (a, b) { return Math.max(0, Math.round((new Date(b + "T00:00:00") - new Date(a + "T00:00:00")) / 86400000)); };
  U.monthDays = function (ym) {
    var p = ym.split("-"); return new Date(+p[0], +p[1], 0).getDate();
  };
  U.sum = function (arr, key) { return (arr || []).reduce(function (a, r) { return a + Number(r[key] || 0); }, 0); };
  U.obj = function (keys, o) { var r = {}; keys.forEach(function (k) { if (o[k] !== undefined) r[k] = o[k]; }); return r; };
  U.todayDow = function () {
    var d = new Date();
    return d.toLocaleDateString("en-MY", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  };

  /* ======================= PLANS (tiers) =======================
     The tenant plan lives on the company record (plan + plan_expires_at),
     defaulting to a time-limited trial. "trial" unlocks every feature. */
  var Plans = (window.Plans = {
    all: window.PLANS || [],
    trial: window.TRIAL_PLAN || { id: "trial", name: "Trial", price: 0, features: ["*"] },
    byId: function (id) {
      return Plans.all.find(function (p) { return p.id === id; }) || Plans.trial;
    },
    tierOf: function (company) {
      var id = (company && company.plan) || cfg.plan || "trial";
      return Plans.byId(id);
    },
    isTrial: function (company) {
      return !(company && company.plan) || company.plan === "trial" || (!company.plan && (cfg.plan || "trial") === "trial");
    },
    expiresAt: function (company) { return (company && company.plan_expires_at) || ""; },
    daysLeft: function (company) {
      var exp = Plans.expiresAt(company);
      if (!exp) return -1; // no expiry (paid or legacy)
      return Math.max(0, U.daysBetween(U.today(), exp));
    },
    trialExpired: function (company) {
      var exp = Plans.expiresAt(company);
      return !!exp && U.today() > exp;
    },
    allows: function (company, feature) {
      var tier = Plans.tierOf(company);
      if (tier.features.indexOf("*") !== -1) return true;
      return tier.features.indexOf(feature) !== -1;
    },
  });

  /* ======================= LOCAL STORAGE ======================= */
  function lsGet(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v === null || v === undefined ? d : v; } catch (e) { return d; } }
  function lsSet(k, v) { localStorage.setItem(k, JSON.stringify(v)); }

  var LS = (window.LS = {
    get: lsGet, set: lsSet, del: function (k) { localStorage.removeItem(k); },
    scoped: function (t) { return NS + "c_" + (Auth.company() ? Auth.company().id : "none") + "_" + t; },
  });

  /* Global (non company-scoped) tables */
  var G = {
    users: function () { return lsGet(NS + "users", []); },
    saveUsers: function (v) { lsSet(NS + "users", v); },
    memberships: function () { return lsGet(NS + "memberships", []); },
    saveMemberships: function (v) { lsSet(NS + "memberships", v); },
    companies: function () { return lsGet(NS + "companies", []); },
    saveCompanies: function (v) { lsSet(NS + "companies", v); },
    company: function (id) { return lsGet(NS + "companies", []).find(function (c) { return c.id === id; }) || null; },
    session: function () { return lsGet(NS + "session", null); },
    saveSession: function (v) { lsSet(NS + "session", v); },
  };

  function hashPw(pw) { /* demo-only obfuscation — real security is handled by Supabase Auth */
    var h = 5381, s = "nx2::" + pw;
    for (var i = 0; i < s.length; i++) h = ((h << 5) + h) ^ s.charCodeAt(i);
    return (h >>> 0).toString(16);
  }

  /* ============================ DB LAYER ============================
     Unified API. mode 'supabase' -> real Postgres via supabase-js
     mode 'local' -> localStorage. All signatures are async. */
  var PROD = (function () {
    try { var qp = new URLSearchParams(location.search).get("env"); if (qp) return qp === "production"; } catch (e) {}
    return (window.NEXCOMPANY_ENV || cfg.env) === "production";
  })();

  var DB = (window.DB = {
    client: null,       // kept for supabase-js compatibility
    driverName: "local",
    driver: null,
    production: PROD,   // locked to Supabase; demo drivers disabled
    productionReady: true,

    get mode() { return DB.driverName; },

    init: async function () {
      if (DB.production) {
        // PRODUCTION is locked to Supabase — demo drivers are never allowed.
        DB.driverName = "supabase";
        DB.productionReady = false;
        DB.driver = DB.drivers.supabase();
        try {
          await DB.driver.init(cfg);
          DB.productionReady = true;
        } catch (e) {
          console.error("PRODUCTION: Supabase is not configured/available (" + e.message + ").");
        }
        return;
      }
      var override = "";
      try { override = localStorage.getItem(NS + "driver") || ""; } catch (e) {}
      var requested = (override || cfg.dbDriver || "auto").toLowerCase();
      if (requested !== "auto") DB.driverName = requested;
      else if (cfg.supabaseUrl && cfg.supabaseAnonKey && window.supabase) DB.driverName = "supabase";
      else DB.driverName = "local";
      var factory = DB.drivers[DB.driverName];
      if (!factory) DB.driverName = "local";
      DB.driver = DB.drivers[DB.driverName]();
      try {
        await DB.driver.init(cfg);
      } catch (e) {
        console.warn("Storage driver '" + DB.driverName + "' unavailable (" + e.message + ") — falling back to localStorage.");
        DB.driverName = "local";
        DB.driver = DB.drivers.local();
        await DB.driver.init(cfg);
      }
      if (DB.driverName !== "local") {
        try { await DB.migrateFromLocal(); } catch (e) { console.warn("Storage migration skipped:", e.message); }
      }
    },

    /* Copy the demo-company tables from localStorage into the active driver
       once, so switching storage preserves the demo data. */
    migrateFromLocal: async function () {
      if (DB.driverName === "local") return;
      var names = ["branches","departments","employees","leave_requests","attendance","payroll_runs","payroll_items","customers","projects","finance_transactions","crm_leads","memos","audit_log","assets","documents"];
      for (var i = 0; i < names.length; i++) {
        var n = names[i];
        var localRows = lsGet(NS + "c_demo-company_" + n, []);
        if (!localRows.length) continue;
        var remote = await DB.driver.list(n, { all: true });
        if (remote.length) continue;
        for (var j = 0; j < localRows.length; j++) await DB.driver.insert(n, localRows[j]);
      }
    },

    clearDemoCompany: async function () {
      if (DB.driverName === "local") return;
      var names = ["branches","departments","employees","leave_requests","attendance","payroll_runs","payroll_items","customers","projects","finance_transactions","crm_leads","memos","audit_log","assets","documents"];
      for (var i = 0; i < names.length; i++) {
        if (DB.driver.clearCompany) await DB.driver.clearCompany(names[i], "demo-company");
      }
    },

    scoped: function (name) { return DB.driver.scoped ? DB.driver.scoped(name) : name; },

    list: async function (name, opts) { return DB.driver.list(name, opts); },
    get: async function (name, id) { return DB.driver.get(name, id); },
    insert: async function (name, row) {
      row = Object.assign({ id: U.id(), created_at: U.nowISO() }, row);
      if (name !== "companies" && name !== "memberships" && !row.company_id && Auth.company()) row.company_id = Auth.company().id;
      return DB.driver.insert(name, row);
    },
    update: async function (name, id, patch) { return DB.driver.update(name, id, patch); },
    remove: async function (name, id) { return DB.driver.remove(name, id); },
    saveAll: async function (name, rows) { return DB.driver.saveAll ? DB.driver.saveAll(name, rows) : rows; },

    drivers: {
      /* ---------- localStorage ---------- */
      local: function () {
        function scoped(name) {
          if (name === "companies") return NS + "companies";
          if (name === "memberships") return NS + "memberships";
          if (name === "users") return NS + "users";
          return LS.scoped(name);
        }
        return {
          async init() {},
          scoped: scoped,
          async list(name, opts) { return lsGet(scoped(name), []); },
          async get(name, id) { return lsGet(scoped(name), []).find(function (x) { return x.id === id; }) || null; },
          async insert(name, row) {
            var rows = lsGet(scoped(name), []);
            rows.push(row);
            lsSet(scoped(name), rows);
            return row;
          },
          async update(name, id, patch) {
            var rows = lsGet(scoped(name), []);
            var i = rows.findIndex(function (x) { return x.id === id; });
            if (i < 0) return null;
            rows[i] = Object.assign({}, rows[i], patch);
            lsSet(scoped(name), rows);
            return rows[i];
          },
          async remove(name, id) {
            var rows = lsGet(scoped(name), []);
            lsSet(scoped(name), rows.filter(function (x) { return x.id !== id; }));
            return true;
          },
          async saveAll(name, rows) { lsSet(scoped(name), rows); },
        };
      },

      /* ---------- Supabase / Postgres ---------- */
      supabase: function () {
        return {
          async init() {
            DB.client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
          },
          async list(name, opts) {
            opts = opts || {};
            var q = DB.client.from(name).select("*");
            if (!opts.all && name !== "companies" && Auth.company()) q = q.eq("company_id", Auth.company().id);
            if (opts.order) q = q.order(opts.order, { ascending: opts.asc !== false });
            var r = await q;
            if (r.error) throw r.error;
            return r.data || [];
          },
          async get(name, id) {
            var r = await DB.client.from(name).select("*").eq("id", id).maybeSingle();
            if (r.error) throw r.error;
            return r.data;
          },
          async insert(name, row) {
            if (name !== "companies" && !row.company_id && Auth.company()) row.company_id = Auth.company().id;
            var r = await DB.client.from(name).insert(row).select().single();
            if (r.error) throw r.error;
            return r.data;
          },
          async update(name, id, patch) {
            var r = await DB.client.from(name).update(patch).eq("id", id).select().single();
            if (r.error) throw r.error;
            return r.data;
          },
          async remove(name, id) {
            var r = await DB.client.from(name).delete().eq("id", id);
            if (r.error) throw r.error;
            return true;
          },
        };
      },

      /* ---------- In-browser SQLite (sql.js WASM) ---------- */
      sqlite: function () {
        var SQL = null, db = null, KEY = NS + "sqlite_db", STORE = "__store";
        function persist() {
          var bytes = db.export(), bin = "";
          for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
          lsSet(KEY, btoa(bin));
        }
        function run(sql, params) { db.run(sql, params || []); }
        function each(sql, params) {
          var out = [];
          db.each(sql, params || [], function (row) { out.push(row.payload); });
          return out;
        }
        function parseAll(raws) {
          return raws.map(function (p) { try { return JSON.parse(p); } catch (e) { return {}; } });
        }
        return {
          async init() {
            if (db) return;
            if (!window.initSqlJs) {
              await new Promise(function (resolve, reject) {
                var s = document.createElement("script");
                s.src = "vendor/sql-wasm.js";
                s.onload = resolve;
                s.onerror = function () { reject(new Error("could not load sql.js from vendor/")); };
                document.head.appendChild(s);
              });
            }
            SQL = await window.initSqlJs({ locateFile: function (f) { return "vendor/" + f; } });
            var persisted = lsGet(KEY, "");
            db = persisted
              ? new SQL.Database(new Uint8Array(atob(persisted).split("").map(function (c) { return c.charCodeAt(0); })))
              : new SQL.Database();
            db.run("CREATE TABLE IF NOT EXISTS " + STORE + " (id TEXT PRIMARY KEY, table_name TEXT NOT NULL, company_id TEXT, created_at TEXT, payload TEXT NOT NULL)");
            db.run("CREATE INDEX IF NOT EXISTS idx_" + STORE + "_t ON " + STORE + "(table_name, company_id)");
          },
          async list(name, opts) {
            opts = opts || {};
            var raws = opts.all
              ? each("SELECT payload FROM " + STORE + " WHERE table_name = ?", [name])
              : (Auth.company()
                ? each("SELECT payload FROM " + STORE + " WHERE table_name = ? AND company_id = ?", [name, Auth.company().id])
                : each("SELECT payload FROM " + STORE + " WHERE table_name = ?", [name]));
            var rows = parseAll(raws);
            if (opts.order) rows.sort(function (a, b) { var av = a[opts.order] || "", bv = b[opts.order] || ""; return opts.asc === false ? bv.localeCompare(av) : av.localeCompare(bv); });
            return rows;
          },
          async get(name, id) {
            var raws = each("SELECT payload FROM " + STORE + " WHERE table_name = ? AND id = ?", [name, id]);
            if (!raws.length) return null;
            try { return JSON.parse(raws[0]); } catch (e) { return {}; }
          },
          async insert(name, row) {
            if (name !== "companies" && name !== "memberships" && !row.company_id && Auth.company()) row.company_id = Auth.company().id;
            run("INSERT OR REPLACE INTO " + STORE + " (id, table_name, company_id, created_at, payload) VALUES (?,?,?,?,?)",
              [row.id, name, row.company_id || (name === "companies" ? row.id : null), row.created_at || U.nowISO(), JSON.stringify(row)]);
            persist();
            return row;
          },
          async update(name, id, patch) {
            var raws = each("SELECT payload FROM " + STORE + " WHERE table_name = ? AND id = ?", [name, id]);
            if (!raws.length) return null;
            var merged = Object.assign(JSON.parse(raws[0]), patch);
            run("UPDATE " + STORE + " SET payload = ? WHERE table_name = ? AND id = ?", [JSON.stringify(merged), name, id]);
            persist();
            return merged;
          },
          async remove(name, id) {
            run("DELETE FROM " + STORE + " WHERE table_name = ? AND id = ?", [name, id]);
            persist();
            return true;
          },
          async clearCompany(name, companyId) {
            run("DELETE FROM " + STORE + " WHERE table_name = ? AND company_id = ?", [name, companyId]);
            persist();
          },
          async saveAll(name, rows) {
            run("DELETE FROM " + STORE + " WHERE table_name = ?", [name]);
            for (var i = 0; i < rows.length; i++) {
              var r = rows[i];
              if (!r.company_id && Auth.company()) r.company_id = Auth.company().id;
              run("INSERT INTO " + STORE + " (id, table_name, company_id, created_at, payload) VALUES (?,?,?,?,?)",
                [r.id, name, r.company_id || null, r.created_at || U.nowISO(), JSON.stringify(r)]);
            }
            persist();
            return rows;
          },
        };
      },

      /* ---------- Generic REST -> any backend database ---------- */
      rest: function () {
        var base = "";
        function root() { return base.replace(/\/$/, ""); }
        function req(method, path, body) {
          return fetch(root() + path, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: body === undefined ? undefined : JSON.stringify(body),
          }).then(function (r) {
            return r.json().then(function (j) {
              if (!r.ok) throw new Error(j.error || ("HTTP " + r.status));
              return j;
            }).catch(function () {
              if (!r.ok) throw new Error("HTTP " + r.status);
              return null;
            });
          });
        }
        return {
          async init() {
            base = cfg.apiBaseUrl || "";
            if (!base) throw new Error("REST driver needs CONFIG.apiBaseUrl (e.g. http://localhost:8091)");
            var j = await req("GET", "/health");
            if (!j || !j.ok) throw new Error("API unreachable at " + base);
          },
          async list(name, opts) {
            opts = opts || {};
            var qs = [];
            if (!opts.all && Auth.company()) qs.push("company_id=" + encodeURIComponent(Auth.company().id));
            var data = await req("GET", "/table/" + encodeURIComponent(name) + (qs.length ? "?" + qs.join("&") : ""));
            if (opts.order) data.sort(function (a, b) { var av = a[opts.order] || "", bv = b[opts.order] || ""; return opts.asc === false ? bv.localeCompare(av) : av.localeCompare(bv); });
            return data || [];
          },
          async get(name, id) { return req("GET", "/table/" + encodeURIComponent(name) + "/" + encodeURIComponent(id)); },
          async insert(name, row) {
            if (name !== "companies" && !row.company_id && Auth.company()) row.company_id = Auth.company().id;
            return req("POST", "/table/" + encodeURIComponent(name), row);
          },
          async update(name, id, patch) { return req("PATCH", "/table/" + encodeURIComponent(name) + "/" + encodeURIComponent(id), patch); },
          async remove(name, id) { await req("DELETE", "/table/" + encodeURIComponent(name) + "/" + encodeURIComponent(id)); return true; },
          async clearCompany(name, companyId) { await req("DELETE", "/table/" + encodeURIComponent(name) + "?company_id=" + encodeURIComponent(companyId)); },
        };
      },
    },
  });

  /* ============================ AUDIT ============================ */
  var Audit = (window.Audit = {
    log: async function (action, entity, entityName, details) {
      try {
        if (!Auth.company()) return;
        await DB.insert("audit_log", {
          action: action, entity: entity, entity_name: entityName || "",
          details: details ? JSON.stringify(details) : "",
          user_id: Auth.user() ? Auth.user().id : null,
          user_email: Auth.user() ? Auth.user().email : null,
          user_role: Auth.role(),
        });
      } catch (e) { /* audit must never break the app */ }
    },
  });

  /* ============================ AUTH ============================ */
  var Auth = (window.Auth = {
    session: null, // { mode, user:{id,name,email}, membership, company, role }

    init: async function () {
      await DB.init();
      if (DB.mode === "supabase") {
        try {
          var r = await DB.client.auth.getSession();
          if (r.data && r.data.session && r.data.session.user) {
            await Auth.setSupabaseUser(r.data.session.user);
          }
        } catch (e) {}
      }
      if (!Auth.session && !DB.production) {
        var s = G.session();
        if (s && s.user_id) {
          var user = G.users().find(function (u) { return u.id === s.user_id; });
          var mem = user ? G.memberships().find(function (m) { return m.user_id === user.id && (!s.company_id || m.company_id === s.company_id); }) : null;
          if (user && mem) {
            Auth.session = { mode: "local", user: user, membership: mem, company: G.company(mem.company_id), role: mem.role };
          } else if (user) {
            Auth.session = { mode: "local", user: user, membership: null, company: null, role: "owner" };
          } else {
            G.saveSession(null);
          }
        }
      }
      return Auth.session;
    },

    setSupabaseUser: async function (su) {
      var mems = await DB.list("memberships", { all: true });
      var mem = mems.find(function (m) { return m.user_id === su.id; }) ||
        mems.find(function (m) { return m.email && m.email.toLowerCase() === (su.email || "").toLowerCase(); });
      if (mem && mem.user_id !== su.id) {
        try {
          if (DB.mode === "supabase" && DB.client) { await DB.client.rpc("nx_link_identity", { target: mem.id }); }
          else { await DB.update("memberships", mem.id, { user_id: su.id }); }
          mem.user_id = su.id;
        } catch (e) {}
      }
      var company = null;
      if (mem) company = await DB.get("companies", mem.company_id);
      Auth.session = {
        mode: "supabase",
        user: { id: su.id, email: su.email, name: (su.user_metadata && su.user_metadata.name) || (su.email || "").split("@")[0] },
        membership: mem, company: company, role: mem ? mem.role : "owner",
      };
    },

    signIn: async function (email, pw) {
      if (DB.mode === "supabase") {
        var r = await DB.client.auth.signInWithPassword({ email: email, password: pw });
        if (r.error) throw r.error;
        await Auth.setSupabaseUser(r.data.user);
        return Auth.session;
      }
      var user = G.users().find(function (u) { return u.email.toLowerCase() === email.toLowerCase(); });
      if (!user) throw new Error("No account found for this email. Try Demo, or create an account.");
      if (user.password_hash !== hashPw(pw)) throw new Error("Incorrect password.");
      var mems = G.memberships().filter(function (m) { return m.user_id === user.id; });
      if (mems.length === 0) {
        Auth.session = { mode: "local", user: user, membership: null, company: null, role: "owner" };
        G.saveSession({ user_id: user.id, company_id: null });
      } else {
        var mem = mems[0];
        Auth.session = { mode: "local", user: user, membership: mem, company: G.company(mem.company_id), role: mem.role };
        G.saveSession({ user_id: user.id, company_id: mem.company_id });
      }
      return Auth.session;
    },

    signUp: async function (name, email, pw) {
      if (DB.mode === "supabase") {
        var r = await DB.client.auth.signUp({ email: email, password: pw, options: { data: { name: name } } });
        if (r.error) throw r.error;
        if (r.data && r.data.user) await Auth.setSupabaseUser(r.data.user);
        return Auth.session;
      }
      if (G.users().some(function (u) { return u.email.toLowerCase() === email.toLowerCase(); })) {
        throw new Error("An account with this email already exists.");
      }
      var user = { id: U.id(), name: name, email: email, password_hash: hashPw(pw), created_at: U.nowISO() };
      G.saveUsers(G.users().concat([user]));
      Auth.session = { mode: "local", user: user, membership: null, company: null, role: "owner" };
      G.saveSession({ user_id: user.id, company_id: null });
      return Auth.session;
    },

    /* Demo personas demonstrate the RBAC model end-to-end. */
    demoLogin: async function (persona) {
      persona = persona || "owner";
      var demo = {
        owner: { email: "demo@nexcompany.app", name: "Alicia Tan", role: "owner", empNo: "EMP001" },
        manager: { email: "manager@nexcompany.app", name: "Farid Rahman", role: "manager", empNo: "EMP002" },
        staff: { email: "staff@nexcompany.app", name: "Nur Aina", role: "staff", empNo: "EMP005" },
      }[persona];
      var seed = await Seed.ensureDemo(); // creates demo company + data
      if (DB.mode !== "local") await DB.migrateFromLocal(); // carry demo data into the active database
      var user = G.users().find(function (u) { return u.email === demo.email; });
      if (!user) {
        user = { id: U.id(), name: demo.name, email: demo.email, password_hash: hashPw("demo1234"), created_at: U.nowISO() };
        G.saveUsers(G.users().concat([user]));
      }
      var emp = seed.employees.find(function (e) { return e.employee_no === demo.empNo; });
      var mem = G.memberships().find(function (m) { return m.user_id === user.id && m.company_id === seed.company.id; });
      if (!mem) {
        mem = { id: U.id(), user_id: user.id, company_id: seed.company.id, role: demo.role, employee_id: emp ? emp.id : null, name: user.name, email: user.email, created_at: U.nowISO() };
        G.saveMemberships(G.memberships().concat([mem]));
      }
      Auth.session = { mode: "local", user: user, membership: mem, company: seed.company, role: mem.role };
      G.saveSession({ user_id: user.id, company_id: seed.company.id });
      await Audit.log("login", "session", demo.email, { mode: "demo", role: mem.role });
      return Auth.session;
    },

    createCompany: async function (profile) {
      var company = Object.assign({ id: U.id(), created_at: U.nowISO(), plan: "trial", plan_expires_at: U.addDays(U.today(), cfg.planTrialDays || 14) }, profile);
      var user = Auth.user();
      var mem = { id: U.id(), user_id: user.id, company_id: company.id, role: "owner", employee_id: null, name: user.name, email: user.email, created_at: U.nowISO() };
      if (DB.mode === "supabase") {
        await DB.insert("companies", company);
        await DB.insert("memberships", mem);
      }
      G.saveCompanies(G.companies().filter(function (c) { return c.id !== company.id; }).concat([company]));
      G.saveMemberships(G.memberships().concat([mem]));
      Auth.session.membership = mem;
      Auth.session.company = company;
      Auth.session.role = "owner";
      G.saveSession({ user_id: user.id, company_id: company.id });
      await Audit.log("create", "company", company.name, { id: company.id });
      return company;
    },

    switchCompany: async function (companyId) {
      var user = Auth.user();
      var mem = G.memberships().find(function (m) { return m.user_id === user.id && m.company_id === companyId; });
      if (!mem) return Auth.session;
      Auth.session.membership = mem;
      Auth.session.company = G.company(companyId);
      Auth.session.role = mem.role;
      G.saveSession({ user_id: user.id, company_id: companyId });
      return Auth.session;
    },

    signOut: async function () {
      if (DB.mode === "supabase") { try { await DB.client.auth.signOut(); } catch (e) {} }
      G.saveSession(null);
      Auth.session = null;
    },

    user: function () { return Auth.session ? Auth.session.user : null; },
    company: function () { return Auth.session ? Auth.session.company : null; },
    role: function () { return Auth.session ? Auth.session.role : "staff"; },
    isStaff: function () { return Auth.role() === "staff"; },

    /* current user's linked employee record (async) */
    employee: async function () {
      var mem = Auth.session ? Auth.session.membership : null;
      if (!mem || !mem.employee_id) return null;
      return DB.get("employees", mem.employee_id);
    },

    /* RBAC */
    can: function (module, perm) {
      var arr = (window.PERMS[module] || {})[Auth.role()] || [];
      return arr.indexOf(perm) !== -1 || arr.indexOf("*") !== -1;
    },
    canView: function (module) {
      return Auth.can(module, "view") || Auth.can(module, "view:self");
    },
  });

  /* ============================ SEED ============================ */
  var Seed = (window.Seed = {
    /* Put rows into the demo company's scoped local tables.
       Uses a fixed scope because seeding runs before a session exists. */
    _put: function (table, rows) {
      var key = NS + "c_demo-company_" + table;
      lsSet(key, lsGet(key, []).concat(rows));
    },
    _get: function (table) { return lsGet(NS + "c_demo-company_" + table, []); },

    ensureDemo: async function () {
      var existing = G.company("demo-company");
      if (existing) {
        return {
          company: existing,
          employees: Seed._get("employees"),
          branches: Seed._get("branches"),
          departments: Seed._get("departments"),
        };
      }
      var cid = "demo-company";
      var company = {
        id: cid, name: "NexCompany Sdn Bhd", registration_no: "201801012345 (K)",
        address: "Lot 12, Jalan Tun Fuad Stephens", city: "Kota Kinabalu", state: "Sabah",
        postcode: "88000", country: "Malaysia", phone: "+60 88-211 000",
        email: "admin@nexcompany.app", website: "https://nexcompany.app",
        currency: "RM", fiscal_start: "01-01", logo: "",
        plan: "trial", plan_expires_at: U.addDays(U.today(), cfg.planTrialDays || 14), created_at: U.nowISO(),
      };
      G.saveCompanies(G.companies().filter(function (c) { return c.id !== cid; }).concat([company]));

      var b1 = { id: U.id(), company_id: cid, name: "HQ Kota Kinabalu", address: "Lot 12, Jalan Tun Fuad Stephens", city: "Kota Kinabalu", phone: "+60 88-211 000", manager: "Alicia Tan", status: "active" };
      var b2 = { id: U.id(), company_id: cid, name: "Labuan Branch", address: "Unit 5, Financial Park Complex", city: "Labuan", phone: "+60 87-410 220", manager: "Farid Rahman", status: "active" };
      var b3 = { id: U.id(), company_id: cid, name: "Sandakan Branch", address: "Block C, Harbour Square", city: "Sandakan", phone: "+60 89-223 450", manager: "Jasmine Lee", status: "active" };
      Seed._put("branches", [b1, b2, b3]);

      var depNames = ["Management", "Technology", "Finance", "Sales", "Projects", "Operations", "Human Resources"];
      var deps = depNames.map(function (d, i) {
        return { id: U.id(), company_id: cid, branch_id: b1.id, name: d, code: "DPT" + String(i + 1).padStart(2, "0"), head: "", created_at: U.nowISO() };
      });
      Seed._put("departments", deps);

      var dMgmt = deps[0], dTech = deps[1], dFin = deps[2], dSal = deps[3], dPrj = deps[4], dOps = deps[5], dHr = deps[6];
      var emps = [
        { employee_no: "EMP001", full_name: "Alicia Tan", email: "alicia@nexcompany.app", phone: "012-800 1101", branch_id: b1.id, department_id: dMgmt.id, position: "Managing Director", employment_status: "active", join_date: "2018-03-12", base_salary: 18000, allowance: 1200, deduction: 2500 },
        { employee_no: "EMP002", full_name: "Farid Rahman", email: "farid@nexcompany.app", phone: "012-800 1102", branch_id: b1.id, department_id: dTech.id, position: "Head of Technology", employment_status: "active", join_date: "2019-06-01", base_salary: 13500, allowance: 900, deduction: 1800 },
        { employee_no: "EMP003", full_name: "Jasmine Lee", email: "jasmine@nexcompany.app", phone: "012-800 1103", branch_id: b2.id, department_id: dFin.id, position: "Finance Manager", employment_status: "active", join_date: "2019-09-16", base_salary: 12000, allowance: 800, deduction: 1600 },
        { employee_no: "EMP004", full_name: "Daniel Wong", email: "daniel@nexcompany.app", phone: "012-800 1104", branch_id: b1.id, department_id: dPrj.id, position: "Project Coordinator", employment_status: "active", join_date: "2020-01-20", base_salary: 6500, allowance: 400, deduction: 850 },
        { employee_no: "EMP005", full_name: "Nur Aina", email: "nuraina@nexcompany.app", phone: "012-800 1105", branch_id: b1.id, department_id: dSal.id, position: "Business Development", employment_status: "active", join_date: "2020-04-06", base_salary: 6200, allowance: 400, deduction: 800 },
        { employee_no: "EMP006", full_name: "Marcus Lim", email: "marcus@nexcompany.app", phone: "012-800 1106", branch_id: b1.id, department_id: dTech.id, position: "Software Engineer", employment_status: "active", join_date: "2020-07-13", base_salary: 7800, allowance: 450, deduction: 1000 },
        { employee_no: "EMP007", full_name: "Siti Hajar", email: "siti@nexcompany.app", phone: "012-800 1107", branch_id: b2.id, department_id: dOps.id, position: "Operations Executive", employment_status: "active", join_date: "2021-02-01", base_salary: 5600, allowance: 350, deduction: 720 },
        { employee_no: "EMP008", full_name: "Ben Tan", email: "ben@nexcompany.app", phone: "012-800 1108", branch_id: b3.id, department_id: dSal.id, position: "Sales Executive", employment_status: "active", join_date: "2021-05-17", base_salary: 5400, allowance: 500, deduction: 700 },
        { employee_no: "EMP009", full_name: "Priya Nair", email: "priya@nexcompany.app", phone: "012-800 1109", branch_id: b1.id, department_id: dFin.id, position: "Accountant", employment_status: "active", join_date: "2021-08-02", base_salary: 6800, allowance: 400, deduction: 880 },
        { employee_no: "EMP010", full_name: "Hafiz Ismail", email: "hafiz@nexcompany.app", phone: "012-800 1110", branch_id: b1.id, department_id: dPrj.id, position: "Project Manager", employment_status: "active", join_date: "2022-01-10", base_salary: 9800, allowance: 600, deduction: 1250 },
        { employee_no: "EMP011", full_name: "Rachel Goh", email: "rachel@nexcompany.app", phone: "012-800 1111", branch_id: b2.id, department_id: dHr.id, position: "HR Executive", employment_status: "active", join_date: "2022-03-21", base_salary: 5200, allowance: 300, deduction: 670 },
        { employee_no: "EMP012", full_name: "Kevin Chong", email: "kevin@nexcompany.app", phone: "012-800 1112", branch_id: b3.id, department_id: dTech.id, position: "IT Support", employment_status: "probation", join_date: "2026-05-04", base_salary: 4200, allowance: 200, deduction: 540 },
        { employee_no: "EMP013", full_name: "Linda Foo", email: "linda@nexcompany.app", phone: "012-800 1113", branch_id: b1.id, department_id: dOps.id, position: "Procurement Officer", employment_status: "active", join_date: "2022-11-07", base_salary: 5000, allowance: 300, deduction: 650 },
        { employee_no: "EMP014", full_name: "Omar Zulkifli", email: "omar@nexcompany.app", phone: "012-800 1114", branch_id: b1.id, department_id: dPrj.id, position: "Site Supervisor", employment_status: "active", join_date: "2023-02-13", base_salary: 4800, allowance: 350, deduction: 620 },
      ].map(function (e) { e.id = U.id(); e.company_id = cid; e.created_at = U.nowISO(); return e; });
      Seed._put("employees", emps);

      var customers = [
        { name: "ABC Holdings", contact_name: "Mr. Tan", email: "tan@abcholdings.my", phone: "012-333 1001", city: "Kota Kinabalu", industry: "Construction" },
        { name: "Sabah Edutech", contact_name: "Ms. Chong", email: "chong@sabahedu.my", phone: "013-555 1002", city: "Kota Kinabalu", industry: "Education" },
        { name: "Borneo Services", contact_name: "Mr. Ali", email: "ali@borneoservices.my", phone: "014-777 1003", city: "Sandakan", industry: "Logistics" },
        { name: "North Borneo Retail", contact_name: "Ms. Lau", email: "lau@nbretail.my", phone: "015-999 1004", city: "Labuan", industry: "Retail" },
      ].map(function (c) { c.id = U.id(); c.company_id = cid; c.created_at = U.nowISO(); return c; });
      Seed._put("customers", customers);

      var projects = [
        { name: "AI Learning Platform", customer_id: customers[1].id, contract_value: 120000, budget: 95000, progress: 54, status: "At Risk", start_date: "2026-02-01", end_date: "2026-11-30", manager_id: emps[9].id },
        { name: "Project Alpha", customer_id: customers[0].id, contract_value: 240000, budget: 200000, progress: 68, status: "Delayed", start_date: "2025-12-15", end_date: "2026-10-30", manager_id: emps[9].id },
        { name: "Cloud Migration", customer_id: customers[2].id, contract_value: 85000, budget: 70000, progress: 83, status: "On Track", start_date: "2026-04-01", end_date: "2026-09-30", manager_id: emps[9].id },
        { name: "Retail POS Rollout", customer_id: customers[3].id, contract_value: 64000, budget: 52000, progress: 25, status: "On Track", start_date: "2026-06-15", end_date: "2026-12-15", manager_id: emps[3].id },
      ].map(function (p) { p.id = U.id(); p.company_id = cid; p.created_at = U.nowISO(); return p; });
      Seed._put("projects", projects);

      var tx = [
        { transaction_date: "2026-08-18", description: "Client payment - AI Platform", category: "Sales", transaction_type: "income", amount: 25000, project_id: projects[0].id },
        { transaction_date: "2026-08-17", description: "Server equipment", category: "Equipment", transaction_type: "expense", amount: 6800, project_id: projects[2].id },
        { transaction_date: "2026-08-16", description: "Software subscriptions", category: "Software", transaction_type: "expense", amount: 2400 },
        { transaction_date: "2026-08-15", description: "Consulting income", category: "Services", transaction_type: "income", amount: 18500 },
        { transaction_date: "2026-08-12", description: "Payroll - August", category: "Payroll", transaction_type: "expense", amount: 64200 },
        { transaction_date: "2026-08-08", description: "Cloud infrastructure", category: "Infrastructure", transaction_type: "expense", amount: 3800, project_id: projects[2].id },
        { transaction_date: "2026-08-05", description: "Project Alpha milestone", category: "Sales", transaction_type: "income", amount: 48000, project_id: projects[1].id },
        { transaction_date: "2026-07-30", description: "Office rent", category: "Facilities", transaction_type: "expense", amount: 9500 },
        { transaction_date: "2026-07-25", description: "Maintenance contract", category: "Operations", transaction_type: "expense", amount: 2100 },
        { transaction_date: "2026-07-20", description: "Training income", category: "Services", transaction_type: "income", amount: 8600 },
      ].map(function (t) { t.id = U.id(); t.company_id = cid; t.created_at = U.nowISO(); return t; });
      Seed._put("finance_transactions", tx);

      var leads = [
        { name: "ABC Holdings", stage: "Proposal", value: 180000, score: 92, next_action: "Follow up proposal today", owner_id: emps[4].id },
        { name: "Sabah Edutech", stage: "Qualified", value: 75000, score: 78, next_action: "Schedule demo meeting", owner_id: emps[4].id },
        { name: "North Borneo Retail", stage: "Lead", value: 42000, score: 55, next_action: "Discovery call", owner_id: emps[7].id },
        { name: "Labuan Port Authority", stage: "New", value: 210000, score: 61, next_action: "Send capability deck", owner_id: emps[7].id },
      ].map(function (l) { l.id = U.id(); l.company_id = cid; l.created_at = U.nowISO(); return l; });
      Seed._put("crm_leads", leads);

      // Leave + attendance (relative to today so the demo stays "alive")
      var today = U.today();
      var leaves = [
        { employee_id: emps[7].id, leave_type: "Annual", start_date: today, end_date: U.addDays(today, 2), days: U.weekdayCount(today, U.addDays(today, 2)) || 1, reason: "Family event", status: "approved", approved_by: emps[0].id },
        { employee_id: emps[12].id, leave_type: "Unpaid", start_date: U.addDays(today, -1), end_date: today, days: U.weekdayCount(U.addDays(today, -1), today) || 1, reason: "Personal matters", status: "pending", approved_by: null },
        { employee_id: emps[5].id, leave_type: "Sick", start_date: today, end_date: today, days: 1, reason: "Medical appointment", status: "approved", approved_by: emps[1].id },
      ].map(function (l) { l.id = U.id(); l.company_id = cid; l.created_at = U.nowISO(); return l; });
      Seed._put("leave_requests", leaves);

      // Attendance for the previous full month + the current month to date,
      // so payroll prorates to a realistic gross for both periods.
      var present = [emps[0], emps[1], emps[2], emps[3], emps[4], emps[5], emps[6], emps[8], emps[9], emps[10], emps[11], emps[13]];
      function genAtt(y, m, maxDay) {
        var daysInMonth = new Date(y, m, 0).getDate();
        var out = [];
        for (var day = 1; day <= (maxDay || daysInMonth); day++) {
          var d = new Date(y, m - 1, day);
          var w = d.getDay();
          if (w === 0 || w === 6) continue;
          var ds = y + "-" + String(m).padStart(2, "0") + "-" + String(day).padStart(2, "0");
          present.forEach(function (e, i) {
            if ((i + day) % 11 === 0) return; // occasional absence
            var late = (i + day) % 4 === 0;
            out.push({ id: U.id(), company_id: cid, employee_id: e.id, date: ds,
              check_in: late ? "09:2" + (i % 10) : "08:4" + (i % 10),
              check_out: "17:3" + (i % 10), status: late ? "late" : "present", created_at: U.nowISO() });
          });
        }
        return out;
      }
      var cy = +today.slice(0, 4), cm = +today.slice(5, 7), cd = +today.slice(8, 10);
      var pm = cm === 1 ? 12 : cm - 1, py = cm === 1 ? cy - 1 : cy;
      var att = genAtt(py, pm).concat(genAtt(cy, cm, cd));
      Seed._put("attendance", att);

      await Audit.log("create", "company", company.name, { action: "demo_seed", id: cid });
      return { company: company, employees: emps, branches: [b1, b2, b3], departments: deps };
    },
  });

  /* ============ public re-exports used across the app ============ */
  window.Perm = {
    can: Auth.can.bind(Auth),
    canView: Auth.canView.bind(Auth),
  };
})();
