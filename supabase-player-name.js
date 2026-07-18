import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const config = window.MATHTOOLSHUB_SUPABASE;
const inputs = [...document.querySelectorAll("#studentName, #nameInput, input#playerName")];
const displays = [...document.querySelectorAll(":not(input)#playerName")];
function applyName(name) {
  const safeName = String(name || "").trim().slice(0, 40);
  if (!safeName) return;
  inputs.forEach(input => {
    input.value = safeName.slice(0, Number(input.maxLength) > 0 ? input.maxLength : 40);
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });
  displays.forEach(display => {
    display.textContent = safeName.slice(0, 18);
  });
  document.dispatchEvent(new CustomEvent("mathToolsHubUserName", { detail: { name: safeName } }));
}

if (config?.url && config?.publishableKey && (inputs.length || displays.length)) {
  const client = createClient(config.url, config.publishableKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });

  async function update(session) {
    if (!session?.user) return;
    let name = String(session.user.user_metadata?.display_name || session.user.email?.split("@")[0] || "").trim();
    const { data } = await client.from("profiles").select("display_name").eq("id", session.user.id).maybeSingle();
    if (data?.display_name) name = String(data.display_name).trim();
    applyName(name);
  }

  const { data: { session } } = await client.auth.getSession();
  await update(session);
  client.auth.onAuthStateChange((_event, nextSession) => update(nextSession));
}
