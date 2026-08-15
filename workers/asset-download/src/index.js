const objectKey = "windows/MathToolsHub-Asset-Management-1.0.0-x64.exe";
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
    if (!/^cs_test_[A-Za-z0-9_]+$/.test(sessionId)) return json({ error: "Invalid sandbox Checkout Session" }, 400);

    try {
      const verification = await fetch(supabaseVerifyUrl, {
        method: "POST",
        headers: {
          apikey: supabasePublishableKey,
          "content-type": "application/json",
        },
        body: JSON.stringify({ sessionId, platform: "verify" }),
      });
      if (!verification.ok) return json({ error: "A completed Asset Management sandbox payment was not found" }, verification.status === 403 ? 403 : 502);

      const object = await env.INSTALLERS.get(objectKey);
      if (!object?.body) return json({ error: "Installer is not available" }, 404);
      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set("content-type", "application/vnd.microsoft.portable-executable");
      headers.set("content-disposition", 'attachment; filename="MathToolsHub-Asset-Management-1.0.0-x64.exe"');
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
