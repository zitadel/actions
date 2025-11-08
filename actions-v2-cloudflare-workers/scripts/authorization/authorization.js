export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    
    if (req.method !== "POST" || url.pathname !== "/") {
      return new Response("Method not allowed", { status: 405 });
    }

    // --- Validate environment variables ---
    const {
      ZITADEL_DOMAIN,
      ACCESS_TOKEN,
      AUTHORIZATION_SIGNING_KEY,
    } = env;

    const missing = [];
    if (!ZITADEL_DOMAIN) missing.push("ZITADEL_DOMAIN");
    if (!ACCESS_TOKEN) missing.push("ACCESS_TOKEN");
    if (!AUTHORIZATION_SIGNING_KEY) missing.push("AUTHORIZATION_SIGNING_KEY");

    if (missing.length > 0) {
      console.error("[Init] Missing environment variables:", missing.join(", "));
      return new Response("Missing configuration", { status: 500 });
    }

    const signatureHeader = req.headers.get("zitadel-signature");
    if (!signatureHeader) {
      console.warn("[Verify] Missing signature header");
      return new Response("Missing signature", { status: 400 });
    }

    const rawBody = await req.text();
    const isValid = await verifySignature(signatureHeader, rawBody, AUTHORIZATION_SIGNING_KEY);
    if (!isValid) {
      console.warn("[Verify] Invalid signature");
      return new Response("Invalid signature", { status: 400 });
    }

    let jsonBody;
    try {
      jsonBody = JSON.parse(rawBody);
    } catch {
      console.error("[Parse] Invalid JSON body");
      return new Response("Invalid JSON body", { status: 400 });
    }

    try {
      const { org, user_grants = [] } = jsonBody || {};
      const orgId = org?.id;

      if (!orgId) {
        console.warn("authorization action: missing org.id in payload");
        return jsonResponse({ append_claims: [] });
      }

      const metaResp = await fetch(`https://${ZITADEL_DOMAIN}/zitadel.org.v2beta.OrganizationService/ListOrganizationMetadata`, {
        method: "POST",
        body: JSON.stringify({ organizationId: orgId }),
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${ACCESS_TOKEN}`
        },
      });

      if (!metaResp.ok) {
        console.error(`[ListOrganizationMetadata] API call failed: ${metaResp.status} ${metaResp.statusText}`);
        return jsonResponse({ append_claims: [] });
      }
      const metaArr = (await metaResp.json()).metadata || [];
      const metaToPerms = new Map();
      for (const { key, value } of metaArr) {
        if (!key) continue;
        let parsed;
        try {
          parsed = JSON.parse(atob(value));
        } catch {
          parsed = String(atob(value)).split(/\s*,\s*/).filter(Boolean);
        }
        const asArray = Array.isArray(parsed) ? parsed : [String(parsed)];
        metaToPerms.set(key, asArray);
      }

      const roles = new Set();
      for (const g of user_grants) {
        (g.roles || []).forEach(r => r && roles.add(String(r)));
      }

      const permissions = [];
      const seen = new Set();
      for (const role of roles) {
        const permsForRole = metaToPerms.get(role);
        if (!permsForRole) continue;
        for (const p of permsForRole) {
          const perm = String(p);
          if (!seen.has(perm)) {
            seen.add(perm);
            permissions.push(perm);
          }
        }
      }

      const append_claims = [];
      if (permissions.length > 0) {
        append_claims.push({ key: "permissions", value: permissions });
      }

      console.info("authorization action -> roles:", Array.from(roles));
      console.info("authorization action -> permissions:", permissions);

      return jsonResponse({ append_claims });
    } catch (e) {
      console.error("authorization action error:", e);
      return jsonResponse({ append_claims: [] });
    }
  },
};

async function verifySignature(signatureHeader, rawBody, signingKey) {
  const elements = signatureHeader.split(",");
  const timestamp = elements.find(e => e.startsWith("t="))?.split("=")[1];
  const signature = elements.find(e => e.startsWith("v1="))?.split("=")[1];

  if (!timestamp || !signature) {
    console.warn("[Verify] Malformed signature header");
    return false;
  }

  const signedPayload = `${timestamp}.${rawBody}`;
  const encoder = new TextEncoder();

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(signingKey),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const sigBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(signedPayload));
  const computedSignature = Array.from(new Uint8Array(sigBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");

  return computedSignature === signature;
}

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
