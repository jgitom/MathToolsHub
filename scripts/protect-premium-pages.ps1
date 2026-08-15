param(
  [string]$OutputDirectory = "C:\Docker\mathtoolshub\.premium-function"
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$manifest = Get-Content (Join-Path $root "activity-entitlements.json") -Raw | ConvertFrom-Json
$premium = @($manifest.activities | Where-Object access_tier -eq "premium")

if (-not (Test-Path -LiteralPath $OutputDirectory)) {
  New-Item -ItemType Directory -Path $OutputDirectory | Out-Null
}

$content = [ordered]@{}
$utf8 = New-Object System.Text.UTF8Encoding($false)

foreach ($activity in $premium) {
  $relative = $activity.path.TrimStart("/").Replace("/", [IO.Path]::DirectorySeparatorChar)
  $pagePath = Join-Path $root $relative
  if (Test-Path -LiteralPath $pagePath -PathType Container) {
    $pagePath = Join-Path $pagePath "index.html"
  }
  if (-not (Test-Path -LiteralPath $pagePath -PathType Leaf)) {
    throw "Premium page not found: $($activity.activity_id) -> $pagePath"
  }

  $originalHtml = [IO.File]::ReadAllText($pagePath)
  if ($originalHtml.Contains("functions/v1/premium-activity")) {
    throw "Refusing to package an existing Premium loader: $pagePath"
  }
  $content[$activity.activity_id] = $originalHtml
  $title = [Net.WebUtility]::HtmlEncode([string]$activity.title)
  $activityId = [Net.WebUtility]::HtmlEncode([string]$activity.activity_id)
  $stub = @"
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex">
  <title>$title | MathToolsHub Premium</title>
  <style>
    *{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;color:#172033;background:#f4f7fa;font-family:Inter,"Segoe UI",Arial,sans-serif}.gate{width:min(480px,100%);padding:28px;border:1px solid #dbe3ec;border-radius:8px;background:#fff;text-align:center;box-shadow:0 18px 45px rgba(15,39,71,.12)}h1{margin:0 0 12px;color:#0f2747;font-size:1.6rem}p{margin:0;color:#64748b;line-height:1.6}.actions{display:grid;gap:10px;margin-top:20px}a{display:grid;place-items:center;min-height:46px;padding:10px 14px;border-radius:8px;color:#fff;background:#2563eb;font-weight:800;text-decoration:none}.secondary{color:#172033;background:#e8eef7}[hidden]{display:none!important}
  </style>
</head>
<body data-premium-activity="$activityId">
  <main class="gate"><h1>$title</h1><p id="gateStatus">Checking your Premium access...</p><div class="actions" id="gateActions" hidden><a id="accountLink" href="/account.html">Sign in or manage subscription</a><a class="secondary" href="/">Return to homepage</a></div></main>
  <script src="/supabase-config.js"></script>
  <script type="module">
    import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
    const status = document.getElementById("gateStatus");
    const actions = document.getElementById("gateActions");
    const accountLink = document.getElementById("accountLink");
    const activityId = document.body.dataset.premiumActivity;
    const config = window.MATHTOOLSHUB_SUPABASE;
    const returnPath = location.pathname + location.search + location.hash;
    accountLink.href = "/account.html?return=" + encodeURIComponent(returnPath);
    const fail = message => { status.textContent = message; actions.hidden = false; };
    try {
      const client = createClient(config.url, config.publishableKey, { auth: { persistSession:true, autoRefreshToken:true, detectSessionInUrl:true } });
      const { data: { session } } = await client.auth.getSession();
      if (!session) throw new Error("SIGN_IN");
      const response = await fetch(config.url + "/functions/v1/premium-activity", {
        method: "POST",
        headers: { "Authorization":"Bearer " + session.access_token, "apikey":config.publishableKey, "content-type":"application/json" },
        body: JSON.stringify({ activityId })
      });
      if (response.status === 403) throw new Error("PREMIUM_REQUIRED");
      if (!response.ok) throw new Error("UNAVAILABLE");
      const html = await response.text();
      document.open(); document.write(html); document.close();
    } catch (error) {
      fail(error.message === "SIGN_IN" ? "Sign in to check your Premium access." : error.message === "PREMIUM_REQUIRED" ? "An active Premium subscription is required for this activity." : "This Premium activity is temporarily unavailable. Please try again.");
    }
  </script>
</body>
</html>
"@
  [IO.File]::WriteAllText($pagePath, $stub, $utf8)
}

$contentJson = $content | ConvertTo-Json -Compress
$functionSource = @"
const CONTENT: Record<string, string> = $contentJson;
const allowedOrigins = new Set(["https://www.mathtoolshub.com", "https://mathtoolshub.com", "http://127.0.0.1:8000", "http://localhost:8000"]);
const cors = (request: Request) => {
  const requested = request.headers.get("origin") ?? "";
  const origin = allowedOrigins.has(requested) ? requested : "https://www.mathtoolshub.com";
  return { "access-control-allow-origin": origin, "access-control-allow-headers": "authorization, apikey, content-type", "access-control-allow-methods": "POST, OPTIONS", "vary": "Origin" };
};
const respond = (request: Request, body: string, status: number, type = "application/json") => new Response(body, { status, headers: { ...cors(request), "content-type": type, "cache-control": "private, no-store" } });

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: cors(request) });
  if (request.method !== "POST") return respond(request, JSON.stringify({ error: "Method not allowed" }), 405);
  const authorization = request.headers.get("authorization") ?? "";
  if (!authorization.startsWith("Bearer ")) return respond(request, JSON.stringify({ error: "Authentication required" }), 401);
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  if (!supabaseUrl || !anonKey) return respond(request, JSON.stringify({ error: "Function is not configured" }), 500);
  let activityId = "";
  try { activityId = String((await request.json()).activityId ?? ""); } catch { return respond(request, JSON.stringify({ error: "Invalid request" }), 400); }
  if (!Object.prototype.hasOwnProperty.call(CONTENT, activityId)) return respond(request, JSON.stringify({ error: "Activity not found" }), 404);
  const headers = { "apikey": anonKey, "authorization": authorization, "content-type": "application/json" };
  const accessResponse = await fetch(supabaseUrl + "/rest/v1/rpc/get_my_subscription", { method: "POST", headers, body: "{}" });
  if (!accessResponse.ok) return respond(request, JSON.stringify({ error: "Unable to verify access" }), accessResponse.status === 401 ? 401 : 503);
  const accessBody = await accessResponse.json();
  const access = Array.isArray(accessBody) ? accessBody[0] : accessBody;
  if (access?.access_tier !== "premium") return respond(request, JSON.stringify({ error: "Premium access required" }), 403);
  return respond(request, CONTENT[activityId], 200, "text/html; charset=utf-8");
});
"@
[IO.File]::WriteAllText((Join-Path $OutputDirectory "index.ts"), $functionSource, $utf8)

Write-Host "Protected $($premium.Count) Premium pages. Function source: $OutputDirectory\index.ts"
