const VERSION = "3.0.0";
const WINDOWS_INSTALLER = {
  key: `windows/GovProject-PMIS-Setup-${VERSION}.exe`,
  contentType: "application/vnd.microsoft.portable-executable",
  filename: `GovProject-PMIS-Setup-${VERSION}.exe`,
};

const json = (body, status) => Response.json(body, {
  status,
  headers: {
    "cache-control": "private, no-store",
    "referrer-policy": "no-referrer",
    "x-content-type-options": "nosniff",
  },
});

const supabaseVerifyUrl = "https://cenayutywkiljwqyxfii.supabase.co/functions/v1/govproject-download";
const supabasePublishableKey = "sb_publishable_yzzaOuTuhztpDyeRsx2BhA_maGOdj0W";

export default {
  async fetch(request, env) {
    if (request.method !== "GET") return json({ error: "Method not allowed" }, 405);
    const url = new URL(request.url);
    if (url.pathname !== "/download") return json({ error: "Not found" }, 404);

    // Verify the purchase against the Supabase Edge Function before serving the
    // installer. The installer itself is held — it is only released after a
    // completed GovProject PMIS payment is confirmed.
    const sessionId = url.searchParams.get("session_id") ?? "";
    if (!/^cs_(test|live)_[A-Za-z0-9_]+$/.test(sessionId)) {
      return json({ error: "A completed GovProject PMIS payment was not found" }, 402);
    }
    try {
      const verify = await fetch(supabaseVerifyUrl, {
        method: "POST",
        headers: {
          apikey: supabasePublishableKey,
          "content-type": "application/json",
        },
        body: JSON.stringify({ sessionId, platform: "windows" }),
      });
      if (!verify.ok) {
        const detail = await verify.text().catch(() => "");
        if (verify.status === 403 || verify.status === 404) return json({ error: "A completed GovProject PMIS payment was not found" }, 402);
        return json({ error: "Installer is not available yet" }, 404);
      }
    } catch {
      return json({ error: "Installer is not available yet" }, 404);
    }

    const object = await env.INSTALLERS.get(WINDOWS_INSTALLER.key);
    if (!object?.body) return json({ error: "Installer is not available yet" }, 404);
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("content-type", WINDOWS_INSTALLER.contentType);
    headers.set("content-disposition", `attachment; filename="${WINDOWS_INSTALLER.filename}"`);
    headers.set("content-length", String(object.size));
    headers.set("cache-control", "private, no-store");
    headers.set("referrer-policy", "no-referrer");
    headers.set("x-content-type-options", "nosniff");
    return new Response(object.body, { headers });
  },
};
