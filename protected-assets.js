import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const config = window.MATHTOOLSHUB_SUPABASE;
const links = document.querySelectorAll("[data-protected-path]");

if (config?.url && config?.publishableKey && links.length) {
  const client = window.mathToolsHubSupabase || createClient(config.url, config.publishableKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
  window.mathToolsHubSupabase = client;

  links.forEach(link => link.addEventListener("click", async event => {
    event.preventDefault();
    if (link.dataset.loading === "true") return;
    link.dataset.loading = "true";
    link.setAttribute("aria-busy", "true");

    try {
      const { data: { session } } = await client.auth.getSession();
      if (!session) {
        const returnUrl = `${location.pathname}${location.search}${location.hash}`;
        location.href = `account.html?return=${encodeURIComponent(returnUrl)}`;
        return;
      }

      const bucket = link.dataset.protectedBucket || "protected-content";
      const { data, error } = await client.storage.from(bucket).createSignedUrl(link.dataset.protectedPath, 120);
      if (error) throw error;
      document.dispatchEvent(new CustomEvent("protectedAssetOpened", { detail: { path: link.dataset.protectedPath } }));
      location.href = data.signedUrl;
    } catch (error) {
      console.error("Protected asset access failed", error);
      alert("This protected resource is unavailable. Please sign in again or contact admin@mathtoolshub.com.");
    } finally {
      link.dataset.loading = "false";
      link.removeAttribute("aria-busy");
    }
  }));
}