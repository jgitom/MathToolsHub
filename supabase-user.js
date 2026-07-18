import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const config = window.MATHTOOLSHUB_SUPABASE;
const accountLinks = [...document.querySelectorAll("[data-user-account]")];
accountLinks.forEach(link => { link.dataset.accountFallback = link.textContent.trim() || "Account"; });
if (config?.url && config?.publishableKey && accountLinks.length) {
  const client = createClient(config.url, config.publishableKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
  let currentSession = null;
  let currentName = "";

  function render() {
    accountLinks.forEach(link => {
      if (!currentSession || !currentName) {
        link.textContent = link.dataset.accountFallback || "Account";
        link.removeAttribute("data-signed-in");
        link.removeAttribute("title");
        link.removeAttribute("aria-label");
        return;
      }
      link.textContent = `👤 ${currentName}`;
      link.dataset.signedIn = "true";
      link.title = `Signed in as ${currentName}`;
      link.setAttribute("aria-label", `Open account for ${currentName}`);
    });
  }

  async function update(session) {
    currentSession = session;
    currentName = "";
    if (session?.user) {
      currentName = String(session.user.user_metadata?.display_name || session.user.email?.split("@")[0] || "Student").trim().slice(0, 40);
      const { data } = await client.from("profiles").select("display_name").eq("id", session.user.id).maybeSingle();
      if (data?.display_name) currentName = String(data.display_name).trim().slice(0, 40);
    }
    render();
  }

  const { data: { session } } = await client.auth.getSession();
  await update(session);
  client.auth.onAuthStateChange((_event, nextSession) => update(nextSession));
  document.addEventListener("siteLanguageChanged", () => { accountLinks.forEach(link => { link.dataset.accountFallback = link.textContent.trim() || "Account"; }); render(); });
}