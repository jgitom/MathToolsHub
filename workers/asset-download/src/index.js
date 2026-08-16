const VERSION = "1.4.2";
const WINDOWS_INSTALLER = {
  key: `windows/MathToolsHub-Asset-Management-${VERSION}-x64.exe`,
  contentType: "application/vnd.microsoft.portable-executable",
  filename: `MathToolsHub-Asset-Management-${VERSION}-x64.exe`,
};
const supabaseVerifyUrl = "https://cenayutywkiljwqyxfii.supabase.co/functions/v1/asset-download";
const supabasePublishableKey = "sb_publishable_yzzaOuTuhztpDyeRsx2BhA_maGOdj0W";

const json = (body, status) => Response.json(body, {
  status,
  headers: {
    "cache-control": "private, no-store",
    "referrer-policy": "no-referrer",
    "x-content-type-options": "nosniff",
  },
});

export default {
  async fetch(request, env) {
    if (request.method !== "GET") return json({ error: "Method not allowed" }, 405);
    const url = new URL(request.url);
    if (url.pathname !== "/download") return json({ error: "Not found" }, 404);

    const sessionId = url.searchParams.get("session_id") ?? "";
    if (!/^cs_(test|live)_[A-Za-z0-9_]+$/.test(sessionId)) return json({ error: "Invalid Checkout Session" }, 400);

    try {
      const verification = await fetch(supabaseVerifyUrl, {
        method: "POST",
        headers: {
          apikey: supabasePublishableKey,
          "content-type": "application/json",
        },
        body: JSON.stringify({ sessionId, platform: "windows" }),
      });
      if (!verification.ok) return json({ error: "A completed Asset Management payment was not found" }, verification.status === 403 ? 403 : 502);

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
    } catch (error) {
      console.error(JSON.stringify({ event: "asset_download_failed", message: error instanceof Error ? error.message : String(error) }));
      return json({ error: "Unable to prepare this download" }, 502);
    }
  },
};
