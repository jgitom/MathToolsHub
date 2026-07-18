import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const script = [...document.scripts].find(element => element.src.includes("supabase-progress.js"));
const config = window.MATHTOOLSHUB_SUPABASE;
const activityId = script?.dataset.activityId || location.pathname.replace(/^\/+|\/+$/g, "") || "home";
const activityType = script?.dataset.activityType || (location.pathname.includes("/games/") ? "game" : "quiz");
const keys = (script?.dataset.progressKeys || "").split(",").map(value => value.trim()).filter(Boolean);
const markerKey = `mthCloudSync:${activityId}`;
const hydratedKey = `mthCloudHydrated:${activityId}`;

if (!config?.url || !config?.publishableKey || !keys.length) {
  console.warn("MathToolsHub cloud sync skipped: configuration or progress keys are missing.");
} else {
  const client = createClient(config.url, config.publishableKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
  let user = null, baseline = "", timer = null, writing = false, queued = false;

  const snapshot = () => Object.fromEntries(keys.map(key => [key, localStorage.getItem(key)]).filter(([, value]) => value !== null));
  const serialise = value => JSON.stringify(value);
  const readMarker = () => { try { return JSON.parse(localStorage.getItem(markerKey) || "{}"); } catch { return {}; } };
  const writeMarker = value => localStorage.setItem(markerKey, JSON.stringify(value));
  const hasData = value => Object.keys(value).length > 0;
  const scoreFrom = value => {
    let best = 0;
    const visit = item => {
      if (!item || typeof item !== "object") return;
      Object.entries(item).forEach(([key, nested]) => {
        if (/score|points|correct|best/i.test(key) && Number.isFinite(Number(nested))) best = Math.max(best, Number(nested));
        else if (typeof nested === "object") visit(nested);
      });
    };
    Object.values(value).forEach(raw => { try { visit(JSON.parse(raw)); } catch {} });
    return best;
  };
  const announce = (state, detail = {}) => document.dispatchEvent(new CustomEvent("mathToolsHubProgressSync", { detail: { state, activityId, ...detail } }));

  async function push(current = snapshot()) {
    if (!user || writing) { queued = true; return; }
    writing = true; queued = false; announce("saving");
    try {
      const updatedAt = new Date().toISOString();
      const { data, error } = await client.from("learning_progress").upsert({ user_id: user.id, activity_id: activityId, activity_type: activityType, score: scoreFrom(current), progress: { version: 1, storage: current }, updated_at: updatedAt }, { onConflict: "user_id,activity_id" }).select("updated_at").single();
      if (error) throw error;
      baseline = serialise(current); writeMarker({ remoteUpdated: data.updated_at, dirty: false }); announce("saved", { updatedAt: data.updated_at });
    } catch (error) { writeMarker({ ...readMarker(), dirty: true }); announce("error", { message: error.message }); console.warn("MathToolsHub cloud progress could not be saved.", error); }
    finally { writing = false; if (queued) push(snapshot()); }
  }

  function hydrate(storage, updatedAt) {
    Object.entries(storage || {}).forEach(([key, value]) => { if (keys.includes(key) && typeof value === "string") localStorage.setItem(key, value); });
    writeMarker({ remoteUpdated: updatedAt, dirty: false });
    sessionStorage.setItem(hydratedKey, updatedAt);
    announce("loaded", { updatedAt });
    location.reload();
  }

  async function start(session) {
    user = session?.user || null;
    if (timer) clearInterval(timer);
    if (!user) { announce("signed-out"); return; }
    announce("loading");
    const local = snapshot(), marker = readMarker();
    const { data: remote, error } = await client.from("learning_progress").select("progress,updated_at").eq("user_id", user.id).eq("activity_id", activityId).maybeSingle();
    if (error) { announce("error", { message: error.message }); console.warn("MathToolsHub cloud progress could not be loaded.", error); return; }
    const remoteStorage = remote?.progress?.storage;
    if (remote && remoteStorage && marker.remoteUpdated !== remote.updated_at && !marker.dirty && sessionStorage.getItem(hydratedKey) !== remote.updated_at) { hydrate(remoteStorage, remote.updated_at); return; }
    baseline = serialise(local);
    if (!remote && hasData(local)) await push(local);
    else if (marker.dirty) await push(local);
    else { if (remote) writeMarker({ remoteUpdated: remote.updated_at, dirty: false }); announce("ready"); }
    timer = setInterval(() => {
      const current = snapshot(), encoded = serialise(current);
      if (encoded !== baseline) { writeMarker({ ...readMarker(), dirty: true }); baseline = encoded; push(current); }
    }, 1500);
  }

  const { data: { session } } = await client.auth.getSession();
  start(session);
  client.auth.onAuthStateChange((_event, nextSession) => start(nextSession));
}