// Browser demo shim for the Asset Management desktop app.
// Replaces the Electron window.assetAPI with a localStorage-backed demo
// so clients can explore the app online without installing anything.
(() => {
  const KEY = "mathtoolshub_asset_demo_v1";
  const DEMO_LIMIT = 100000; // demo unlocks the full tier so every screen is viewable

  const emptyStore = () => ({ version: 1, assets: [], updatedAt: new Date().toISOString() });

  const demoAssets = [
    { id: "a1", assetId: "ICT-0001", name: "Teacher Laptop", category: "Computer", serial: "SN-LT-2201", status: "Assigned", assignee: "Ms. Anita", location: "Classroom 3A", purchaseDate: "2023-05-12", value: 3200, condition: "Good", nextMaintenance: "2026-09-15", notes: "Staff issue" },
    { id: "a2", assetId: "ICT-0002", name: "Student Tablet", category: "Tablet", serial: "SN-TB-8812", status: "Assigned", assignee: "Library", location: "Media Room", purchaseDate: "2023-08-02", value: 1450, condition: "Excellent", nextMaintenance: "2026-08-30", notes: "" },
    { id: "a3", assetId: "AV-0101", name: "Projector", category: "Projector", serial: "PRJ-77X", status: "Available", assignee: "", location: "Store Room", purchaseDate: "2022-11-19", value: 2100, condition: "Good", nextMaintenance: "2026-08-20", notes: "" },
    { id: "a4", assetId: "FN-0301", name: "Office Desk", category: "Furniture", serial: "", status: "Available", assignee: "", location: "Admin Office", purchaseDate: "2021-03-08", value: 550, condition: "Fair", nextMaintenance: "", notes: "" },
    { id: "a5", assetId: "LB-0502", name: "Microscope", category: "Laboratory", serial: "MIC-9931", status: "Maintenance", assignee: "", location: "Science Lab", purchaseDate: "2022-06-21", value: 4800, condition: "Fair", nextMaintenance: "2026-08-10", notes: "Lens calibration" },
    { id: "a6", assetId: "NW-0401", name: "Network Switch", category: "Network", serial: "NS-24P", status: "Assigned", assignee: "IT Room", location: "Server Cabinet", purchaseDate: "2023-01-15", value: 1200, condition: "Excellent", nextMaintenance: "2026-10-01", notes: "" },
    { id: "a7", assetId: "VE-0601", name: "Delivery Van", category: "Vehicle", serial: "VIN-MTH-201", status: "Assigned", assignee: "Logistics", location: "Depot", purchaseDate: "2020-09-30", value: 52000, condition: "Good", nextMaintenance: "2026-08-25", notes: "Next service" },
    { id: "a8", assetId: "OT-0701", name: "Printer", category: "Other", serial: "PRT-2210", status: "Available", assignee: "", location: "General Office", purchaseDate: "2023-04-05", value: 780, condition: "Good", nextMaintenance: "", notes: "" }
  ];

  function loadStore() {
    try {
      const parsed = JSON.parse(localStorage.getItem(KEY) || "null");
      return { ...emptyStore(), ...(parsed || {}), assets: Array.isArray(parsed?.assets) ? parsed.assets : demoAssets.map(a => ({ ...a, createdAt: a.updatedAt })) };
    } catch (e) {
      return { ...emptyStore(), assets: demoAssets.map(a => ({ ...a })) };
    }
  }

  function saveStore(store) {
    const next = { ...store, version: 1, updatedAt: new Date().toISOString() };
    localStorage.setItem(KEY, JSON.stringify(next));
    return next;
  }

  const download = (name, text, type) => {
    const blob = new Blob([text], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  const pickFile = () => new Promise(resolve => {
    const input = document.createElement("input");
    input.type = "file"; input.accept = ".json";
    input.onchange = () => resolve(input.files?.[0] || null);
    input.click();
  });

  window.assetAPI = Object.freeze({
    load: async () => loadStore(),
    save: async store => saveStore(store),
    exportData: async store => { download("mathtoolshub-assets-demo.json", JSON.stringify(store, null, 2), "application/json"); return { canceled: false }; },
    exportCsv: async store => {
      const columns = ["assetId", "name", "category", "serial", "status", "assignee", "location", "purchaseDate", "value", "condition", "nextMaintenance", "notes"];
      const quote = v => `"${String(v ?? "").replaceAll('"', '""')}"`;
      const csv = [columns.join(","), ...(store.assets || []).map(a => columns.map(k => quote(a[k])).join(","))].join("\r\n");
      download("mathtoolshub-assets-demo.csv", `\uFEFF${csv}`, "text/csv");
      return { canceled: false };
    },
    importData: async () => {
      const file = await pickFile();
      if (!file) return { canceled: true };
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed.assets)) throw new Error("The selected file is not a valid asset database.");
      return { canceled: false, store: saveStore({ ...emptyStore(), ...parsed }) };
    },
    licenseStatus: async () => ({ valid: true, assetLimit: DEMO_LIMIT, purchaseId: "demo", issuedAt: new Date().toISOString() }),
    importLicense: async () => ({ canceled: true })
  });
})();