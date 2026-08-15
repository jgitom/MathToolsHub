const $ = id => document.getElementById(id);
let store = { version: 1, assets: [] };
let licence = { valid: false };
const fields = ["assetId","name","category","serial","status","assignee","location","purchaseDate","value","condition","notes"];
const money = new Intl.NumberFormat("en-MY", { style: "currency", currency: "MYR", maximumFractionDigits: 0 });

function toast(message) { const node = $("toast"); node.textContent = message; node.classList.add("show"); setTimeout(() => node.classList.remove("show"), 3000); }
function escapeHTML(value="") { const node = document.createElement("span"); node.textContent = value; return node.innerHTML; }
function filteredAssets() {
  const query = $("search").value.trim().toLowerCase();
  return store.assets.filter(asset => (!$("statusFilter").value || asset.status === $("statusFilter").value) && (!$("categoryFilter").value || asset.category === $("categoryFilter").value) && (!query || fields.some(key => String(asset[key] || "").toLowerCase().includes(query))));
}
function render() {
  $("totalStat").textContent = store.assets.length;
  $("assignedStat").textContent = store.assets.filter(asset => asset.status === "Assigned").length;
  $("availableStat").textContent = store.assets.filter(asset => asset.status === "Available").length;
  $("valueStat").textContent = money.format(store.assets.reduce((sum, asset) => sum + Number(asset.value || 0), 0));
  $("licenseStat").textContent = licence.valid ? `${licence.assetLimit.toLocaleString()} assets` : "Not activated";
  const categories = [...new Set(store.assets.map(asset => asset.category).filter(Boolean))].sort();
  const selected = $("categoryFilter").value;
  $("categoryFilter").innerHTML = '<option value="">All categories</option>' + categories.map(value => `<option>${escapeHTML(value)}</option>`).join("");
  $("categoryFilter").value = categories.includes(selected) ? selected : "";
  const assets = filteredAssets();
  $("tableHost").innerHTML = assets.length ? `<table><thead><tr><th>Asset</th><th>Category</th><th>Status</th><th>Assigned / location</th><th>Value</th><th>Actions</th></tr></thead><tbody>${assets.map(asset => `<tr><td><div class="asset-name">${escapeHTML(asset.name)}</div><div class="sub">${escapeHTML(asset.assetId)}${asset.serial ? ` - ${escapeHTML(asset.serial)}` : ""}</div></td><td>${escapeHTML(asset.category || "-")}</td><td><span class="badge ${asset.status.toLowerCase()}">${escapeHTML(asset.status)}</span><div class="sub">${escapeHTML(asset.condition || "")}</div></td><td>${escapeHTML(asset.assignee || "Unassigned")}<div class="sub">${escapeHTML(asset.location || "No location")}</div></td><td>${money.format(Number(asset.value || 0))}</td><td><button class="icon-btn" data-edit="${asset.id}">Edit</button> <button class="icon-btn danger" data-delete="${asset.id}">Delete</button></td></tr>`).join("")}</tbody></table>` : '<div class="empty"><strong>No assets found</strong>Add an asset or adjust the current filters.</div>';
}
function openEditor(asset) {
  if (!asset && (!licence.valid || store.assets.length >= licence.assetLimit)) return toast(licence.valid ? `Your ${licence.assetLimit.toLocaleString()}-asset licence is full.` : "Activate a licence before adding assets.");
  $("assetForm").reset(); $("recordId").value = asset?.id || ""; $("dialogTitle").textContent = asset ? "Edit asset" : "Add asset";
  fields.forEach(key => { if (asset && asset[key] != null) $(key).value = asset[key]; });
  $("assetDialog").showModal(); $("assetId").focus();
}
async function save(nextStore, message) {
  try { store = await window.assetAPI.save(nextStore); render(); toast(message); return true; }
  catch (error) { toast(error.message || "Save failed"); return false; }
}

$("assetForm").addEventListener("submit", async event => {
  event.preventDefault();
  const id = $("recordId").value || crypto.randomUUID();
  const asset = { id, updatedAt: new Date().toISOString() };
  fields.forEach(key => asset[key] = $(key).value.trim());
  const duplicate = store.assets.find(item => item.assetId.toLowerCase() === asset.assetId.toLowerCase() && item.id !== id);
  if (duplicate) return toast("Asset ID already exists");
  const index = store.assets.findIndex(item => item.id === id);
  if (index < 0 && (!licence.valid || store.assets.length >= licence.assetLimit)) return toast(licence.valid ? `Your ${licence.assetLimit.toLocaleString()}-asset licence is full.` : "Activate a licence before adding assets.");
  const assets = [...store.assets];
  if (index >= 0) assets[index] = { ...assets[index], ...asset }; else assets.unshift({ ...asset, createdAt: asset.updatedAt });
  if (await save({ ...store, assets }, index >= 0 ? "Asset updated" : "Asset added")) $("assetDialog").close();
});
$("tableHost").addEventListener("click", async event => {
  const edit = event.target.closest("[data-edit]"), remove = event.target.closest("[data-delete]");
  if (edit) openEditor(store.assets.find(asset => asset.id === edit.dataset.edit));
  if (remove) { const asset = store.assets.find(item => item.id === remove.dataset.delete); if (confirm(`Delete ${asset.name}? This cannot be undone.`)) await save({ ...store, assets: store.assets.filter(item => item.id !== asset.id) }, "Asset deleted"); }
});
$("addBtn").addEventListener("click", () => openEditor());
$("closeDialog").addEventListener("click", () => $("assetDialog").close());
$("cancelDialog").addEventListener("click", () => $("assetDialog").close());
$("licenseBtn").addEventListener("click", async () => { try { const result = await window.assetAPI.importLicense(); if (!result.canceled) { licence = result.status; render(); toast(`Licence activated for ${licence.assetLimit.toLocaleString()} assets`); } } catch (error) { toast(error.message || "Licence activation failed"); } });
["search","statusFilter","categoryFilter"].forEach(id => $(id).addEventListener("input", render));
async function exportData() { const result = await window.assetAPI.exportData(store); if (!result.canceled) toast("Backup exported"); }
$("exportBtn").addEventListener("click", exportData); $("exportSide").addEventListener("click", exportData);
$("importBtn").addEventListener("click", async () => { try { const result = await window.assetAPI.importData(); if (!result.canceled) { store = result.store; render(); toast("Asset database imported"); } } catch (error) { toast(error.message || "Import failed"); } });
(async () => { [store, licence] = await Promise.all([window.assetAPI.load(), window.assetAPI.licenseStatus()]); render(); })();
